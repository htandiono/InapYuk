import type { Request, Response } from 'express';
import { sendCreated } from '../../utils/api-response';
import { registerUser } from './auth.service';
import type { RegisterUserInput } from './auth.schema';

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
