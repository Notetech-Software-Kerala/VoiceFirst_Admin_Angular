// src/app/core/_device/browser-device.service.ts
import { Injectable } from '@angular/core';
import { UAParser } from 'ua-parser-js';
import { v4 as uuidv4 } from 'uuid';

export type DeviceType = 'Desktop' | 'Mobile' | 'Tablet' | 'Unknown';

export interface BrowserDevicePayload {
  deviceID: string;
  os: string;             // "Windows" | "macOS" | "Android" | "iOS" | "Linux" | "Unknown"
  osVersion: string;      // best-effort, e.g. "Windows 11" | "10.0.0" or "Unknown"
  manufacturer: string;   // browser name, e.g. "Chrome"
  model: string;          // browser model-ish, e.g. "Chrome 121"
  deviceType: DeviceType;
  deviceName: string;     // friendly label, e.g. "Chrome on Windows (Desktop)"
}

@Injectable({ providedIn: 'root' })
export class BrowserDeviceService {
  private cached: BrowserDevicePayload | null = null;

  get snapshot(): BrowserDevicePayload | null {
    return this.cached;
  }

  async collect(): Promise<BrowserDevicePayload> {
    const parser = new UAParser();
    const result = parser.getResult();

    const deviceID = this.getOrCreateDeviceId();
    const deviceType = this.detectDeviceType(result.device.type);

    let osName = result.os.name ?? 'Unknown';
    if (osName === 'Mac OS') osName = 'macOS';

    let osVersion = result.os.version ? `${osName} ${result.os.version}` : 'Unknown';
    
    // Check Client Hints for more accurate Windows 11 detection if Chromium browser supports it
    const uaData = (navigator as any).userAgentData;
    if (uaData?.getHighEntropyValues && osName === 'Windows') {
      try {
        const v = await uaData.getHighEntropyValues(['platformVersion']);
        if (v?.platformVersion) {
          const major = Number(v.platformVersion.split('.')[0]);
          if (!Number.isNaN(major)) {
            osVersion = major >= 13 ? 'Windows 11' : 'Windows 10';
          }
        }
      } catch {
        // Fallback to parser result
      }
    }

    const browserName = result.browser.name ?? 'Unknown';
    const browserVersion = result.browser.version ?? '';
    const manufacturer = browserName;
    const model = `${browserName} ${browserVersion}`.trim();

    const deviceName = `${manufacturer} on ${osName} (${deviceType})`;

    const payload: BrowserDevicePayload = {
      deviceID,
      os: osName,
      osVersion,
      manufacturer,
      model,
      deviceType,
      deviceName,
    };

    this.cached = payload;
    return payload;
  }

  private getOrCreateDeviceId(): string {
    const key = 'DeviceID';
    try {
      const existing = localStorage.getItem(key);
      if (existing) return existing;

      const id = uuidv4();
      localStorage.setItem(key, id);
      return id;
    } catch {
      return uuidv4();
    }
  }

  private detectDeviceType(type?: string): DeviceType {
    if (type === 'tablet') return 'Tablet';
    if (type === 'mobile') return 'Mobile';
    if (!type) return 'Desktop';
    return 'Unknown';
  }
}
