import { Usuario, UsuarioPublico, publicarUsuario } from '../../dominio/entidades';
import { ErrorDeAplicacion } from '../../dominio/errores';
import { normalizarEmail } from '../../dominio/reglas';
import { Cifrador, EmisorDeTokens, RepositorioSesiones, RepositorioUsuarios } from '../puertos';

export interface SesionEmitida {
  token: string;
  refreshToken: string;
  usuario: UsuarioPublico;
}

export class ServicioAuth {
  private readonly relleno: Promise<string>;

  constructor(
    private readonly usuarios: RepositorioUsuarios,
    private readonly cifrador: Cifrador,
    private readonly tokens: EmisorDeTokens,
    private readonly sesiones: RepositorioSesiones,
  ) {
    this.relleno = cifrador.cifrar('relleno-interno-no-es-una-clave');
  }

  async iniciarSesion(email: string, contrasena: string): Promise<SesionEmitida> {
    const usuario = this.usuarios.buscarPorEmail(normalizarEmail(email));
    const hash = usuario?.passwordHash ?? (await this.relleno);
    const coincide = await this.cifrador.coincide(contrasena, hash);
    if (!usuario || !coincide) {
      throw new ErrorDeAplicacion('credenciales inválidas', 401);
    }
    return this.emitirPar(usuario);
  }

  renovar(refreshToken: string): { token: string; refreshToken: string } {
    const carga = this.leerRenovacion(refreshToken);
    const sesion = this.sesiones.buscar(carga.jti);
    if (!sesion || sesion.usuarioId !== carga.sub) {
      throw new ErrorDeAplicacion('token inválido', 401);
    }
    const usuario = this.usuarios.buscarPorId(carga.sub);
    if (!usuario) {
      throw new ErrorDeAplicacion('token inválido', 401);
    }
    this.sesiones.revocar(carga.jti);
    const par = this.emitirPar(usuario);
    return { token: par.token, refreshToken: par.refreshToken };
  }

  private emitirPar(usuario: Usuario): SesionEmitida {
    const token = this.tokens.emitirAcceso({ sub: usuario.id, rol: usuario.rol });
    const renovacion = this.tokens.emitirRenovacion(usuario.id);
    this.sesiones.guardar({
      jti: renovacion.jti,
      usuarioId: usuario.id,
      venceEn: renovacion.exp,
    });
    return {
      token,
      refreshToken: renovacion.token,
      usuario: publicarUsuario(usuario),
    };
  }

  private leerRenovacion(refreshToken: string): { sub: string; jti: string } {
    try {
      return this.tokens.verificarRenovacion(refreshToken);
    } catch (error) {
      if (error instanceof Error && error.message === 'token expirado') {
        throw new ErrorDeAplicacion('token expirado', 401);
      }
      throw new ErrorDeAplicacion('token inválido', 401);
    }
  }
}
