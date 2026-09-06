import { Redirect, Route } from 'react-router-dom';
import { IonRouterOutlet } from '@ionic/react';
import LoginPage from '../features/auth/pages/LoginPage';
import Home from '../pages/Home';
import RoutineListPage from '../features/routines/pages/RoutineListPage';
import RoutineDetailPage from '../features/routines/pages/RoutineDetailPage';
import CreateRoutinePage from '../features/routines/pages/CreateRoutinePage';
import { ProtectedGate, PublicGate } from './SessionGates';

const AppRoutes: React.FC = () => (
  <IonRouterOutlet>
    <Route exact path="/login" render={() => <PublicGate><LoginPage /></PublicGate>} />
    <Route exact path="/registro" render={() => <PublicGate><LoginPage /></PublicGate>} />
    <Route exact path="/home" render={() => <ProtectedGate><Home /></ProtectedGate>} />
    <Route exact path="/rutinas/nueva" render={() => <ProtectedGate><CreateRoutinePage /></ProtectedGate>} />
    <Route exact path="/rutinas/:routineId([0-9a-fA-F-]{36})" render={() => <ProtectedGate><RoutineDetailPage /></ProtectedGate>} />
    <Route exact path="/rutinas" render={() => <ProtectedGate><RoutineListPage /></ProtectedGate>} />
    <Redirect exact from="/" to="/home" />
  </IonRouterOutlet>
);

export default AppRoutes;
