import { Espacio, Reserva, Usuario } from '../../dominio/entidades';
import {
  RepositorioEspacios,
  RepositorioReservas,
  RepositorioSesiones,
  RepositorioUsuarios,
  SesionRenovacion,
} from '../../aplicacion/puertos';

export class RepositorioUsuariosMemoria implements RepositorioUsuarios {
  private readonly datos = new Map<string, Usuario>();

  guardar(usuario: Usuario): void {
    this.datos.set(usuario.id, { ...usuario });
  }

  actualizar(usuario: Usuario): void {
    if (!this.datos.has(usuario.id)) {
      throw new Error(`No existe el usuario ${usuario.id}`);
    }
    this.datos.set(usuario.id, { ...usuario });
  }

  buscarPorId(id: string): Usuario | undefined {
    const usuario = this.datos.get(id);
    return usuario ? { ...usuario } : undefined;
  }

  buscarPorEmail(email: string): Usuario | undefined {
    for (const usuario of this.datos.values()) {
      if (usuario.email === email) {
        return { ...usuario };
      }
    }
    return undefined;
  }
}

export class RepositorioEspaciosMemoria implements RepositorioEspacios {
  private readonly datos = new Map<string, Espacio>();

  guardar(espacio: Espacio): void {
    this.datos.set(espacio.id, { ...espacio });
  }

  listar(): Espacio[] {
    return [...this.datos.values()].map((espacio) => ({ ...espacio }));
  }

  buscarPorNombre(nombre: string): Espacio | undefined {
    for (const espacio of this.datos.values()) {
      if (espacio.nombre === nombre) {
        return { ...espacio };
      }
    }
    return undefined;
  }
}

export class RepositorioReservasMemoria implements RepositorioReservas {
  private readonly datos = new Map<string, Reserva>();

  guardar(reserva: Reserva): void {
    this.datos.set(reserva.id, { ...reserva });
  }

  actualizar(reserva: Reserva): void {
    if (!this.datos.has(reserva.id)) {
      throw new Error(`No existe la reserva ${reserva.id}`);
    }
    this.datos.set(reserva.id, { ...reserva });
  }

  listar(): Reserva[] {
    return [...this.datos.values()].map((reserva) => ({ ...reserva }));
  }

  buscarPorId(id: string): Reserva | undefined {
    const reserva = this.datos.get(id);
    return reserva ? { ...reserva } : undefined;
  }
}

export class RepositorioSesionesMemoria implements RepositorioSesiones {
  private readonly datos = new Map<string, SesionRenovacion>();

  guardar(sesion: SesionRenovacion): void {
    this.datos.set(sesion.jti, { ...sesion });
  }

  buscar(jti: string): SesionRenovacion | undefined {
    const sesion = this.datos.get(jti);
    if (!sesion) {
      return undefined;
    }
    if (sesion.venceEn * 1000 <= Date.now()) {
      this.datos.delete(jti);
      return undefined;
    }
    return { ...sesion };
  }

  revocar(jti: string): void {
    this.datos.delete(jti);
  }
}
