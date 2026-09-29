Feature: Consulta de mis reservas
  Como usuario autenticado
  Quiero ver el listado de mis reservas
  Para organizar mi agenda

  Background:
    Given que el usuario "Juan" ya está registrado con email "juan@correo.com" y contraseña "secreto123"
    And que "Juan" tiene una sesión activa
    And que existe el espacio "Sala A" de tipo "sala" con capacidad 6 y precio 100
    And que existe el espacio "Sala B" de tipo "sala" con capacidad 4 y precio 80

  Scenario: El usuario ve solamente sus reservas
    Given que "Juan" ya reservó el espacio "Sala A" para el "2026-10-15"
    And que el usuario "Ana" ya está registrado con email "ana@correo.com" y contraseña "secreto123"
    And que "Ana" tiene una sesión activa
    And que "Ana" ya reservó el espacio "Sala B" para el "2026-10-15"
    When "Juan" consulta sus reservas
    Then la respuesta tiene código 200
    And la lista contiene 1 reservas
    And la lista incluye el espacio "Sala A"
    And la lista no incluye el espacio "Sala B"

  Scenario: Un usuario sin reservas recibe una lista vacía
    When "Juan" consulta sus reservas
    Then la respuesta tiene código 200
    And la lista contiene 0 reservas

  Scenario: Sin sesión no se pueden ver las reservas
    When se consultan las reservas sin token
    Then la respuesta tiene código 401
    And el mensaje de error contiene "no autenticado"
