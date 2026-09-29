import { randomUUID } from 'crypto';
import { Usuario, UsuarioPublico, publicarUsuario } from '../../dominio/entidades';
import { ErrorDeAplicacion } from '../../dominio/errores';
import { SALDO_INICIAL, validarRegistro } from '../../dominio/reglas';
import { Cifrador, RepositorioUsuarios } from '../puertos';

export class ServicioUsuarios {
  constructor(
    private readonly usuarios: RepositorioUsuarios,
    private readonly cifrador: Cifrador,
  ) {}

  async registrar(entrada: {
    nombre: string;
    email: string;
    contrasena: string;
  }): Promise<UsuarioPublico> {
    const datos = validarRegistro(entrada);
    if (this.usuarios.buscarPorEmail(datos.email)) {
      throw new ErrorDeAplicacion('email ya registrado', 409);
    }

    const usuario: Usuario = {
      id: randomUUID(),
      nombre: datos.nombre,
      email: datos.email,
      passwordHash: await this.cifrador.cifrar(entrada.contrasena),
      saldo: SALDO_INICIAL,
    };
    this.usuarios.guardar(usuario);
    return publicarUsuario(usuario);
  }

  perfil(usuarioId: string): UsuarioPublico {
    const usuario = this.usuarios.buscarPorId(usuarioId);
    if (!usuario) {
      throw new ErrorDeAplicacion('usuario no encontrado', 404);
    }
    return publicarUsuario(usuario);
  }
}
