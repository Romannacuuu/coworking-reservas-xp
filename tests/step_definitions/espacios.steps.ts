import assert from 'node:assert/strict';
import { Given, Then, When } from '@cucumber/cucumber';
import request from 'supertest';
import { MundoApi } from '../support/mundo';
import { exigirRespuesta } from '../support/respuesta';

Given(
  'que existe el espacio {string} de tipo {string} con capacidad {int} y precio {int}',
  function (this: MundoApi, nombre: string, tipo: string, capacidad: number, precio: number) {
    this.espacios.registrar({ nombre, tipo, capacidad, precioPorDia: precio });
  },
);

When(
  '{string} consulta la disponibilidad para el {string}',
  async function (this: MundoApi, nombre: string, fecha: string) {
    const token = this.tokenDe(nombre);
    await this.medir(() =>
      request(this.app).get('/api/espacios').query({ fecha }).set('Authorization', `Bearer ${token}`),
    );
  },
);

When(
  'se consulta la disponibilidad para el {string} sin token',
  async function (this: MundoApi, fecha: string) {
    await this.medir(() => request(this.app).get('/api/espacios').query({ fecha }));
  },
);

When(
  'se consulta la disponibilidad para el {string} con el token {string}',
  async function (this: MundoApi, fecha: string, token: string) {
    await this.medir(() =>
      request(this.app).get('/api/espacios').query({ fecha }).set('Authorization', `Bearer ${token}`),
    );
  },
);

When('{string} consulta la disponibilidad sin fecha', async function (this: MundoApi, nombre: string) {
  const token = this.tokenDe(nombre);
  await this.medir(() => request(this.app).get('/api/espacios').set('Authorization', `Bearer ${token}`));
});

When('se consulta el estado de salud de la API', async function (this: MundoApi) {
  await this.medir(() => request(this.app).get('/api/salud'));
});

Then('el espacio {string} figura como {string}', function (this: MundoApi, nombre: string, estado: string) {
  const cuerpo = exigirRespuesta(this).body as Array<{ nombre: string; estado: string }>;
  assert.ok(Array.isArray(cuerpo), 'La disponibilidad no devolvió una lista');
  const espacio = cuerpo.find((item) => item.nombre === nombre);
  assert.ok(espacio, `No apareció "${nombre}" en ${JSON.stringify(cuerpo)}`);
  assert.equal(espacio.estado, estado);
});

Then('el estado de salud es {string}', function (this: MundoApi, estado: string) {
  const cuerpo = exigirRespuesta(this).body as { estado?: string };
  assert.equal(cuerpo.estado, estado);
});
