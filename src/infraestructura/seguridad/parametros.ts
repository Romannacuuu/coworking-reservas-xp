export const ACCESO_POR_DEFECTO_SEGUNDOS = 15 * 60;
export const RENOVACION_POR_DEFECTO_SEGUNDOS = 7 * 24 * 60 * 60;
export const LOGIN_MAXIMO_POR_DEFECTO = 5;
export const LOGIN_VENTANA_POR_DEFECTO_MS = 15 * 60 * 1000;
export const ORIGENES_POR_DEFECTO = ['http://localhost:5173', 'http://localhost:3000'];

export function enteroEnRango(
  valor: string | undefined,
  defecto: number,
  minimo: number,
  maximo: number,
  nombre: string,
): number {
  if (valor === undefined || valor.trim() === '') {
    return defecto;
  }
  const numero = Number(valor);
  if (!Number.isInteger(numero) || numero < minimo || numero > maximo) {
    throw new Error(`${nombre} debe ser un entero entre ${minimo} y ${maximo}`);
  }
  return numero;
}

export function origenesDesdeEntorno(valor: string | undefined): string[] {
  if (valor === undefined || valor.trim() === '') {
    return [...ORIGENES_POR_DEFECTO];
  }
  const lista = valor
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
  if (lista.length === 0 || lista.includes('*')) {
    throw new Error('CORS_ORIGINS debe listar orígenes concretos y no puede ser *');
  }
  return lista;
}
