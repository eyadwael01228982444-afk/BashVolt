import React from 'react';
import { RotateCcw } from 'lucide-react';
import { PickupItem } from '../types';

interface RestoreWhitelistProps {
  items: PickupItem[];
  onRestoreItem: (id: string) => void;
  onRestoreAll: () => void;
}

export const RestoreWhitelist: React.FC<RestoreWhitelistProps> = ({
  items,
  onRestoreItem,
  onRestoreAll,
}) => {
  return (
    <section
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderColor: 'var(--border-hairline)',
      }}
      className="border rounded-2xl p-6 space-y-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4" style={{ borderColor: 'var(--border-hairline)' }}>
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">Pickup Whitelist &amp; Restore</h2>
          <p style={{ color: 'var(--text-secondary)' }} className="text-sm">
            Everything permanently removed by Pickup Mode is listed here. Restore any item anytime
            to bring it back and return its window to normal size.
          </p>
        </div>

        {items.length > 0 && (
          <button
            type="button"
            onClick={onRestoreAll}
            style={{
              backgroundColor: 'var(--bg-subtle)',
              color: 'var(--text-primary)',
              borderColor: 'var(--border-hairline)',
            }}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold border rounded-lg hover:opacity-85 transition-opacity whitespace-nowrap"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restore All ({items.length})</span>
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div
          style={{
            borderColor: 'var(--border-hairline)',
            color: 'var(--text-muted)',
          }}
          className="py-12 px-6 text-center border border-dashed rounded-xl text-sm"
        >
          Nothing has been permanently removed yet. Arm Pickup Mode with your hotkey and click any
          unwanted banner, card, or button across open apps to manage it here.
        </div>
      ) : (
        <div className="divide-y" style={{ borderColor: 'var(--border-hairline)' }}>
          {items.map((item) => (
            <div
              key={item.id}
              style={{ borderColor: 'var(--border-hairline)' }}
              className="py-3.5 flex flex-wrap items-center justify-between gap-4"
            >
              <div className="min-w-0 space-y-0.5">
                <p className="text-sm font-medium truncate">{item.elementName}</p>
                <div
                  style={{ color: 'var(--text-muted)' }}
                  className="flex items-center gap-2 text-xs"
                >
                  <span>{item.appName}</span>
                  <span aria-hidden="true">·</span>
                  <span className="inline-flex items-center gap-1.5">
                    <span
                      className="inline-block w-2.5 h-2.5 rounded-xs border border-slate-400/50"
                      style={{ backgroundColor: item.bgColor }}
                    />
                    <span className="font-mono">{item.bgColor}</span>
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono tabular-nums">{item.removedAt}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onRestoreItem(item.id)}
                style={{
                  backgroundColor: 'var(--bg-subtle)',
                  color: 'var(--text-primary)',
                  borderColor: 'var(--border-hairline)',
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold border rounded-lg hover:opacity-85 transition-opacity whitespace-nowrap shrink-0"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restore</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
