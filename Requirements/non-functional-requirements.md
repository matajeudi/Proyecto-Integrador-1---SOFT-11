# Requerimientos No Funcionales - Sistema de Gestión Humana Rikimaka

## RNF-001: Rendimiento - Tiempo de Respuesta
**Categoría:** Rendimiento  
**Prioridad:** Alta

### Descripción:
El sistema debe responder a las solicitudes de los usuarios en tiempos óptimos para garantizar una experiencia fluida.

### Métricas:
- Tiempo de carga inicial de página: **≤ 2 segundos** (90% de las veces)
- Tiempo de respuesta de operaciones CRUD: **≤ 500 milisegundos** (95% de las veces)
- Tiempo de generación de reportes con hasta 1000 registros: **≤ 3 segundos**
- Tiempo de búsqueda/filtrado: **≤ 1 segundo**

### Verificación:
- Usar herramientas como Google Lighthouse para medir tiempo de carga
- Implementar logging de tiempos de respuesta en backend
- Realizar pruebas de carga con herramientas como Apache JMeter
- Monitorear con métricas reales en producción

**Justificación:** Usuarios esperan respuestas rápidas. Tiempos mayores generan frustración y abandono del sistema.

---

## RNF-002: Rendimiento - Concurrencia
**Categoría:** Rendimiento  
**Prioridad:** Media

### Descripción:
El sistema debe soportar multiples usuarios simultaneos sin degradación significativa.

### Métricas:
- Soporte mínimo: **50 usuarios concurrentes** sin degradación >10% en tiempo de respuesta
- Tasa de error bajo carga: **< 1%** de peticiones fallidas
- Tiempo de respuesta bajo carga (50 usuarios): **≤ 1 segundo** para operaciones básicas

### Verificación:
- Realizar pruebas de carga con Apache JMeter simulando 50 usuarios concurrentes
- Medir tasa de errores HTTP (500, 503) durante pruebas
- Monitorear uso de CPU y memoria del servidor durante carga

**Justificación:** La organización Rikimaka puede tener múltiples empleados accediendo simultaneamente, especialmente al inicio y final de jornada laboral.

---

## RNF-003: Seguridad - Autenticación y Autorización
**Categoría:** Seguridad  
**Prioridad:** Alta

### Descripción:
El sistema debe garantizar que solo usuarios autorizados accedan a funcionalidades según su rol.

### Métricas:
- **100%** de endpoints protegidos requieren autenticación válida
- **100%** de operaciones verifican permisos de rol antes de ejecutar
- Tokens de sesión con expiración: **8 horas máximo**
- Contraseñas hasheadas con algoritmo: **bcrypt con factor 10**
- Intentos fallidos de login permitidos: **5 máximo** antes de bloqueo temporal de **15 minutos**

### Verificación:
- Pruebas de acceso no-autorizado intentando acceder a endpoints sin token → Debe retornar 401
- Intentar acceso con rol incorrecto → Debe retornar 403
- Verificar en base de datos que las contraseñas esten hasheadas (no texto plano)
- Simular 6 intentos fallidos de login → Cuenta bloqueada temporalmente

**Justificación:** Proteger información sensible de empleados, salarios, y datos empresariales. Vital para cumplir con regulaciones de protección de datos.

---

## RNF-004: Seguridad - Protección de Datos
**Categoría:** Seguridad  
**Prioridad:** Alta

### Descripción:
Los datos sensibles deben estar protegidos en tránsito y en reposo.

### Métricas:
- **100%** de comunicaciones mediante HTTPS/TLS 1.2 o superior
- **100%** de datos sensibles en BD encriptados (salarios, información personal)
- Backups automáticos de base de datos: **diarios** con retención de **30 días**
- Logs de auditoría: **100%** de operaciones críticas registradas (login, cambios de permisos, aprobaciones)

### Verificación:
- Revisar configuración de MongoDB Atlas con encriptación en reposo habilitada
- Verificar existencia de backups diarios en últimos 30 días
- Consultar tabla de logs y verificar registro de operaciones críticas

**Justificación:** Proteger privacidad de empleados y cumplir con leyes de protección de datos personales.

---

## RNF-005: Usabilidad - Interfaz Intuitiva
**Categoría:** Usabilidad  
**Prioridad:** Alta

### Descripción:
La interfaz debe ser fácil de usar para usuarios sin experiencia técnica avanzada.

### Métricas:
- Tiempo para completar tarea común (registrar reporte diario): **≤ 3 minutos** para usuario nuevo
- Tasa de error en formularios: **< 5%** (usuarios completan correctamente al primer intento)
- Navegación a cualquier funcionalidad principal: **≤ 3 clicks**

### Verificación:
- Realizar pruebas con usuarios reales cronometrando tiempo de tareas
- Observar y registrar errores durante pruebas de usabilidad
- Contar clicks necesarios para llegar a funcionalidades clave

**Justificación:** Usuarios son trabajadores de diversos perfiles, no necesariamente técnicos. Interfaz compleja reduce adopción y genera frustración.

---

## RNF-006: Usabilidad - Accesibilidad
**Categoría:** Usabilidad  
**Prioridad:** Media

### Descripción:
El sistema debe ser accesible para usuarios con diferentes capacidades.

### Métricas:
- Cumplimiento de WCAG 2.1 Nivel AA: **≥ 90%** de criterios
- Contraste de colores: ratio mínimo **4.5:1** para texto normal
- Navegación completa por teclado: **100%** de funcionalidades accesibles sin mouse
- Textos alternativos: **100%** de imágenes e iconos informativos con alt text
- Tamaño mínimo de fuente: **16px** para texto principal
- Elementos responsivos

### Verificación:
- Usar herramienta WAVE para auditoría automática de accesibilidad
- Verificar contraste con herramienta Color Contrast Analyzer
- Navegar sistema completo usando solo teclado (Tab, Enter, flechas) junto al narrator de windows
- Revisar código HTML verificando atributos alt en imágenes

**Justificación:** Inclusión de todos los empleados, independiente de capacidades visuales o motoras. Puede ser requisito legal en algunas jurisdicciones.

---

## RNF-007: Disponibilidad
**Categoría:** Confiabilidad  
**Prioridad:** Alta

### Descripción:
El sistema debe estar disponible para los usuarios durante horarios laborales.

### Métricas:
- Uptime (tiempo activo): **≥ 99%** mensual (permite ~7 horas de downtime al mes)
- Uptime durante horario laboral (8am-6pm): **≥ 99.5%**
- Tiempo máximo de downtime no planificado: **≤ 2 horas continuas**
- Tiempo de recuperación ante falla (RTO): **≤ 1 hora**

### Verificación:
- Monitoreo con servicios como UptimeRobot o Pingdom
- Revisar logs de disponibilidad mensualmente
- Simular caída de servidor y medir tiempo de recuperación

**Justificación:** Empleados necesitan registrar reportes diarios y solicitar vacaciones. Indisponibilidad afecta productividad y cumplimiento de procesos.

---

## RNF-008: Escalabilidad
**Categoría:** Escalabilidad  
**Prioridad:** Media

### Descripción:
El sistema debe poder crecer sin requerir rediseño completo de arquitectura.

### Métricas:
- Capacidad de escalar a: **500 usuarios** sin cambios arquitectónicos mayores
- Capacidad de almacenar: **50,000 reportes diarios** sin degradación >15% en consultas
- Tiempo de respuesta con base de datos 10x más grande: **≤ 800ms** (degradación máxima 60%)

### Verificación:
- Poblar base de datos de prueba con 50,000 registros y medir tiempos de consulta
- Realizar pruebas de carga progresiva (50, 100, 200, 500 usuarios)
- Revisar arquitectura y validar que puede escalar horizontalmente

**Justificación:** Rikimaka puede crecer y contratar más empleados. Sistema debe soportar crecimiento sin reconstrucción costosa.

---

## RNF-009: Mantenibilidad - Código Limpio
**Categoría:** Mantenibilidad  
**Prioridad:** Media

### Descripción:
El código debe ser fácil de entender, modificar y mantener por cualquier desarrollador.

### Métricas:
- Cobertura de comentarios en funciones complejas.
- Documentación de API: **100%** de endpoints documentados
- Adherencia a convenciones de código: **≥ 95%** (medido con linter)

### Verificación:
- Revisar documentación de API (puede ser con Swagger/OpenAPI)
- Code reviews verificando adherencia a guías de estilo

**Justificación:** Facilita onboarding de nuevos desarrolladores, reduce bugs, y acelera implementación de nuevas funcionalidades.

---

## RNF-010: Portabilidad - Compatibilidad de Navegadores
**Categoría:** Portabilidad  
**Prioridad:** Alta

### Descripción:
El sistema debe funcionar correctamente en navegadores web modernos.

### Métricas:
- Soporte de navegadores:
  - Chrome
  - Firefox:
  - Safari
  - Edge
- Compatibilidad funcional: **100%** de funcionalidades operativas en navegadores soportados
- Compatibilidad visual: **≥ 95%** de elementos visuales correctos en todos los navegadores

### Verificación:
- Realizar pruebas manuales en cada navegador soportado
- Usar herramientas como BrowserStack para testing de multiplataforma
- Validar con Can I Use que funcionalidades JavaScript/CSS son compatibles
- Mantener checklist de funcionalidades probadas por navegador

**Justificación:** Usuarios pueden tener preferencias diferentes de navegador. Garantizar acceso universal desde diferentes dispositivos.

---

## RNF-011: Portabilidad - Responsive Design
**Categoría:** Portabilidad  
**Prioridad:** Alta

### Descripción:
El sistema debe ser utilizable en diferentes tamaños de pantalla, con pensamiento de desarrollar a partir de pantallas tipo mobiles a pantallas grandes tipo Desktop.

### Métricas:
- Soporte de resoluciones:
  - Desktop: **≥ 1366x768px** (100% funcional)
  - Tablet: **≥ 768x1024px** (≥ 100% funcional)
  - Mobile: **≥ 375x667px** (≥ 100% funcional)
- Tiempo de carga en mobile con 3G: **≤ 5 segundos**

### Verificación:
- Probar sistema en dispositivos reales o emuladores
- Usar DevTools de Chrome para simular diferentes resoluciones
- Validar con Google Mobile-Friendly Test
- Probar con throttling de red simulando 3G

**Justificación:** Trabajadores pueden necesitar consultar información o registrar reportes desde dispositivos móviles fuera de oficina.

---

## RNF-012: Recuperabilidad
**Categoría:** Confiabilidad  
**Prioridad:** Alta

### Descripción:
El sistema debe poder recuperarse de fallos sin pérdida significativa de datos.

### Métricas:
- RPO (Recovery Point Objective): **≤ 24 horas** (pérdida máxima de datos)
- RTO (Recovery Time Objective): **≤ 4 horas** (tiempo máximo de recuperación)
- Frecuencia de backups: **diaria** (automática a las 2am o durante el periodo de menor trafico de usuarios)
- Pruebas de restauración: **mensual** (verificar integridad de backups)
- Tiempo de restauración de backup: **≤ 2 horas**

### Verificación:
- Verificar existencia de backups diarios en MongoDB Atlas
- Cronometrar tiempo de restauración de backup de prueba
- Documentar procedimiento de recuperación y verificar que funciona

**Justificación:** Proteger información crítica de la organización. Reportes diarios y registros de vacaciones son información valiosa que no puede perderse.