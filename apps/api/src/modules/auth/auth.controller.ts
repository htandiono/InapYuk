import type { Request, Response } from 'express';
import { sendCreated } from '../../utils/api-response';
import { registerUser, registerTenant } from './auth.service';
import type { RegisterUserInput, RegisterTenantInput } from './auth.schema';

export async function handleRegisterUser(req: Request, res: Response) {
  const input = req.body as RegisterUserInput;
  const user = await registerUser(input);

  sendCreated(res, {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  }, 'Pendaftaran berhasil, periksa email Anda');
}

export async function handleRegisterTenant(req: Request, res: Response) {
  const input = req.body as RegisterTenantInput;
  const user = await registerTenant(input);

  sendCreated(res, {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  }, 'Pendaftaran tenant berhasil, periksa email Anda');
}
