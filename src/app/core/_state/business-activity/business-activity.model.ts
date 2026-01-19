export interface BusinessActivityModel {
  sysBusinessActivityId: number;     // or string if your API uses GUIDs/strings
  businessActivityName: string;
  createdBy: string;
  createdAt: string;                // ISO date string; use Date if you parse it
  isActive: boolean;
  updatedBy?: string | null;
  updatedAt?: string | null;
}