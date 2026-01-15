// src/app/core/_device/browser-device.service.ts
import { Injectable } from '@angular/core';

export type DeviceType = 'Desktop' | 'Mobile' | 'Tablet' | 'Unknown';

export interface BrowserDevicePayload {
  deviceID: string;
  os: string;             // "Windows" | "macOS" | "Android" | "iOS" | "Linux" | "Unknown"
  osVersion: string;      // best-effort, e.g. "Windows 11" or "Unknown"
  manufacturer: string;   // browser name, e.g. "Chrome"
  model: string;          // browser model-ish, e.g. "Chromium 121" or full UA
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
    const ua = navigator.userAgent;

    const deviceID = this.getOrCreateDeviceId();
    const deviceType = this.detectDeviceType(ua);

    const os = this.detectOS(ua) ?? 'Unknown';

    // OS version is best-effort.
    // Windows 11 detection is ONLY reliable via UA-Client-Hints in Chromium browsers.
    const osVersion = (await this.detectOSVersion(os)) ?? 'Unknown';

    const browser = await this.detectBrowserNameAndVersion();
    const manufacturer = browser.name; // you want "Chrome" here
    const model = browser.model;       // you want "<chrome-model>" here

    const deviceName = `${manufacturer} on ${os} (${deviceType})`;

    const payload: BrowserDevicePayload = {
      deviceID,
      os,
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
    const existing = localStorage.getItem(key);
    if (existing) return existing;

    const id = crypto.randomUUID();
    localStorage.setItem(key, id);
    return id;
  }

  private detectDeviceType(ua: string): DeviceType {
    if (/iPad|Tablet/i.test(ua)) return 'Tablet';
    if (/Mobi|Android|iPhone|iPod/i.test(ua)) return 'Mobile';
    if (/Windows|Macintosh|Linux/i.test(ua)) return 'Desktop';
    return 'Unknown';
  }

  private detectOS(ua: string): string | null {
    if (/Windows NT/i.test(ua)) return 'Windows';
    if (/Android/i.test(ua)) return 'Android';
    if (/iPhone|iPad|iPod/i.test(ua)) return 'iOS';
    if (/Mac OS X/i.test(ua)) return 'macOS';
    if (/Linux/i.test(ua)) return 'Linux';
    return null;
  }

  /**
   * Best-effort OS Version:
   * - Chromium: use User-Agent Client Hints (platformVersion) to distinguish Windows 10 vs 11.
   * - Fallback: parse legacy UA (not reliable for Win11 because both Win10/11 show NT 10.0).
   */
  private async detectOSVersion(os: string): Promise<string | null> {
    const uaData = (navigator as any).userAgentData;

    // Chromium-based browsers may support this (more accurate)
    if (uaData?.getHighEntropyValues) {
      try {
        const v = await uaData.getHighEntropyValues(['platformVersion', 'platform']);
        const pv: string | undefined = v?.platformVersion;

        if (os === 'Windows' && pv) {
          // Common heuristic used in the wild:
          // platformVersion major >= 13 => Windows 11, else Windows 10
          const major = Number(pv.split('.')[0]);
          if (!Number.isNaN(major)) {
            return major >= 13 ? 'Windows 11' : 'Windows 10';
          }
        }

        if (os === 'Android' && pv) return `Android ${pv.split('.')[0]}`;
        // iOS/macOS platformVersion is not consistently available across browsers.
      } catch {
        // ignore and fallback
      }
    }

    // Fallback parsing (approx)
    const ua = navigator.userAgent;

    if (os === 'Windows') {
      // Not reliable for Win11: both Win10 and Win11 often show "Windows NT 10.0"
      const m = ua.match(/Windows NT ([0-9.]+)/);
      if (m?.[1] === '10.0') return 'Windows 10/11';
      return m ? `Windows NT ${m[1]}` : null;
    }

    if (os === 'Android') {
      const m = ua.match(/Android ([0-9.]+)/);
      return m ? `Android ${m[1]}` : null;
    }

    if (os === 'iOS') {
      const m = ua.match(/OS (\d+[_\d]*) like Mac OS X/);
      return m ? `iOS ${m[1].replace(/_/g, '.')}` : null;
    }

    if (os === 'macOS') {
      const m = ua.match(/Mac OS X (\d+[_\d]*)/);
      return m ? `macOS ${m[1].replace(/_/g, '.')}` : null;
    }

    return null;
  }

  /**
   * Returns browser name + a "model" string:
   * - name: "Chrome" / "Edge" / "Firefox" / "Safari"
   * - model: "Chromium 121" or "Firefox 122" or fallback to full userAgent
   */
  private async detectBrowserNameAndVersion(): Promise<{ name: string; model: string }> {
    const ua = navigator.userAgent;

    // Prefer UA-CH brands if available (more consistent in Chromium)
    const uaData = (navigator as any).userAgentData;
    if (uaData?.brands && Array.isArray(uaData.brands)) {
      const brands: Array<{ brand: string; version: string }> = uaData.brands;

      const pick =
        brands.find(b => /Microsoft Edge/i.test(b.brand)) ??
        brands.find(b => /Google Chrome/i.test(b.brand)) ??
        brands.find(b => /Chromium/i.test(b.brand)) ??
        brands[0];

      if (pick) {
        const name =
          /Microsoft Edge/i.test(pick.brand) ? 'Edge' :
            /Google Chrome/i.test(pick.brand) ? 'Chrome' :
              /Chromium/i.test(pick.brand) ? 'Chrome' : pick.brand;

        const model = `${pick.brand.replace('Google ', '')} ${pick.version}`;
        return { name, model };
      }
    }

    // Legacy UA fallback
    const edge = ua.match(/Edg\/(\d+)/);
    if (edge) return { name: 'Edge', model: `Edge ${edge[1]}` };

    const chrome = ua.match(/Chrome\/(\d+)/);
    if (chrome && !/Edg\//.test(ua)) return { name: 'Chrome', model: `Chrome ${chrome[1]}` };

    const firefox = ua.match(/Firefox\/(\d+)/);
    if (firefox) return { name: 'Firefox', model: `Firefox ${firefox[1]}` };

    const safari = ua.match(/Version\/(\d+).+Safari/);
    if (safari && !/Chrome\//.test(ua)) return { name: 'Safari', model: `Safari ${safari[1]}` };

    return { name: 'Unknown', model: ua }; // model fallback: UA string
  }
}
