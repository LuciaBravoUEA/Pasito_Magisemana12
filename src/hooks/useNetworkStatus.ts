import { useEffect, useState } from 'react';

// Wrapper transversal sobre online/offline del WebView (Capacitor expone el mismo navigator.onLine
// que un navegador normal; no requiere el plugin @capacitor/network para este alcance). Usado por
// el repositorio de rutinas para decidir cuándo drenar el outbox — ver services/repositories/routinesRepository.ts.
export const useNetworkStatus = (): boolean => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = (): void => setIsOnline(true);
    const handleOffline = (): void => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
};
