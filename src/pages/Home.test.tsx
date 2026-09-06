import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { SessionUser } from '../types/api/auth';
import { useSessionStore } from '../store/sessionStore';
import Home from './Home';

const mutate = vi.fn();
let isPending = false;

vi.mock('../features/auth/hooks/useSession', () => ({
  useLogoutMutation: () => ({ mutate, isPending }),
}));

const baseUser: SessionUser = {
  id: 'user-1',
  name: 'Mateo Vera',
  email: 'mateo@pasitosmagicos.local',
  roles: [{ id: 'role-1', code: 'acompanante', name: 'Acompañante' }],
  permissions: [],
};

afterEach(() => {
  useSessionStore.getState().clearSession();
  mutate.mockClear();
  isPending = false;
});

describe('Home', () => {
  it('shows the Pasitos Mágicos home with routine progress', () => {
    useSessionStore.getState().setSession(baseUser);

    render(<Home />);

    expect(screen.getByText('Pasitos Mágicos')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Hola, Mateo' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Rutinas de hoy' })).toBeInTheDocument();
    expect(screen.getByText('2 de 4 tareas completadas')).toBeInTheDocument();
    expect(screen.getByText('Estrellas ganadas')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Reporte de hoy' })).toBeInTheDocument();
    expect(screen.getByText('Completó 2 de 4 actividades y alcanzó 50% de su rutina.')).toBeInTheDocument();
  });

  it('lists the daily routines and reward status', () => {
    useSessionStore.getState().setSession(baseUser);

    render(<Home />);

    expect(screen.getByText('Leer 10 minutos')).toBeInTheDocument();
    expect(screen.getByText('Ordenar útiles')).toBeInTheDocument();
    expect(screen.getByText('Ejercicios de concentración')).toBeInTheDocument();
    expect(screen.getByText('Racha de la semana')).toBeInTheDocument();
  });

  it('updates the report and announces a visual reward when a routine is completed', () => {
    useSessionStore.getState().setSession(baseUser);

    const { container } = render(<Home />);
    const completeButton = container.querySelector('ion-button[aria-label="Marcar Ejercicios de concentración como completada"]');

    expect(completeButton).not.toBeNull();
    fireEvent.click(completeButton!);

    expect(screen.getByText('3 de 4 tareas completadas')).toBeInTheDocument();
    expect(screen.getByText('Completó 3 de 4 actividades y alcanzó 75% de su rutina.')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Ganaste una estrella por completar tu actividad.');
  });

  it('triggers logout and exposes its pending state', () => {
    useSessionStore.getState().setSession(baseUser);
    isPending = true;

    const { container } = render(<Home />);
    const button = container.querySelector('.home-footer ion-button[aria-busy="true"]');

    expect(button).not.toBeNull();
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(button?.querySelector('ion-spinner')).toHaveAttribute('aria-label', 'Procesando');
    expect(mutate).not.toHaveBeenCalled();
  });
});
