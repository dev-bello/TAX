import { useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface ShortcutConfig {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  action: () => void;
  description: string;
}

export function useKeyboardShortcuts(shortcuts: ShortcutConfig[]) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      for (const shortcut of shortcuts) {
        const ctrlMatch = shortcut.ctrl ? e.ctrlKey || e.metaKey : !e.ctrlKey && !e.metaKey;
        const shiftMatch = shortcut.shift ? e.shiftKey : !e.shiftKey;
        const altMatch = shortcut.alt ? e.altKey : !e.altKey;

        if (
          e.key.toLowerCase() === shortcut.key.toLowerCase() &&
          ctrlMatch &&
          shiftMatch &&
          altMatch
        ) {
          e.preventDefault();
          shortcut.action();
          return;
        }
      }
    },
    [shortcuts]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

// Default app shortcuts
export function useAppShortcuts() {
  const navigate = useNavigate();

  useKeyboardShortcuts([
    { key: '/', action: () => document.querySelector<HTMLInputElement>('input[type="text"]')?.focus(), description: 'Focus search' },
    { key: 'd', action: () => navigate('/'), description: 'Go to Dashboard' },
    { key: 'c', action: () => navigate('/calculator'), description: 'Go to Calculator' },
    { key: 'e', action: () => navigate('/expenses'), description: 'Go to Expenses' },
    { key: 'p', action: () => navigate('/profile'), description: 'Go to Profile' },
    { key: '?', action: () => alert('Keyboard Shortcuts:\n/ - Search\nd - Dashboard\nc - Calculator\ne - Expenses\np - Profile\n? - Help'), description: 'Show help' },
  ]);
}
