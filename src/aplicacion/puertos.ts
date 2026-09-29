import { Espacio, Reserva, Usuario } from '../dominio/entidades';

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

export interface EmisorDeTokens {
  emitir(usuarioId: string): string;
  verificar(token: string): { sub: string };
}
