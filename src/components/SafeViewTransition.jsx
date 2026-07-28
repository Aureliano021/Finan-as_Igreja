import React, { ViewTransition } from 'react';

/**
 * SafeViewTransition component wrapper.
 * Provides graceful degradation: if React's ViewTransition component is available
 * in the React runtime, it renders <ViewTransition>; otherwise, it smoothly
 * falls back to rendering children directly without throwing an error.
 */
export default function SafeViewTransition({ children, ...props }) {
  if (typeof ViewTransition !== 'undefined' && ViewTransition) {
    return <ViewTransition {...props}>{children}</ViewTransition>;
  }
  return <>{children}</>;
}
