Feature: Reserva de espacios
  Como usuario autenticado
  Quiero reservar un espacio disponible
  Para tener un lugar de trabajo

  Background:
    Given que el usuario "Juan" ya está registrado con email "juan@correo.com" y contraseña "secreto123"
    And que "Juan" tiene una sesión activa

  Scenario: Reserva exitosa de un espacio disponible
    Given que existe el espacio "Sala A" de tipo "sala" con capacidad 6 y precio 100
    When "Juan" reserva el espacio "Sala A" para el "2026-10-15"
    Then la respuesta tiene código 201
    And la reserva queda en estado "confirmada"
    And el saldo de "Juan" es 200
    When "Juan" consulta la disponibilidad para el "2026-10-15"
    Then el espacio "Sala A" figura como "Ocupada"

  Scenario: No se puede reservar un espacio ya ocupado
    Given que existe el espacio "Sala A" de tipo "sala" con capacidad 6 y precio 100
    And que "Juan" ya reservó el espacio "Sala A" para el "2026-10-15"
    And que el usuario "Ana" ya está registrado con email "ana@correo.com" y contraseña "secreto123"
    And que "Ana" tiene una sesión activa
    When "Ana" reserva el espacio "Sala A" para el "2026-10-15"
    Then la respuesta tiene código 409
    And el mensaje de error contiene "ocupado"
    And el saldo de "Ana" es 300

  Scenario: No se puede reservar sin saldo suficiente
    Given que existe el espacio "Sala Premium" de tipo "sala" con capacidad 10 y precio 500
    When "Juan" reserva el espacio "Sala Premium" para el "2026-10-15"
    Then la respuesta tiene código 400
    And el mensaje de error contiene "saldo insuficiente"
    And el saldo de "Juan" es 300

  Scenario: No se puede reservar una fecha pasada
    Given que existe el espacio "Sala A" de tipo "sala" con capacidad 6 y precio 100
    When "Juan" reserva el espacio "Sala A" para el "2020-01-01"
    Then la respuesta tiene código 400
    And el mensaje de error contiene "anterior"

  Scenario: Una fecha imposible se rechaza
    Given que existe el espacio "Sala A" de tipo "sala" con capacidad 6 y precio 100
    When "Juan" reserva el espacio "Sala A" para el "2026-02-31"
    Then la respuesta tiene código 400
    And el mensaje de error contiene "formato de fecha"
