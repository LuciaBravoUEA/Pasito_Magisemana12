import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { IonSpinner } from '@ionic/react';
import { Redirect, useHistory, useLocation } from 'react-router-dom';
import { useSession } from '../features/auth/hooks/useSession';
import { sanitizeReturnTo } from './route-utils';

export const ProtectedGate: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isPending, isError } = useSession();
  const history = useHistory();
  const location = useLocation();
  const returnTo = `${location.pathname}${location.search}`;
  const isAuthEntryRoute = location.pathname === '/login' || location.pathname === '/registro';

  useEffect(() => {
    if (isError && !isAuthEntryRoute) {
      history.replace(`/login?returnTo=${encodeURIComponent(returnTo)}`);
    }
  }, [history, isAuthEntryRoute, isError, returnTo]);

  if (isPending || isError) return <IonSpinner name="dots" />;
  return <>{children}</>;
};

export const PublicGate: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isSuccess } = useSession();
  const location = useLocation();
  const returnTo = sanitizeReturnTo(new URLSearchParams(location.search).get('returnTo'));

  if (isSuccess) return <Redirect to={returnTo} />;
  return <>{children}</>;
};
