import { randomUUID } from 'crypto';
import { Espacio, EspacioConEstado } from '../../dominio/entidades';
import { ErrorDeAplicacion } from '../../dominio/errores';
import { afirmarFechaConFormato, hayReservaConfirmada, validarEspacio } from '../../dominio/reglas';
import { RepositorioEspacios, RepositorioReservas } from '../puertos';

export class ServicioEspacios {
  constructor(
    private readonly espacios: RepositorioEspacios,
    private readonly reservas: RepositorioReservas,
  ) {}

  registrar(entrada: {
    nombre: string;
    tipo: string;
    capacidad: number;
    precioPorDia: number;
  }): Espacio {
    const datos = validarEspacio(entrada);
    if (this.espacios.buscarPorNombre(datos.nombre)) {
      throw new ErrorDeAplicacion('ya existe un espacio con ese nombre', 409);
    }
    const espacio: Espacio = { id: randomUUID(), ...datos };
    this.espacios.guardar(espacio);
    return espacio;
  }

  disponibilidad(fecha: string): EspacioConEstado[] {
    afirmarFechaConFormato(fecha);
    const reservas = this.reservas.listar();
    return this.espacios.listar().map((espacio) => ({
      ...espacio,
      estado: hayReservaConfirmada(reservas, espacio.id, fecha) ? 'Ocupada' : 'Disponible',
    }));
  }
}
