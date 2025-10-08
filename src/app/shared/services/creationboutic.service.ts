import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CreationbouticService {

  identifiant = '';
  motdepasse = '';
  clqualite = '';
  clnom = '';
  clprenom = '';
  cladr1 = '';
  cladr2 = '';
  clcp = '';
  clville = '';
  cltel = '';
  btnom = '';
  btalias = '';
  btcourriel = '';
  btlogo = '';
  prchxmethode = '';
  prchxpaie = '';
  prmntmincmd = 0;
  prvalidsms = false;

  constructor() { }

  getIdentifiant()
  {
    return this.identifiant;
  }

  setIdentifant(identifiant:string)
  {
    this.identifiant = identifiant;
  }

  getMotdepasse(useStorage:boolean = true)
  {
    return this.motdepasse;
  }

  setMotdepasse(motdepasse:string)
  {
    this.motdepasse = motdepasse;
  }

  getClQualite(useStorage:boolean = true)
  {
    return this.clqualite;
  }

  setClQualite(clqualite:string)
  {
    this.clqualite = clqualite;
  }

  getClNom(useStorage:boolean = true)
  {
    return this.clnom;
  }

  setClNom(clnom:string)
  {
    this.clnom = clnom;
  }

  getClPrenom(useStorage:boolean = true)
  {
    return this.clprenom;
  }

  setClPrenom(clprenom:string)
  {
    this.clprenom = clprenom;
  }

  getClAdr1(useStorage:boolean = true)
  {
    return this.cladr1;
  }

  setClAdr1(cladr1:string)
  {
    this.cladr1 = cladr1;
  }

  getClAdr2(useStorage:boolean = true)
  {
    return this.cladr2;
  }

  setClAdr2(cladr2:string)
  {
    this.cladr2 = cladr2;
  }

  getClCp(useStorage:boolean = true)
  {
    return this.clcp;
  }

  setClCp(clcp:string)
  {
    this.clcp = clcp;
  }

  getClVille(useStorage:boolean = true)
  {
    return this.clville;
  }

  setClVille(clville:string)
  {
    this.clville = clville;
  }

  getClTel(useStorage:boolean = true)
  {
    return this.cltel;
  }

  setClTel(cltel:string)
  {
    this.cltel = cltel;
  }

  setClient(identifiant: string, motdepasse: string, clqualite: string, clnom: string, clprenom: string, cladr1: string, cladr2: string, 
            clcp: string, clville: string, cltel: string)
  {
    this.setIdentifant(identifiant);
    this.setMotdepasse(motdepasse);
    this.setClQualite(clqualite);
    this.setClNom(clnom);
    this.setClPrenom(clprenom);
    this.setClAdr1(cladr1);
    this.setClAdr2(cladr2);
    this.setClCp(clcp);
    this.setClVille(clville);
    this.setClTel(cltel);
  }

  getBtNom()
  {
    return this.btnom;
  }

  setBtNom(btnom: string)
  {
    this.btnom = btnom;
  }

  getBtAlias()
  {
    return this.btalias;
  }

  setBtAlias(btalias: string)
  {
    this.btalias = btalias;
  }

  getBtCourriel()
  {
    return this.btcourriel;
  }

  setBtCourriel(btcourriel: string)
  {
    this.btcourriel = btcourriel;
  }

  getBtLogo()
  {
    return this.btlogo;
  }

  setBtLogo(btlogo: string)
  {
    this.btlogo = btlogo;
  }

  setBoutic(btnom:string, btalias:string, btcourriel: string, btlogo: string)
  {
    this.setBtNom(btnom);
    this.setBtAlias(btalias);
    this.setBtCourriel(btcourriel);
    this.setBtLogo(btlogo);
  }

  getPrChoixMethode()
  {
    return this.prchxmethode;
  }

  setPrChoixMethode(prchxmethode: string)
  {
    this.prchxmethode = prchxmethode;
  }

  getPrChoixPaie()
  {
    return this.prchxpaie;
  }

  setPrChoixPaie(prchxpaie: string)
  {
    this.prchxpaie = prchxpaie;
  }

  getPrMontantMinimunCommande()
  {
    return this.prmntmincmd;
  }

  setPrMontantMinimunCommande(prmntmincmd: number)
  {
    this.prmntmincmd = prmntmincmd;
  }

  getPrValidationSMS()
  {
    return this.prvalidsms;
  }

  setPrValidationSMS(prvalidsms: boolean)
  {
    this.prvalidsms = prvalidsms;
  }

  setParametre(prchxmethode: string, prchxpaie: string, prmntmincmd: number, prvalidsms: boolean)
  {
    this.setPrChoixMethode(prchxmethode);
    this.setPrChoixPaie(prchxpaie);
    this.setPrMontantMinimunCommande(prmntmincmd);
    this.setPrValidationSMS(prvalidsms);
  }

}
