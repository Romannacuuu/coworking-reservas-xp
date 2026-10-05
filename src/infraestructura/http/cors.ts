import { NextFunction, Request, Response } from 'express';

export function filtrarOrigen(permitidos: readonly string[]) {
  const lista = new Set(permitidos);
  return (req: Request, res: Response, next: NextFunction): void => {
    const origen = req.header('origin');
    if (!origen) {
      next();
      return;
    }
    if (!lista.has(origen)) {
      res.status(403).json({ error: 'origen no permitido' });
      return;
    }
    res.setHeader('Access-Control-Allow-Origin', origen);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS');
    if (req.method === 'OPTIONS') {
      res.status(204).end();
      return;
    }
    next();
  };
}
