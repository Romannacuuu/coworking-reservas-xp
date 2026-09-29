import assert from 'node:assert/strict';
import { Then } from '@cucumber/cucumber';
import { MundoApi } from '../support/mundo';
import { exigirRespuesta } from '../support/respuesta';

Then('la respuesta tiene código {int}', function (this: MundoApi, codigo: number) {
  const respuesta = exigirRespuesta(this);
  assert.equal(respuesta.status, codigo, JSON.stringify(respuesta.body));
});

Then('el mensaje de error contiene {string}', function (this: MundoApi, fragmento: string) {
  const cuerpo = exigirRespuesta(this).body as { error?: unknown };
  const mensaje = typeof cuerpo.error === 'string' ? cuerpo.error : '';
  assert.ok(mensaje.includes(fragmento), `El mensaje "${mensaje}" no contiene "${fragmento}"`);
});

Then('el tiempo de respuesta es menor a {int} milisegundos', function (this: MundoApi, maximo: number) {
  assert.ok(
    this.duracionMs < maximo,
    `La respuesta tardó ${this.duracionMs} ms y el umbral es ${maximo} ms`,
  );
});
