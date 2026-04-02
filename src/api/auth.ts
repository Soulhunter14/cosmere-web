import client from './client'
import type { LoginResponse } from '../types'

export const authApi = {
  register: (data: { username: string; password: string; displayName: string }) =>
    client.post<LoginResponse>('/auth/register', data).then((r) => r.data),

  login: (data: { username: string; password: string }) =>
    client.post<LoginResponse>('/auth/login', data).then((r) => r.data),
}
