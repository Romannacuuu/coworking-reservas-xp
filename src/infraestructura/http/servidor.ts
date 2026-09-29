import express, { Express } from 'express';
import { ServicioAuth } from '../../aplicacion/servicios/servicioAuth';
import { ServicioEspacios } from '../../aplicacion/servicios/servicioEspacios';
import { ServicioReservas } from '../../aplicacion/servicios/servicioReservas';
import { ServicioUsuarios } from '../../aplicacion/servicios/servicioUsuarios';
import { EmisorDeTokens } from '../../aplicacion/puertos';
import { manejadorDeErrores } from './http';
import { htmlDeInicio } from './paginaInicio';
import { rutasEspacios } from './controladores/espacios';
import { rutasReservas } from './controladores/reservas';
import { rutasSesion } from './controladores/sesion';
import { rutasUsuarios } from './controladores/usuarios';

export interface ServiciosHttp {
  usuarios: ServicioUsuarios;
  auth: ServicioAuth;
  espacios: ServicioEspacios;
  reservas: ServicioReservas;
  tokens: EmisorDeTokens;
}

export function crearServidor(servicios: ServiciosHttp): Express {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json());
  app.get('/', (_req, res) => {
    res.type('html').send(htmlDeInicio());
  });
  app.get('/api/salud', (_req, res) => {
    res.status(200).json({ estado: 'ok' });
  });

  app.use('/api', rutasUsuarios(servicios.usuarios, servicios.tokens));
  app.use('/api', rutasSesion(servicios.auth));
  app.use('/api', rutasEspacios(servicios.espacios, servicios.tokens));
  app.use('/api', rutasReservas(servicios.reservas, servicios.tokens));

  app.use((_req, res) => {
    res.status(404).json({ error: 'ruta no encontrada' });
  });
  app.use(manejadorDeErrores);
  return app;
}
