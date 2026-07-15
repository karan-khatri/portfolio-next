"use client";

import { useEffect } from "react";

export function useBodyThemeClass(className: string) {
  useEffect(() => {
    document.body.classList.add(className);
    return () => {
      document.body.classList.remove(className);
    };
  }, [className]);
}
