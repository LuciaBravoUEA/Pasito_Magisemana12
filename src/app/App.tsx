import { IonApp, setupIonicReact } from '@ionic/react';
import { Capacitor } from '@capacitor/core';
import { Keyboard, KeyboardResize } from '@capacitor/keyboard';
import { IonReactRouter } from '@ionic/react-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { useEffect } from 'react';
import AppRoutes from '../routes/AppRoutes';
import { queryClient } from './queryClient';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Dark mode: sigue la preferencia del sistema operativo (prefers-color-scheme) */
import '@ionic/react/css/palettes/dark.system.css';

/* Theme variables */
import '../theme/variables.css';

setupIonicReact();

const App: React.FC = () => {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    void Keyboard.setResizeMode({ mode: KeyboardResize.Body }).catch(() => undefined);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <IonApp>
        <IonReactRouter>
          <AppRoutes />
        </IonReactRouter>
      </IonApp>
    </QueryClientProvider>
  );
};

export default App;
