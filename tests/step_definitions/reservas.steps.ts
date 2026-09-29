import assert from 'node:assert/strict';
import { Given, Then, When } from '@cucumber/cucumber';
import request from 'supertest';
import { MundoApi } from '../support/mundo';
import { exigirRespuesta } from '../support/respuesta';

Given(
  'que {string} ya reservó el espacio {string} para el {string}',
  async function (this: MundoApi, nombre: string, espacio: string, fecha: string) {
    const respuesta = await request(this.app)
      .post('/api/reservas')
      .set('Authorization', `Bearer ${this.tokenDe(nombre)}`)
      .send({ espacio, fecha });
    assert.equal(respuesta.status, 201, JSON.stringify(respuesta.body));
    const cuerpo = respuesta.body as { id: string };
    this.recordarReserva(nombre, espacio, fecha, cuerpo.id);
  },
);

When(
  '{string} reserva el espacio {string} para el {string}',
  async function (this: MundoApi, nombre: string, espacio: string, fecha: string) {
    const token = this.tokenDe(nombre);
    await this.medir(() =>
      request(this.app).post('/api/reservas').set('Authorization', `Bearer ${token}`).send({ espacio, fecha }),
    );
    if (this.respuesta?.status === 201) {
      const cuerpo = this.respuesta.body as { id: string };
      this.recordarReserva(nombre, espacio, fecha, cuerpo.id);
    }
  },
);

When(
  '{string} cancela su reserva del espacio {string} del {string}',
  async function (this: MundoApi, nombre: string, espacio: string, fecha: string) {
    const id = this.idReserva(nombre, espacio, fecha);
    const token = this.tokenDe(nombre);
    await this.medir(() =>
      request(this.app).post(`/api/reservas/${id}/cancelacion`).set('Authorization', `Bearer ${token}`),
    );
  },
);

When(
  '{string} intenta cancelar la reserva de {string} del espacio {string} del {string}',
  async function (this: MundoApi, quien: string, dueno: string, espacio: string, fecha: string) {
    const id = this.idReserva(dueno, espacio, fecha);
    const token = this.tokenDe(quien);
    await this.medir(() =>
      request(this.app).post(`/api/reservas/${id}/cancelacion`).set('Authorization', `Bearer ${token}`),
    );
  },
);

When('{string} consulta sus reservas', async function (this: MundoApi, nombre: string) {
  const token = this.tokenDe(nombre);
  await this.medir(() => request(this.app).get('/api/reservas').set('Authorization', `Bearer ${token}`));
});

When('se consultan las reservas sin token', async function (this: MundoApi) {
  await this.medir(() => request(this.app).get('/api/reservas'));
});

Then('la reserva queda en estado {string}', function (this: MundoApi, estado: string) {
  const cuerpo = exigirRespuesta(this).body as { estado?: string };
  assert.equal(cuerpo.estado, estado);
});

Then('la lista contiene {int} reservas', function (this: MundoApi, cantidad: number) {
  const cuerpo = exigirRespuesta(this).body;
  assert.ok(Array.isArray(cuerpo), 'Se esperaba una lista de reservas');
  assert.equal(cuerpo.length, cantidad);
});

Then('la lista incluye el espacio {string}', function (this: MundoApi, espacio: string) {
  const cuerpo = listaDeReservas(this);
  assert.ok(cuerpo.some((reserva) => reserva.espacio === espacio));
});

Then('la lista no incluye el espacio {string}', function (this: MundoApi, espacio: string) {
  const cuerpo = listaDeReservas(this);
  assert.equal(
    cuerpo.some((reserva) => reserva.espacio === espacio),
    false,
  );
});

function listaDeReservas(mundo: MundoApi): Array<{ espacio: string }> {
  const cuerpo = exigirRespuesta(mundo).body;
  assert.ok(Array.isArray(cuerpo), 'Se esperaba una lista de reservas');
  return cuerpo as Array<{ espacio: string }>;
}
