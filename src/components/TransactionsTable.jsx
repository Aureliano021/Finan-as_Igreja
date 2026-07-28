import React from 'react';
import TransactionsTableDesktop from './desktop/TransactionsTableDesktop';
import TransactionsTableMobile from './mobile/TransactionsTableMobile';

/**
 * Main TransactionsTable component.
 * Renders dedicated device components (TransactionsTableDesktop & TransactionsTableMobile)
 * to maintain clean separation of concerns and ensure zero cross-device styling conflicts.
 */
export default function TransactionsTable(props) {
  const { isExporting } = props;

  // When exporting PNG, always render the desktop side-by-side layout with full data
  if (isExporting) {
    return <TransactionsTableDesktop {...props} />;
  }

  return (
    <>
      {/* Desktop view (rendered exclusively on desktop screens) */}
      <div className="desktop-only">
        <TransactionsTableDesktop {...props} />
      </div>

      {/* Mobile view (rendered exclusively on mobile smartphones) */}
      <div className="mobile-only">
        <TransactionsTableMobile {...props} />
      </div>
    </>
  );
}
