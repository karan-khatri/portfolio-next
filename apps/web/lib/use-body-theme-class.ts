"use client";

import { useEffect } from "react";

// Radix/Base UI portal-based components (Dialog, Popover, Select content,
// etc.) render into document.body by default — a sibling of the themed
// wrapper div, not a descendant of it. Since .theme-admin/.theme-site only
// override CSS custom properties (not set them on <body> itself), portaled
// content fell back to the unthemed default (visibly: dialogs rendered
// light-mode inside the dark admin). Toggling the class on <body> for the
// component's lifetime means portaled content — attached directly under
// body — always inherits the right variables too.
export function useBodyThemeClass(className: string) {
  useEffect(() => {
    document.body.classList.add(className);
    return () => {
      document.body.classList.remove(className);
    };
  }, [className]);
}
