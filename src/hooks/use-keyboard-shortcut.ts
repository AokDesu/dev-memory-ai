'use client';

import { useEffect } from 'react';

interface KeyboardShortcutOptions {
  key: string;
  ctrl?: boolean;
  meta?: boolean;
  shift?: boolean;
  alt?: boolean;
  preventDefault?: boolean;
}

export function useKeyboardShortcut(
  options: KeyboardShortcutOptions,
  callback: () => void,
  enabled: boolean = true
) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const { key, ctrl = false, meta = false, shift = false, alt = false, preventDefault = true } = options;

      const isCtrlOrMeta = ctrl || meta;
      const ctrlOrMetaPressed = event.ctrlKey || event.metaKey;

      const matches =
        event.key.toLowerCase() === key.toLowerCase() &&
        (!isCtrlOrMeta || ctrlOrMetaPressed) &&
        (!shift || event.shiftKey) &&
        (!alt || event.altKey);

      if (matches) {
        if (preventDefault) {
          event.preventDefault();
        }
        callback();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [options, callback, enabled]);
}

// Predefined shortcuts
export const shortcuts = {
  commandPalette: { key: 'k', meta: true },
  search: { key: '/', preventDefault: true },
  escape: { key: 'Escape' },
  save: { key: 's', meta: true },
  copy: { key: 'c', meta: true },
  help: { key: '?' },
} as const;

// Made with Bob
