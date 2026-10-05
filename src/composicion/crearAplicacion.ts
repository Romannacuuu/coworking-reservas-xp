import { Express } from 'express';
import { Cifrador, RepositorioUsuarios, VigenciaTokens } from '../aplicacion/puertos';
import { ServicioAuth } from '../aplicacion/servicios/servicioAuth';
import { ServicioEspacios } from '../aplicacion/servicios/servicioEspacios';
import { ServicioReservas } from '../aplicacion/servicios/servicioReservas';
import { ServicioUsuarios } from '../aplicacion/servicios/servicioUsuarios';
import {
  RepositorioEspaciosMemoria,
  RepositorioReservasMemoria,
  RepositorioSesionesMemoria,
  RepositorioUsuariosMemoria,
} from '../infraestructura/persistencia/memoria';
import { CifradorBcrypt, rondasDesdeEntorno } from '../infraestructura/seguridad/cifradorBcrypt';
import { EmisorJwt } from '../infraestructura/seguridad/emisorDeTokens';
import {
  ACCESO_POR_DEFECTO_SEGUNDOS,
  LOGIN_MAXIMO_POR_DEFECTO,
  LOGIN_VENTANA_POR_DEFECTO_MS,
  RENOVACION_POR_DEFECTO_SEGUNDOS,
  enteroEnRango,
  origenesDesdeEntorno,
} from '../infraestructura/seguridad/parametros';
import { crearServidor } from '../infraestructura/http/servidor';

export interface LimiteLogin {
  ventanaMs: number;
  maximo: number;
}

export interface Aplicacion {
  app: Express;
  repositorioUsuarios: RepositorioUsuarios;
  cifrador: Cifrador;
  vigencia: VigenciaTokens;
  origenesPermitidos: string[];
  limiteLogin: LimiteLogin;
  servicios: {
    usuarios: ServicioUsuarios;
    auth: ServicioAuth;
    espacios: ServicioEspacios;
    reservas: ServicioReservas;
  };
}

export function crearAplicacion(opciones?: { sembrarCatalogo?: boolean }): Aplicacion {
  const usuarios = new RepositorioUsuariosMemoria();
  const espacios = new RepositorioEspaciosMemoria();
  const reservas = new RepositorioReservasMemoria();
  const sesiones = new RepositorioSesionesMemoria();
  const cifrador = new CifradorBcrypt(rondasDesdeEntorno(process.env.BCRYPT_ROUNDS));
  const vigencia: VigenciaTokens = {
    accesoSegundos: enteroEnRango(
      process.env.ACCESS_TOKEN_TTL_SECONDS,
      ACCESO_POR_DEFECTO_SEGUNDOS,
      1,
      60 * 60 * 24,
      'ACCESS_TOKEN_TTL_SECONDS',
    ),
    renovacionSegundos: enteroEnRango(
      process.env.REFRESH_TOKEN_TTL_SECONDS,
      RENOVACION_POR_DEFECTO_SEGUNDOS,
      60,
      60 * 60 * 24 * 90,
      'REFRESH_TOKEN_TTL_SECONDS',
    ),
  };
  const limiteLogin: LimiteLogin = {
    maximo: enteroEnRango(process.env.LOGIN_MAX_INTENTOS, LOGIN_MAXIMO_POR_DEFECTO, 1, 100, 'LOGIN_MAX_INTENTOS'),
    ventanaMs: enteroEnRango(
      process.env.LOGIN_VENTANA_MS,
      LOGIN_VENTANA_POR_DEFECTO_MS,
      1000,
      24 * 60 * 60 * 1000,
      'LOGIN_VENTANA_MS',
    ),
  };
  const origenesPermitidos = origenesDesdeEntorno(process.env.CORS_ORIGINS);
  const tokens = new EmisorJwt(process.env.TOKEN_SECRET ?? 'dev-secret-xp', vigencia);

  const servicios = {
    usuarios: new ServicioUsuarios(usuarios, cifrador),
    auth: new ServicioAuth(usuarios, cifrador, tokens, sesiones),
    espacios: new ServicioEspacios(espacios, reservas),
    reservas: new ServicioReservas(reservas, espacios, usuarios),
  };

  if (opciones?.sembrarCatalogo) {
    servicios.espacios.registrar({ nombre: 'Sala A', tipo: 'sala', capacidad: 8, precioPorDia: 100 });
    servicios.espacios.registrar({ nombre: 'Sala B', tipo: 'sala', capacidad: 4, precioPorDia: 80 });
    servicios.espacios.registrar({
      nombre: 'Escritorio 1',
      tipo: 'escritorio',
      capacidad: 1,
      precioPorDia: 40,
    });
  }

  return {
    app: crearServidor({ ...servicios, tokens, origenesPermitidos, limiteLogin }),
    repositorioUsuarios: usuarios,
    cifrador,
    vigencia,
    origenesPermitidos,
    limiteLogin,
    servicios,
  };
}
