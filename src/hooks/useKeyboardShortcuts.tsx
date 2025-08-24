import React, { useEffect, useCallback, useState } from 'react';

interface Shortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  description: string;
  handler: () => void;
}

export function useKeyboardShortcuts(shortcuts: Shortcut[]) {
  const [showHelp, setShowHelp] = useState(false);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Show help on ? key
    if (event.key === '?' && !event.ctrlKey && !event.metaKey) {
      event.preventDefault();
      setShowHelp(prev => !prev);
      return;
    }

    shortcuts.forEach(shortcut => {
      const isMatch = 
        event.key.toLowerCase() === shortcut.key.toLowerCase() &&
        !!event.ctrlKey === !!shortcut.ctrl &&
        !!event.shiftKey === !!shortcut.shift &&
        !!event.altKey === !!shortcut.alt;

      if (isMatch) {
        event.preventDefault();
        shortcut.handler();
      }
    });
  }, [shortcuts]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return { showHelp, setShowHelp };
}

// Common shortcuts hook for navigation
export function useNavigationShortcuts() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [items, setItems] = useState<{ onSelect?: () => void }[]>([]);

  const shortcuts: Shortcut[] = [
    {
      key: 'j',
      description: 'Move down',
      handler: () => setSelectedIndex(prev => Math.min(prev + 1, items.length - 1))
    },
    {
      key: 'k',
      description: 'Move up',
      handler: () => setSelectedIndex(prev => Math.max(prev - 1, 0))
    },
    {
      key: 'Enter',
      description: 'Select item',
      handler: () => {
        if (items[selectedIndex]?.onSelect) {
          items[selectedIndex].onSelect();
        }
      }
    },
    {
      key: '/',
      description: 'Focus search',
      handler: () => {
        const searchInput = document.querySelector('[data-search-input]') as HTMLInputElement;
        searchInput?.focus();
      }
    },
    {
      key: 'Escape',
      description: 'Clear search/selection',
      handler: () => {
        const searchInput = document.querySelector('[data-search-input]') as HTMLInputElement;
        if (searchInput) {
          searchInput.value = '';
          searchInput.blur();
        }
        setSelectedIndex(0);
      }
    }
  ];

  const { showHelp, setShowHelp } = useKeyboardShortcuts(shortcuts);

  return {
    selectedIndex,
    setSelectedIndex,
    setItems,
    showHelp,
    setShowHelp,
    shortcuts
  };
}

// Keyboard shortcut display component
export function KeyboardShortcutHelp({ 
  shortcuts, 
  open, 
  onClose 
}: { 
  shortcuts: Shortcut[];
  open: boolean;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div className="bg-background rounded-lg shadow-lg p-6 max-w-md w-full" onClick={e => e.stopPropagation()}>
        <h2 className="text-lg font-semibold mb-4">Keyboard Shortcuts</h2>
        <div className="space-y-2">
          <div className="flex justify-between items-center py-1">
            <span className="text-sm">Show this help</span>
            <kbd className="px-2 py-1 text-xs bg-muted rounded">?</kbd>
          </div>
          {shortcuts.map((shortcut, index) => (
            <div key={index} className="flex justify-between items-center py-1">
              <span className="text-sm">{shortcut.description}</span>
              <div className="flex gap-1">
                {shortcut.ctrl && <kbd className="px-2 py-1 text-xs bg-muted rounded">Ctrl</kbd>}
                {shortcut.shift && <kbd className="px-2 py-1 text-xs bg-muted rounded">Shift</kbd>}
                {shortcut.alt && <kbd className="px-2 py-1 text-xs bg-muted rounded">Alt</kbd>}
                <kbd className="px-2 py-1 text-xs bg-muted rounded">{shortcut.key}</kbd>
              </div>
            </div>
          ))}
        </div>
        <button 
          onClick={onClose}
          className="mt-4 w-full px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
} 