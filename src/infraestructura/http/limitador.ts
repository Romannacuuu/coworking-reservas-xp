import { NextFunction, Request, Response } from 'express';

export function limitadorDeIntentos(opciones: { ventanaMs: number; maximo: number }) {
  const marcas = new Map<string, number[]>();
  return (req: Request, res: Response, next: NextFunction): void => {
    const ahora = Date.now();
    const clave = req.socket.remoteAddress ?? 'local';
    const recientes = (marcas.get(clave) ?? []).filter((marca) => ahora - marca < opciones.ventanaMs);
    if (recientes.length >= opciones.maximo) {
      marcas.set(clave, recientes);
      res.status(429).json({ error: 'demasiados intentos de inicio de sesión' });
      return;
    }
    recientes.push(ahora);
    marcas.set(clave, recientes);
    next();
  };
}
