export type AppTheme = 'white' | 'purple' | 'system' | 'black';
export type ResolvedTheme = 'white' | 'purple' | 'black';
export type ActiveMode = 'none' | 'volt' | 'pickup';

export interface HotkeyBindings {
  toggleOverlay: string;
  voltMode: string;
  pickupMode: string;
}

export interface AppSettings {
  theme: AppTheme;
  hotkeys: HotkeyBindings;
}

export interface PickupItem {
  id: string;
  appId: string;
  appName: string;
  elementName: string;
  bgColor: string;
  removedAt: string;
}

export const DEFAULT_HOTKEYS: HotkeyBindings = {
  toggleOverlay: 'F9',
  voltMode: 'Ctrl+Alt+Z',
  pickupMode: 'Ctrl+Shift+Z',
};

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'system',
  hotkeys: DEFAULT_HOTKEYS,
};
