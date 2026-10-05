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

export function exigirTextoPresente(valor: unknown, campo: string): string {
  if (typeof valor !== 'string') {
    throw new ErrorDeAplicacion(`el campo ${campo} es obligatorio`, 400);
  }
  return valor;
}

export function exigirEntero(valor: unknown, campo: string): number {
  if (typeof valor !== 'number' || !Number.isInteger(valor)) {
    throw new ErrorDeAplicacion(`el campo ${campo} debe ser un entero`, 400);
  }
  return valor;
}

export function exigirCampos(cuerpo: unknown, permitidos: readonly string[]): Record<string, unknown> {
  if (!cuerpo || typeof cuerpo !== 'object' || Array.isArray(cuerpo)) {
    throw new ErrorDeAplicacion('el cuerpo es inválido', 400);
  }
  const registro = cuerpo as Record<string, unknown>;
  for (const clave of Object.keys(registro)) {
    if (!permitidos.includes(clave)) {
      throw new ErrorDeAplicacion('campo no permitido', 400);
    }
  }
  return registro;
}
