import React from 'react';
import useMediaQuery from '../hooks/useMediaQuery';
import NavbarDesktop from './desktop/NavbarDesktop';
import NavbarMobile from './mobile/NavbarMobile';

/**
 * Navbar wrapper — conditionally renders only the mobile OR desktop navbar
 * based on viewport width, avoiding unnecessary DOM nodes and React reconciliation
 * for the invisible component.
 */
export default function Navbar(props) {
  const isMobile = useMediaQuery('(max-width: 768px)');

  return isMobile ? <NavbarMobile {...props} /> : <NavbarDesktop {...props} />;
}
