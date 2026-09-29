Feature: Cancelación de reserva
  Como usuario autenticado
  Quiero cancelar una reserva propia
  Para liberar el espacio y recuperar el saldo

  Background:
    Given que el usuario "Juan" ya está registrado con email "juan@correo.com" y contraseña "secreto123"
    And que "Juan" tiene una sesión activa
    And que existe el espacio "Sala A" de tipo "sala" con capacidad 6 y precio 100

  Scenario: Cancelar una reserva propia libera la sala y reintegra el saldo
    Given que "Juan" ya reservó el espacio "Sala A" para el "2026-10-15"
    When "Juan" cancela su reserva del espacio "Sala A" del "2026-10-15"
    Then la respuesta tiene código 200
    And la reserva queda en estado "cancelada"
    And el saldo de "Juan" es 300
    When "Juan" consulta la disponibilidad para el "2026-10-15"
    Then el espacio "Sala A" figura como "Disponible"

  Scenario: No se puede cancelar la reserva de otra persona
    Given que "Juan" ya reservó el espacio "Sala A" para el "2026-10-15"
    And que el usuario "Ana" ya está registrado con email "ana@correo.com" y contraseña "secreto123"
    And que "Ana" tiene una sesión activa
    When "Ana" intenta cancelar la reserva de "Juan" del espacio "Sala A" del "2026-10-15"
    Then la respuesta tiene código 403
    And el mensaje de error contiene "otro usuario"
    And el saldo de "Juan" es 200

  Scenario: No se puede cancelar dos veces la misma reserva
    Given que "Juan" ya reservó el espacio "Sala A" para el "2026-10-15"
    When "Juan" cancela su reserva del espacio "Sala A" del "2026-10-15"
    Then la respuesta tiene código 200
    When "Juan" cancela su reserva del espacio "Sala A" del "2026-10-15"
    Then la respuesta tiene código 409
    And el mensaje de error contiene "ya está cancelada"
