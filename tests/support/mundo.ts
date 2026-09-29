import { IWorldOptions, setWorldConstructor, World } from '@cucumber/cucumber';
import { Response } from 'supertest';
import { Aplicacion, crearAplicacion } from '../../src/composicion/crearAplicacion';
import { Cifrador, RepositorioUsuarios } from '../../src/aplicacion/puertos';
import { ServicioEspacios } from '../../src/aplicacion/servicios/servicioEspacios';

interface CuentaEscenario {
  id: string;
  email: string;
  contrasena: string;
  token?: string;
}

export class MundoApi extends World {
  private aplicacion!: Aplicacion;
  respuesta: Response | null = null;
  duracionMs = 0;
  private readonly cuentas = new Map<string, CuentaEscenario>();
  private readonly reservas = new Map<string, string>();

  constructor(opciones: IWorldOptions) {
    super(opciones);
    this.reiniciar();
  }

  reiniciar(): void {
    this.aplicacion = crearAplicacion();
    this.respuesta = null;
    this.duracionMs = 0;
    this.cuentas.clear();
    this.reservas.clear();
  }

  get app(): Aplicacion['app'] {
    return this.aplicacion.app;
  }

  get repositorioUsuarios(): RepositorioUsuarios {
    return this.aplicacion.repositorioUsuarios;
  }

  get cifrador(): Cifrador {
    return this.aplicacion.cifrador;
  }

  get espacios(): ServicioEspacios {
    return this.aplicacion.servicios.espacios;
  }

  recordarUsuario(nombre: string, email: string, contrasena: string, id: string): void {
    const previa = this.cuentas.get(nombre);
    this.cuentas.set(nombre, {
      id,
      email,
      contrasena,
      token: previa?.token,
    });
  }

  guardarToken(nombre: string, token: string): void {
    this.datosDe(nombre).token = token;
  }

  tieneCuenta(nombre: string): boolean {
    return this.cuentas.has(nombre);
  }

  datosDe(nombre: string): CuentaEscenario {
    const cuenta = this.cuentas.get(nombre);
    if (!cuenta) {
      throw new Error(`El escenario no registró al usuario "${nombre}"`);
    }
    return cuenta;
  }

  tokenDe(nombre: string): string {
    const token = this.datosDe(nombre).token;
    if (!token) {
      throw new Error(`"${nombre}" no tiene una sesión activa`);
    }
    return token;
  }

  recordarReserva(usuario: string, espacio: string, fecha: string, id: string): void {
    this.reservas.set(this.claveReserva(usuario, espacio, fecha), id);
  }

  idReserva(usuario: string, espacio: string, fecha: string): string {
    const id = this.reservas.get(this.claveReserva(usuario, espacio, fecha));
    if (!id) {
      throw new Error(`No hay una reserva de ${usuario} para ${espacio} el ${fecha}`);
    }
    return id;
  }

  async medir(ejecutar: () => Promise<Response>): Promise<void> {
    const inicio = Date.now();
    this.respuesta = await ejecutar();
    this.duracionMs = Date.now() - inicio;
  }

  private claveReserva(usuario: string, espacio: string, fecha: string): string {
    return `${usuario}|${espacio}|${fecha}`;
  }
}

setWorldConstructor(MundoApi);
