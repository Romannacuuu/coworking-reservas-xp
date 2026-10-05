import { randomUUID } from 'crypto';
import { Reserva, Rol } from '../../dominio/entidades';
import { ErrorDeAplicacion } from '../../dominio/errores';
import { afirmarFechaReservable, fechaDeHoy, hayReservaConfirmada } from '../../dominio/reglas';
import { RepositorioEspacios, RepositorioReservas, RepositorioUsuarios } from '../puertos';

export interface ReservaConfirmada extends Reserva {
  saldoRestante: number;
}

export class ServicioReservas {
  constructor(
    private readonly reservas: RepositorioReservas,
    private readonly espacios: RepositorioEspacios,
    private readonly usuarios: RepositorioUsuarios,
    private readonly hoy: () => string = fechaDeHoy,
  ) {}

  reservar(entrada: { usuarioId: string; espacio: string; fecha: string }): ReservaConfirmada {
    afirmarFechaReservable(entrada.fecha, this.hoy());

    const espacio = this.espacios.buscarPorNombre(entrada.espacio);
    if (!espacio) {
      throw new ErrorDeAplicacion('espacio no encontrado', 404);
    }

    const usuario = this.usuarios.buscarPorId(entrada.usuarioId);
    if (!usuario) {
      throw new ErrorDeAplicacion('usuario no encontrado', 404);
    }

    if (hayReservaConfirmada(this.reservas.listar(), espacio.id, entrada.fecha)) {
      throw new ErrorDeAplicacion('el espacio está ocupado en esa fecha', 409);
    }

    if (usuario.saldo < espacio.precioPorDia) {
      throw new ErrorDeAplicacion('saldo insuficiente', 400);
    }

    const saldoRestante = usuario.saldo - espacio.precioPorDia;
    this.usuarios.actualizar({ ...usuario, saldo: saldoRestante });

    const reserva: Reserva = {
      id: randomUUID(),
      usuarioId: usuario.id,
      espacioId: espacio.id,
      espacio: espacio.nombre,
      fecha: entrada.fecha,
      estado: 'confirmada',
      costo: espacio.precioPorDia,
    };
    this.reservas.guardar(reserva);
    return { ...reserva, saldoRestante };
  }

  cancelar(usuarioId: string, reservaId: string): ReservaConfirmada {
    const reserva = this.reservas.buscarPorId(reservaId);
    if (!reserva) {
      throw new ErrorDeAplicacion('reserva no encontrada', 404);
    }
    if (reserva.usuarioId !== usuarioId) {
      throw new ErrorDeAplicacion('no puedes cancelar una reserva de otro usuario', 403);
    }
    if (reserva.estado === 'cancelada') {
      throw new ErrorDeAplicacion('la reserva ya está cancelada', 409);
    }

    const usuario = this.usuarios.buscarPorId(usuarioId);
    if (!usuario) {
      throw new ErrorDeAplicacion('usuario no encontrado', 404);
    }

    const cancelada: Reserva = { ...reserva, estado: 'cancelada' };
    this.reservas.actualizar(cancelada);
    const saldoRestante = usuario.saldo + reserva.costo;
    this.usuarios.actualizar({ ...usuario, saldo: saldoRestante });
    return { ...cancelada, saldoRestante };
  }

  listarPropias(usuarioId: string): Reserva[] {
    return this.reservas.listar().filter((reserva) => reserva.usuarioId === usuarioId);
  }

  listarDe(usuarioId: string): Reserva[] {
    if (!this.usuarios.buscarPorId(usuarioId)) {
      throw new ErrorDeAplicacion('usuario no encontrado', 404);
    }
    return this.listarPropias(usuarioId);
  }

  obtener(reservaId: string): Reserva {
    const reserva = this.reservas.buscarPorId(reservaId);
    if (!reserva) {
      throw new ErrorDeAplicacion('reserva no encontrada', 404);
    }
    return reserva;
  }

  anotar(actor: { id: string; rol: Rol }, reservaId: string, nota: string): Reserva {
    const reserva = this.obtener(reservaId);
    if (actor.rol !== 'ADMIN' && reserva.usuarioId !== actor.id) {
      throw new ErrorDeAplicacion('no tienes permisos sobre este recurso', 403);
    }
    const texto = nota.trim();
    if (texto.length > 200) {
      throw new ErrorDeAplicacion('la nota es demasiado larga', 400);
    }
    const actualizada: Reserva = { ...reserva, nota: texto };
    this.reservas.actualizar(actualizada);
    return actualizada;
  }
}
