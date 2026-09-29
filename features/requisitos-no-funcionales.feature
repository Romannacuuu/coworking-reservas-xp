Feature: Requisitos no funcionales
  Como auditor de seguridad y como administrador del sistema
  Quiero contraseñas con bcrypt y respuestas rápidas
  Para proteger los datos y sostener una experiencia fluida

  Scenario: Las contraseñas se almacenan con bcrypt y sal
    When un visitante se registra con nombre "Juan", email "juan@correo.com" y contraseña "secreto123"
    Then la respuesta tiene código 201
    And la contraseña almacenada de "juan@correo.com" no es el texto "secreto123"
    And la contraseña almacenada de "juan@correo.com" es un hash bcrypt
    And la contraseña almacenada de "juan@correo.com" verifica el texto "secreto123"

  Scenario: Dos cuentas con la misma contraseña no comparten el hash
    When un visitante se registra con nombre "Ana", email "ana@correo.com" y contraseña "secreto123"
    And un visitante se registra con nombre "Luis", email "luis@correo.com" y contraseña "secreto123"
    Then la respuesta tiene código 201
    And los hashes de "ana@correo.com" y "luis@correo.com" son distintos

  Scenario: El endpoint de salud responde en menos de 200 ms
    When se consulta el estado de salud de la API
    Then la respuesta tiene código 200
    And el estado de salud es "ok"
    And el tiempo de respuesta es menor a 200 milisegundos

  Scenario: La consulta de disponibilidad responde en menos de 200 ms
    Given que el usuario "Juan" ya está registrado con email "juan@correo.com" y contraseña "secreto123"
    And que "Juan" tiene una sesión activa
    And que existe el espacio "Sala A" de tipo "sala" con capacidad 6 y precio 100
    When "Juan" consulta la disponibilidad para el "2026-10-15"
    Then la respuesta tiene código 200
    And el tiempo de respuesta es menor a 200 milisegundos
