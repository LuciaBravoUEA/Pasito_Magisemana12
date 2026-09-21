import { IonToast } from '@ionic/react';
import { useOutboxSync } from '../features/routines/hooks/use-outbox-sync';
import { useSyncStatusStore } from '../store/sync-status-store';

export const LocalSync: React.FC = () => {
  useOutboxSync();
  const message = useSyncStatusStore(state => state.message);
  return <IonToast isOpen={Boolean(message)} message={message ?? ''} position="top" buttons={['Entendido']} onDidDismiss={() => useSyncStatusStore.getState().setMessage(null)} />;
};
