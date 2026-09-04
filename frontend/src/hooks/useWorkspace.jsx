import React, { createContext, useContext, useState, useCallback } from 'react';

const ContextualWindowContext = createContext(null);

export function ContextualWindowProvider({ children }) {
  // activeWindow: null when closed, or an object:
  // {
  //   id: string,          // e.g. 'headline', 'core', 'spread', 'route-DEL-BOM', 'flag-xxx', 'formula'
  //   type: string,        // 'headline' | 'core' | 'spread' | 'route' | 'policy-flag' | 'formula' | 'concept'
  //   title: string,
  //   titleHi?: string,
  //   data?: any
  // }
  const [activeWindow, setActiveWindow] = useState(null);

  const openContextualWindow = useCallback((windowConfig) => {
    // Replaces whatever is currently open with the single new window
    setActiveWindow(windowConfig);
  }, []);

  const closeContextualWindow = useCallback(() => {
    setActiveWindow(null);
  }, []);

  return (
    <ContextualWindowContext.Provider value={{
      activeWindow,
      openContextualWindow,
      closeContextualWindow,
      // Aliases for clean backward compatibility
      openTab: openContextualWindow,
      closeTab: closeContextualWindow,
      activeTab: activeWindow,
      activeTabId: activeWindow?.id || null
    }}>
      {children}
    </ContextualWindowContext.Provider>
  );
}

export function useContextualWindow() {
  const context = useContext(ContextualWindowContext);
  if (!context) {
    throw new Error('useContextualWindow must be used within a ContextualWindowProvider');
  }
  return context;
}

// Backward compatible alias
export const useWorkspace = useContextualWindow;
export const WorkspaceProvider = ContextualWindowProvider;
