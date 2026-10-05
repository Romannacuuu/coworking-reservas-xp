Feature: Autorización por rol
  Como administrador del coworking
  Quiero que publicar espacios exija el rol ADMIN
  Para que un usuario común no modifique el catálogo

  Scenario: Un usuario común no puede publicar un espacio
    Given que el usuario "Elena" ya está registrado con email "elena@correo.com" y contraseña "secreto123"
    And que "Elena" tiene una sesión activa
    When "Elena" publica el espacio "Sala Norte" de tipo "sala" con capacidad 6 y precio 90
    Then la respuesta tiene código 403
    And el mensaje de error contiene "permisos necesarios"

  Scenario: Sin token no se puede publicar un espacio
    When se intenta publicar un espacio sin token
    Then la respuesta tiene código 401
    And el mensaje de error contiene "no autenticado"

  Scenario: Un administrador publica un espacio
    Given que el administrador "Franco" ya está registrado con email "franco@correo.com" y contraseña "secreto123"
    When "Franco" inicia sesión con email "franco@correo.com" y contraseña "secreto123"
    Then la respuesta tiene código 200
    And el token de acceso declara el rol "ADMIN"
    When "Franco" publica el espacio "Sala Norte" de tipo "sala" con capacidad 6 y precio 90
    Then la respuesta tiene código 201
    And el espacio publicado se llama "Sala Norte"

  Scenario: No se puede publicar dos espacios con el mismo nombre
    Given que el administrador "Franco" ya está registrado con email "franco@correo.com" y contraseña "secreto123"
    And que "Franco" tiene una sesión activa
    When "Franco" publica el espacio "Sala Norte" de tipo "sala" con capacidad 6 y precio 90
    Then la respuesta tiene código 201
    When "Franco" publica el espacio "Sala Norte" de tipo "sala" con capacidad 4 y precio 70
    Then la respuesta tiene código 409
    And el mensaje de error contiene "ya existe"

  Scenario: El registro no permite elegir el rol
    When un visitante se registra con nombre "Intruso", email "intruso@correo.com" y contraseña "secreto123" y el rol "ADMIN"
    Then la respuesta tiene código 400
    And el mensaje de error contiene "rol"
    When "Intruso" inicia sesión con email "intruso@correo.com" y contraseña "secreto123"
    Then la respuesta tiene código 401
    And el mensaje de error contiene "credenciales inválidas"
