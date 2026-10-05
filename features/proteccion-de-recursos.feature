Feature: Protección del recurso frente a un usuario que no es dueño
  Como usuario autenticado
  Quiero que solo el dueño o un administrador modifique mi reserva
  Para que otra persona no altere mi reserva cambiando el identificador

  Background:
    Given que el usuario "Juan" ya está registrado con email "juan@correo.com" y contraseña "secreto123"
    And que "Juan" tiene una sesión activa
    And que existe el espacio "Sala A" de tipo "sala" con capacidad 6 y precio 100
    And que "Juan" ya reservó el espacio "Sala A" para el "2026-10-15"

  Scenario: El dueño anota su reserva
    When "Juan" anota "Llego a las 9" en la reserva de "Juan" del espacio "Sala A" del "2026-10-15"
    Then la respuesta tiene código 200
    And la nota de la reserva es "Llego a las 9"

  Scenario: Otra persona no puede anotar la reserva
    Given que el usuario "Ana" ya está registrado con email "ana@correo.com" y contraseña "secreto123"
    And que "Ana" tiene una sesión activa
    When "Ana" anota "hack" en la reserva de "Juan" del espacio "Sala A" del "2026-10-15"
    Then la respuesta tiene código 403
    And el mensaje de error contiene "este recurso"
    When "Juan" consulta sus reservas
    Then la respuesta tiene código 200
    And ninguna reserva de la lista tiene la nota "hack"

  Scenario: Un administrador puede anotar la reserva de otra persona
    Given que el administrador "Franco" ya está registrado con email "franco@correo.com" y contraseña "secreto123"
    And que "Franco" tiene una sesión activa
    When "Franco" anota "Revisada" en la reserva de "Juan" del espacio "Sala A" del "2026-10-15"
    Then la respuesta tiene código 200
    And la nota de la reserva es "Revisada"

  Scenario: Anotar una reserva que no existe responde 404
    When "Juan" anota "Nada" en una reserva inexistente
    Then la respuesta tiene código 404
    And el mensaje de error contiene "no encontrada"

  Scenario: Un usuario no puede ver las reservas de otro
    Given que el usuario "Ana" ya está registrado con email "ana@correo.com" y contraseña "secreto123"
    And que "Ana" tiene una sesión activa
    When "Ana" consulta las reservas de "Juan"
    Then la respuesta tiene código 403
    And el mensaje de error contiene "este recurso"

  Scenario: El dueño puede ver sus reservas por su identificador
    When "Juan" consulta las reservas de "Juan"
    Then la respuesta tiene código 200
    And la lista contiene 1 reservas
    And la lista incluye el espacio "Sala A"

  Scenario: Un administrador puede ver las reservas de cualquier usuario
    Given que el administrador "Franco" ya está registrado con email "franco@correo.com" y contraseña "secreto123"
    And que "Franco" tiene una sesión activa
    When "Franco" consulta las reservas de "Juan"
    Then la respuesta tiene código 200
    And la lista incluye el espacio "Sala A"

  Scenario: Una nota demasiado larga se rechaza
    When "Juan" anota una nota demasiado larga en su reserva del espacio "Sala A" del "2026-10-15"
    Then la respuesta tiene código 400
    And el mensaje de error contiene "demasiado larga"
