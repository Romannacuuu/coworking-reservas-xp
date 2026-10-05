Feature: Endurecimiento del servidor
  Como operador de la API
  Quiero limitar el login, acotar el CORS y rechazar entradas maliciosas
  Para reducir fuerza bruta, orígenes ajenos e inyección

  Scenario: Tras varios intentos fallidos el login queda bloqueado
    Given que el usuario "Juan" ya está registrado con email "juan@correo.com" y contraseña "secreto123"
    When "Juan" supera el límite de inicios de sesión
    Then la respuesta tiene código 429
    And el mensaje de error contiene "demasiados intentos"
    When "Juan" inicia sesión con email "juan@correo.com" y contraseña "secreto123"
    Then la respuesta tiene código 429
    And el mensaje de error contiene "demasiados intentos"

  Scenario: Con el login bloqueado el refresh token sigue renovando la sesión
    Given que el usuario "Juan" ya está registrado con email "juan@correo.com" y contraseña "secreto123"
    And que "Juan" tiene una sesión activa
    When "Juan" supera el límite de inicios de sesión
    Then la respuesta tiene código 429
    When "Juan" renueva la sesión con su refresh token
    Then la respuesta tiene código 200
    And la respuesta incluye un token de acceso
    When "Juan" consulta su perfil
    Then la respuesta tiene código 200

  Scenario: Un origen de la lista permitida puede llamar a la API
    When se consulta la salud desde un origen permitido
    Then la respuesta tiene código 200
    And la respuesta refleja ese origen permitido

  Scenario: Un origen que no está en la lista es rechazado
    When se consulta la salud desde el origen "https://atacante.example"
    Then la respuesta tiene código 403
    And el mensaje de error contiene "origen no permitido"
    And la respuesta no autoriza cualquier origen

  Scenario: Un operador NoSQL en el registro es rechazado
    When un visitante envía un registro con un operador de inyección
    Then la respuesta tiene código 400
    And el mensaje de error contiene "entrada rechazada"

  Scenario: Un operador NoSQL en la consulta es rechazado
    When se consulta la disponibilidad con un operador en la fecha
    Then la respuesta tiene código 400
    And el mensaje de error contiene "entrada rechazada"

  Scenario: Una cadena típica de inyección SQL no inicia sesión
    Given que el usuario "Juan" ya está registrado con email "juan@correo.com" y contraseña "secreto123"
    When "Atacante" inicia sesión con email "juan@correo.com' OR '1'='1" y contraseña "secreto123"
    Then la respuesta tiene código 401
    And el mensaje de error contiene "credenciales inválidas"

  Scenario: Un byte nulo en el nombre es rechazado
    When un visitante se registra con un byte nulo en el nombre
    Then la respuesta tiene código 400
    And el mensaje de error contiene "entrada rechazada"

  Scenario: Un campo extra en el registro es rechazado
    When un visitante se registra con un campo extra no permitido
    Then la respuesta tiene código 400
    And el mensaje de error contiene "campo no permitido"

  Scenario: Publicar un espacio con capacidad no numérica es rechazado
    Given que el administrador "Franco" ya está registrado con email "franco@correo.com" y contraseña "secreto123"
    And que "Franco" tiene una sesión activa
    When "Franco" intenta publicar un espacio con capacidad "ocho"
    Then la respuesta tiene código 400
    And el mensaje de error contiene "entero"
