Feature: Registro de usuario
  Como visitante
  Quiero registrarme con nombre, email y contraseña
  Para poder acceder al sistema de reservas

  Scenario: Registro exitoso de un visitante nuevo
    When un visitante se registra con nombre "Juan", email "juan@correo.com" y contraseña "secreto123"
    Then la respuesta tiene código 201
    And la respuesta incluye el email "juan@correo.com"
    And la contraseña no aparece en la respuesta
    And el usuario creado tiene saldo 300

  Scenario: Registro rechazado por email duplicado
    Given que el usuario "Juan" ya está registrado con email "juan@correo.com" y contraseña "secreto123"
    When un visitante se registra con nombre "Otro", email "juan@correo.com" y contraseña "otraclave1"
    Then la respuesta tiene código 409
    And el mensaje de error contiene "email ya registrado"

  Scenario: El email no distingue mayúsculas
    Given que el usuario "Juan" ya está registrado con email "juan@correo.com" y contraseña "secreto123"
    When un visitante se registra con nombre "Juan Dos", email "Juan@Correo.com" y contraseña "secreto123"
    Then la respuesta tiene código 409
    And el mensaje de error contiene "email ya registrado"

  Scenario: Registro rechazado por contraseña corta
    When un visitante se registra con nombre "Ana", email "ana@correo.com" y contraseña "corta"
    Then la respuesta tiene código 400
    And el mensaje de error contiene "contraseña"

  Scenario: Registro rechazado por email mal formado
    When un visitante se registra con nombre "Ana", email "ana-sin-arroba" y contraseña "secreto123"
    Then la respuesta tiene código 400
    And el mensaje de error contiene "email"

  Scenario: Registro rechazado por nombre vacío
    When un visitante se registra con nombre " ", email "ana@correo.com" y contraseña "secreto123"
    Then la respuesta tiene código 400
    And el mensaje de error contiene "nombre"
