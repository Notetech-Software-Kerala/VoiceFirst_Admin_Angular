import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EncryptionService {
  // Not truly secret if shipped in frontend code.
  private readonly SECRET_KEY = 'VoiceFirstAdminSecretKey';

  private encoder = new TextEncoder();
  private decoder = new TextDecoder();

  constructor() {}

  private async getKey(): Promise<CryptoKey> {
    const keyMaterial = await crypto.subtle.digest(
      'SHA-256',
      this.encoder.encode(this.SECRET_KEY)
    );

    return crypto.subtle.importKey(
      'raw',
      keyMaterial,
      { name: 'AES-GCM' },
      false,
      ['encrypt', 'decrypt']
    );
  }

  private toBase64(bytes: Uint8Array): string {
    let binary = '';
    for (const b of bytes) binary += String.fromCharCode(b);
    return btoa(binary);
  }

  private fromBase64(base64: string): Uint8Array {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }

  private toBase64Url(bytes: Uint8Array): string {
    return this.toBase64(bytes)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/g, '');
  }

  private fromBase64Url(base64Url: string): Uint8Array {
    let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) base64 += '=';
    return this.fromBase64(base64);
  }

  async encrypt(data: unknown): Promise<string> {
    try {
      if (data == null) return '';

      const key = await this.getKey();
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const plaintext = this.encoder.encode(JSON.stringify(data));

      const encryptedBuffer = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        plaintext
      );

      const encryptedBytes = new Uint8Array(encryptedBuffer);

      // prepend IV to ciphertext
      const combined = new Uint8Array(iv.length + encryptedBytes.length);
      combined.set(iv, 0);
      combined.set(encryptedBytes, iv.length);

      return this.toBase64(combined);
    } catch (e) {
      console.error('Encryption failed', e);
      return '';
    }
  }

  async decrypt(ciphertext: string): Promise<any> {
    try {
      if (!ciphertext) return null;

      const key = await this.getKey();
      const combined = this.fromBase64(ciphertext);

      const iv = combined.slice(0, 12);
      const encryptedBytes = combined.slice(12);

      const decryptedBuffer = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        key,
        encryptedBytes
      );

      const decryptedString = this.decoder.decode(decryptedBuffer);
      return JSON.parse(decryptedString);
    } catch (e) {
      console.error('Decryption failed', e);
      return null;
    }
  }

  async encryptForRoute(id: string | number): Promise<string> {
    try {
      if (id == null || id === '') return '';

      const key = await this.getKey();
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const plaintext = this.encoder.encode(String(id));

      const encryptedBuffer = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        plaintext
      );

      const encryptedBytes = new Uint8Array(encryptedBuffer);
      const combined = new Uint8Array(iv.length + encryptedBytes.length);
      combined.set(iv, 0);
      combined.set(encryptedBytes, iv.length);

      return this.toBase64Url(combined);
    } catch (e) {
      console.error('Route encryption failed', e);
      return '';
    }
  }

  async decryptFromRoute(encryptedId: string | null): Promise<string | null> {
    try {
      if (!encryptedId) return null;

      const key = await this.getKey();
      const combined = this.fromBase64Url(encryptedId);

      const iv = combined.slice(0, 12);
      const encryptedBytes = combined.slice(12);

      const decryptedBuffer = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        key,
        encryptedBytes
      );

      return this.decoder.decode(decryptedBuffer);
    } catch (e) {
      console.error('Route decryption failed', e);
      return null;
    }
  }
}