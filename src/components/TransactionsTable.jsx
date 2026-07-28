import React from 'react';
import useMediaQuery from '../hooks/useMediaQuery';
import TransactionsTableDesktop from './desktop/TransactionsTableDesktop';
import TransactionsTableMobile from './mobile/TransactionsTableMobile';

/**
 * Main TransactionsTable component.
 * Conditionally renders only the device-appropriate component using
 * useMediaQuery instead of rendering both and hiding with CSS.
 * Exception: during PNG export, always render desktop layout.
 */
export default function TransactionsTable(props) {
  const { isExporting } = props;
  const isMobile = useMediaQuery('(max-width: 768px)');

  // When exporting PNG, always render the desktop side-by-side layout with full data
  if (isExporting) {
    return <TransactionsTableDesktop {...props} />;
  }

  return isMobile ? (
    <TransactionsTableMobile {...props} />
  ) : (
    <TransactionsTableDesktop {...props} />
  );
}
