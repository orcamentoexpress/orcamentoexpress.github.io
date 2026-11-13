import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * `navigator.onLine` é pouco confiável (em celular/PWA costuma ficar "false" mesmo com internet,
 * e o aviso nunca saía). Aqui o navegador só vale como pista: a conexão é confirmada com uma
 * requisição real e pequena, e reconferida sozinha enquanto estiver "offline".
 */
async function reallyOnline(): Promise<boolean> {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), 5000);
  try {
    const base = (import.meta as unknown as { env?: { BASE_URL?: string } }).env?.BASE_URL || '/';
    const res = await fetch(`${base}manifest.webmanifest?_=${Date.now()}`, {
      method: 'GET',
      cache: 'no-store',
      signal: controller.signal,
    });
    return res.ok || res.status < 500;
  } catch {
    return false;
  } finally {
    window.clearTimeout(timer);
  }
}

export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const checking = useRef(false);

  const verify = useCallback(async () => {
    if (checking.current) return;
    checking.current = true;
    try {
      if (typeof navigator !== 'undefined' && navigator.onLine) {
        setIsOnline(true);
        return;
      }
      setIsOnline(await reallyOnline());
    } finally {
      checking.current = false;
    }
  }, []);

  useEffect(() => {
    verify();
    const onOnline = () => setIsOnline(true);
    const onOffline = () => verify();
    const onFocus = () => verify();
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onFocus);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onFocus);
    };
  }, [verify]);

  // Enquanto aparecer offline, reconfere a cada 8s para o aviso sumir sozinho.
  useEffect(() => {
    if (isOnline) return;
    const id = window.setInterval(async () => {
      if (await reallyOnline()) setIsOnline(true);
    }, 8000);
    return () => window.clearInterval(id);
  }, [isOnline]);

  return isOnline;
}
