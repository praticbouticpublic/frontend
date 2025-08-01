import { Injectable } from '@angular/core';
import { TypeOrderline } from '../enum/typeorderline.enum';
import { Article, Groupe } from '../enum/model.enum';

export interface Orderline
{
  id: string;
  type: TypeOrderline;
  name: string;
  prix: string;
  qt: string;
  unite: string;
  opts: string;
  txta : string;
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  order: Orderline [] = new Array();
  total = 0;
  fraisLivr = 0;
  remise = 0;
  nom = '';
  prenom = '';
  telephone = '';
  vente = '';
  adr1 = '';
  adr2 = '';
  codepostal = '';
  ville = '';
  paiement = '';
  codepromo = '';
  infosup = '';
  articles: Article[][] = new Array();

  constructor() {

  }

  addOrderline(id: string, type: TypeOrderline, name: string, prix: string, qt: string, unite: string , opts: string, txta: string)
  {
    this.order.push({id, type, name, prix, qt, unite, opts, txta});
  }

  getOrderline(index: number): Orderline
  {
    return this.order[index];
  }

  setOrderLenght(val: number)
  {
    this.order.length = val;
  }

  getOrderLenght()
  {
    return this.order.length;
  }

  razOrder()
  {
    this.order.length = 0;
    sessionStorage.removeItem('commande');
    this.setSousTotal(0);
    sessionStorage.removeItem('soustotal');
    this.setFraisLivr(0);
    sessionStorage.removeItem('fraislivr');
    this.setRemise(0);
    sessionStorage.removeItem('remise');
    this.setNom('');
    sessionStorage.removeItem('nom');
    this.setPrenom('');
    sessionStorage.removeItem('prenom');
    this.setTelephone('');
    sessionStorage.removeItem('telephone');
    this.setVente('');
    sessionStorage.removeItem('vente');
    this.setAdr1('');
    sessionStorage.removeItem('adr1');
    this.setAdr2('');
    sessionStorage.removeItem('adr2');
    this.setCodePostal('');
    sessionStorage.removeItem('codepostal');
    this.setVille('');
    sessionStorage.removeItem('ville');
    this.setPaiement('');
    sessionStorage.removeItem('paiement');
    this.setCodePromo('');
    sessionStorage.removeItem('codepromo');
    this.setInfoSup('');
    sessionStorage.removeItem('infosup');
  }

  getSousTotal(useStorage:boolean = true) : number
  {
    return (useStorage ? +String(sessionStorage.getItem('soustotal') ?? '0') : this.total);
  }

  setSousTotal(valeur: number)
  {
    sessionStorage.setItem('soustotal', String(valeur));
    this.total = valeur;
  }

  getFraisLivr(useStorage:boolean = true): number
  {
    return (useStorage ? +String(sessionStorage.getItem('fraislivr') ?? '0') : this.fraisLivr);
  }

  setFraisLivr(valeur: number)
  {
    sessionStorage.setItem('fraislivr', String(valeur));
    this.fraisLivr = valeur;
  }

  getRemise(useStorage:boolean = true): number
  {
    return (useStorage ? +String(sessionStorage.getItem('remise') ?? '0') : this.remise);
  }

  setRemise(valeur: number)
  {
    sessionStorage.setItem('remise', String(valeur));
    this.remise = valeur;
  }

  Enregistrement()
  {
    sessionStorage.setItem('soustotal', String(this.total));
    sessionStorage.setItem('commande', JSON.stringify(this.order));
  }

  getCommande() : Orderline[]
  {
    let commande = sessionStorage.getItem('commande');
    if (commande !== null)
      return JSON.parse(commande);
    else
      return new Array;
  }

  getNom(useStorage:boolean = true) : string
  {
    return (useStorage ? sessionStorage.getItem('nom') as string : this.nom);
  }

  setNom(valeur:string)
  {
    sessionStorage.setItem('nom', valeur !== null ? valeur : '');
    this.nom = valeur;
  }

  getPrenom(useStorage:boolean = true): string
  {
    return (useStorage ? sessionStorage.getItem('prenom') as string : this.prenom);
  }

  setPrenom(valeur:string)
  {
    sessionStorage.setItem('prenom', valeur !== null ? valeur : '');
    this.prenom = valeur;
  }

  getTelephone(useStorage:boolean = true): string
  {
    return (useStorage ? sessionStorage.getItem('telephone') as string : this.telephone);
  }

  setTelephone(valeur:string)
  {
    sessionStorage.setItem('telephone', valeur !== null ? valeur : '');
    this.telephone = valeur;
  }

  getVente(useStorage:boolean = true): string
  {
    return (useStorage ? sessionStorage.getItem('vente') as string : this.vente);
  }

  setVente(valeur:string)
  {
    sessionStorage.setItem('vente', valeur !== null ? valeur : '');
    this.vente = valeur;
  }

  getAdr1(useStorage:boolean = true): string
  {
    return (useStorage ? sessionStorage.getItem('adr1') as string : this.adr1);
  }

  setAdr1(valeur:string)
  {
    sessionStorage.setItem('adr1', valeur !== null ? valeur : '');
    this.adr1 = valeur;
  }

  getAdr2(useStorage:boolean = true): string
  {
    return (useStorage ? sessionStorage.getItem('adr2') as string : this.adr2);
  }

  setAdr2(valeur:string)
  {
    sessionStorage.setItem('adr2', valeur !== null ? valeur : '' );
    this.adr2 = valeur;
  }

  getCodePostal(useStorage:boolean = true) : string
  {
    return (useStorage ? sessionStorage.getItem('codepostal') as string : this.codepostal);
  }

  setCodePostal(valeur:string)
  {
    sessionStorage.setItem('codepostal', String(valeur !== null ? valeur : ''));
    this.codepostal = valeur;
  }

  getVille(useStorage:boolean = true): string
  {
    return (useStorage ? sessionStorage.getItem('ville') as string : this.ville);
  }

  setVille(valeur:string)
  {
    sessionStorage.setItem('ville', valeur !== null ? valeur : '');
    this.ville = valeur;
  }

  getPaiement(useStorage:boolean = true): string
  {
    return (useStorage ? sessionStorage.getItem('paiement') as string : this.paiement);
  }

  setPaiement(valeur:string)
  {
    sessionStorage.setItem('paiement', valeur !== null ? valeur : '');
    this.paiement = valeur;
  }

  getCodePromo(useStorage:boolean = true): string
  {
    return (useStorage ? sessionStorage.getItem('codepromo') as string : this.codepromo);
  }

  setCodePromo(valeur:string)
  {
    sessionStorage.setItem('codepromo', valeur !== null ? valeur : '');
    this.codepromo = valeur;
  }

  getInfoSup(useStorage:boolean = true): string
  {
    return (useStorage ? sessionStorage.getItem('infosup') as string : this.infosup);
  }

  setInfoSup(valeur:string)
  {
    sessionStorage.setItem('infosup', valeur !== null ? valeur : '');
    this.infosup = valeur;
  }

  setArticles(articles: Article[][])
  {
    this.articles = articles;
  }

  removeMemControl()
  {
    this.articles.forEach((article:Article[]) => {
      article.forEach((art:Article, idxart: number)=> {
        sessionStorage.removeItem('artid'+art.id+'qte');
        sessionStorage.removeItem('artid'+art.id+'cur');
          art.groupes.forEach((groupe:Groupe)=> {
            for(let cur = 1; cur<=art.qte; cur++)
            {
              sessionStorage.removeItem('artid'+art.id+'grpid'+groupe.id+'cur'+cur);
            }
          });
      });
    });
  }

}
