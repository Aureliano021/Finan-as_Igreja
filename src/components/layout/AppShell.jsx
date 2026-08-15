import React from 'react';

/**
 * AppShell Component
 * Container mestre da aplicação, compondo header, main, fab e navegação inferior.
 */
export default function AppShell({
  header,
  children,
  navigation,
  fab,
  toast,
  modal
}) {
  return (
    <div className="app-shell">
      {/* Toast Notification Layer */}
      {toast}

      {/* Sticky Header Slot */}
      {header}

      {/* Main Scrollable Content */}
      <main className="app-main">
        {children}
      </main>

      {/* Floating Action Button Slot */}
      {fab}

      {/* Bottom Navigation Slot */}
      {navigation}

      {/* Modals & BottomSheets Layer */}
      {modal}
    </div>
  );
}
