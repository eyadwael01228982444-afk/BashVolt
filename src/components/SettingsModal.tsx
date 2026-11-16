import React, { useEffect, useState } from 'react';
import { Keyboard, Palette, RotateCcw, X } from 'lucide-react';
import { AppSettings, AppTheme, DEFAULT_HOTKEYS, HotkeyBindings } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (next: AppSettings) => void;
}

type SettingsTab = 'hotbar' | 'theme';
type CaptureTarget = keyof HotkeyBindings | null;

function formatKeyboardEvent(e: KeyboardEvent): string | null {
  const key = e.key;
  if (key === 'Control' || key === 'Shift' || key === 'Alt' || key === 'Meta') {
    return null;
  }
  const parts: string[] = [];
  if (e.ctrlKey) parts.push('Ctrl');
  if (e.altKey) parts.push('Alt');
  if (e.shiftKey) parts.push('Shift');

  let mainKey: string | null = null;
  const keyMatch = /^Key([A-Z])$/.exec(e.code);
  const digitMatch = /^Digit(\d)$/.exec(e.code);
  const fnMatch = /^F(\d{1,2})$/.exec(e.code);

  if (fnMatch) {
    mainKey = `F${fnMatch[1]}`;
  } else if (keyMatch) {
    mainKey = keyMatch[1];
  } else if (digitMatch) {
    mainKey = digitMatch[1];
  } else if (e.code === 'Space' || key === ' ') {
    mainKey = 'Space';
  } else if (e.code === 'Escape' || key === 'Escape') {
    mainKey = 'Esc';
  } else if (/^F\d{1,2}$/i.test(key)) {
    mainKey = key.toUpperCase();
  } else if (key.length === 1 && /[a-z0-9]/i.test(key)) {
    mainKey = key.toUpperCase();
  }

  if (!mainKey) return null;
  parts.push(mainKey);
  return parts.join('+');
}

const THEME_OPTIONS: {
  id: AppTheme;
  name: string;
  description: string;
  swatch: string;
}[] = [
  {
    id: 'white',
    name: 'White',
    description: 'Bright daylight workspace with clean soft borders.',
    swatch: '#ffffff',
  },
  {
    id: 'purple',
    name: 'Purple',
    description: 'Deep violet-plum studio surface with warm contrast.',
    swatch: '#21153a',
  },
  {
    id: 'system',
    name: 'System',
    description: 'Automatically follows your operating system theme.',
    swatch: 'linear-gradient(135deg, #ffffff 50%, #121216 50%)',
  },
  {
    id: 'black',
    name: 'Black',
    description: 'True dark obsidian surface for low-light sessions.',
    swatch: '#09090b',
  },
];

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}) => {
  const [activeOption, setActiveOption] = useState<SettingsTab>('hotbar');
  const [capturing, setCapturing] = useState<CaptureTarget>(null);

  useEffect(() => {
    if (!isOpen) {
      setCapturing(null);
      return;
    }
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !capturing) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, capturing, onClose]);

  useEffect(() => {
    if (!capturing) return;
    const handleCapture = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const combo = formatKeyboardEvent(e);
      if (combo) {
        onUpdateSettings({
          ...settings,
          hotkeys: {
            ...settings.hotkeys,
            [capturing]: combo,
          },
        });
        setCapturing(null);
      }
    };
    window.addEventListener('keydown', handleCapture, true);
    return () => window.removeEventListener('keydown', handleCapture, true);
  }, [capturing, settings, onUpdateSettings]);

  if (!isOpen) return null;

  const hotkeyFields: {
    key: keyof HotkeyBindings;
    label: string;
    helper: string;
  }[] = [
    {
      key: 'voltMode',
      label: 'Volt Hotkey',
      helper: 'Activates Volt mode (temporary hide until refresh or reopen).',
    },
    {
      key: 'pickupMode',
      label: 'Pickup Hotkey',
      helper: 'Activates Pickup mode (permanent removal with Whitelist restore).',
    },
    {
      key: 'toggleOverlay',
      label: 'Toggle Box Visibility',
      helper: 'Shows or hides the selection box while a mode is active.',
    },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Settings"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border-hairline)',
          color: 'var(--text-primary)',
        }}
        className="w-full max-w-[560px] border rounded-xl shadow-xl overflow-hidden"
      >
        {/* Header */}
        <div
          style={{ borderColor: 'var(--border-hairline)' }}
          className="flex items-center justify-between px-5 py-3.5 border-b"
        >
          <h2 className="text-sm font-semibold">Settings</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close settings"
            style={{ color: 'var(--text-secondary)' }}
            className="p-1.5 rounded-lg hover:opacity-80 transition-opacity"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 2 Options Navigation: Hotbar & Theme */}
        <div
          style={{
            backgroundColor: 'var(--bg-subtle)',
            borderColor: 'var(--border-hairline)',
          }}
          className="flex items-center gap-2 px-6 py-2.5 border-b"
        >
          <button
            type="button"
            onClick={() => setActiveOption('hotbar')}
            style={
              activeOption === 'hotbar'
                ? {
                    backgroundColor: 'var(--bg-surface)',
                    color: 'var(--text-primary)',
                  }
                : { color: 'var(--text-secondary)' }
            }
            className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap"
          >
            <Keyboard className="w-3.5 h-3.5" />
            <span>Hotbar</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveOption('theme')}
            style={
              activeOption === 'theme'
                ? {
                    backgroundColor: 'var(--bg-surface)',
                    color: 'var(--text-primary)',
                  }
                : { color: 'var(--text-secondary)' }
            }
            className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap"
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Theme</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {activeOption === 'hotbar' ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p style={{ color: 'var(--text-secondary)' }} className="text-xs">
                  Only pressing these hotkeys activates or switches modes.
                </p>
                <button
                  type="button"
                  onClick={() =>
                    onUpdateSettings({
                      ...settings,
                      hotkeys: DEFAULT_HOTKEYS,
                    })
                  }
                  style={{
                    backgroundColor: 'var(--bg-subtle)',
                    color: 'var(--text-primary)',
                  }}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg hover:opacity-85 transition-opacity whitespace-nowrap shrink-0 ml-3"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              </div>

              <div className="space-y-3">
                {hotkeyFields.map(({ key, label, helper }) => {
                  const isCapturing = capturing === key;
                  return (
                    <div
                      key={key}
                      style={{
                        borderColor: 'var(--border-hairline)',
                        backgroundColor: 'var(--bg-canvas)',
                      }}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 border rounded-xl"
                    >
                      <div className="space-y-0.5">
                        <p className="text-xs font-semibold">{label}</p>
                        <p style={{ color: 'var(--text-muted)' }} className="text-xs">
                          {helper}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <input
                          type="text"
                          value={settings.hotkeys[key]}
                          onChange={(e) =>
                            onUpdateSettings({
                              ...settings,
                              hotkeys: {
                                ...settings.hotkeys,
                                [key]: e.target.value,
                              },
                            })
                          }
                          aria-label={label}
                          style={{
                            backgroundColor: 'var(--bg-surface)',
                            borderColor: 'var(--border-hairline)',
                            color: 'var(--text-primary)',
                          }}
                          className="w-32 px-2.5 py-1.5 text-xs font-mono border rounded-lg focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setCapturing(isCapturing ? null : key)}
                          style={
                            isCapturing
                              ? { backgroundColor: '#dc2626', color: '#ffffff', borderColor: '#dc2626' }
                              : {
                                  backgroundColor: 'var(--bg-surface)',
                                  color: 'var(--text-primary)',
                                  borderColor: 'var(--border-hairline)',
                                }
                          }
                          className="px-3 py-1.5 text-xs font-medium border rounded-lg transition-colors whitespace-nowrap"
                        >
                          {isCapturing ? 'Press keys...' : 'Edit'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {THEME_OPTIONS.map((option) => {
                const selected = settings.theme === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => onUpdateSettings({ ...settings, theme: option.id })}
                    style={{
                      backgroundColor: 'var(--bg-canvas)',
                      borderColor: selected ? 'var(--accent-volt)' : 'var(--border-hairline)',
                    }}
                    className={`text-left p-4 rounded-xl border transition-all ${
                      selected ? 'ring-1 ring-current' : 'hover:opacity-90'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <span className="text-sm font-semibold">{option.name}</span>
                      <span
                        className="w-5 h-5 rounded-full border border-slate-400/50 shrink-0"
                        style={{ background: option.swatch }}
                      />
                    </div>
                    <p style={{ color: 'var(--text-muted)' }} className="text-xs leading-relaxed">
                      {option.description}
                    </p>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
