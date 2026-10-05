import { randomUUID } from 'crypto';
import jwt from 'jsonwebtoken';
import { EmisorDeTokens, IdentidadToken, VigenciaTokens } from '../../aplicacion/puertos';
import { Rol } from '../../dominio/entidades';

export class EmisorJwt implements EmisorDeTokens {
  constructor(
    private readonly secreto: string,
    private readonly vigencia: VigenciaTokens,
  ) {
    if (secreto.length < 8) {
      throw new Error('TOKEN_SECRET debe tener al menos 8 caracteres');
    }
  }

  emitirAcceso(identidad: IdentidadToken): string {
    const ahora = Math.floor(Date.now() / 1000);
    const exp = this.vigencia.accesoSegundos > 0 ? ahora + this.vigencia.accesoSegundos : ahora - 1;
    return jwt.sign({ sub: identidad.sub, rol: identidad.rol, tipo: 'acceso', exp }, this.secreto, {
      algorithm: 'HS256',
    });
  }

  emitirRenovacion(usuarioId: string): { token: string; jti: string; exp: number } {
    const jti = randomUUID();
    const ahora = Math.floor(Date.now() / 1000);
    const exp = ahora + this.vigencia.renovacionSegundos;
    const token = jwt.sign({ sub: usuarioId, jti, tipo: 'renovacion', exp }, this.secreto, {
      algorithm: 'HS256',
    });
    return { token, jti, exp };
  }

  verificarAcceso(token: string): IdentidadToken {
    const carga = this.decodificar(token, 'acceso');
    const rol = carga.rol;
    if (!esRol(rol) || typeof carga.sub !== 'string' || carga.sub.length === 0) {
      throw new Error('token inválido');
    }
    return { sub: carga.sub, rol };
  }

  verificarRenovacion(token: string): { sub: string; jti: string } {
    const carga = this.decodificar(token, 'renovacion');
    if (
      typeof carga.sub !== 'string' ||
      carga.sub.length === 0 ||
      typeof carga.jti !== 'string' ||
      carga.jti.length === 0
    ) {
      throw new Error('token inválido');
    }
    return { sub: carga.sub, jti: carga.jti };
  }

  private decodificar(token: string, tipo: 'acceso' | 'renovacion'): jwt.JwtPayload {
    try {
      const decodificado = jwt.verify(token, this.secreto, { algorithms: ['HS256'] });
      if (typeof decodificado === 'string' || decodificado.tipo !== tipo) {
        throw new Error('token inválido');
      }
      return decodificado;
    } catch (error) {
      if (error instanceof Error && (error.message === 'token inválido' || error.message === 'token expirado')) {
        throw error;
      }
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('token expirado');
      }
      throw new Error('token inválido');
    }
  }
}

function esRol(valor: unknown): valor is Rol {
  return valor === 'USUARIO' || valor === 'ADMIN';
}
