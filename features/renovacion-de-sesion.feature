Feature: Renovación y vencimiento de la sesión
  Como usuario registrado
  Quiero un access token breve y un refresh token para renovarlo
  Para seguir trabajando cuando el access token ya no sirve

  Scenario: El inicio de sesión devuelve un JWT y un refresh token
    Given que el usuario "Juan" ya está registrado con email "juan@correo.com" y contraseña "secreto123"
    When "Juan" inicia sesión con email "juan@correo.com" y contraseña "secreto123"
    Then la respuesta tiene código 200
    And la respuesta incluye un token de acceso
    And la respuesta incluye un refresh token
    And el token de acceso tiene formato JWT
    And el token de acceso declara el rol "USUARIO"
    When "Juan" consulta su perfil
    Then la respuesta tiene código 200
    And el perfil declara el rol "USUARIO"

  Scenario: El perfil no es accesible sin token
    When se solicita el perfil sin proporcionar un token
    Then la respuesta tiene código 401
    And el mensaje de error contiene "no autenticado"

  Scenario: Un token alterado se rechaza
    When se solicita el perfil con el token "token-falso"
    Then la respuesta tiene código 401
    And el mensaje de error contiene "token inválido"

  Scenario: Un JWT con algoritmo none se rechaza
    When se solicita el perfil con un JWT de algoritmo none
    Then la respuesta tiene código 401
    And el mensaje de error contiene "token inválido"

  Scenario: Un access token vencido se rechaza y el refresh emite otro vigente
    Given que los access tokens nacen vencidos
    And que el usuario "Juan" ya está registrado con email "juan@correo.com" y contraseña "secreto123"
    When "Juan" inicia sesión con email "juan@correo.com" y contraseña "secreto123"
    Then la respuesta tiene código 200
    When "Juan" consulta su perfil
    Then la respuesta tiene código 401
    And el mensaje de error contiene "expirado"
    When se restablece la vigencia normal del access token
    And "Juan" renueva la sesión con su refresh token
    Then la respuesta tiene código 200
    And la respuesta incluye un token de acceso
    When "Juan" consulta su perfil
    Then la respuesta tiene código 200

  Scenario: Renovar invalida el refresh token anterior
    Given que el usuario "Juan" ya está registrado con email "juan@correo.com" y contraseña "secreto123"
    And que "Juan" tiene una sesión activa
    When "Juan" renueva la sesión con su refresh token
    Then la respuesta tiene código 200
    When "Juan" intenta renovar con el refresh token anterior
    Then la respuesta tiene código 401
    And el mensaje de error contiene "token inválido"

  Scenario: El access token no renueva la sesión
    Given que el usuario "Juan" ya está registrado con email "juan@correo.com" y contraseña "secreto123"
    And que "Juan" tiene una sesión activa
    When "Juan" intenta renovar usando el access token
    Then la respuesta tiene código 401
    And el mensaje de error contiene "token inválido"

  Scenario: El refresh token no autoriza una ruta protegida
    Given que el usuario "Juan" ya está registrado con email "juan@correo.com" y contraseña "secreto123"
    And que "Juan" tiene una sesión activa
    When "Juan" consulta su perfil usando el refresh token
    Then la respuesta tiene código 401
    And el mensaje de error contiene "token inválido"

  Scenario: Un refresh token falso se rechaza
    When se renueva la sesión con el token "refresh-falso"
    Then la respuesta tiene código 401
    And el mensaje de error contiene "token inválido"
