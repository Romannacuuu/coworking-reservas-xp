import type { Rol } from '../dominio/entidades';

declare global {
  namespace Express {
    interface Request {
      usuarioId?: string;
      rol?: Rol;
    }
  }
}

export {};
