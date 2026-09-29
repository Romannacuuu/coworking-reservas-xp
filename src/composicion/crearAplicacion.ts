import { Express } from 'express';
import { Cifrador, RepositorioUsuarios } from '../aplicacion/puertos';
import { ServicioAuth } from '../aplicacion/servicios/servicioAuth';
import { ServicioEspacios } from '../aplicacion/servicios/servicioEspacios';
import { ServicioReservas } from '../aplicacion/servicios/servicioReservas';
import { ServicioUsuarios } from '../aplicacion/servicios/servicioUsuarios';
import {
  RepositorioEspaciosMemoria,
  RepositorioReservasMemoria,
  RepositorioUsuariosMemoria,
} from '../infraestructura/persistencia/memoria';
import { CifradorBcrypt, rondasDesdeEntorno } from '../infraestructura/seguridad/cifradorBcrypt';
import { EmisorHmac } from '../infraestructura/seguridad/emisorDeTokens';
import { crearServidor } from '../infraestructura/http/servidor';

export interface Aplicacion {
  app: Express;
  repositorioUsuarios: RepositorioUsuarios;
  cifrador: Cifrador;
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
  const cifrador = new CifradorBcrypt(rondasDesdeEntorno(process.env.BCRYPT_ROUNDS));
  const tokens = new EmisorHmac(process.env.TOKEN_SECRET ?? 'dev-secret-xp');

  const servicios = {
    usuarios: new ServicioUsuarios(usuarios, cifrador),
    auth: new ServicioAuth(usuarios, cifrador, tokens),
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
    app: crearServidor({ ...servicios, tokens }),
    repositorioUsuarios: usuarios,
    cifrador,
    servicios,
  };
}
