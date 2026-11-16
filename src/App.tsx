import React, { useEffect, useState } from 'react';
import { Settings, X } from 'lucide-react';
import {
  ActiveMode,
  AppSettings,
  DEFAULT_SETTINGS,
  PickupItem,
  ResolvedTheme,
} from './types';
import { ControlWorkspace } from './components/ControlWorkspace';
import { RestoreWhitelist } from './components/RestoreWhitelist';
import { SettingsModal } from './components/SettingsModal';

type ActiveView = 'modes' | 'whitelist';

const STORAGE_SETTINGS = 'volt_pickup_settings_v2';
const STORAGE_PICKUP = 'volt_pickup_rules_v2';

function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_SETTINGS);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    return {
      theme: parsed.theme || DEFAULT_SETTINGS.theme,
      hotkeys: {
        ...DEFAULT_SETTINGS.hotkeys,
        ...(parsed.hotkeys || {}),
      },
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function loadPickupItems(): PickupItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_PICKUP);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function extractPhysicalKey(e: KeyboardEvent): string {
  const keyMatch = /^Key([A-Z])$/.exec(e.code);
  if (keyMatch) return keyMatch[1];

  const digitMatch = /^Digit(\d)$/.exec(e.code);
  if (digitMatch) return digitMatch[1];

  const fnMatch = /^F(\d{1,2})$/.exec(e.code);
  if (fnMatch) return `F${fnMatch[1]}`;

  if (e.code === 'Space' || e.key === ' ') return 'SPACE';
  if (e.code === 'Escape' || e.key === 'Escape') return 'ESC';

  return e.key.toUpperCase();
}

function matchesHotkey(e: KeyboardEvent, hotkey: string): boolean {
  const parts = hotkey
    .split('+')
    .map((p) => p.trim().toUpperCase())
    .filter(Boolean);
  if (parts.length === 0) return false;

  const needCtrl = parts.includes('CTRL') || parts.includes('CONTROL');
  const needAlt = parts.includes('ALT');
  const needShift = parts.includes('SHIFT');
  const keyToken = parts.find((p) => !['CTRL', 'CONTROL', 'ALT', 'SHIFT'].includes(p));
  if (!keyToken) return false;

  const physicalKey = extractPhysicalKey(e);
  const logicalKey =
    e.key === ' ' ? 'SPACE' : e.key === 'Escape' ? 'ESC' : e.key.toUpperCase();

  return (
    e.ctrlKey === needCtrl &&
    e.altKey === needAlt &&
    e.shiftKey === needShift &&
    (physicalKey === keyToken || logicalKey === keyToken)
  );
}

export default function App() {
  const [activeView, setActiveView] = useState<ActiveView>('modes');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<AppSettings>(loadSettings);
  const [systemDark, setSystemDark] = useState<boolean>(() =>
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  );

  const [activeMode, setActiveMode] = useState<ActiveMode>('none');
  const [overlayVisible, setOverlayVisible] = useState<boolean>(true);
  const [pickupItems, setPickupItems] = useState<PickupItem[]>(loadPickupItems);

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (ev: MediaQueryListEvent) => setSystemDark(ev.matches);
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  const resolvedTheme: ResolvedTheme =
    settings.theme === 'system' ? (systemDark ? 'black' : 'white') : settings.theme;

  useEffect(() => {
    document.documentElement.setAttribute('data-resolved-theme', resolvedTheme);
  }, [resolvedTheme]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_SETTINGS, JSON.stringify(settings));
    } catch {
      // Ignore storage errors
    }
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_PICKUP, JSON.stringify(pickupItems));
    } catch {
      // Ignore storage errors
    }
  }, [pickupItems]);

  // Hotkey listener: Volt/Pickup activate only via hotkeys; active mode turns off ONLY when center X is clicked
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (settingsOpen || e.repeat) return;
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'SELECT' ||
          target.tagName === 'TEXTAREA')
      ) {
        return;
      }

      if (matchesHotkey(e, settings.hotkeys.voltMode)) {
        e.preventDefault();
        e.stopPropagation();
        setActiveMode('volt');
        setOverlayVisible(true);
      } else if (matchesHotkey(e, settings.hotkeys.pickupMode)) {
        e.preventDefault();
        e.stopPropagation();
        setActiveMode('pickup');
        setOverlayVisible(true);
      } else if (matchesHotkey(e, settings.hotkeys.toggleOverlay)) {
        e.preventDefault();
        e.stopPropagation();
        setOverlayVisible((v) => !v);
      }
    };

    window.addEventListener('keydown', onKeyDown, true);
    return () => window.removeEventListener('keydown', onKeyDown, true);
  }, [settings.hotkeys, settingsOpen]);

  const handleRestoreItem = (id: string) => {
    setPickupItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleRestoreAll = () => {
    setPickupItems([]);
  };

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-canvas)',
        color: 'var(--text-primary)',
      }}
      className="min-h-screen flex flex-col transition-colors duration-200"
    >
      {/* Software Top Bar */}
      <header
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border-hairline)',
        }}
        className="border-b px-6 py-3"
      >
        <div className="max-w-[960px] mx-auto flex items-center justify-between gap-8">
          <a
            href="#modes"
            onClick={(e) => {
              e.preventDefault();
              setActiveView('modes');
            }}
            className="text-sm font-bold tracking-tight whitespace-nowrap shrink-0"
          >
            Volt &amp; Pickup
          </a>

          <nav aria-label="Primary sections" className="flex items-center gap-6 text-sm font-medium">
            <button
              type="button"
              onClick={() => setActiveView('modes')}
              style={{
                color: activeView === 'modes' ? 'var(--text-primary)' : 'var(--text-muted)',
                borderColor: activeView === 'modes' ? 'var(--accent-volt)' : 'transparent',
              }}
              className="py-1 border-b-2 transition-colors whitespace-nowrap shrink-0"
            >
              Modes
            </button>
            <button
              type="button"
              onClick={() => setActiveView('whitelist')}
              style={{
                color: activeView === 'whitelist' ? 'var(--text-primary)' : 'var(--text-muted)',
                borderColor: activeView === 'whitelist' ? 'var(--accent-pickup)' : 'transparent',
              }}
              className="py-1 border-b-2 transition-colors whitespace-nowrap shrink-0"
            >
              Whitelist ({pickupItems.length})
            </button>
          </nav>

          <div className="shrink-0">
            <button
              type="button"
              onClick={() => setSettingsOpen(true)}
              style={{
                backgroundColor: 'var(--bg-subtle)',
                color: 'var(--text-primary)',
                borderColor: 'var(--border-hairline)',
              }}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold border rounded-lg hover:opacity-85 transition-opacity whitespace-nowrap shrink-0"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Settings</span>
            </button>
          </div>
        </div>
      </header>

      {/* Software Window Content */}
      <main className="flex-1 max-w-[960px] w-full mx-auto px-6 py-6">
        {activeView === 'modes' ? (
          <ControlWorkspace settings={settings} activeMode={activeMode} />
        ) : (
          <RestoreWhitelist
            items={pickupItems}
            onRestoreItem={handleRestoreItem}
            onRestoreAll={handleRestoreAll}
          />
        )}
      </main>

      {/* Center-Screen X: Click ONLY to turn off the active mode */}
      {activeMode !== 'none' && overlayVisible && (
        <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
          <button
            type="button"
            aria-label="Turn off active mode"
            onClick={() => setActiveMode('none')}
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderColor:
                activeMode === 'volt' ? 'var(--accent-volt)' : 'var(--accent-pickup)',
              color: activeMode === 'volt' ? 'var(--accent-volt)' : 'var(--accent-pickup)',
            }}
            className="w-14 h-14 rounded-full border-2 shadow-2xl flex items-center justify-center transition-transform duration-150 hover:scale-105 cursor-pointer"
          >
            <X className="w-6 h-6 stroke-[2.5]" />
          </button>
        </div>
      )}

      {/* Minimal Footer */}
      <footer className="max-w-[960px] w-full mx-auto px-6 py-3 flex justify-end">
        <span className="text-[6px] leading-none text-yellow-300/45 select-none">
          Also Try Ublock origin Extension on Browser!
        </span>
      </footer>

      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={setSettings}
      />
    </div>
  );
}
