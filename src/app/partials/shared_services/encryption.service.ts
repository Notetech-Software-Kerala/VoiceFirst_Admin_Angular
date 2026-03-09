import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';

@Injectable({
  providedIn: 'root'
})
export class EncryptionService {
  // Not truly secret if shipped in frontend code.
  private readonly SECRET_KEY = 'VoiceFirstAdminSecretKey';

  constructor() {}

  async encrypt(data: unknown): Promise<string> {
    try {
      if (data == null) return '';
      const stringData = JSON.stringify(data);
      return CryptoJS.AES.encrypt(stringData, this.SECRET_KEY).toString();
    } catch (e) {
      console.error('Encryption failed', e);
      return '';
    }
  }

  async decrypt(ciphertext: string): Promise<any> {
    try {
      if (!ciphertext) return null;
      const bytes = CryptoJS.AES.decrypt(ciphertext, this.SECRET_KEY);
      const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
      
      if (!decryptedString) {
        return null;
      }
      
      return JSON.parse(decryptedString);
    } catch (e) {
      console.error('Decryption failed', e);
      return null;
    }
  }

  async encryptForRoute(id: string | number): Promise<string> {
    try {
      if (id == null || id === '') return '';
      const encrypted = CryptoJS.AES.encrypt(String(id), this.SECRET_KEY).toString();
      // Make the base64 string url-safe
      return encrypted
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/g, '');
    } catch (e) {
      console.error('Route encryption failed', e);
      return '';
    }
  }

  async decryptFromRoute(encryptedId: string | null): Promise<string | null> {
    try {
      if (!encryptedId) return null;
      
      // Revert url-safe base64 string to original base64
      let base64 = encryptedId.replace(/-/g, '+').replace(/_/g, '/');
      while (base64.length % 4) base64 += '=';
      
      const bytes = CryptoJS.AES.decrypt(base64, this.SECRET_KEY);
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch (e) {
      console.error('Route decryption failed', e);
      return null;
    }
  }
}