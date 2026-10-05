import { Espacio, Reserva, Rol, Usuario } from '../dominio/entidades';

export interface RepositorioUsuarios {
  guardar(usuario: Usuario): void;
  actualizar(usuario: Usuario): void;
  buscarPorId(id: string): Usuario | undefined;
  buscarPorEmail(email: string): Usuario | undefined;
}

export interface RepositorioEspacios {
  guardar(espacio: Espacio): void;
  listar(): Espacio[];
  buscarPorNombre(nombre: string): Espacio | undefined;
}

export interface RepositorioReservas {
  guardar(reserva: Reserva): void;
  actualizar(reserva: Reserva): void;
  listar(): Reserva[];
  buscarPorId(id: string): Reserva | undefined;
}

export interface Cifrador {
  cifrar(plano: string): Promise<string>;
  coincide(plano: string, hash: string): Promise<boolean>;
}

export interface IdentidadToken {
  sub: string;
  rol: Rol;
}

export interface VigenciaTokens {
  accesoSegundos: number;
  renovacionSegundos: number;
}

export interface SesionRenovacion {
  jti: string;
  usuarioId: string;
  venceEn: number;
}

export interface RepositorioSesiones {
  guardar(sesion: SesionRenovacion): void;
  buscar(jti: string): SesionRenovacion | undefined;
  revocar(jti: string): void;
}

export interface EmisorDeTokens {
  emitirAcceso(identidad: IdentidadToken): string;
  emitirRenovacion(usuarioId: string): { token: string; jti: string; exp: number };
  verificarAcceso(token: string): IdentidadToken;
  verificarRenovacion(token: string): { sub: string; jti: string };
}
