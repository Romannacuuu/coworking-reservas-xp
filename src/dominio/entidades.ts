export type TipoEspacio = 'sala' | 'escritorio';

export type EstadoEspacio = 'Disponible' | 'Ocupada';

export type EstadoReserva = 'confirmada' | 'cancelada';

export type Rol = 'USUARIO' | 'ADMIN';

export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  passwordHash: string;
  saldo: number;
  rol: Rol;
}

export interface UsuarioPublico {
  id: string;
  nombre: string;
  email: string;
  saldo: number;
  rol: Rol;
}

export interface Espacio {
  id: string;
  nombre: string;
  tipo: TipoEspacio;
  capacidad: number;
  precioPorDia: number;
}

export interface EspacioConEstado extends Espacio {
  estado: EstadoEspacio;
}

export interface Reserva {
  id: string;
  usuarioId: string;
  espacioId: string;
  espacio: string;
  fecha: string;
  estado: EstadoReserva;
  costo: number;
  nota?: string;
}

export function publicarUsuario(usuario: Usuario): UsuarioPublico {
  return {
    id: usuario.id,
    nombre: usuario.nombre,
    email: usuario.email,
    saldo: usuario.saldo,
    rol: usuario.rol,
  };
}
