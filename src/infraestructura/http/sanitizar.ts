import { NextFunction, Request, Response } from 'express';
import { ErrorDeAplicacion } from '../../dominio/errores';

const CLAVES_PROHIBIDAS = new Set(['__proto__', 'constructor', 'prototype']);

export function rechazarInyeccion(valor: unknown): void {
  if (typeof valor === 'string') {
    if (valor.includes('\0')) {
      throw new ErrorDeAplicacion('entrada rechazada', 400);
    }
    return;
  }
  if (Array.isArray(valor)) {
    for (const item of valor) {
      rechazarInyeccion(item);
    }
    return;
  }
  if (!valor || typeof valor !== 'object') {
    return;
  }
  for (const clave of Object.keys(valor)) {
    if (clave.startsWith('$') || clave.includes('.') || CLAVES_PROHIBIDAS.has(clave)) {
      throw new ErrorDeAplicacion('entrada rechazada', 400);
    }
    rechazarInyeccion((valor as Record<string, unknown>)[clave]);
  }
}

export function sanearEntrada(req: Request, _res: Response, next: NextFunction): void {
  try {
    rechazarInyeccion(req.body);
    rechazarInyeccion(req.query);
    next();
  } catch (error) {
    next(error);
  }
}
