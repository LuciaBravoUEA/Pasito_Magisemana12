import { IonIcon } from '@ionic/react';
import { barChartOutline, bookOutline, checkmarkDoneOutline, peopleOutline, sparklesOutline, starOutline, timerOutline } from 'ionicons/icons';
import { useState } from 'react';
import { useHistory } from 'react-router-dom';
import AppButton from '../components/common/AppButton';
import AppCard from '../components/common/AppCard';
import ResourceState from '../components/feedback/ResourceState';
import AppPage from '../components/layout/AppPage';
import { useLogoutMutation } from '../features/auth/hooks/useSession';
import ChatbotWidget from '../features/chatbot/components/ChatbotWidget';
import ProfileSummary from '../features/home/components/ProfileSummary';
import { useSessionStore } from '../store/sessionStore';
import './home.css';

type Routine = { id: number; title: string; category: string; points: number; completed: boolean; icon: string };

const initialRoutines: Routine[] = [
  { id: 1, title: 'Leer 10 minutos', category: 'Escuela', points: 10, completed: true, icon: bookOutline },
  { id: 2, title: 'Ordenar útiles', category: 'Hogar', points: 15, completed: true, icon: checkmarkDoneOutline },
  { id: 3, title: 'Ejercicios de concentración', category: 'Calma', points: 20, completed: false, icon: timerOutline },
  { id: 4, title: 'Preparar mochila', category: 'Ritual matutino', points: 10, completed: false, icon: sparklesOutline },
];

const playRewardTone = (): void => {
  const AudioCtor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtor) return;
  const audioContext = new AudioCtor();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  oscillator.type = 'triangle';
  oscillator.frequency.value = 740;
  gainNode.gain.value = 0.05;
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  oscillator.start();
  oscillator.stop(audioContext.currentTime + 0.14);
};

const Home: React.FC = () => {
  const user = useSessionStore(state => state.user);
  const logoutMutation = useLogoutMutation();
  const history = useHistory();
  const [routines, setRoutines] = useState(initialRoutines);
  const [rewardMessage, setRewardMessage] = useState<string | null>(null);
  const completedCount = routines.filter(item => item.completed).length;
  const pendingRoutines = routines.filter(item => !item.completed);
  const progress = Math.round((completedCount / routines.length) * 100);
  const stars = completedCount * 15 + 10;
  const streak = completedCount >= 3 ? '5 días' : '3 días';

  const toggleRoutine = (id: number): void => {
    setRoutines(current => {
      const nextValue = current.map(item => (item.id === id ? { ...item, completed: !item.completed } : item));
      if (nextValue.find(item => item.id === id)?.completed) {
        playRewardTone();
        setRewardMessage('Ganaste una estrella por completar tu actividad.');
      } else {
        setRewardMessage(null);
      }
      return nextValue;
    });
  };

  const handleLogout = async (): Promise<void> => {
    try {
      await logoutMutation.mutateAsync();
    } finally {
      history.replace('/login');
    }
  };

  return (
    <AppPage title="Pasitos Mágicos">
      <main className="home-page">
        <ResourceState status={user ? 'success' : 'empty'} emptyTitle="No hay una sesión activa" emptyDescription="Inicia sesión para ver tus actividades.">
          {user && <>
            <header className="home-hero">
              <p className="home-hero__eyebrow">Bienvenido</p>
              <h1>Hola, {user.name.split(' ')[0]}</h1>
              <p>Hoy puedes celebrar cada pequeño logro y seguir avanzando con alegría.</p>
            </header>

            <ProfileSummary user={user} />

            <section className="home-section" aria-label="Seguimiento educativo">
              <AppButton onClick={() => history.push('/seguimiento')}>Ver seguimiento</AppButton>
            </section>

            <section className="home-summary" aria-label="Progreso diario">
              <AppCard title="Tu avance" description={`${completedCount} de ${routines.length} tareas completadas`} metadata={<span>{progress}% listo</span>} tone="highlight" />
              <AppCard title="Estrellas ganadas" description={String(stars)} metadata={<span>¡Sigue así!</span>} />
              <AppCard title="Racha de la semana" description={streak} metadata={<span>sin interrupciones</span>} />
            </section>

            <section className="home-section" aria-labelledby="home-routines-title">
              <div className="home-section__heading"><p>Tu día</p><h2 id="home-routines-title">Rutinas de hoy</h2></div>
              <div className="home-routine-list">
                {routines.map(routine => (
                  <AppCard
                    key={routine.id}
                    title={routine.title}
                    description={routine.category}
                    tone={routine.completed ? 'success' : 'default'}
                    className="home-routine"
                    leading={<span className="home-routine__icon" aria-hidden="true"><IonIcon icon={routine.icon} /></span>}
                    metadata={<span className="home-routine__points"><IonIcon icon={starOutline} aria-hidden="true" /> {routine.points} estrellas</span>}
                    actions={<AppButton variant={routine.completed ? 'secondary' : 'primary'} onClick={() => toggleRoutine(routine.id)} accessibleLabel={routine.completed ? `Marcar ${routine.title} como pendiente` : `Marcar ${routine.title} como completada`}>{routine.completed ? 'Hecho' : 'Marcar'}</AppButton>}
                  />
                ))}
              </div>
            </section>

            <section className="home-report" aria-labelledby="home-report-title">
              <div className="home-section__heading"><p>Para acompañar</p><h2 id="home-report-title">Reporte de hoy</h2></div>
              <div className="home-report__details">
                <AppCard title="Avance diario" description={`Completó ${completedCount} de ${routines.length} actividades y alcanzó ${progress}% de su rutina.`} leading={<IonIcon icon={barChartOutline} aria-hidden="true" />} />
                <AppCard title="Padres y docentes" description={pendingRoutines.length ? `Próximo paso: ${pendingRoutines[0].title}.` : 'Todas las actividades están completas.'} leading={<IonIcon icon={peopleOutline} aria-hidden="true" />} />
                <AppCard title="Refuerzo positivo" description={`${stars} estrellas para celebrar el esfuerzo de hoy.`} leading={<IonIcon icon={starOutline} aria-hidden="true" />} tone="warning" />
              </div>
            </section>

            {rewardMessage && <p className="home-reward" role="status" aria-live="polite"><IonIcon icon={starOutline} aria-hidden="true" />{rewardMessage}</p>}
          </>}
        </ResourceState>

        <footer className="home-footer">
          <AppButton onClick={() => history.push('/rutinas')}>Ver rutinas guardadas</AppButton>
          <AppButton variant="secondary" isLoading={logoutMutation.isPending} onClick={() => void handleLogout()}>Cerrar sesión</AppButton>
        </footer>
      </main>

      <ChatbotWidget userName={user?.name.split(' ')[0]} />
    </AppPage>
  );
};

export default Home;
