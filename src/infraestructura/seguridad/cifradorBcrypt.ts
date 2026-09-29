import bcrypt from 'bcryptjs';
import { Cifrador } from '../../aplicacion/puertos';

export class CifradorBcrypt implements Cifrador {
  constructor(private readonly rondas: number) {}

  cifrar(plano: string): Promise<string> {
    return bcrypt.hash(plano, this.rondas);
  }

  coincide(plano: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plano, hash);
  }
}

export function rondasDesdeEntorno(valor: string | undefined): number {
  const rondas = Number(valor ?? 8);
  if (!Number.isInteger(rondas) || rondas < 4 || rondas > 15) {
    throw new Error('BCRYPT_ROUNDS debe ser un entero entre 4 y 15');
  }
  return rondas;
}
