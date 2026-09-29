import { Reserva, TipoEspacio } from './entidades';
import { ErrorDeAplicacion } from './errores';

export const SALDO_INICIAL = 300;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const FECHA = /^\d{4}-\d{2}-\d{2}$/;

export function fechaDeHoy(ahora: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Argentina/Buenos_Aires',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(ahora);
}

export function normalizarEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function validarRegistro(entrada: { nombre: string; email: string; contrasena: string }): {
  nombre: string;
  email: string;
} {
  const nombre = entrada.nombre.trim();
  if (nombre.length < 2) {
    throw new ErrorDeAplicacion('el nombre debe tener al menos 2 caracteres', 400);
  }

  const email = normalizarEmail(entrada.email);
  if (!EMAIL.test(email)) {
    throw new ErrorDeAplicacion('el email es inválido', 400);
  }

  if (entrada.contrasena.length < 8) {
    throw new ErrorDeAplicacion('la contraseña debe tener al menos 8 caracteres', 400);
  }

  return { nombre, email };
}

export function validarEspacio(entrada: {
  nombre: string;
  tipo: string;
  capacidad: number;
  precioPorDia: number;
}): { nombre: string; tipo: TipoEspacio; capacidad: number; precioPorDia: number } {
  const nombre = entrada.nombre.trim();
  if (nombre.length < 2) {
    throw new ErrorDeAplicacion('el nombre del espacio es inválido', 400);
  }
  if (entrada.tipo !== 'sala' && entrada.tipo !== 'escritorio') {
    throw new ErrorDeAplicacion('el tipo de espacio es inválido', 400);
  }
  if (!Number.isInteger(entrada.capacidad) || entrada.capacidad < 1) {
    throw new ErrorDeAplicacion('la capacidad debe ser un entero mayor a cero', 400);
  }
  if (!Number.isInteger(entrada.precioPorDia) || entrada.precioPorDia < 1) {
    throw new ErrorDeAplicacion('el precio debe ser un entero mayor a cero', 400);
  }
  return {
    nombre,
    tipo: entrada.tipo,
    capacidad: entrada.capacidad,
    precioPorDia: entrada.precioPorDia,
  };
}

export function afirmarFechaConFormato(fecha: string): void {
  if (!FECHA.test(fecha)) {
    throw new ErrorDeAplicacion('formato de fecha inválido', 400);
  }
  const instante = new Date(`${fecha}T00:00:00.000Z`);
  if (Number.isNaN(instante.getTime()) || instante.toISOString().slice(0, 10) !== fecha) {
    throw new ErrorDeAplicacion('formato de fecha inválido', 400);
  }
}

export function afirmarFechaReservable(fecha: string, hoy: string): void {
  afirmarFechaConFormato(fecha);
  if (fecha < hoy) {
    throw new ErrorDeAplicacion('la fecha no puede ser anterior a hoy', 400);
  }
}

export function hayReservaConfirmada(reservas: Reserva[], espacioId: string, fecha: string): boolean {
  return reservas.some(
    (reserva) =>
      reserva.espacioId === espacioId && reserva.fecha === fecha && reserva.estado === 'confirmada',
  );
}
