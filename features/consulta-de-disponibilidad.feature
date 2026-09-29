Feature: Consulta de disponibilidad
  Como usuario autenticado
  Quiero ver qué espacios están libres en una fecha
  Para elegir dónde trabajar

  Background:
    Given que el usuario "Juan" ya está registrado con email "juan@correo.com" y contraseña "secreto123"
    And que "Juan" tiene una sesión activa
    And que existe el espacio "Sala A" de tipo "sala" con capacidad 6 y precio 100
    And que existe el espacio "Sala B" de tipo "sala" con capacidad 4 y precio 80

  Scenario: Todos los espacios figuran disponibles si no hay reservas
    When "Juan" consulta la disponibilidad para el "2026-10-15"
    Then la respuesta tiene código 200
    And el espacio "Sala A" figura como "Disponible"
    And el espacio "Sala B" figura como "Disponible"

  Scenario: Un espacio reservado figura ocupado solo en esa fecha
    Given que "Juan" ya reservó el espacio "Sala A" para el "2026-10-15"
    When "Juan" consulta la disponibilidad para el "2026-10-15"
    Then la respuesta tiene código 200
    And el espacio "Sala A" figura como "Ocupada"
    And el espacio "Sala B" figura como "Disponible"
    When "Juan" consulta la disponibilidad para el "2026-10-16"
    Then el espacio "Sala A" figura como "Disponible"

  Scenario: Sin sesión no se puede consultar la disponibilidad
    When se consulta la disponibilidad para el "2026-10-15" sin token
    Then la respuesta tiene código 401
    And el mensaje de error contiene "no autenticado"

  Scenario: Un token alterado se rechaza
    When se consulta la disponibilidad para el "2026-10-15" con el token "token-falso"
    Then la respuesta tiene código 401
    And el mensaje de error contiene "token inválido"

  Scenario: La fecha es obligatoria
    When "Juan" consulta la disponibilidad sin fecha
    Then la respuesta tiene código 400
    And el mensaje de error contiene "fecha"

  Scenario: Una fecha mal escrita se rechaza
    When "Juan" consulta la disponibilidad para el "15-10-2026"
    Then la respuesta tiene código 400
    And el mensaje de error contiene "formato de fecha"
