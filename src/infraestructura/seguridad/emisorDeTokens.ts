import { createHmac, timingSafeEqual } from 'crypto';
import { EmisorDeTokens } from '../../aplicacion/puertos';

const DOCE_HORAS_MS = 1000 * 60 * 60 * 12;

interface Carga {
  sub: string;
  exp: number;
}

export class EmisorHmac implements EmisorDeTokens {
  constructor(private readonly secreto: string) {
    if (secreto.length < 8) {
      throw new Error('TOKEN_SECRET debe tener al menos 8 caracteres');
    }
  }

  emitir(usuarioId: string): string {
    const cuerpo = Buffer.from(
      JSON.stringify({ sub: usuarioId, exp: Date.now() + DOCE_HORAS_MS } satisfies Carga),
      'utf8',
    ).toString('base64url');
    return `${cuerpo}.${this.firmar(cuerpo)}`;
  }

  verificar(token: string): { sub: string } {
    const [cuerpo, firma] = token.split('.');
    if (!cuerpo || !firma || token.split('.').length !== 2) {
      throw new Error('token inválido');
    }

    const esperada = this.firmar(cuerpo);
    const recibida = Buffer.from(firma);
    const calculada = Buffer.from(esperada);
    if (recibida.length !== calculada.length || !timingSafeEqual(recibida, calculada)) {
      throw new Error('token inválido');
    }

    try {
      const carga = JSON.parse(Buffer.from(cuerpo, 'base64url').toString('utf8')) as Carga;
      if (typeof carga.sub !== 'string' || carga.sub.length === 0 || carga.exp < Date.now()) {
        throw new Error('token inválido');
      }
      return { sub: carga.sub };
    } catch (error) {
      if (error instanceof Error && error.message === 'token inválido') {
        throw error;
      }
      throw new Error('token inválido');
    }
  }

  private firmar(cuerpo: string): string {
    return createHmac('sha256', this.secreto).update(cuerpo).digest('hex');
  }
}
