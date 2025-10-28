# Requerimientos Funcionales - Sistema de Gestión Humana Rikimaka

## RF-01: Autenticación de Usuarios
**Prioridad:** Alta  
**Rol:** Todos los roles   
**Descripción:** El sistema debe permitir que los usuarios inicien sesión con credenciales únicas.

### Criterios:
- El sistema debe validar correo electrónico y contraseña contra la base de datos
- El sistema debe diferenciar entre 3 roles: Administrador de Talento Humano, Trabajador/Colaborador y Personal de TI
- El sistema debe mostrar un mensaje de error si las credenciales son incorrectas
- El sistema debe generar un token de sesión valido por 8 horas despues de un login exitoso
- El sistema debe redirigir al usuario a su dashboard correspondiente según su rol

**Verificación de implementación:** 
- Prueba con credenciales válidas de cada rol → Acceso exitoso
- Prueba con credenciales inválidas → Mensaje de error mostrado
- Verificar token JWT generado con expiración de 8 horas

---

## RF-002: Gestión de Días Feriados
**Prioridad:** Alta  
**Rol:** Admin TH   
**Descripción:** El administrador de talento humano debe poder definir y gestionar los días feriados del año.

### Criterios:
- El admin debe poder crear un día feriado especificando: fecha, nombre, y descripción
- El sistema debe permitir editar días feriados existentes
- El sistema debe permitir eliminar días feriados
- El sistema debe listar todos los días feriados ordenados por fecha
- El sistema debe validar que no se dupliquen fechas de días feriados
- Los días feriados deben visualizarse en el calendario de solicitud de vacaciones

**Verificación:**
- Crear día feriado "1 de mayo - Día del Trabajador" → Se guarda en la base de datos
- Intentar crear otro feriado con fecha 1 de mayo → Sistema rechaza duplicado
- Eliminar día feriado → Se elimina de BD y calendario

---

## RF-003: Definición de Períodos de Vacaciones
**Prioridad:** Alta  
**Rol:** Admin TH   
**Descripción:** El administrador debe poder establecer los períodos en que los trabajadores pueden solicitar vacaciones.

### Criterios:
- El admin debe poder crear períodos especificando: fecha inicio, fecha fin, descripción
- El sistema debe validar que la fecha fin sea posterior a la fecha inicio
- El sistema debe permitir crear múltiples períodos de vacaciones
- El sistema debe permitir editar y eliminar períodos
- Solo se pueden solicitar vacaciones dentro de períodos definidos

**Verificación implementación:**
- Crear período "Verano 2025: 01/06/2025 - 31/08/2025" → Se guarda correctamente
- Intentar crear período con fecha fin anterior a inicio → Sistema muestra error
- Trabajador intenta solicitar vacaciones fuera del período → Sistema rechaza

---

## RF-004: Solicitud de Vacaciones
**Prioridad:** Alta  
**Rol:** Trabajador/Colaborador   
**Descripción:** Los trabajadores deben poder solicitar períodos de vacaciones visualizando el calendario con días feriados.

### Criterios:
- El trabajador debe seleccionar fecha inicio y fecha fin de vacaciones
- El sistema debe mostrar un calendario visual con días feriados marcados
- El sistema debe calcular automáticamente los días hábiles solicitados (excluyendo fines de semana y feriados)
- El sistema debe validar que las fechas estén dentro de períodos permitidos
- El sistema debe permitir agregar una justificación/comentario opcional
- El estado inicial de la solicitud debe ser "Pendiente"
- El trabajador debe poder ver el historial de sus solicitudes con sus estados

**Verificación de implementación:**
- Solicitar vacaciones del 10 al 14 de junio (5 días hábiles) → Sistema calcula correctamente
- Solicitar vacaciones incluyendo un feriado → Feriado no cuenta en días solicitados
- Solicitar fuera de período permitido → Sistema rechaza con mensaje claro
- Verificar que aparece en lista con estado "Pendiente"

---

## RF-005: Aprobación de Solicitudes de Vacaciones
**Prioridad:** Alta  
**Rol:** Admin TH   
**Descripción:** El administrador debe poder revisar, aprobar o rechazar solicitudes de vacaciones.

### Criterios:
- El admin debe ver lista de todas las solicitudes con filtros por estado (Pendiente/Aprobada/Rechazada)
- El admin debe poder ver detalles completos de cada solicitud: trabajador, fechas, días, justificación
- El admin debe poder aprobar una solicitud, cambiando su estado a "Aprobada"
- El admin debe poder rechazar una solicitud, cambiando su estado a "Rechazada"
- Al rechazar, el admin debe ingresar un motivo obligatorio
- El sistema debe notificar al trabajador del cambio de estado (visualmente en el sistema)
- No se pueden modificar solicitudes ya rechazadas, solo aprobadas.

**Verificación de implementación:**
- Aprobar solicitud pendiente → Estado cambia a "Aprobada" y trabajador la ve actualizada
- Rechazar solicitud sin motivo → Sistema exige ingresar motivo
- Rechazar con motivo "Período no disponible" → Se guarda motivo y trabajador lo puede leer
- Intentar modificar solicitud rechazada → Sistema lo impide
- Intentar modificar solicitud aprobada → Sistema lo permite

---

## RF-006: Creación de Catálogo de Proyectos
**Prioridad:** Alta  
**Rol:** Personal TI   
**Descripción:** El personal de TI debe poder crear y mantener un catálogo de proyectos con sus metadatos.

### Criterios:
- El usuario TI debe poder crear un proyecto especificando: nombre, descripción, fecha inicio, fecha fin estimada
- El sistema debe permitir agregar metadatos: presupuesto asignado (monto segun la moneda utilizada), recursos asignados (número de personas estimadas)
- El sistema debe generar un código único para cada proyecto (formato: PROJ-YYYY-####)
- El usuario TI debe poder editar información de proyectos existentes
- El usuario TI debe poder desactivar proyectos (sin eliminarlos)
- El sistema debe listar todos los proyectos con filtros: activo/inactivo, por fecha

**Verificación de implementación:**
- Crear proyecto "Migración Sistema ERP" con presupuesto $50,000 → Se genera código PROJ-2025-0001
- Editar presupuesto a $55,000 → Se actualiza correctamente
- Desactivar proyecto → No aparece en listado de proyectos activos pero existe en la based de datos
- Verificar código unico no se duplica

---

## RF-007: Asignación de Trabajadores a Proyectos
**Prioridad:** Alta  
**Rol:** Personal TI   
**Descripción:** El personal de TI debe poder asignar y gestionar la asociación de trabajadores a proyectos.

### Criterios:
- El usuario TI debe poder asignar uno o multiples trabajadores a un proyecto
- El sistema debe mostrar lista de trabajadores disponibles con su información básica
- El sistema debe permitir definir fecha inicio de asignación
- El sistema debe permitir definir fecha fin de asignación (puede ser null si continua)
- El usuario TI debe poder remover trabajadores de proyectos
- El sistema debe mostrar el listado de trabajadores asignados por proyecto
- Un trabajador puede estar asignado a múltiples proyectos simultáneamente

**Verificación de implementación:**
- Asignar trabajador "Juan Pérez" a proyecto PROJ-2025-0001 → Aparece en lista de asignaciones
- Asignar mismo trabajador a PROJ-2025-0002 → Se permite y ambas asignaciones son visibles
- Remover trabajador de proyecto → Asignación se elimina pero mantiene historial
- Verificar que solo aparecen proyectos activos para asignar

---

## RF-008: Registro de Reporte Diario
**Prioridad:** Alta  
**Rol:** Trabajador/Colaborador   
**Descripción:** Los trabajadores deben poder registrar su reporte diario de actividades detallando proyectos, tareas y horas.

### Criterios:
- El trabajador debe seleccionar la fecha del reporte (máximo fecha actual, no fechas futuras)
- El trabajador debe poder agregar múltiples actividades en un mismo reporte diario
- Por cada actividad debe especificar:
  - Proyecto (seleccionado de lista de proyectos asignados)
  - Descripción de la actividad (mínimo 20 caracteres)
  - Horas dedicadas (número decimal entre 0.5 y 12 horas)
  - Estado de la tarea (opciones: No iniciada, En Progreso, Completada, Bloqueada)
- El sistema debe validar que la suma total de horas del día no exceda 12 horas
- El trabajador debe poder editar reportes del mismo día
- No se pueden editar reportes de días anteriores
- El sistema debe mostrar historial de reportes diarios del trabajador

**Verificación de implementación:**
- Registrar actividad "Desarrollo de API de usuarios" en PROJ-2025-0001, 4 horas, Completada → Se guarda
- Agregar segunda actividad al mismo día con 3 horas → Total 7 horas, se permite
- Intentar agregar actividad con 6 horas más (total 13) → Sistema rechaza por exceder límite
- Intentar registrar reporte con fecha de mañana → Sistema rechaza
- Intentar editar reporte de hace 2 días → Sistema impide modificación

---

## RF-009: Visualización de Estadísticas de Proyectos
**Prioridad:** Media  
**Rol:** Admin TH   
**Descripción:** El administrador debe poder visualizar estadísticas consolidadas sobre horas dedicadas a proyectos.

### Criterios:
- El admin debe poder filtrar estadísticas por rango de fechas
- El sistema debe mostrar por cada proyecto:
  - Total de horas registradas
  - Desglose de horas por trabajador
  - Comparación contra presupuesto de horas estimado (si aplica)
  - Porcentaje de avance basado en horas
- El sistema debe mostrar gráfico visual de distribución de horas por proyecto
- El sistema debe permitir exportar datos a formato CSV

**Verificación de implementación:**
- Seleccionar proyecto PROJ-2025-0001 con rango de enero 2025 → Muestra 160 horas totales
- Verificar desglose: Juan 80h, María 50h, Pedro 30h → Suma correcta
- Exportar a CSV → Archivo descarga con datos correctos en formato tabular

---

## RF-010: Reporte de Distribución de Carga de Trabajo
**Prioridad:** Media  
**Rol:** Admin TH   
**Descripción:** El administrador debe poder visualizar la distribución de carga de trabajo entre trabajadores.

### Criterios:
- El sistema debe mostrar lista de trabajadores con sus horas totales registradas
- El admin debe poder filtrar por rango de fechas
- El sistema debe mostrar promedio de horas diarias por trabajador
- El sistema debe mostrar número de proyectos activos por trabajador
- El sistema debe resaltar trabajadores con carga superior al 90% de capacidad (>9h promedio diario)
- El sistema debe mostrar gráfico de barras comparativo

**Verificación de implementación:**
- Ver reporte de marzo 2025 → Juan: 180h (9h/día prom), María: 160h (8h/día prom)
- Verificar que Juan aparece resaltado por carga >90%
- Verificar conteo de proyectos: Juan: 3 proyectos, María: 2 proyectos

---

## RF-011: Cierre de Sesión
**Prioridad:** Media  
**Rol:** Todos los roles   
**Descripción:** Todos los usuarios deben poder cerrar sesión de forma segura.

### Criterios:
- El sistema debe tener botón de "Cerrar Sesión" visible en todas las páginas
- Al cerrar sesión, el sistema debe invalidar el token de autenticación
- El sistema debe redirigir al usuario a la página de login
- El sistema debe prevenir acceso a páginas protegidas después del logout

**Verificación de implementación:**
- Click en "Cerrar Sesión" → Redirige a login
- Intentar acceder a dashboard con URL directa → Sistema redirige a login
- Verificar que token JWT es invalidado

---

## RF-012: Recuperación de Contraseña
**Prioridad:** Baja  
**Rol:** Todos los roles   
**Descripción:** Los usuarios deben poder recuperar su contraseña si la olvidan.

### Criterios:
- El sistema debe tener enlace "¿Olvidaste tu contraseña?" en página de login
- El usuario debe ingresar su correo electrónico registrado
- El sistema debe validar que el correo esta registrado
- El sistema debe generar un token de recuperación único válido por 1 hora
- El sistema debe enviar correo con enlace de recuperación
- El usuario debe poder establecer nueva contraseña usando el enlace
- El token debe invalidarse después de usarse o después de 1 hora

**Verificación de implementación:**
- Ingresar email registrado → Sistema valida en la base de datos que email esta registrado → Correo enviado con enlace
- Ingresar email no registrado → Sistema valida en la base de datos que email no esta registrado → Informa por alerta visual que el correo no está asociado a ninguna cuenta.
- Click en enlace dentro de 1 hora → Permite cambiar contraseña
- Intentar usar mismo enlace nuevamente → Sistema rechaza token usado
- Esperar 1 hora → Token expira y no permite cambio