import { useState, useEffect } from 'react';

export type SurfaceMode = 'dark' | 'light' | 'lite';

export function useSurfaceMode() {
  const [mode, setMode] = useState<SurfaceMode>(() => {
    const isLowEnd =
      typeof navigator !== 'undefined' &&
      ((navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) ||
        // @ts-expect-error deviceMemory is non-standard
        (navigator.deviceMemory && navigator.deviceMemory <= 4));
    return isLowEnd ? 'lite' : 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-surface', mode);
  }, [mode]);

  return { mode, setMode };
}