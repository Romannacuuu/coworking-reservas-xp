export class ErrorDeAplicacion extends Error {
  constructor(
    readonly mensaje: string,
    readonly codigo: number,
  ) {
    super(mensaje);
    this.name = 'ErrorDeAplicacion';
  }
}
