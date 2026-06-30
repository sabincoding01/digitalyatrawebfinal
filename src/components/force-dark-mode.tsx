"use client";

import { useEffect } from "react";

/**
 * Adds `class="dark"` to <html> when mounted (for portal/admin routes)
 * and removes it when unmounted so the main site stays in light mode.
 */
export function ForceDarkMode() {
  useEffect(() => {
    const html = document.documentElement;
    html.classList.add("dark");
    return () => {
      html.classList.remove("dark");
    };
  }, []);

  return null;
}
