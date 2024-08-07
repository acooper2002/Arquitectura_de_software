# Documentacion

## Integrantes del equipo
* Nicolás Edelman (251363)
* Mateo Goldwasser (239420)
* Andrew Cooper (253469)

## Identificación de los principales atrubutos de calidad
#### Performance:
Se espera un tiempo de respuesta rápido para todo lo relacionado con busqueda, reserva y pago de inmuebles. En el texto, se interpreta de la cita: "Se debe demostrar que el servicio tenga un rendimiento aceptable en temporada, previendo
1000 reservas por minuto y una latencia promedio de 500 milisegundos." 

En cuanto a los sensores, tambien tenemos restricciones, como dice en la letra: Tener en cuenta que esperan recibir 100 mediciones por segundo provenientes de sensores de diferentes tipos. El sistema no debe menguar el rendimiento, por ello y las consultas a realizarse
no deben demorar más de 2 segundos en arrojar datos en escenarios límite.

#### Modificabilidad: 
Creemos que la capacidad de modificar y adaptar las funcionalidades del sistema, como agregar nuevas caracteristicas o ajustar existentes, es esencial. Por ejemplo, si se decide agregar nuevas consultas o funcionalidades para los usuarios, el sistema debe ser lo suficientemente flexible para integrar estos cambios sin afectar negativamente a otras partes del sistema.
En el texto lo identificamos en la siguiente cita: "Finalmente, considere que se pueda agregar, quitar o intercambiar pasos con el menor impacto posible, y soportar el reintento de los pasos que no se cumplen si el proceso se interrumpe por cualquier motivo
(por ejemplo, fallas en la comunicación entre sistemas)."



## Solución documentada con ADRs
Implementamos ADRs basándonos en el template de Michael Nygard.
- [ADR-001: Pipes & Filters para manejo de sensores](/ADRs/ADR001.md)
- [ADR-002: Cache en Pipes & Filters para mejor performance](/ADRs/ADR002.md)
- [ADR-003: Comunicacion Generador-Servidor por cola de mensajes](/ADRs/ADR003.md)
- [ADR-004: CQRS en tabla de reservas](/ADRs/ADR004.md)
- [ADR-005: Componente de notificaciones](/ADRs/ADR005.md)
- [ADR-006: Uso de Redis para busqueda de Inmuebles](/ADRs/ADR006.md)
- [ADR-007: Rechazo del Uso de Redis para Búsqueda de Inmuebles](/ADRs/ADR007.md)
- [ADR-008: Uso de Redis en el generador de mediciones](/ADRs/ADR008.md)
- [ADR-009: Separación de notificadores en Instancias de node](/ADRs/ADR009.md)
- [ADR-010: ElasticSearch con Logs para notificadores de sensores](/ADRs/ADR010.md)
- [ADR-011: ElasticSearch con Logs para errores del sistema](/ADRs/ADR011.md)
- [ADR-012: Uso de índices en la base de datos](/ADRs/ADR012.md)
- [ADR-013: Uso de transacciones en la base de datos](/ADRs/ADR013.md)
- [ADR-014: Uso de Redis en consumidores de PubSub](/ADRs/ADR014.md)

## Para correr proyecto
1. npm i
2. docker-compose up -d
3. tsc (para transpilar a js)
4. pm2 start (esto corre el backend y el servidor de payment)
5. npm run db:seed (para seedear la db)
6. npm run securityConsumers, npm run manteinanceConsumers, npm run administrationConsumers, npm run othersConsumers, npm run paymentConsumers, npm run bookingConsumers (prender todos los consumers de los pub-sub)
7. npm run generateMeasurements
8. npm run serverMeasurements
