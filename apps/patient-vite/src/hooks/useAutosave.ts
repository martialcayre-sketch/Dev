import { useCallback, useRef } from 'react';

/**
 * Hook d'autosave avec debounce
 * @param saveFn Fonction async de sauvegarde
 * @param delayMs Délai de debounce en ms (défaut: 500)
 */
export function useAutosave<T extends unknown>(
  saveFn: (data: T) => Promise<void>,
  delayMs: number = 500
) {
  const timerRef = useRef<number | null>(null);

  const scheduleSave = useCallback(
    (data: T) => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(async () => {
        try {
          await saveFn(data);
        } catch (err) {
          console.error('[useAutosave] Error:', err);
        }
      }, delayMs);
    },
    [saveFn, delayMs]
  );

  return { scheduleSave };
}
