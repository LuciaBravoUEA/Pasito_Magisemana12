import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { SessionUser } from '../../../types/api/auth';
import ProfileSummary from './ProfileSummary';

const user: SessionUser = {
  id: 'user-1',
  name: 'Evam Jampa',
  email: 'evam.jampa@pasitosmagicos.local',
  roles: [{ id: 'role-1', code: 'estudiante', name: 'Estudiante' }],
  permissions: [],
};

describe('ProfileSummary', () => {
  it('shows session identity and assigned roles', () => {
    render(<ProfileSummary user={user} />);

    expect(screen.getByRole('heading', { name: 'Evam Jampa' })).toBeInTheDocument();
    expect(screen.getByText('evam.jampa@pasitosmagicos.local')).toBeInTheDocument();
    expect(screen.getByText('Estudiante')).toBeInTheDocument();
  });

  it('shows an understandable empty state without roles', () => {
    render(<ProfileSummary user={{ ...user, roles: [] }} />);

    expect(screen.getByText('Aún no tienes roles asignados.')).toBeInTheDocument();
  });
});
