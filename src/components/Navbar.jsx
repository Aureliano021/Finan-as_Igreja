import React from 'react';
import NavbarDesktop from './desktop/NavbarDesktop';
import NavbarMobile from './mobile/NavbarMobile';

export default function Navbar(props) {
  return (
    <>
      <NavbarDesktop {...props} />
      <NavbarMobile {...props} />
    </>
  );
}
