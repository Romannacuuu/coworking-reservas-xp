import { NextFunction, Request, Response } from 'express';
import { EmisorDeTokens } from '../../aplicacion/puertos';
import { Rol } from '../../dominio/entidades';

export function requerirAuth(tokens: EmisorDeTokens) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const encabezado = req.header('authorization');
    if (!encabezado?.startsWith('Bearer ')) {
      res.status(401).json({ error: 'no autenticado' });
      return;
    }

    try {
      const carga = tokens.verificarAcceso(encabezado.slice('Bearer '.length));
      req.usuarioId = carga.sub;
      req.rol = carga.rol;
      next();
    } catch (error) {
      const mensaje = error instanceof Error && error.message === 'token expirado' ? 'token expirado' : 'token inválido';
      res.status(401).json({ error: mensaje });
    }
  };
}

export function requerirRol(roles: readonly Rol[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.rol || !roles.includes(req.rol)) {
      res.status(403).json({ error: 'no tienes los permisos necesarios' });
      return;
    }
    next();
  };
}

export function exigirMismoUsuarioOAdmin(parametro: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.usuarioId || !req.rol) {
      res.status(401).json({ error: 'no autenticado' });
      return;
    }
    if (req.rol === 'ADMIN' || req.params[parametro] === req.usuarioId) {
      next();
      return;
    }
    res.status(403).json({ error: 'no tienes permisos sobre este recurso' });
  };
}

export function exigirDuenoDeReserva(obtener: (id: string) => { usuarioId: string }) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const reserva = obtener(req.params.id);
      if (req.rol === 'ADMIN' || reserva.usuarioId === req.usuarioId) {
        next();
        return;
      }
      res.status(403).json({ error: 'no tienes permisos sobre este recurso' });
    } catch (error) {
      next(error);
    }
  };
}

export function usuarioAutenticado(req: Request): string {
  if (!req.usuarioId) {
    throw new Error('La ruta exigía autenticación y no recibió usuarioId');
  }
  return req.usuarioId;
}

export function rolAutenticado(req: Request): Rol {
  if (!req.rol) {
    throw new Error('La ruta exigía autenticación y no recibió el rol');
  }
  return req.rol;
}
