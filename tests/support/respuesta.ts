import assert from 'node:assert/strict';
import { Response } from 'supertest';
import { MundoApi } from './mundo';

export function exigirRespuesta(mundo: MundoApi): Response {
  assert.ok(mundo.respuesta, 'No hay una respuesta HTTP. Falta el paso When de este escenario.');
  return mundo.respuesta;
}

const CLAVES_SENSIBLES = ['password', 'contrasena', 'contraseña', 'passwordHash', 'hash'];

export function tieneClaveSensible(valor: unknown): boolean {
  if (!valor || typeof valor !== 'object') {
    return false;
  }
  return Object.entries(valor as Record<string, unknown>).some(
    ([clave, interior]) => CLAVES_SENSIBLES.includes(clave) || tieneClaveSensible(interior),
  );
}
