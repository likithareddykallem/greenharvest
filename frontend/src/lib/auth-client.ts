import { apiFetch } from './api-client';
import type { Address, AuthSession, User, UserRole } from './types';

export type RegisterPayload = {
  email: string;
  password: string;
  role: UserRole;
  profile: {
    firstName: string;
    lastName: string;
    phone?: string;
    address?: Address;
  };
  farmDetails?: {
    farmName: string;
    deliveryRadiusKm?: number;
    specialties?: string[];
    farmLocation?: {
      label?: string;
      address?: Address;
      coordinates?: [number, number];
      acreage?: number;
    };
  };
};

type RegisterResponse = {
  user: User;
  redirectPath?: string;
};

type LoginResponse = AuthSession;

export type LoginPayload = {
  email: string;
  password: string;
  role: UserRole;
};

export async function registerUser(payload: RegisterPayload) {
  const res = await apiFetch<RegisterResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
  return res.data;
}

export async function loginUser(payload: LoginPayload) {
  const res = await apiFetch<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
  return res.data;
}




