const acceso = document.getElementById('acceso');
const panel = document.getElementById('panel');
const cuenta = document.getElementById('cuenta');
const aviso = document.getElementById('aviso');
const fecha = document.getElementById('fecha');
const espacios = document.getElementById('espacios');
const reservas = document.getElementById('reservas');

let perfil = null;

fecha.value = new Date().toLocaleDateString('en-CA');

document.getElementById('form-login').addEventListener('submit', async (evento) => {
  evento.preventDefault();
  const datos = Object.fromEntries(new FormData(evento.currentTarget));
  await ejecutar(async () => {
    const sesion = await pedir('/api/sesion', { method: 'POST', body: datos }, false);
    guardarSesion(sesion);
    await abrirPanel();
    mostrar('Sesión iniciada.');
  });
});

document.getElementById('form-registro').addEventListener('submit', async (evento) => {
  evento.preventDefault();
  const formulario = evento.currentTarget;
  const datos = Object.fromEntries(new FormData(formulario));
  await ejecutar(async () => {
    await pedir('/api/usuarios', { method: 'POST', body: datos }, false);
    const sesion = await pedir('/api/sesion', {
      method: 'POST',
      body: { email: datos.email, contrasena: datos.contrasena },
    }, false);
    guardarSesion(sesion);
    formulario.reset();
    await abrirPanel();
    mostrar('Cuenta creada. Ya podés reservar.');
  });
});

document.getElementById('form-fecha').addEventListener('submit', async (evento) => {
  evento.preventDefault();
  await ejecutar(() => cargarEspacios());
});

document.getElementById('salir').addEventListener('click', () => {
  borrarSesion();
  perfil = null;
  mostrarAcceso();
  mostrar('Sesión cerrada.');
});

espacios.addEventListener('click', (evento) => {
  const boton = evento.target.closest('button[data-espacio]');
  if (!boton) return;
  ejecutar(() => reservar(boton.dataset.espacio));
});

reservas.addEventListener('click', (evento) => {
  const boton = evento.target.closest('button[data-reserva]');
  if (!boton) return;
  ejecutar(() => cancelar(boton.dataset.reserva));
});

iniciar();

async function iniciar() {
  if (!sessionStorage.getItem('coworking.token')) {
    mostrarAcceso();
    return;
  }
  try {
    await abrirPanel();
  } catch (error) {
    borrarSesion();
    mostrarAcceso();
    mostrar(error.message, true);
  }
}

async function abrirPanel() {
  perfil = await pedir('/api/usuarios/yo');
  pintarCuenta();
  acceso.hidden = true;
  panel.hidden = false;
  cuenta.hidden = false;
  await Promise.all([cargarEspacios(), cargarReservas()]);
}

function pintarCuenta() {
  document.getElementById('quien').textContent = `${perfil.nombre} · ${perfil.rol}`;
  document.getElementById('saldo').textContent = `${perfil.saldo} créditos`;
}

async function cargarEspacios() {
  const lista = await pedir(`/api/espacios?fecha=${encodeURIComponent(fecha.value)}`);
  espacios.replaceChildren();
  if (lista.length === 0) {
    espacios.append(parrafo('No hay espacios cargados.'));
    return;
  }
  for (const espacio of lista) {
    const libre = espacio.estado === 'Disponible';
    const tarjeta = document.createElement('article');
    tarjeta.className = 'tarjeta';
    const info = document.createElement('div');
    const titulo = document.createElement('h3');
    titulo.textContent = espacio.nombre;
    const detalle = document.createElement('p');
    const personas = espacio.capacidad === 1 ? 'persona' : 'personas';
    detalle.textContent = `${espacio.tipo} · ${espacio.capacidad} ${personas} · ${espacio.precioPorDia} créditos`;
    const estado = document.createElement('p');
    estado.className = `estado ${libre ? 'libre' : 'ocupada'}`;
    estado.textContent = espacio.estado;
    info.append(titulo, detalle, estado);
    const boton = document.createElement('button');
    boton.type = 'button';
    boton.dataset.espacio = espacio.nombre;
    boton.textContent = 'Reservar';
    boton.disabled = !libre;
    tarjeta.append(info, boton);
    espacios.append(tarjeta);
  }
}

async function cargarReservas() {
  const lista = await pedir('/api/reservas');
  reservas.replaceChildren();
  if (lista.length === 0) {
    reservas.append(parrafo('Todavía no tenés reservas.'));
    return;
  }
  for (const reserva of lista) {
    const tarjeta = document.createElement('article');
    tarjeta.className = 'tarjeta';
    const info = document.createElement('div');
    const titulo = document.createElement('h3');
    titulo.textContent = reserva.espacio;
    const detalle = document.createElement('p');
    detalle.textContent = `${reserva.fecha} · ${reserva.costo} créditos`;
    const estado = document.createElement('p');
    estado.className = `estado ${reserva.estado === 'confirmada' ? 'libre' : 'cancelada'}`;
    estado.textContent = reserva.estado;
    info.append(titulo, detalle, estado);
    tarjeta.append(info);
    if (reserva.estado === 'confirmada') {
      const boton = document.createElement('button');
      boton.type = 'button';
      boton.className = 'secundario';
      boton.dataset.reserva = reserva.id;
      boton.textContent = 'Cancelar';
      tarjeta.append(boton);
    }
    reservas.append(tarjeta);
  }
}

async function reservar(nombre) {
  const resultado = await pedir('/api/reservas', {
    method: 'POST',
    body: { espacio: nombre, fecha: fecha.value },
  });
  perfil.saldo = resultado.saldoRestante;
  pintarCuenta();
  await Promise.all([cargarEspacios(), cargarReservas()]);
  mostrar(`${nombre} quedó reservada. Te quedan ${resultado.saldoRestante} créditos.`);
}

async function cancelar(id) {
  const resultado = await pedir(`/api/reservas/${id}/cancelacion`, { method: 'POST' });
  perfil.saldo = resultado.saldoRestante;
  pintarCuenta();
  await Promise.all([cargarEspacios(), cargarReservas()]);
  mostrar(`Reserva cancelada. Te quedan ${resultado.saldoRestante} créditos.`);
}

function mostrarAcceso() {
  acceso.hidden = false;
  panel.hidden = true;
  cuenta.hidden = true;
}

function parrafo(texto) {
  const nodo = document.createElement('p');
  nodo.className = 'vacio';
  nodo.textContent = texto;
  return nodo;
}

function mostrar(texto, esError = false) {
  aviso.hidden = false;
  aviso.textContent = texto;
  aviso.classList.toggle('error', esError);
}

async function ejecutar(accion) {
  try {
    await accion();
  } catch (error) {
    mostrar(error.message, true);
  }
}

async function pedir(ruta, opciones = {}, renovar = true) {
  const token = sessionStorage.getItem('coworking.token');
  const encabezados = { 'Content-Type': 'application/json' };
  if (token) encabezados.Authorization = `Bearer ${token}`;
  const respuesta = await fetch(ruta, {
    method: opciones.method || 'GET',
    headers: encabezados,
    body: opciones.body ? JSON.stringify(opciones.body) : undefined,
  });
  const cuerpo = await leerJson(respuesta);
  if (respuesta.status === 401 && cuerpo.error === 'token expirado' && renovar) {
    await renovarSesion();
    return pedir(ruta, opciones, false);
  }
  if (!respuesta.ok) {
    throw new Error(cuerpo.error || 'no se pudo completar la operación');
  }
  return cuerpo;
}

async function renovarSesion() {
  const refreshToken = sessionStorage.getItem('coworking.refresh');
  if (!refreshToken) throw new Error('la sesión venció');
  const respuesta = await fetch('/api/sesion/renovacion', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });
  const cuerpo = await leerJson(respuesta);
  if (!respuesta.ok) {
    borrarSesion();
    mostrarAcceso();
    throw new Error(cuerpo.error || 'la sesión venció');
  }
  guardarSesion(cuerpo);
}

async function leerJson(respuesta) {
  try {
    return await respuesta.json();
  } catch {
    return {};
  }
}

function guardarSesion(sesion) {
  sessionStorage.setItem('coworking.token', sesion.token);
  sessionStorage.setItem('coworking.refresh', sesion.refreshToken);
}

function borrarSesion() {
  sessionStorage.removeItem('coworking.token');
  sessionStorage.removeItem('coworking.refresh');
}
