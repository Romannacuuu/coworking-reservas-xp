import { NextFunction, Request, Response } from 'express';
import { EmisorDeTokens } from '../../aplicacion/puertos';

export function requerirAuth(tokens: EmisorDeTokens) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const encabezado = req.header('authorization');
    if (!encabezado?.startsWith('Bearer ')) {
      res.status(401).json({ error: 'no autenticado' });
      return;
    }

    try {
      const carga = tokens.verificar(encabezado.slice('Bearer '.length));
      req.usuarioId = carga.sub;
      next();
    } catch {
      res.status(401).json({ error: 'token inválido' });
    }
  };
}

export function usuarioAutenticado(req: Request): string {
  if (!req.usuarioId) {
    throw new Error('La ruta exigía autenticación y no recibió usuarioId');
  }
  return req.usuarioId;
}
