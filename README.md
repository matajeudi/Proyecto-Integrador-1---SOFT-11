# Proyecto Integrador 1 - SOFT-11 (UCenfotec)
> - Desarrollador: `Jeudi Mata`
> - Curso lectivo: `C3 2025`

##  Nombre del proyecto: `Sistema de Gestion Humana - Rikimaka`

Propuesta:
> La organización Rikimaka requiere implementar un sistema integral de gestión humana para
optimizar la administración de proyectos, la solicitud de permisos y el reporte de labores
diarias, fortaleciendo la trazabilidad del trabajo y la planificación estratégica del personal,
para los siguientes usuarios:
> - Administrador de talento humano
> - Trabajador/Colaborador
> - Personal de TI

## Generalidades de edicion del proyecto

### 1. Convenciones de nomenclatura y formato de codigo
Reglas que se deben seguir para nombras archivos, variables, funciones, etc., y como se debe formatear el codigo para asegurar consistencia y coherencia.

1. Ejemplo de nomenclatura de archivos:
    - Archivos JavaScript: `adminDashboard.js`, `userPage`, `projectService`
    - Archivos HTML: `admin-dashboard.html`, `daily-report.html`, `contact-us.html`, `index.html`, `home-page.html`
    - Archivos CSS: `styleSheet.css`, `customCSS.css`, `dashboardCSS.css`

2. Ejemplos de nomenclatura de codigo:
    - Variables: `let totalProjectHours = 0;` / `let userName = "";`
    - Constantes: `const MAX_VACATION_DAYS = 13;` / `const MAX_ATTEMPT = 4;`
    - Funciones: `function calculateHoursWorked() {}` / `function approveVacationRequest() {}`

3. Formatos generales:
    - Separación de elementos de codigo por su tipo, es decir: mantener un espaciado de 1 linea entre contenedores padres o entre secciones, ejemplo: 
    ![imagen que muestra la separacion mencionada](projectImages\readME_codeExample1.PNG)

> Para asegurar consistencia, facilidad y generalidad; el nombramiento de archivos o codigo sera en Ingles siempre, a excepcion de los elementos visibles en la pagina para el usuario o etiquetas de accesibilidad, esto será en Español.


### 2. Estrategia de branches y commits

Los branches se crearan apartir del main, y cada branch correspondera a una funcion mayor especifica y estas pueden tener sub branches segun sea requerido. Ademas, los mensajes de commit siguen la convencion siguiente (ejemplo no establecido, estructura se actualizara despues, lo a continuacion es una posible estructura):

```
main              # Producción (código estable)
  └── develop     # Integración de desarrollo
       ├── feature/*   # Nuevas funcionalidades
       ├── fix/*       # Corrección de bugs
       └── hotfix/*    # Correcciones urgentes
```
Contexto: 
- **main**: Código en producción, siempre estable
- **develop**: Rama principal de desarrollo donde se integra todo
- **New/nombre-funcionalidad**: Para desarrollar nuevas características
- **fix/nombre-bug**: Para corregir errores
- **hotfix/nombre-urgente**: Para correcciones críticas directas a main

### 3. Tipos de commit

Los commits deben seguir un formato estandarizado para mantener un historial de actualizacioes ordenado y claramente clasificado.

Tipos de commit principales:

| Tipo | Descripción | Ejemplo |
|------|-------------|---------|
| `New` | Nueva funcionalidad | `New(auth): implementar login de usuarios` |
| `Update` | Actualizacion de codigo (logica) sin completar | `Update(auth): progreso en la funcionalidad de login de usuarios` |
| `Fix` | Corrección de errores | `Fix(reportes): corregir cálculo de horas` |
| `Docs` | Documentación | `Docs(readme): actualizar guía de instalación` |
| `Style` | Formato (sin cambios de lógica) | `Style: aplicar Prettier a todo el código` |


-- -
