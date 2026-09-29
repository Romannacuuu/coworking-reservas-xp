Feature: Inicio de sesión
  Como usuario registrado
  Quiero iniciar sesión con email y contraseña
  Para acceder a mis reservas

  Scenario: Inicio de sesión exitoso
    Given que el usuario "Juan" ya está registrado con email "juan@correo.com" y contraseña "secreto123"
    When "Juan" inicia sesión con email "juan@correo.com" y contraseña "secreto123"
    Then la respuesta tiene código 200
    And la respuesta incluye un token de acceso
    When "Juan" consulta sus reservas
    Then la respuesta tiene código 200

  Scenario: Contraseña incorrecta
    Given que el usuario "Juan" ya está registrado con email "juan@correo.com" y contraseña "secreto123"
    When "Juan" inicia sesión con email "juan@correo.com" y contraseña "incorrecta1"
    Then la respuesta tiene código 401
    And el mensaje de error contiene "credenciales inválidas"

  Scenario: Email que no existe
    When "Fantasma" inicia sesión con email "noexiste@correo.com" y contraseña "secreto123"
    Then la respuesta tiene código 401
    And el mensaje de error contiene "credenciales inválidas"
