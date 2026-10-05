import assert from 'node:assert/strict';
import { Given, Then, When } from '@cucumber/cucumber';
import request from 'supertest';
import { normalizarEmail } from '../../src/dominio/reglas';
import { MundoApi } from '../support/mundo';
import { exigirRespuesta, tieneClaveSensible } from '../support/respuesta';

Given(
  'que el usuario {string} ya está registrado con email {string} y contraseña {string}',
  async function (this: MundoApi, nombre: string, email: string, contrasena: string) {
    const respuesta = await request(this.app).post('/api/usuarios').send({ nombre, email, contrasena });
    assert.equal(respuesta.status, 201, JSON.stringify(respuesta.body));
    const cuerpo = respuesta.body as { id: string };
    this.recordarUsuario(nombre, email, contrasena, cuerpo.id);
  },
);

Given('que {string} tiene una sesión activa', async function (this: MundoApi, nombre: string) {
  const cuenta = this.datosDe(nombre);
  const respuesta = await request(this.app)
    .post('/api/sesion')
    .send({ email: cuenta.email, contrasena: cuenta.contrasena });
  assert.equal(respuesta.status, 200, JSON.stringify(respuesta.body));
  const cuerpo = respuesta.body as { token: string; refreshToken?: string };
  this.guardarSesion(nombre, cuerpo.token, cuerpo.refreshToken);
});

When(
  'un visitante se registra con nombre {string}, email {string} y contraseña {string}',
  async function (this: MundoApi, nombre: string, email: string, contrasena: string) {
    await this.medir(() => request(this.app).post('/api/usuarios').send({ nombre, email, contrasena }));
    if (this.respuesta?.status === 201) {
      const cuerpo = this.respuesta.body as { id: string };
      this.recordarUsuario(nombre, email, contrasena, cuerpo.id);
    }
  },
);

When(
  '{string} inicia sesión con email {string} y contraseña {string}',
  async function (this: MundoApi, nombre: string, email: string, contrasena: string) {
    await this.medir(() => request(this.app).post('/api/sesion').send({ email, contrasena }));
    if (this.respuesta?.status === 200) {
      const cuerpo = this.respuesta.body as { token: string; refreshToken?: string; usuario: { id: string } };
      if (!this.tieneCuenta(nombre)) {
        this.recordarUsuario(nombre, email, contrasena, cuerpo.usuario.id);
      }
      this.guardarSesion(nombre, cuerpo.token, cuerpo.refreshToken);
    }
  },
);

Then('la respuesta incluye el email {string}', function (this: MundoApi, email: string) {
  const cuerpo = exigirRespuesta(this).body as { email?: string };
  assert.equal(cuerpo.email, email);
});

Then('la contraseña no aparece en la respuesta', function (this: MundoApi) {
  const cuerpo = exigirRespuesta(this).body as unknown;
  const texto = JSON.stringify(cuerpo);
  assert.equal(tieneClaveSensible(cuerpo), false);
  assert.equal(texto.includes('$2a$') || texto.includes('$2b$') || texto.includes('$2y$'), false);
});

Then('el usuario creado tiene saldo {int}', function (this: MundoApi, saldo: number) {
  const cuerpo = exigirRespuesta(this).body as { saldo?: number };
  assert.equal(cuerpo.saldo, saldo);
});

Then('la respuesta incluye un token de acceso', function (this: MundoApi) {
  const cuerpo = exigirRespuesta(this).body as { token?: unknown };
  assert.equal(typeof cuerpo.token, 'string');
  assert.ok((cuerpo.token as string).length > 20);
});

Then('el saldo de {string} es {int}', async function (this: MundoApi, nombre: string, saldo: number) {
  const respuesta = await request(this.app)
    .get('/api/usuarios/yo')
    .set('Authorization', `Bearer ${this.tokenDe(nombre)}`);
  assert.equal(respuesta.status, 200, JSON.stringify(respuesta.body));
  const cuerpo = respuesta.body as { saldo: number };
  assert.equal(cuerpo.saldo, saldo);
});

Then(
  'la contraseña almacenada de {string} no es el texto {string}',
  function (this: MundoApi, email: string, plano: string) {
    assert.notEqual(hashAlmacenado(this, email), plano);
  },
);

Then('la contraseña almacenada de {string} es un hash bcrypt', function (this: MundoApi, email: string) {
  assert.match(hashAlmacenado(this, email), /^\$2[aby]\$/);
});

Then(
  'la contraseña almacenada de {string} verifica el texto {string}',
  async function (this: MundoApi, email: string, plano: string) {
    assert.equal(await this.cifrador.coincide(plano, hashAlmacenado(this, email)), true);
  },
);

Then('los hashes de {string} y {string} son distintos', function (this: MundoApi, emailA: string, emailB: string) {
  assert.notEqual(hashAlmacenado(this, emailA), hashAlmacenado(this, emailB));
});

function hashAlmacenado(mundo: MundoApi, email: string): string {
  const usuario = mundo.repositorioUsuarios.buscarPorEmail(normalizarEmail(email));
  assert.ok(usuario, `No hay un usuario almacenado con email ${email}`);
  return usuario.passwordHash;
}
