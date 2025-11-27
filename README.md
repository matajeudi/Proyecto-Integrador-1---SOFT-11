# Proyecto Integrador 1 - SOFT-11 (UCenfotec)
> - Desarrollador: `Jeudi Mata`
> - Curso lectivo: `C3 2025`

##  Nombre del proyecto: `Sistema de Gestion Humana - Rikimaka`

### Descripcion del Proyecto

Sistema web integral de gestión humana que optimiza la administración de proyectos, solicitudes de vacaciones y reportes diarios de actividades. Permite a las organizaciones gestionar eficientemente su talento humano con trazabilidad completa del trabajo y planificación estratégica del personal.

**Usuarios del sistema:**
- **Administrador de Talento Humano:** Gestiona feriados, períodos de vacaciones, aprueba solicitudes y visualiza estadísticas
- **Trabajador/Colaborador:** Solicita vacaciones, registra reportes diarios de actividades y visualiza proyectos asignados
- **Personal de TI:** Crea catálogo de proyectos, asigna trabajadores y gestiona recursos

---

## Requisitos Previos

Antes de instalar el proyecto, asegúrese de tener instalado:

- **Node.js** v18.0.0 o superior ([Descargar](https://nodejs.org/))
- **npm** v9.0.0 o superior (incluido con Node.js)
- **MongoDB Atlas** cuenta activa ([Crear cuenta](https://www.mongodb.com/cloud/atlas))
- **GitKraken** para clonar el repositorio ([Descargar](https://www.gitkraken.com/))
- Navegador web moderno (Chrome, Firefox, Edge o Safari)

---

## Instalacion

### 1. Clonar el repositorio

```bash
git clone https://github.com/jeudimata/ProyectoIntegrador1_SOFT-11.git
cd ProyectoIntegrador1_SOFT-11
```

### 2. Instalar dependencias del backend

```bash
cd backend
npm install
```

**Dependencias instaladas:**
- `express` v4.18.2 - Framework web para Node.js
- `mongoose` v7.5.0 - ODM para MongoDB
- `cors` v2.8.5 - Middleware para habilitar CORS
- `dotenv` v16.3.1 - Carga variables de entorno
- `body-parser` v1.20.2 - Parser de body HTTP
- `multer` v1.4.5-lts.1 - Manejo de multipart/form-data
- `bcryptjs` v2.4.3 - Encriptacion de contraseñas
- `jsonwebtoken` v9.0.2 - Generacion y verificacion de tokens JWT

### 3. Configurar variables de entorno

Crear archivo `.env` en la carpeta `backend/` con el siguiente contenido:

```env
# Puerto del servidor
PORT=3000

# MongoDB Atlas Connection String
MONGODB_URI=mongodb+srv://<usuario>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority

# JWT Secret Key
JWT_SECRET=tu_clave_secreta_aqui

# JWT Expiration (8 horas)
JWT_EXPIRES_IN=8h
```

**Nota:** Reemplazar `<usuario>`, `<password>`, `<cluster>` y `<database>` con las credenciales de MongoDB Atlas.

---

## Ejecucion

### Iniciar el servidor backend

```bash
cd backend
node index.js
```

**Salida esperada:**
```
Servidor corriendo en http://localhost:3000
MongoDB Atlas conectado
```

### Abrir el frontend

1. Navegar a la carpeta `frontend/html/`
2. Abrir `index.html` en el navegador
3. Alternativamente, usar Live Server en VS Code

**URL de acceso:** `http://localhost:5500/frontend/html/index.html` (si usa Live Server)

---

## Estructura del Proyecto

```
ProyectoIntegrador1_SOFT-11/
├── backend/
│   ├── models/              # Modelos de Mongoose
│   │   ├── user.model.js
│   │   ├── project.model.js
│   │   ├── vacation.model.js
│   │   ├── vacationPeriod.model.js
│   │   ├── holiday.model.js
│   │   ├── dailyReport.model.js
│   │   └── auditLog.model.js
│   ├── routes/              # Rutas de la API
│   │   ├── auth-route.js
│   │   ├── user-route.js
│   │   ├── project-route.js
│   │   ├── vacation-route.js
│   │   ├── vacationPeriod-route.js
│   │   ├── holiday-route.js
│   │   ├── report-route.js
│   │   └── auditLog-route.js
│   ├── .env                 # Variables de entorno (no incluido en repo)
│   ├── index.js             # Punto de entrada del servidor
│   ├── package.json         # Dependencias del backend
│   └── package-lock.json
├── frontend/
│   ├── html/                # Paginas HTML
│   │   ├── index.html
│   │   ├── admin-dashboard.html
│   │   ├── worker-dashboard.html
│   │   └── it-dashboard.html
│   ├── css/                 # Estilos
│   │   ├── stylesheet.css
│   │   └── calendarView.css
│   ├── js/                  # Scripts JavaScript
│   │   ├── mainPage.js
│   │   ├── adminDashboard.js
│   │   ├── workerDashboard.js
│   │   ├── itDashboard.js
│   │   └── calendarView.js
│   └── assets/              # Recursos estaticos
│       ├── images/
│       └── icons/
├── Requirements/            # Documentacion de requerimientos
│   ├── functional-requirements.md
│   └── non-functional-requirements.md
├── projectImages/           # Imagenes del proyecto
├── .gitignore
└── README.md
```

---

## Tecnologias Utilizadas

### Backend
- **Node.js** - Entorno de ejecucion JavaScript
- **Express.js** - Framework web minimalista
- **MongoDB Atlas** - Base de datos NoSQL en la nube
- **Mongoose** - ODM para MongoDB
- **JWT** - Autenticacion basada en tokens
- **bcrypt** - Encriptacion de contraseñas

### Frontend
- **HTML5** - Estructura semantica
- **CSS3** - Estilos y diseño responsive
- **JavaScript** - Logica del cliente
- **Bootstrap 5.3** - Framework CSS
- **Bootstrap Icons** - Iconografia
- **SweetAlert2** - Alertas visuales
- **Chart.js** - Graficos y estadisticas

---

## Credenciales de Prueba

### Administrador de Talento Humano
```
Email: admin@rikimaka.com
Password: admin123
```

### Trabajador/Colaborador
```
Email: worker@rikimaka.com
Password: worker123
```

### Personal de TI
```
Email: it@rikimaka.com
Password: password123
```

---

## Convenciones de Desarrollo

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
