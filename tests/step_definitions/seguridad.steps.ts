import assert from 'node:assert/strict';
import { Given, Then, When } from '@cucumber/cucumber';
import request from 'supertest';
import { ACCESO_POR_DEFECTO_SEGUNDOS } from '../../src/infraestructura/seguridad/parametros';
import { MundoApi } from '../support/mundo';
import { exigirRespuesta } from '../support/respuesta';

Given('que los access tokens nacen vencidos', function (this: MundoApi) {
  this.vigencia.accesoSegundos = 0;
});

Given(
  'que el administrador {string} ya está registrado con email {string} y contraseña {string}',
  async function (this: MundoApi, nombre: string, email: string, contrasena: string) {
    const creado = await this.servicios.usuarios.registrarAdministrador({ nombre, email, contrasena });
    this.recordarUsuario(nombre, email, contrasena, creado.id);
  },
);

When('se restablece la vigencia normal del access token', function (this: MundoApi) {
  this.vigencia.accesoSegundos = ACCESO_POR_DEFECTO_SEGUNDOS;
});

When('{string} consulta su perfil', async function (this: MundoApi, nombre: string) {
  await this.medir(() =>
    request(this.app).get('/api/usuarios/yo').set('Authorization', `Bearer ${this.tokenDe(nombre)}`),
  );
});

When('{string} consulta su perfil usando el refresh token', async function (this: MundoApi, nombre: string) {
  await this.medir(() =>
    request(this.app).get('/api/usuarios/yo').set('Authorization', `Bearer ${this.refreshDe(nombre)}`),
  );
});

When('se solicita el perfil sin proporcionar un token', async function (this: MundoApi) {
  await this.medir(() => request(this.app).get('/api/usuarios/yo'));
});

When('se solicita el perfil con el token {string}', async function (this: MundoApi, token: string) {
  await this.medir(() => request(this.app).get('/api/usuarios/yo').set('Authorization', `Bearer ${token}`));
});

When('se solicita el perfil con un JWT de algoritmo none', async function (this: MundoApi) {
  const encabezado = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url');
  const carga = Buffer.from(
    JSON.stringify({ sub: 'ajeno', rol: 'ADMIN', tipo: 'acceso', exp: 4_102_444_800 }),
  ).toString('base64url');
  await this.medir(() =>
    request(this.app)
      .get('/api/usuarios/yo')
      .set('Authorization', `Bearer ${encabezado}.${carga}.`),
  );
});

When('{string} renueva la sesión con su refresh token', async function (this: MundoApi, nombre: string) {
  const refreshToken = this.refreshDe(nombre);
  this.marcarRefreshAnterior(nombre);
  await this.medir(() => request(this.app).post('/api/sesion/renovacion').send({ refreshToken }));
  if (this.respuesta?.status === 200) {
    const cuerpo = this.respuesta.body as { token: string; refreshToken: string };
    this.guardarSesion(nombre, cuerpo.token, cuerpo.refreshToken);
  }
});

When('{string} intenta renovar con el refresh token anterior', async function (this: MundoApi, nombre: string) {
  await this.medir(() =>
    request(this.app).post('/api/sesion/renovacion').send({ refreshToken: this.refreshAnteriorDe(nombre) }),
  );
});

When('{string} intenta renovar usando el access token', async function (this: MundoApi, nombre: string) {
  await this.medir(() =>
    request(this.app).post('/api/sesion/renovacion').send({ refreshToken: this.tokenDe(nombre) }),
  );
});

When('se renueva la sesión con el token {string}', async function (this: MundoApi, token: string) {
  await this.medir(() => request(this.app).post('/api/sesion/renovacion').send({ refreshToken: token }));
});

When('{string} supera el límite de inicios de sesión', async function (this: MundoApi, nombre: string) {
  const cuenta = this.datosDe(nombre);
  const tope = this.maximoLogin + 1;
  for (let i = 0; i < tope; i += 1) {
    await this.medir(() =>
      request(this.app).post('/api/sesion').send({ email: cuenta.email, contrasena: 'clave-incorrecta' }),
    );
    if (this.respuesta?.status === 429) {
      return;
    }
  }
  assert.fail(`El límite no se activó. Último estado: ${this.respuesta?.status}`);
});

When(
  '{string} publica el espacio {string} de tipo {string} con capacidad {int} y precio {int}',
  async function (this: MundoApi, nombre: string, espacio: string, tipo: string, capacidad: number, precio: number) {
    await this.medir(() =>
      request(this.app)
        .post('/api/espacios')
        .set('Authorization', `Bearer ${this.tokenDe(nombre)}`)
        .send({ nombre: espacio, tipo, capacidad, precioPorDia: precio }),
    );
  },
);

When('se intenta publicar un espacio sin token', async function (this: MundoApi) {
  await this.medir(() =>
    request(this.app).post('/api/espacios').send({
      nombre: 'Sala X',
      tipo: 'sala',
      capacidad: 4,
      precioPorDia: 50,
    }),
  );
});

When(
  '{string} intenta publicar un espacio con capacidad {string}',
  async function (this: MundoApi, nombre: string, capacidad: string) {
    await this.medir(() =>
      request(this.app)
        .post('/api/espacios')
        .set('Authorization', `Bearer ${this.tokenDe(nombre)}`)
        .send({ nombre: 'Sala Rara', tipo: 'sala', capacidad, precioPorDia: 50 }),
    );
  },
);

When(
  'un visitante se registra con nombre {string}, email {string} y contraseña {string} y el rol {string}',
  async function (this: MundoApi, nombre: string, email: string, contrasena: string, rol: string) {
    await this.medir(() => request(this.app).post('/api/usuarios').send({ nombre, email, contrasena, rol }));
  },
);

When(
  '{string} anota {string} en la reserva de {string} del espacio {string} del {string}',
  async function (this: MundoApi, quien: string, nota: string, dueno: string, espacio: string, fecha: string) {
    const id = this.idReserva(dueno, espacio, fecha);
    await this.medir(() =>
      request(this.app)
        .patch(`/api/reservas/${id}`)
        .set('Authorization', `Bearer ${this.tokenDe(quien)}`)
        .send({ nota }),
    );
  },
);

When('{string} anota {string} en una reserva inexistente', async function (this: MundoApi, nombre: string, nota: string) {
  await this.medir(() =>
    request(this.app)
      .patch('/api/reservas/00000000-0000-0000-0000-000000000000')
      .set('Authorization', `Bearer ${this.tokenDe(nombre)}`)
      .send({ nota }),
  );
});

When(
  '{string} anota una nota demasiado larga en su reserva del espacio {string} del {string}',
  async function (this: MundoApi, nombre: string, espacio: string, fecha: string) {
    const id = this.idReserva(nombre, espacio, fecha);
    await this.medir(() =>
      request(this.app)
        .patch(`/api/reservas/${id}`)
        .set('Authorization', `Bearer ${this.tokenDe(nombre)}`)
        .send({ nota: 'a'.repeat(201) }),
    );
  },
);

When('{string} consulta las reservas de {string}', async function (this: MundoApi, quien: string, dueno: string) {
  await this.medir(() =>
    request(this.app)
      .get(`/api/usuarios/${this.datosDe(dueno).id}/reservas`)
      .set('Authorization', `Bearer ${this.tokenDe(quien)}`),
  );
});

When('se consulta la salud desde un origen permitido', async function (this: MundoApi) {
  await this.medir(() => request(this.app).get('/api/salud').set('Origin', this.origenPermitido));
});

When('se consulta la salud desde el origen {string}', async function (this: MundoApi, origen: string) {
  await this.medir(() => request(this.app).get('/api/salud').set('Origin', origen));
});

When('un visitante envía un registro con un operador de inyección', async function (this: MundoApi) {
  await this.medir(() =>
    request(this.app).post('/api/usuarios').send({
      nombre: 'Ataque',
      email: { $gt: '' },
      contrasena: 'secreto123',
    }),
  );
});

When('se consulta la disponibilidad con un operador en la fecha', async function (this: MundoApi) {
  await this.medir(() => request(this.app).get('/api/espacios?fecha[$gt]=1'));
});

When('un visitante se registra con un byte nulo en el nombre', async function (this: MundoApi) {
  await this.medir(() =>
    request(this.app).post('/api/usuarios').send({
      nombre: 'Ana\u0000',
      email: 'ana-nulo@correo.com',
      contrasena: 'secreto123',
    }),
  );
});

When('un visitante se registra con un campo extra no permitido', async function (this: MundoApi) {
  await this.medir(() =>
    request(this.app).post('/api/usuarios').send({
      nombre: 'Marta',
      email: 'marta@correo.com',
      contrasena: 'secreto123',
      saldo: 9999,
    }),
  );
});

Then('la respuesta incluye un refresh token', function (this: MundoApi) {
  const cuerpo = exigirRespuesta(this).body as { refreshToken?: unknown };
  assert.equal(typeof cuerpo.refreshToken, 'string');
  assert.equal((cuerpo.refreshToken as string).split('.').length, 3);
});

Then('el token de acceso tiene formato JWT', function (this: MundoApi) {
  const token = tokenDeRespuesta(this);
  const partes = token.split('.');
  assert.equal(partes.length, 3);
  const encabezado = JSON.parse(Buffer.from(partes[0], 'base64url').toString('utf8')) as { alg?: string };
  const carga = cargaDe(token);
  assert.equal(encabezado.alg, 'HS256');
  assert.equal(typeof carga.sub, 'string');
  assert.equal(typeof carga.exp, 'number');
  assert.equal(carga.tipo, 'acceso');
  assert.equal(Object.hasOwn(carga, 'contrasena'), false);
  assert.equal(Object.hasOwn(carga, 'password'), false);
});

Then('el token de acceso declara el rol {string}', function (this: MundoApi, rol: string) {
  assert.equal(cargaDe(tokenDeRespuesta(this)).rol, rol);
});

Then('el perfil declara el rol {string}', function (this: MundoApi, rol: string) {
  const cuerpo = exigirRespuesta(this).body as { rol?: string };
  assert.equal(cuerpo.rol, rol);
});

Then('el espacio publicado se llama {string}', function (this: MundoApi, nombre: string) {
  const cuerpo = exigirRespuesta(this).body as { nombre?: string };
  assert.equal(cuerpo.nombre, nombre);
});

Then('la nota de la reserva es {string}', function (this: MundoApi, nota: string) {
  const cuerpo = exigirRespuesta(this).body as { nota?: string };
  assert.equal(cuerpo.nota, nota);
});

Then('ninguna reserva de la lista tiene la nota {string}', function (this: MundoApi, nota: string) {
  const cuerpo = exigirRespuesta(this).body as Array<{ nota?: string }>;
  assert.ok(Array.isArray(cuerpo), 'Se esperaba una lista de reservas');
  assert.equal(
    cuerpo.some((reserva) => reserva.nota === nota),
    false,
  );
});

Then('la respuesta refleja ese origen permitido', function (this: MundoApi) {
  const valor = exigirRespuesta(this).headers['access-control-allow-origin'];
  assert.equal(valor, this.origenPermitido);
  assert.notEqual(valor, '*');
});

Then('la respuesta no autoriza cualquier origen', function (this: MundoApi) {
  assert.notEqual(exigirRespuesta(this).headers['access-control-allow-origin'], '*');
});

function tokenDeRespuesta(mundo: MundoApi): string {
  const cuerpo = exigirRespuesta(mundo).body as { token?: unknown };
  assert.equal(typeof cuerpo.token, 'string');
  return cuerpo.token as string;
}

function cargaDe(token: string): { sub?: unknown; exp?: unknown; tipo?: unknown; rol?: unknown } {
  const partes = token.split('.');
  assert.equal(partes.length, 3);
  return JSON.parse(Buffer.from(partes[1], 'base64url').toString('utf8')) as {
    sub?: unknown;
    exp?: unknown;
    tipo?: unknown;
    rol?: unknown;
  };
}
