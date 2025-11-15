import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { ActivatedRoute, InitialNavigation, Params, Router } from '@angular/router';
import { Location, NgIf, NgFor, NgClass } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormBuilder, FormGroup, FormControl, AbstractControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { ModeleService } from '../../services/model.service';
import { environment } from 'src/environments/environment';
import { LogininfoService } from '../../../shared/services/logininfo.service';
import { MatDialog } from '@angular/material/dialog';
import iro from '@jaames/iro';
import { strings } from 'src/app/shared/string';
import { Initialisation } from '../../initialisation';
import { ActiveSubscriptionService } from '../../../shared/services/activesubscription.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MessageService } from 'src/app/shared/services/message.service';
import { DialogComponent } from 'src/app/shared/components/dialog/dialog.component';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatFormField, MatLabel, MatInput, MatError } from '@angular/material/input';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatSelect, MatOption } from '@angular/material/select';
import { MatButton, MatFabButton } from '@angular/material/button';
import { NgbCarousel, NgbSlide } from '@ng-bootstrap/ng-bootstrap';
import { MatIcon } from '@angular/material/icon';
import {HeaderService} from "../../../shared/services/header.service";
import * as myGlobals from "./../../../global";
import {Subject} from "rxjs";

interface recimage
{
  pkid: number;
  bouticid: number;
  artid: number;
  filename: string;
  favori: boolean;
  visible: boolean;
}

interface Publication {
  form: any;
  msg: string | null;
}

@Component({
    selector: 'app-presentationrecord',
    templateUrl: './presentationrecord.component.html',
    styleUrls: ['./presentationrecord.component.scss'],
    imports: [NgIf, MatProgressSpinner, ReactiveFormsModule, NgFor, MatFormField, MatLabel, MatInput, MatError, MatCheckbox, MatSelect, MatOption, NgClass, MatButton, NgbCarousel, NgbSlide, MatFabButton, MatIcon]
})

export class PresentationrecordComponent extends Initialisation {
  private route = inject(ActivatedRoute);
  private location = inject(Location);

  formAction = inject(FormBuilder);


  myTitle = '';
  loaded = false;
  numtable = -1;
  form: FormGroup;
  champs: any;
  bouticid: any;
  noimage: any;
  srvroot = environment.srvroot;
  liste: any[][] = new Array();
  valeurs!: any[];
  elemimage: any;
  eleminpimg: any;
  elemclose: any;
  formloaded = false;
  isSubmitted = false;
  imgtruefilename = '';
  logoloaded = true;
  nomliens!: any[];
  colorcode: any;
  colorpicker: any = null;
  imagesrc = '';
  lastactive = false;
  listimg: recimage[] = new Array();
  listimgvis: recimage[] = new Array();

  //msg: Subject<any> = new Subject<any>;
  @Input() action:string = '';
  @Input() table:string = '';

  selcol:string ='';
  selid:number = 0;
  id:number = 0;
  imgidx = 0;
  imgcount = 0;

  error = new Subject<Publication>();


  constructor()
  {
    const activesub = inject(ActiveSubscriptionService);
    const snackbar = inject(MatSnackBar);
    const msg = inject(MessageService);
    const router = inject(Router);
    const lginf = inject(LogininfoService);
    const httpClient = inject(HttpClient);
    const model = inject(ModeleService);
    const dialog = inject(MatDialog);
    const header = inject(HeaderService);

    super(httpClient, lginf, msg, model, activesub, snackbar, dialog, router, header);
    this.form = this.formAction.group({});
  }

  get errorControl()
  {
    return this.form.controls;
  }

  errorControlfield(index: any)
  {
    return this.form.get(index) as AbstractControl<any, any>;
  }

  async genValeursLiens()
  {
    let i =-1;
    this.liste = new Array(this.champs.length);
    this.nomliens = new Array(this.champs.length);
    this.valeurs = new Array(this.champs.length);
    for (const ch of this.champs)
    {
      i++;
      this.liste[i] = new Array();
      if (ch.typ === 'fk')
      {
        for (const element of this.model.getLiens())
        {
          if ((element.srctbl === this.model.getTable(this.numtable).nom) && (element.srcfld === this.champs[i].nom ))
          {
            this.nomliens[i] = element.desc;
            for (const tbl of this.model.getTables())
            {
              if (tbl.nom === element.dsttbl)
              {
                const ii =  i;
                const obj = { bouticid: this.bouticid, action: 'remplir-options', table: tbl.nom,
                   colonne: tbl.cs + ((element.nom === 'statut') ? ', couleur' : '') };

                this.httpClient.post<any>( environment.apiroot + 'remplir-options', obj, await this.header.buildHttpOptions()).subscribe({
                  next:(data: any) => {
                    let l= -1;
                    let k = -1;
                    for (const donnee of data.results)
                    {
                      l++;
                      this.liste[ii].push(new Object({id: donnee[0], valeur: donnee[1].toString(), couleur: (donnee.length > 2) ? donnee[2] : null}));
                      if (donnee.length > 2)
                      {
                        k++;
                        const css = '.optbackcolor' + k + '{background-color:' + donnee[2] + '; color: ' + ((this.luminosite(donnee[2]) > 127) ? 'black' : 'white') + '}';
                        const css2 = '.optbackcolor' + k + ' > div.alert-button-inner > div.alert-radio-label { background-color:' + donnee[2] + '; color: '
                        + ((this.luminosite(donnee[2]) > 127) ? 'black' : 'white') + '}';
                        const head = document.getElementsByTagName('head')[0];
                        const style = document.createElement('style');
                        style.type = 'text/css';
                        style.appendChild(document.createTextNode(css));
                        style.appendChild(document.createTextNode(css2));
                        head.appendChild(style);
                      }
                    }
                  },
                  error:(e:any) => {
                    this.openDialog(strings.ErrConnect, e.error.error);
                  }
                })
              }
            }
          }
        }
      }
      else
      {
        this.nomliens[i] = ch.desc;
      }
    }
    const obj2 = { bouticid: this.bouticid, action:'get-values', table:this.model.getTable(this.numtable).nom, colonne:'', row:'', idtoup:this.id };

    this.httpClient.post<any>(environment.apiroot + 'get-values', obj2, await this.header.buildHttpOptions()).subscribe({
      next:(response) => {
        const data = response.values;
        let i = -1;
        for(let champ of this.champs)
        {
          i++;
          switch (champ.typ)
          {
            case 'text':
            case 'ref':
            case 'image':
            case 'pass':
            case 'email':
            case 'codepostal':
            case 'couleur':
              this.valeurs[i] = data[i];
            break;
            case 'date':
              const event = new Date(Date.parse(data[i]));
              this.valeurs[i] = event.toLocaleString('fr-FR');
            break;
            case 'bool':
              this.valeurs[i] = (data[i] === 1) ? 'oui' : 'non';
            break;
            case'prix':
              this.valeurs[i]  = parseFloat(data[i]).toFixed(2) + ' €';
            break;
            case 'fk':
              for (let lien of this.model.getLiens())
              {
                if ((lien.srctbl === this.model.getTable(this.numtable).nom) && (lien.srcfld === champ.nom ))
                {
                  for (let list of this.liste[i])
                  {
                    if (list.id === data[i])
                    {
                      this.valeurs[i] = list;
                    }
                  }
                }
              }
            break;
          }
        }
      },
      error:(e:any) => {
        this.openErrDialog(strings.ErrConnect, e.error.error);
      }
    })
  }

  async genValeursparDefaut()
  {
    this.bouticid = this.lginf.getBouticId();
      const obj = { bouticid: this.bouticid, action:'getvalues', table:this.model.getTable(this.numtable).nom, colonne:'',
        row:'', idtoup: this.id };

      this.httpClient.post<any>(environment.apiroot + 'get-values', obj, await this.header.buildHttpOptions()).subscribe({
      next:(response) => {
        const data = response.values;
        this.formloaded = true;
        let k =-1;
        for (const champ of this.champs)
        {
          k++;
          const l=k;
          if (champ.typ !== 'pk')
          {
            let defval = localStorage.getItem('mem_fld_' + l);
            if (defval === null)
            {
              switch (this.action)
              {
                case 'insert':
                  defval = champ.defval;
                break;
                case 'update':
                  defval = data[l];
                break;
              }

            }
            if (champ.typ === 'image')
            {
              if ((defval !== null) && (defval !== ''))
              {
                this.imagesrc = environment.apiroot + 'upload/' + defval;
                this.imgtruefilename = defval;
                localStorage.setItem('mem_fld_' + l, defval);
              }
              else
              {
                this.imagesrc = '';
                this.imgtruefilename = '';
                localStorage.removeItem('mem_fld_' + l);
              }
            }
            else if (defval !== null)
            {
              if (champ.typ === 'bool')
              {
                (this.form.get(l.toString())as AbstractControl<any, any>).setValue((defval.toString() === '1') ? true : false);
              }
              else if (champ.typ === 'fk')
              {
                if (this.selcol !== champ.nom)
                {
                 (this.form.get(l.toString())as AbstractControl<any, any>).setValue(defval.toString());
                 (this.form.get(l.toString())as AbstractControl<any, any>).addValidators([Validators.required]);
                }
              }
              else if (champ.typ === 'couleur')
              {
                (this.form.get(l.toString())as AbstractControl<any, any>).setValue(defval);
                const coul = (defval !== '') ? defval : '#FFF';
                if (this.colorpicker === null)
                {
                  this.colorpicker = iro.ColorPicker('#picker',{width:160, color:coul});
                  this.colorpicker.on('color:change', (color: any) => {
                    (this.form.get(l.toString()) as FormGroup<any>).setValue(color.hexString);
                  });
                }
              }
              else
              {
                (this.form.get(l.toString())as AbstractControl<any, any>).setValue(defval);
              }
            }
          }
        }
      }, error:(e:any) => {
        this.openErrDialog(strings.ErrConnect, e.error.error);
      }
    });
  }

  ngOnInit(): void {
    super.chargementRessources();
  }

  override run()
  {
    this.route.params.subscribe(async (params: Params) => {
      this.table = params['table'];
      if (this.action !== 'insert')
      {
        this.id = +params['idtoup'];
      }
      this.selcol = params['selcol'];
      this.selid = +params['selid'];
      this.numtable = this.model.getnumtable(this.table);
      this.champs = this.model.getTable(this.numtable).champs;
      for (let h = 0; h < this.champs.length; h++)
      {
        if (this.selcol !== this.champs[h].nom)
          this.form.addControl(h.toString(), new FormControl());

      }
      let mboutic = Number(localStorage.getItem('mem_bouticid'));
      let op = localStorage.getItem('mem_operation');
      let table = localStorage.getItem('mem_table');
      let idtoup = 0;
      if (this.action !== 'insert')
      {
        idtoup = Number(localStorage.getItem('mem_idtoup'));
      }
      let selcol = localStorage.getItem('mem_selcol');
      let selid = Number(localStorage.getItem('mem_selid'));
      this.imgcount = Number(localStorage.getItem('mem_imgcount'));

      this.bouticid = this.lginf.getBouticId();
      if (table !== null)
      {
        if ((mboutic !== this.bouticid) || (op !== this.action) || (table !== this.table) || (idtoup !== this.id) ||
          (selcol !== this.selcol) || (selid !== this.selid))
        {
          for(let ij=0; ij< this.model.getTable(this.numtable).champs.length; ij++)
          {
            localStorage.removeItem('mem_fld_' + ij);
          }
          // Efface les images mémorisés dans le dépot local du navigateur
          for (let ic = 0; ic < this.imgcount; ic++)
            localStorage.removeItem('mem_img_' + ic)
          localStorage.setItem('mem_imgcount' , '0');
          this.imgcount = 0;
        }
      }
      localStorage.setItem('mem_bouticid', this.bouticid);
      localStorage.setItem('mem_operation', this.action);
      localStorage.setItem('mem_table', this.table);
      if (this.action !== 'insert')
      {
        localStorage.setItem('mem_idtoup', this.id.toString());
      }
      localStorage.setItem('mem_selcol', this.selcol);
      localStorage.setItem('mem_selid', this.selid.toString());

      this.genValeursLiens();

      if (this.selcol === 'none')
      {
        this.selcol = '';
      }

      // retourne le nombre d'image memorisé dans le dépot local du navigateur
      let favset = false;
      let memlistimg: any[] = Array();
      for (let jc = 0; jc<this.imgcount; jc++ )
        memlistimg.push(JSON.parse(String(localStorage.getItem('mem_img_' + jc))));

      if ((this.table === 'article') && (this.action === 'update'))
      {
        let imgpos = 0;
        this.model.getData(this.bouticid, "artlistimg", environment.maximage, 0, "artid", this.id, null).then(observable =>{
          observable.subscribe({
            next:(response) => {
              for (let di of response.data as any)
              {
                let img = {pkid: parseInt(di[0], 10), artid: this.id, bouticid: parseInt(this.bouticid,10), filename: di[2], favori :(di[3] === 1), visible : (di[4] === 1)};
                // si il n'y a déjà une image favorite on met un drapeau
                if (img.favori)
                  favset = true;

                if (img.visible)
                {
                  this.listimgvis.push(img as recimage);
                  this.listimg.push(img as recimage);
                  localStorage.setItem('mem_imgcount' , String(this.listimgvis.length));
                  this.imgcount = this.listimgvis.length;
                  localStorage.setItem('mem_img_' + String(this.imgcount - 1), JSON.stringify(img));
                  imgpos++;
                }
              }
              memlistimg.forEach((mimg, midx) => {
                if (midx >= imgpos)
                {
                  let img2 = { pkid: mimg.pkid, artid: this.id, bouticid: +this.bouticid, filename: mimg.filename, favori: (mimg.favori && !favset ) , visible: mimg.visible  };
                  this.listimgvis.push(img2 as recimage);
                  this.listimg.push(img2 as recimage);
                  this.imgcount = this.listimgvis.length;
                  localStorage.setItem('mem_imgcount' , String(this.listimgvis.length));
                }
              });
            },
            error:(err:any) => {
              this.openErrDialog(strings.ErrConnect, err.error.error);
            }
          });
        });
      }
      else if ((this.table === 'article') && (this.action === 'insert'))
      {
        memlistimg.forEach((mimg, midx) => {
          let img3 = { pkid: mimg.pkid, artid: this.id, bouticid: +this.bouticid, filename: mimg.filename, favori: (mimg.favori && !favset ) , visible: mimg.visible  };
          this.listimgvis.push(img3 as recimage);
          this.listimg.push(img3 as recimage);
          this.imgcount = this.listimgvis.length;
          localStorage.setItem('mem_imgcount' , String(this.listimgvis.length));
        });
      }

      this.loaded = true;
      this.formloaded = true;
      this.genValeursparDefaut();
      localStorage.setItem('lasturl_' + this.lginf.getBouticId(), this.router.url);
    })
  }


  goBack()
  {
    // Efface les images mémorisés dans le dépot local du navigateur
    for (let ic = 0; ic < this.imgcount; ic++)
      localStorage.removeItem('mem_img_' + ic);

    localStorage.removeItem('mem_imgcount');

    if (this.selid === 0)
    {
      this.selcol = 'none';
      if ((this.table === 'categorie') || (this.table === 'article') || (this.table === 'groupeopt'))
      {
        this.router.navigate(['admin/backoffice/tabs/products/displaytable/' + this.table]);
      }
      else if ((this.table === 'barlivr') || (this.table === 'cpzone'))
      {
        this.router.navigate(['admin/backoffice/tabs/deliveries/displaytable/' + this.table]);
      }
      else if (this.table === 'statutcmd')
      {
        this.router.navigate(['admin/backoffice/tabs/customerarea/displaytable/' + this.table]);
      }
      else if (this.table === 'promotion')
      {
        this.router.navigate(['admin/backoffice/tabs/discounts/displaytable/' + this.table]);
      }
      else if (this.table === 'commande')
      {
        this.router.navigate(['admin/backoffice/tabs/orders/displaytable/' + this.table]);
      }
    }
    else
    {
      if (this.table === 'relgrpoptart')
      {
        this.router.navigate(['admin/backoffice/tabs/products/updaterecord/article/' + String(this.selid) + '/none/0']);
      }
      else
      if (this.table === 'option')
      {
        this.router.navigate(['admin/backoffice/tabs/products/updaterecord/groupeopt/' + String(this.selid) + '/none/0']);
      }
      else
      if (this.table === 'lignecmd')
      {
        this.router.navigate(['admin/backoffice/tabs/orders/viewrecord/commande/' + String(this.selid) + '/none/0']);
      }

    }
  }

  luminosite(couleur: any)
  {
    const r = parseInt(couleur.slice(1, 3), 16);
    const g = parseInt(couleur.slice(3, 5), 16);
    const b = parseInt(couleur.slice(5, 7), 16);
    const lumi = (r + g + b) / 3;
    return lumi;
  }

  onAddImgToLst(event: any)
  {
    if (((((event as CustomEvent).target) as HTMLInputElement).value !== '') && (((event as CustomEvent).target) as HTMLInputElement).value !== null)
    {
      const files = (((event as CustomEvent).target) as HTMLInputElement).files as FileList;
      const formdata = new FormData();
      for ( let i = 0;i<files.length; i++)
        formdata.append('file[]', files.item(i) as File);
      this.logoloaded = false;
      this.httpClient.post<any>(environment.apiroot + 'boupload', formdata, {  withCredentials:true }).subscribe({
        next:(data: string[]) => {
          this.lastactive = true;
          data.forEach((dat: string, idx: any) => {
            let img = {pkid: 0, artid: this.id, bouticid: parseInt(this.bouticid,10), filename: (dat as string), favori :false, visible : true};
            this.imgcount++;
            localStorage.setItem('mem_imgcount' , String(this.imgcount));
            //this.memlistimg.push(img);
            localStorage.setItem('mem_img_' + String(this.imgcount - 1), JSON.stringify(img));
            this.listimgvis.push(img as recimage);
            this.listimg.push(img as recimage);
          });
          this.logoloaded = true;
        },
        error:(err:any) => {
          this.logoloaded = true;
          this.openErrDialog(strings.ErrConnect, err.error.error);
        }
      });
    }
  }

  onRemoveImgFromLst(i: number)
  {
    // Efface les images mémorisés dans le dépot local du navigateur
    for (let ic = 0; ic < this.imgcount; ic++)
      localStorage.removeItem('mem_img_' + ic)

    for (let img of this.listimg)
    {
      if (img.filename === this.listimgvis[i].filename)
        img.visible = false;
    }

    this.listimgvis.splice(i,1);
    // On Décremente le nombre d'image memorisé
    this.imgcount--;
    localStorage.setItem('mem_imgcount' , String(this.imgcount));
    // Regénére les images mémorisé
    this.listimgvis.forEach((li, idx) => localStorage.setItem('mem_img_' + idx, JSON.stringify(li)));
  }

  onChangeFavImg(i: number)
  {
    // Efface les images mémorisés dans le dépot local du navigateur
    for (let ic = 0; ic < this.imgcount; ic++)
      localStorage.removeItem('mem_img_' + ic)

    let favoristatus = this.listimgvis[i].favori;
    for (let imgvis of this.listimgvis)
    {
      imgvis.favori = false;
    }
    for (let img of this.listimg)
    {
      img.favori = false;
    }
    this.listimgvis[i].favori = !favoristatus;
    if (this.listimgvis[i].pkid !== 0)
    {
      for (let img of this.listimg)
      {
        if (this.listimgvis[i].pkid === img.pkid)
        {
          img.favori = !favoristatus;
        }
      }
    }
    // Regénére les images mémorisé
    this.listimgvis.forEach((li, idx) => localStorage.setItem('mem_img_' + idx, JSON.stringify(li)));
  }

  onCancelUpdate(event: Event)
  {
    let j = -1;
    for (const champ of this.champs)
    {
      j++;
      let fld: any;
      if (champ.typ !== 'pk')
      {
        localStorage.removeItem('mem_fld_' + j);
      }
    }
    this.loaded = true;
    this.formloaded = true;
    this.genValeursparDefaut();
  }

  onStatutChange(event: any, numero:any)
  {
    let row = [];
    const col = {nom:'statid', valeur:event.value, type:'fk'};
    row.push(col);
    this.model.updaterow(this.bouticid, this.model.getTable(this.numtable).nom, row, 'cmdid', this.id, this);

    this.sendStatutSMS(this.bouticid, this.id);
    let couleur: any;
    for (let optelem of this.liste[numero])
    {
      if ( event.value === optelem.id)
      {
        this.valeurs[numero] = optelem;
        break;
      }
    }
  }

  sendSMS( bouticid: any, telephone: any, message: any)
  {
    const obj = { bouticid: bouticid, telephone:telephone, message:message };

    this.httpClient.post<any>(environment.apiroot + 'send-sms', obj, myGlobals.httpOptions).subscribe({
      next:(data: string) => {},
      error:(err:any) => this.openErrDialog(strings.ErrConnect, err.error.error)
    });
  }

  async sendStatutSMS( bouticid: any, cmdid: any)
  {
    const obj = { bouticid: bouticid, action:"get-com-data", table:"commande", cmdid:cmdid };

    this.httpClient.post<any>(environment.apiroot + "get-com-data", obj, await this.header.buildHttpOptions()).subscribe({
      next:(response) => this.sendSMS( bouticid, response.data[0], response.data[1]), error:(err:any) => this.openErrDialog(strings.ErrConnect, err.error.error)
    });
  }

  onSubmitAction(event: any, act:string): boolean
  {

    this.isSubmitted = true;
    // If there are any async validators
    //
    this.form.clearAsyncValidators();
    // If there are any normal validators
    //
    this.form.clearValidators();
    // Doing the validation on all the controls to put them back to valid
    //
    this.form.updateValueAndValidity();
    if (!this.form.valid)
    {
      this.loaded = true;
      return false;
    }
    const row: { nom: any; valeur: any; type: any; desc: any; }[] = [];
    let pknom: any;
    const error = false;
    const errmsg ='';
    this.champs.forEach((champ: { typ: string; nom: string; desc: any; }, j: number) =>
    {

      let val: any;
      if (champ.typ === 'image')
      {
        val = this.imgtruefilename;
      }
      else if (champ.typ ==='bool')
      {
        val = (this.form.get(j.toString()) as AbstractControl<any, any>).value ? '1' : '0';
      }
      else if (champ.typ === 'fk')
      {
        val = (this.selcol === champ.nom) ? this.selid : (this.form.get(j.toString()) as AbstractControl<any, any>).value;
      }
      else if (champ.typ !== 'pk')
      {
        val = (this.form.get(j.toString()) as AbstractControl<any, any>).value;
      }
      else
      {
        pknom = champ.nom;
      }
      if (champ.typ !== 'pk')
      {
        const col = {nom:champ.nom, valeur:val, type:champ.typ, desc:champ.desc};
        row.push(col);
      }
      localStorage.removeItem('mem_fld_' + j);
    });
    // Efface les images mémorisés dans le dépot local du navigateur
    for (let ic = 0; ic < this.imgcount; ic++)
      localStorage.removeItem('mem_img_' + ic);

    localStorage.removeItem('mem_imgcount');

    if (error === false)
    {
      if (act === 'update') {
        this.model.updaterow(this.bouticid, this.model.getTable(this.numtable).nom, row, pknom, this.id, this).then(observable => {
          observable.subscribe({
            next: (response: any) => {
              //this.error.next({ form:this, msg:null });
              this.appendImgtoBd();
              this.goBack();
            },
            error: (err: any) => {
              this.openDialog(strings.ErrConnect, err.error.error);
              //this.error.next({ form:this, msg:err.error.error });
            }
          });
        })
      }
      else if (act === 'insert')
      {
        this.model.insertrow(this.bouticid, this.model.getTable(this.numtable).nom, row).then(observable =>{
          observable.subscribe({
            next:(response:any) => {
              this.id = response.id;
              this.appendImgtoBd();
              this.goBack();
            },
            error:(err:any) => {
              this.openDialog(strings.ErrConnect, err.error.error);
            }
          });
        });
      }
    }
    else
    {
      this.openDialog(strings.CantContinue, errmsg);
    }
    return true;
  }

  appendImgtoBd()
  {
    if (this.model.getTable(this.numtable).nom === 'article')
    {
      for (let img of this.listimg)
      {
        let numlstimg = this.model.getnumtable('artlistimg');
        let champslstimg = this.model.tables[numlstimg].champs;
        let row = [];

        for (let i=0; i<champslstimg.length; i++)
        {
          let val = '';
          if (champslstimg[i].nom === 'artid')
          {
            val = this.id.toString();
          }
          else if (champslstimg[i].nom === 'image')
          {
            val = img.filename;
          }
          else if (champslstimg[i].nom === 'favori')
          {
            val = img.favori ? '1' : '0';
          }
          else if (champslstimg[i].nom === 'visible')
          {
            val = img.visible ? '1' : '0';
          }
          if (champslstimg[i].typ !== 'pk')
          {
            let col = {nom:champslstimg[i].nom, valeur:val, type:champslstimg[i].typ, desc:champslstimg[i].desc};
            row.push(col);
          }
        }
        if (img.pkid === 0)
        {

          this.model.insertrow(this.bouticid, 'artlistimg', row).then(observable => {
            observable.subscribe({
              next:() => {}, error:(err:any) => {
                this.openDialog(strings.ErrConnect, err.error.error);
              }
            });
          });
        }
        else
        {
          this.model.updaterow(this.bouticid, 'artlistimg', row, 'artlistimgid', img.pkid, this);
        }
      }
    }
  }

  onClickNextImg(event: any)
  {
    if (this.imgidx < this.listimgvis.length )
      this.imgidx++;
    else
      this.imgidx = 0;
    let favori = (event.currentTarget as HTMLElement);
    let active = Array.from((favori.parentElement as HTMLElement).querySelectorAll('.active'));
    if (active[0].classList.contains('favori') === true)
    {
      (document.getElementById('favoriid') as HTMLImageElement).src = 'assets/svg/favori_selected.svg';
    }
    else
    {
      (document.getElementById('favoriid') as HTMLImageElement).src = 'assets/svg/favori_unselected.svg';
    }
  }

  onClickPrevImg(event: any)
  {
    if (this.imgidx > 0)
      this.imgidx--;
    else
      this.imgidx = this.listimgvis.length - 1;
    let favori = (event.currentTarget as HTMLElement);
    let active = Array.from((favori.parentElement as HTMLElement).querySelectorAll('.active'));
    if (active[0].classList.contains('favori') === true)
    {
      (document.getElementById('favoriid') as HTMLImageElement).src = 'assets/svg/favori_selected.svg';
    }
    else
    {
      (document.getElementById('favoriid') as HTMLImageElement).src = 'assets/svg/favori_unselected.svg';
    }
  }

  bakFieldValue(event: any, index: any)
  {
    localStorage.setItem('mem_fld_' + index, event.target.value);
  }

  bakSelectionValue(event: any, index: any)
  {
    localStorage.setItem('mem_fld_' + index, event.value);
  }

  openErrDialog(title: string, body: string): void {
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '250px',
      data : { title, body }
    });

    dialogRef.afterClosed().subscribe((result: string) => {
      this.router.navigate(['admin/main/exit'])
    });
  }

}
