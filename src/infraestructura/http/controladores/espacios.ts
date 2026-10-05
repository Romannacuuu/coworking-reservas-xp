import { Router } from 'express';
import { ServicioEspacios } from '../../../aplicacion/servicios/servicioEspacios';
import { EmisorDeTokens } from '../../../aplicacion/puertos';
import { ErrorDeAplicacion } from '../../../dominio/errores';
import { adaptar, exigirCampos, exigirEntero, exigirTexto } from '../http';
import { requerirAuth, requerirRol } from '../autenticacion';

export function rutasEspacios(espacios: ServicioEspacios, tokens: EmisorDeTokens): Router {
  const router = Router();

  router.post(
    '/espacios',
    requerirAuth(tokens),
    requerirRol(['ADMIN']),
    adaptar(async (req, res) => {
      const cuerpo = exigirCampos(req.body, ['nombre', 'tipo', 'capacidad', 'precioPorDia']);
      const espacio = espacios.registrar({
        nombre: exigirTexto(cuerpo.nombre, 'nombre'),
        tipo: exigirTexto(cuerpo.tipo, 'tipo'),
        capacidad: exigirEntero(cuerpo.capacidad, 'capacidad'),
        precioPorDia: exigirEntero(cuerpo.precioPorDia, 'precio'),
      });
      res.status(201).json(espacio);
    }),
  );

  router.get(
    '/espacios',
    requerirAuth(tokens),
    adaptar(async (req, res) => {
      const fecha = req.query.fecha;
      if (typeof fecha !== 'string' || fecha.trim() === '') {
        throw new ErrorDeAplicacion('la fecha es obligatoria', 400);
      }
      res.status(200).json(espacios.disponibilidad(fecha));
    }),
  );

  return router;
}
