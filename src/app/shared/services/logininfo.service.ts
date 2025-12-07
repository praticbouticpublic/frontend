import { Injectable } from '@angular/core';
import { Logininfo } from 'src/app/shared/models/logininfo';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LogininfoService {
  data!:Logininfo;
  handleid: any;
  logged = false;
  iv!: Uint8Array;



  constructor() {
    this.data = new Logininfo();
  }

  getLogged(useStorage:boolean = true) : boolean
  {
    let val = sessionStorage.getItem('logged');
    return ((useStorage && (val !== null)) ? Boolean(val) : this.logged) as boolean;
  }

  setLogged(state: boolean)
  {
    sessionStorage.setItem('logged', String(state));
    this.logged = state;
  }

  getHandleId()
  {
    return this.handleid;
  }

  setHandleId(id: any)
  {
    this.handleid = id;
  }

  getBouticId(useStorage:boolean = true): number
  {
    let val = sessionStorage.getItem('bouticid');
    return ((useStorage && (val !== null)) ? +val: this.data.bouticid);
  }

  setBouticId(lebouticid: number)
  {
    sessionStorage.setItem('bouticid', String(lebouticid));
    this.data.bouticid = lebouticid;
  }

  getAlias(useStorage:boolean = true): string
  {
    let val = sessionStorage.getItem('alias');
    return ((useStorage && (val !== null)) ? val: this.data.alias);
  }

  setAlias(lalias: string)
  {
    sessionStorage.setItem('alias', lalias);
    this.data.alias = lalias;
  }

  getIdentifiant(useStorage:boolean = true):string
  {
    let val = sessionStorage.getItem('identifiant');
    return ((useStorage && (val !== null)) ? val : (this.data.identifiant ?? ""));
  }

  setIdentifiant(lidentifiant: string | undefined) {
    sessionStorage.setItem('identifiant', lidentifiant ?? "");
    this.data.identifiant = lidentifiant;
  }

  // Function to convert a Base64 string to a Uint8Array (16-byte array)
  base64ToUint8Array(base64: string): Uint8Array
  {
    // Decode the Base64 string
    const binaryString = atob(base64);

    // Create a Uint8Array with the same length as the decoded string
    const byteArray = new Uint8Array(binaryString.length);

    // Convert each character to its byte value
    for (let i = 0; i < binaryString.length; i++) {
        byteArray[i] = binaryString.charCodeAt(i);
    }

    return byteArray;
  }

  uint8ArrayToBase64(uint8Array: Uint8Array): string {
    let binary = '';
    const len = uint8Array.byteLength;

    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(uint8Array[i]);
    }

    return btoa(binary); // Utilisation de btoa pour encoder en base64
  }

  // Exemple pour le chiffrement
  async setMotdepasse(lemotdepasse: string) {
    const rawKey = new Uint8Array(new TextEncoder().encode(environment.identificationkey));
    const iv = new Uint8Array(crypto.getRandomValues(new Uint8Array(16))); // Générer un nouveau IV

    try {
        const key = await crypto.subtle.importKey('raw', rawKey, { name: 'AES-CBC' }, true, ['encrypt']);
        const encrypted = await crypto.subtle.encrypt({ name: 'AES-CBC', iv }, key, new TextEncoder().encode(lemotdepasse));

        this.iv = iv; // Stocker le IV
        const encryptedBase64 = this.uint8ArrayToBase64(new Uint8Array(encrypted));
        sessionStorage.setItem('motdepasse', encryptedBase64);
        sessionStorage.setItem('iv', this.uint8ArrayToBase64(iv)); // Stocker l'IV encodé en base64
        this.data.motdepasse = lemotdepasse;
    } catch (error) {
        console.error('Erreur lors du chiffrement :', error);
        throw new Error('Échec du chiffrement du mot de passe');
    }
  }

  // Exemple pour le déchiffrement
  async getMotdepasse(useStorage: boolean = true): Promise<string> {
    let encryptedVal = sessionStorage.getItem('motdepasse');
    if (!encryptedVal) {
        return this.data.motdepasse; // Retourner la valeur par défaut si rien n'est stocké
    }

    const rawKey = new TextEncoder().encode(environment.identificationkey);
    const ivBase64 = sessionStorage.getItem('iv'); // Récupérer le IV encodé en base64
    if (!ivBase64) {
        throw new Error('Vecteur d\'initialisation non trouvé');
    }

    const iv = new Uint8Array(this.base64ToUint8Array(ivBase64)); // Convertir le IV de base64 en Uint8Array

    try {
        const key = await crypto.subtle.importKey('raw', rawKey, { name: 'AES-CBC' }, true, ['decrypt']);
        const encryptedData = new Uint8Array(this.base64ToUint8Array(encryptedVal)); // Convertir le texte chiffré en Uint8Array

        const decrypted = await crypto.subtle.decrypt({ name: 'AES-CBC', iv }, key, encryptedData);
        const storedpass = new TextDecoder().decode(decrypted);

        return (useStorage && encryptedVal !== null) ? storedpass : this.data.motdepasse;
    } catch (error) {
        console.error('Erreur lors du déchiffrement :', error);
        throw new Error('Échec du déchiffrement du mot de passe');
    }
  }

  getStripecustomerid(useStorage:boolean = true):string
  {
    let val = sessionStorage.getItem('stripecustomerid');
    return ((useStorage && (val !== null)) ? val : this.data.stripecustomerid);
  }

  setStripecustomerid(stripecustomerid: string)
  {
    sessionStorage.setItem('stripecustomerid', stripecustomerid);
    this.data.stripecustomerid = stripecustomerid;
  }

  getLoginInfo(useStorage:boolean = true): Logininfo
  {
    return this.data;
  }

  setLoginInfo(lebouticid: number, lalias:string, lidentifiant:string, lemotdepasse:string, lestripecustomerid:string)
  {
    this.setBouticId(lebouticid);
    this.setAlias(lalias);
    this.setIdentifiant(lidentifiant);
    this.setMotdepasse(lemotdepasse);
    this.setStripecustomerid(lestripecustomerid);
  }

  clearLogin()
  {
    this.data.bouticid = 0;
    sessionStorage.removeItem('bouticid');
    this.data.alias = '';
    sessionStorage.removeItem('alias');
    this.data.identifiant ='';
    sessionStorage.removeItem('identifiant');
    this.data.motdepasse ='';
    sessionStorage.removeItem('motdepasse');
    this.data.stripecustomerid ='';
    sessionStorage.removeItem('stripecustomerid');
  }

}
