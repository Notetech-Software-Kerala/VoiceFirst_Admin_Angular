import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';

@Injectable({
    providedIn: 'root'
})
export class EncryptionService {
    // Hardcoded secret key as per current project structure constraints
    // In a real production env, this should be in environment files or fetched securely
    private readonly SECRET_KEY = 'VoiceFirstAdminSecretKey';

    constructor() { }

    encrypt(data: any): string {
        try {
            if (!data) return '';
            const jsonString = JSON.stringify(data);
            const encrypted = CryptoJS.AES.encrypt(jsonString, this.SECRET_KEY).toString();
            // URL safe replacement if needed, but Angular router usually handles encoding
            return encrypted;
        } catch (e) {
            console.error('Encryption failed', e);
            return '';
        }
    }

    decrypt(ciphertext: string): any {
        try {
            if (!ciphertext) return null;
            const bytes = CryptoJS.AES.decrypt(ciphertext, this.SECRET_KEY);
            const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
            if (!decryptedString) return null;
            return JSON.parse(decryptedString);
        } catch (e) {
            console.error('Decryption failed', e);
            return null;
        }
    }
}
