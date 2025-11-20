// Script para el panel de trabajador
const API_BASE_URL = 'http://localhost:3000/api';
let currentUserId = '507f1f77bcf86cd799439012';
let activityCount = 1;

document.addEventListener('DOMContentLoaded', function() {
    checkAuthAndRole('worker');
    initializeDashboard();
    setupEventListeners();
    loadProjects();
    initThemeToggle();
});

function initThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = document.getElementById('themeIcon');
    const savedTheme = localStorage.getItem('theme') || 'light';
    
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme, themeIcon);
    
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateThemeIcon(newTheme, themeIcon);
        });
    }
}

function updateThemeIcon(theme, icon) {
    if (icon) {
        if (theme === 'dark') {
            icon.classList.remove('bi-moon-stars-fill');
            icon.classList.add('bi-sun-fill');
        } else {
            icon.classList.remove('bi-sun-fill');
            icon.classList.add('bi-moon-stars-fill');
        }
    }
}

function checkAuthAndRole(requiredRole) {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
        console.error('401 Unauthorized: No hay sesion activa');
        showUnauthorizedError();
        setTimeout(() => window.location.href = 'index.html', 2000);
        return;
    }
    const user = JSON.parse(currentUser);
    if (user.role !== requiredRole) {
        console.error(`403 Forbidden: Usuario con rol '${user.role}' intento acceder a dashboard '${requiredRole}'`);
        showForbiddenError();
        setTimeout(() => window.location.href = 'index.html', 2000);
        return;
    }
    document.getElementById('userName').textContent = user.name;
}

function showUnauthorizedError() {
    document.body.innerHTML = `
        <div class="container mt-5">
            <div class="row justify-content-center">
                <div class="col-md-6">
                    <div class="alert alert-danger text-center" role="alert">
                        <i class="bi bi-exclamation-triangle-fill" style="font-size: 3rem;"></i>
                        <h4 class="mt-3">401 - No Autorizado</h4>
                        <p>Debe iniciar sesion para acceder a esta pagina.</p>
                        <p class="mb-0">Redirigiendo al inicio...</p>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function showForbiddenError() {
    document.body.innerHTML = `
        <div class="container mt-5">
            <div class="row justify-content-center">
                <div class="col-md-6">
                    <div class="alert alert-warning text-center" role="alert">
                        <i class="bi bi-shield-exclamation" style="font-size: 3rem;"></i>
                        <h4 class="mt-3">403 - Acceso Denegado</h4>
                        <p>No tiene permisos para acceder a esta pagina.</p>
                        <p class="mb-0">Redirigiendo al inicio...</p>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

// Configurar event listeners
function setupEventListeners() {
    // Navegacion entre secciones
    document.querySelectorAll('[data-section]').forEach(button => {
        button.addEventListener('click', function() {
            showSection(this.dataset.section);
            updateActiveButton(this);
        });
    });

    // Formularios
    document.getElementById('dailyReportForm').addEventListener('submit', handleReportSubmit);
    document.getElementById('vacationRequestForm').addEventListener('submit', handleVacationSubmit);
    
    // Calcular dias de vacaciones automaticamente
    document.getElementById('vacationStartDate').addEventListener('change', calculateVacationDays);
    document.getElementById('vacationEndDate').addEventListener('change', calculateVacationDays);
}

// Mostrar seccion especifica
function showSection(sectionId) {
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.add('d-none');
    });
    document.getElementById(sectionId).classList.remove('d-none');
    
    // Cargar datos segun la seccion
    switch(sectionId) {
        case 'my-reports':
            loadMyReports();
            break;
        case 'my-vacations':
            loadMyVacations();
            break;
        case 'vacation-request':
            loadHolidaysCalendar();
            break;
    }
}

// Actualizar boton activo
function updateActiveButton(activeButton) {
    document.querySelectorAll('.list-group-item').forEach(btn => {
        btn.classList.remove('active');
    });
    activeButton.classList.add('active');
}

// Cargar proyectos disponibles
async function loadProjects() {
    try {
        const response = await fetch(`${API_BASE_URL}/projects`);
        const projects = await response.json();
        populateProjectSelects(projects);
    } catch (error) {
        console.error('Error cargando proyectos:', error);
        showError('Error cargando proyectos');
    }
}

// Poblar selects de proyectos
function populateProjectSelects(projects) {
    const selects = document.querySelectorAll('[id^="activityProject"]');
    
    selects.forEach(select => {
        select.innerHTML = '<option value="">Seleccionar proyecto</option>' +
            projects.map(project => 
                `<option value="${project._id}">${project.projectName}</option>`
            ).join('');
    });
}

// Agregar nueva actividad
function addActivity() {
    const container = document.getElementById('activitiesContainer');
    const activityHtml = `
        <div class="activity-item border p-3 mb-3">
            <button type="button" class="btn-remove-activity" onclick="removeActivity(this)">×</button>
            <h5>Actividad ${activityCount + 1}</h5>
            <div class="row">
                <div class="col-md-6">
                    <label for="activityProject${activityCount}" class="form-label">Proyecto</label>
                    <select class="form-select" id="activityProject${activityCount}" required>
                        <option value="">Seleccionar proyecto</option>
                    </select>
                </div>
                <div class="col-md-6">
                    <label for="activityHours${activityCount}" class="form-label">Horas Dedicadas</label>
                    <input type="number" class="form-control" id="activityHours${activityCount}" min="0.5" max="24" step="0.5" required>
                </div>
            </div>
            <div class="mb-3">
                <label for="activityDescription${activityCount}" class="form-label">Descripcion de Actividad</label>
                <textarea class="form-control" id="activityDescription${activityCount}" rows="3" required></textarea>
            </div>
            <div class="mb-3">
                <label for="activityStatus${activityCount}" class="form-label">Estado</label>
                <select class="form-select" id="activityStatus${activityCount}" required>
                    <option value="">Seleccionar estado</option>
                    <option value="completed">Completada</option>
                    <option value="in-progress">En Progreso</option>
                    <option value="blocked">Bloqueada</option>
                </select>
            </div>
        </div>
    `;
    
    container.insertAdjacentHTML('beforeend', activityHtml);
    activityCount++;
    
    // Cargar proyectos en el nuevo select
    loadProjects();
}

// Remover actividad
function removeActivity(button) {
    if (document.querySelectorAll('.activity-item').length > 1) {
        button.closest('.activity-item').remove();
    } else {
        showError('Debe mantener al menos una actividad');
    }
}

// Manejar envio de reporte diario
async function handleReportSubmit(e) {
    e.preventDefault();
    
    const reportDate = document.getElementById('reportDate').value;
    const activities = [];
    
    // Recopilar datos de todas las actividades
    document.querySelectorAll('.activity-item').forEach((item, index) => {
        const projectSelect = item.querySelector(`[id^="activityProject"]`);
        const hoursInput = item.querySelector(`[id^="activityHours"]`);
        const descriptionTextarea = item.querySelector(`[id^="activityDescription"]`);
        const statusSelect = item.querySelector(`[id^="activityStatus"]`);
        
        if (projectSelect.value && hoursInput.value && descriptionTextarea.value && statusSelect.value) {
            activities.push({
                activityProject: projectSelect.value,
                activityHours: parseFloat(hoursInput.value),
                activityDescription: descriptionTextarea.value,
                activityStatus: statusSelect.value
            });
        }
    });
    
    if (activities.length === 0) {
        showError('Debe completar al menos una actividad');
        return;
    }
    
    const reportData = {
        reportDate: reportDate,
        reportUser: currentUserId,
        reportActivities: activities
    };
    
    try {
        const response = await fetch(`${API_BASE_URL}/reports`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(reportData)
        });
        
        if (response.ok) {
            showSuccess('Reporte guardado correctamente');
            e.target.reset();
            resetActivities();
        } else {
            throw new Error('Error guardando reporte');
        }
    } catch (error) {
        console.error('Error:', error);
        showError('Error guardando reporte');
    }
}

// Resetear actividades a estado inicial
function resetActivities() {
    const container = document.getElementById('activitiesContainer');
    container.innerHTML = `
        <div class="activity-item border p-3 mb-3">
            <h5>Actividad 1</h5>
            <div class="row">
                <div class="col-md-6">
                    <label for="activityProject0" class="form-label">Proyecto</label>
                    <select class="form-select" id="activityProject0" required>
                        <option value="">Seleccionar proyecto</option>
                    </select>
                </div>
                <div class="col-md-6">
                    <label for="activityHours0" class="form-label">Horas Dedicadas</label>
                    <input type="number" class="form-control" id="activityHours0" min="0.5" max="24" step="0.5" required>
                </div>
            </div>
            <div class="mb-3">
                <label for="activityDescription0" class="form-label">Descripcion de Actividad</label>
                <textarea class="form-control" id="activityDescription0" rows="3" required></textarea>
            </div>
            <div class="mb-3">
                <label for="activityStatus0" class="form-label">Estado</label>
                <select class="form-select" id="activityStatus0" required>
                    <option value="">Seleccionar estado</option>
                    <option value="completed">Completada</option>
                    <option value="in-progress">En Progreso</option>
                    <option value="blocked">Bloqueada</option>
                </select>
            </div>
        </div>
    `;
    activityCount = 1;
    loadProjects();
}

// Manejar solicitud de vacaciones
async function handleVacationSubmit(e) {
    e.preventDefault();
    
    const vacationData = {
        vacationUser: currentUserId,
        vacationStartDate: document.getElementById('vacationStartDate').value,
        vacationEndDate: document.getElementById('vacationEndDate').value,
        vacationReason: document.getElementById('vacationReason').value
    };
    
    try {
        const response = await fetch(`${API_BASE_URL}/vacations`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(vacationData)
        });
        
        if (response.ok) {
            showSuccess('Solicitud de vacaciones enviada correctamente');
            e.target.reset();
        } else {
            throw new Error('Error enviando solicitud');
        }
    } catch (error) {
        console.error('Error:', error);
        showError('Error enviando solicitud de vacaciones');
    }
}

// Calcular dias de vacaciones
function calculateVacationDays() {
    const startDate = document.getElementById('vacationStartDate').value;
    const endDate = document.getElementById('vacationEndDate').value;
    
    if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const timeDiff = end.getTime() - start.getTime();
        const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
        
        if (daysDiff > 0) {
            // Mostrar dias calculados (se podria agregar un elemento para mostrar esto)
            console.log(`Dias de vacaciones: ${daysDiff}`);
        }
    }
}

// Cargar mis reportes
async function loadMyReports() {
    try {
        const response = await fetch(`${API_BASE_URL}/reports/user/${currentUserId}`);
        const reports = await response.json();
        displayMyReports(reports);
    } catch (error) {
        console.error('Error cargando reportes:', error);
        showError('Error cargando reportes');
    }
}

// Mostrar mis reportes
function displayMyReports(reports) {
    const tbody = document.getElementById('myReportsTable');
    
    if (reports.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center">No hay reportes registrados</td></tr>';
        return;
    }
    
    tbody.innerHTML = reports.map(report => `
        <tr>
            <td>${formatDate(report.reportDate)}</td>
            <td>${report.reportTotalHours}h</td>
            <td>${report.reportActivities.length} actividades</td>
            <td>
                <button class="btn btn-sm btn-outline-primary" onclick="viewReportDetails('${report._id}')">
                    Ver Detalles
                </button>
            </td>
        </tr>
    `).join('');
}

// Cargar mis vacaciones
async function loadMyVacations() {
    try {
        const response = await fetch(`${API_BASE_URL}/vacations/user/${currentUserId}`);
        const vacations = await response.json();
        displayMyVacations(vacations);
    } catch (error) {
        console.error('Error cargando vacaciones:', error);
        showError('Error cargando vacaciones');
    }
}

// Mostrar mis vacaciones
function displayMyVacations(vacations) {
    const tbody = document.getElementById('myVacationsTable');
    
    if (vacations.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">No hay solicitudes de vacaciones</td></tr>';
        return;
    }
    
    tbody.innerHTML = vacations.map(vacation => `
        <tr>
            <td>${formatDate(vacation.createdAt)}</td>
            <td>${formatDate(vacation.vacationStartDate)}</td>
            <td>${formatDate(vacation.vacationEndDate)}</td>
            <td>${vacation.vacationDays}</td>
            <td><span class="badge status-${vacation.vacationStatus}">${getStatusText(vacation.vacationStatus)}</span></td>
            <td>${vacation.vacationComments || '-'}</td>
        </tr>
    `).join('');
}

// Cargar calendario de feriados
function loadHolidaysCalendar() {
    // Datos de ejemplo, reemplazar con llamada a API
    const holidays = [
        { name: 'Año Nuevo', date: '2024-01-01' },
        { name: 'Dia del Trabajador', date: '2024-05-01' },
        { name: 'Independencia', date: '2024-09-15' }
    ];
    
    const container = document.getElementById('holidaysCalendar');
    container.innerHTML = holidays.map(holiday => `
        <div class="holiday-item">
            <strong>${holiday.name}</strong><br>
            <small class="text-muted">${formatDate(holiday.date)}</small>
        </div>
    `).join('');
}

function viewReportDetails(reportId) {
    console.log('Ver detalles del reporte:', reportId);
}

// Inicializar dashboard
function initializeDashboard() {
    // Establecer fecha actual por defecto
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('reportDate').value = today;
}

// Funciones de utilidad
function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('es-ES');
}

function getStatusText(status) {
    const statusMap = {
        'pending': 'Pendiente',
        'approved': 'Aprobada',
        'rejected': 'Rechazada',
        'completed': 'Completada',
        'in-progress': 'En Progreso',
        'blocked': 'Bloqueada'
    };
    return statusMap[status] || status;
}

function showSuccess(message) {
    showAlert(message, 'success');
}

function showError(message) {
    showAlert(message, 'danger');
}

function showAlert(message, type) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.querySelector('.container-fluid').prepend(alertDiv);
    
    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
}