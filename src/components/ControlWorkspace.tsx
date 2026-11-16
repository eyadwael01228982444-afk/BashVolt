import React from 'react';
import { Sparkles, Zap } from 'lucide-react';
import { ActiveMode, AppSettings } from '../types';

interface ControlWorkspaceProps {
  settings: AppSettings;
  activeMode: ActiveMode;
}

export const ControlWorkspace: React.FC<ControlWorkspaceProps> = ({
  settings,
  activeMode,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Section 1: Volt */}
      <section
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: activeMode === 'volt' ? 'var(--accent-volt)' : 'var(--border-hairline)',
        }}
        className={`p-5 rounded-xl border flex flex-col justify-between gap-4 transition-colors ${
          activeMode === 'volt' ? 'ring-1 ring-current' : ''
        }`}
      >
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 shrink-0" style={{ color: 'var(--accent-volt)' }} />
              <h2 className="text-sm font-semibold">Volt</h2>
            </div>
            <span style={{ color: 'var(--text-muted)' }} className="font-mono text-xs">
              {settings.hotkeys.voltMode}
            </span>
          </div>

          <p style={{ color: 'var(--text-secondary)' }} className="text-xs leading-relaxed">
            Temporarily hides whatever you click until the window is refreshed or the program is
            closed and reopened. Matches and resizes with the window&apos;s background color.
          </p>
        </div>

        <div
          style={{ color: activeMode === 'volt' ? 'var(--accent-volt)' : 'var(--text-muted)' }}
          className="text-xs font-medium"
        >
          {activeMode === 'volt' ? 'Active' : `Press ${settings.hotkeys.voltMode}`}
        </div>
      </section>

      {/* Section 2: Pickup */}
      <section
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: activeMode === 'pickup' ? 'var(--accent-pickup)' : 'var(--border-hairline)',
        }}
        className={`p-5 rounded-xl border flex flex-col justify-between gap-4 transition-colors ${
          activeMode === 'pickup' ? 'ring-1 ring-current' : ''
        }`}
      >
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 shrink-0" style={{ color: 'var(--accent-pickup)' }} />
              <h2 className="text-sm font-semibold">Pickup</h2>
            </div>
            <span style={{ color: 'var(--text-muted)' }} className="font-mono text-xs">
              {settings.hotkeys.pickupMode}
            </span>
          </div>

          <p style={{ color: 'var(--text-secondary)' }} className="text-xs leading-relaxed">
            Whatever you click disappears forever across restarts. Resizes the window with the
            same background color and saves items in your Whitelist so you can restore them.
          </p>
        </div>

        <div
          style={{ color: activeMode === 'pickup' ? 'var(--accent-pickup)' : 'var(--text-muted)' }}
          className="text-xs font-medium"
        >
          {activeMode === 'pickup' ? 'Active' : `Press ${settings.hotkeys.pickupMode}`}
        </div>
      </section>
    </div>
  );
};
