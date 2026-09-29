import { NextFunction, Request, RequestHandler, Response } from 'express';
import { ErrorDeAplicacion } from '../../dominio/errores';

export function adaptar(
  manejador: (req: Request, res: Response, next: NextFunction) => Promise<void>,
): RequestHandler {
  return (req, res, next) => {
    void manejador(req, res, next).catch(next);
  };
}

export function manejadorDeErrores(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (error instanceof ErrorDeAplicacion) {
    res.status(error.codigo).json({ error: error.mensaje });
    return;
  }
  console.error(error);
  res.status(500).json({ error: 'error interno' });
}

export function exigirTexto(valor: unknown, campo: string): string {
  if (typeof valor !== 'string' || valor.trim() === '') {
    throw new ErrorDeAplicacion(`el campo ${campo} es obligatorio`, 400);
  }
  return valor;
}
