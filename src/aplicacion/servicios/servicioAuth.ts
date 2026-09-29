import { UsuarioPublico, publicarUsuario } from '../../dominio/entidades';
import { ErrorDeAplicacion } from '../../dominio/errores';
import { normalizarEmail } from '../../dominio/reglas';
import { Cifrador, EmisorDeTokens, RepositorioUsuarios } from '../puertos';

export class ServicioAuth {
  private readonly relleno: Promise<string>;

  constructor(
    private readonly usuarios: RepositorioUsuarios,
    private readonly cifrador: Cifrador,
    private readonly tokens: EmisorDeTokens,
  ) {
    this.relleno = cifrador.cifrar('relleno-interno-no-es-una-clave');
  }

  async iniciarSesion(
    email: string,
    contrasena: string,
  ): Promise<{ token: string; usuario: UsuarioPublico }> {
    const usuario = this.usuarios.buscarPorEmail(normalizarEmail(email));
    const hash = usuario?.passwordHash ?? (await this.relleno);
    const coincide = await this.cifrador.coincide(contrasena, hash);
    if (!usuario || !coincide) {
      throw new ErrorDeAplicacion('credenciales inválidas', 401);
    }
    return {
      token: this.tokens.emitir(usuario.id),
      usuario: publicarUsuario(usuario),
    };
  }
}
