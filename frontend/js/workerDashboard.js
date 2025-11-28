// Script para el panel de trabajador
const API_BASE_URL = 'http://localhost:3000/api';
let currentUserId = '';

document.addEventListener('DOMContentLoaded', async function() {
    await checkAuthAndRole('worker');
    initializeDashboard();
    setupEventListeners();
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

async function checkAuthAndRole(requiredRole) {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
        window.location.href = 'index.html';
        return;
    }
    const user = JSON.parse(currentUser);
    if (user.role !== requiredRole) {
        window.location.href = 'index.html';
        return;
    }
    await fetchCurrentUserId(user.email);
    document.getElementById('userName').textContent = user.name;
}

async function fetchCurrentUserId(email) {
    try {
        const response = await fetch(`${API_BASE_URL}/users`);
        const users = await response.json();
        const currentUser = users.find(u => u.userEmail === email);
        if (currentUser) {
            currentUserId = currentUser._id;
            console.log('Usuario ID obtenido:', currentUserId);
        } else {
            console.error('No se encontro usuario con email:', email);
        }
    } catch (error) {
        console.error('Error obteniendo ID de usuario:', error);
    }
}

function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

function setupEventListeners() {
    document.querySelectorAll('[data-section]').forEach(button => {
        button.addEventListener('click', function() {
            showSection(this.dataset.section);
            updateActiveButton(this);
        });
    });

    document.getElementById('vacationRequestForm').addEventListener('submit', handleVacationRequest);
    document.getElementById('dailyReportForm').addEventListener('submit', handleDailyReportSubmit);
}

function showSection(sectionId) {
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.add('d-none');
    });
    document.getElementById(sectionId).classList.remove('d-none');
    
    switch(sectionId) {
        case 'daily-report':
            loadAssignedProjects();
            break;
        case 'vacation-request':
            loadHolidaysCalendar();
            break;
        case 'my-vacations':
            loadMyVacations();
            break;
        case 'my-reports':
            loadMyReports();
            break;
        case 'vacation-periods':
            loadVacationPeriods();
            break;
    }
}

function updateActiveButton(activeButton) {
    document.querySelectorAll('.list-group-item').forEach(btn => {
        btn.classList.remove('active');
    });
    activeButton.classList.add('active');
}

// Solicitar vacaciones
async function handleVacationRequest(e) {
    e.preventDefault();
    
    if (!currentUserId) {
        showError('Error: No se pudo obtener el ID del usuario. Intente recargar la pagina.');
        return;
    }
    
    const form = e.target;
    const editId = form.dataset.editId;
    const startDate = document.getElementById('vacationStartDate').value;
    const endDate = document.getElementById('vacationEndDate').value;
    const reason = document.getElementById('vacationReason').value.trim();
    
    if (!startDate || !endDate || !reason) {
        showError('Todos los campos son requeridos');
        return;
    }
    
    if (reason.length < 10) {
        showError('La razon debe tener al menos 10 caracteres');
        return;
    }
    
    if (reason.length > 500) {
        showError('La razon no puede exceder 500 caracteres');
        return;
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(startDate + 'T00:00:00');
    start.setHours(0, 0, 0, 0);
    
    if (start < today) {
        showError('La fecha de inicio no puede ser anterior a hoy');
        return;
    }
    
    if (new Date(endDate) < new Date(startDate)) {
        showError('La fecha de fin no puede ser anterior a la fecha de inicio');
        return;
    }
    
    const isBlocked = await checkVacationPeriodConflict(startDate, endDate);
    if (isBlocked) {
        return;
    }
    
    const vacationData = {
        vacationUser: currentUserId,
        vacationStartDate: startDate,
        vacationEndDate: endDate,
        vacationReason: reason,
        vacationDays: 1
    };
    
    try {
        let response;
        if (editId) {
            response = await fetch(`${API_BASE_URL}/vacations/${editId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(vacationData)
            });
        } else {
            response = await fetch(`${API_BASE_URL}/vacations`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(vacationData)
            });
        }
        
        const result = await response.json();
        
        if (response.ok) {
            showSuccess(editId ? 'Solicitud actualizada correctamente' : 'Solicitud de vacaciones enviada correctamente');
            form.reset();
            delete form.dataset.editId;
        } else {
            showError(result.message || result.error || 'Error procesando solicitud');
        }
    } catch (error) {
        console.error('Error completo:', error);
        showError('Error conectando con el servidor');
    }
}

// Verificar si las fechas caen en periodo bloqueado
async function checkVacationPeriodConflict(startDate, endDate) {
    try {
        const response = await fetch(`${API_BASE_URL}/vacation-periods`);
        const result = await response.json();
        
        if (!result.success || !result.periods || result.periods.length === 0) {
            return false;
        }
        
        const start = new Date(startDate + 'T00:00:00');
        const end = new Date(endDate + 'T00:00:00');
        
        for (const period of result.periods) {
            const periodStart = new Date(period.periodStartDate);
            const periodEnd = new Date(period.periodEndDate);
            periodStart.setHours(0, 0, 0, 0);
            periodEnd.setHours(0, 0, 0, 0);
            
            if (start <= periodEnd && end >= periodStart) {
                showError(`No se pueden solicitar vacaciones durante el periodo bloqueado: ${period.periodName} (${formatDate(period.periodStartDate)} - ${formatDate(period.periodEndDate)})`);
                return true;
            }
        }
        return false;
    } catch (error) {
        console.error('Error verificando periodos:', error);
        return false;
    }
}

// Carga y renderiza calendario visual con todos los eventos
async function loadHolidaysCalendar() {
    try {
        const events = await CalendarView.fetchAllEvents();
        CalendarView.renderFullCalendar('eventsCalendar', events);
    } catch (error) {
        console.error('Error:', error);
    }
}

// Cargar mis vacaciones
async function loadMyVacations() {
    try {
        const response = await fetch(`${API_BASE_URL}/vacations/user/${currentUserId}`);
        const vacations = await response.json();
        displayMyVacations(vacations);
    } catch (error) {
        console.error('Error:', error);
        showError('Error cargando vacaciones');
    }
}

function displayMyVacations(vacations) {
    const tbody = document.getElementById('myVacationsTable');
    
    if (vacations.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center">No tiene solicitudes de vacaciones</td></tr>';
        return;
    }
    
    tbody.innerHTML = vacations.map(vacation => {
        let statusBadge = '';
        let actions = '';
        
        if (vacation.vacationStatus === 'pending') {
            statusBadge = '<span class="badge bg-warning">Pendiente</span>';
            actions = `
                <button class="btn btn-sm btn-primary me-1" onclick="editVacation('${vacation._id}')">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteVacation('${vacation._id}')">
                    <i class="bi bi-trash"></i>
                </button>
            `;
        } else if (vacation.vacationStatus === 'approved') {
            statusBadge = '<span class="badge bg-success">Aprobada</span>';
            actions = `
                <button class="btn btn-sm btn-danger" onclick="deleteVacation('${vacation._id}')">
                    <i class="bi bi-trash"></i>
                </button>
            `;
        } else {
            statusBadge = '<span class="badge bg-danger">Rechazada</span>';
            actions = '-';
        }
        
        return `
            <tr>
                <td>${formatDate(vacation.createdAt)}</td>
                <td>${formatDate(vacation.vacationStartDate)}</td>
                <td>${formatDate(vacation.vacationEndDate)}</td>
                <td>${vacation.vacationDays}</td>
                <td>${statusBadge}</td>
                <td>${vacation.vacationComments || '-'}</td>
                <td>${actions}</td>
            </tr>
        `;
    }).join('');
}

function initializeDashboard() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('reportDate').value = today;
    loadAssignedProjects();
}

// Cargar proyectos asignados al trabajador
async function loadAssignedProjects() {
    if (!currentUserId) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/projects`);
        const projects = await response.json();
        
        const assignedProjects = projects.filter(project => 
            project.projectAssignedUsers && 
            project.projectAssignedUsers.some(user => user._id === currentUserId)
        );
        
        populateProjectSelects(assignedProjects);
    } catch (error) {
        console.error('Error cargando proyectos:', error);
    }
}

function populateProjectSelects(projects) {
    const selects = document.querySelectorAll('[id^="activityProject"]');
    
    const options = projects.length > 0 
        ? projects.map(p => `<option value="${p._id}">${p.projectName}</option>`).join('')
        : '<option value="">No hay proyectos asignados</option>';
    
    selects.forEach(select => {
        const currentValue = select.value;
        select.innerHTML = '<option value="">Seleccionar proyecto</option>' + options;
        if (currentValue) select.value = currentValue;
    });
}

let activityCount = 1;

function addActivity() {
    const container = document.getElementById('activitiesContainer');
    activityCount++;
    
    const activityDiv = document.createElement('div');
    activityDiv.className = 'activity-item border p-3 mb-3';
    activityDiv.innerHTML = `
        <h5>Actividad ${activityCount}</h5>
        <div class="row">
            <div class="col-md-6">
                <label for="activityProject${activityCount - 1}" class="form-label text-dark fw-semibold">
                    <i class="bi bi-folder"></i> Proyecto
                </label>
                <select class="form-select" id="activityProject${activityCount - 1}" required>
                    <option value="">Seleccionar proyecto</option>
                </select>
            </div>
            <div class="col-md-6">
                <label for="activityHours${activityCount - 1}" class="form-label text-dark fw-semibold">
                    <i class="bi bi-clock"></i> Horas Dedicadas
                </label>
                <input type="number" class="form-control" id="activityHours${activityCount - 1}" min="0.5" max="24" step="0.5" placeholder="Ej: 4.5" required>
            </div>
        </div>
        <div class="mb-3">
            <label for="activityDescription${activityCount - 1}" class="form-label text-dark fw-semibold">
                <i class="bi bi-file-text"></i> Descripción de Actividad
            </label>
            <textarea class="form-control" id="activityDescription${activityCount - 1}" rows="3" placeholder="Describa las tareas realizadas" minlength="10" maxlength="500" required></textarea>
        </div>
        <div class="mb-3">
            <label for="activityStatus${activityCount - 1}" class="form-label text-dark fw-semibold">
                <i class="bi bi-flag"></i> Estado
            </label>
            <select class="form-select" id="activityStatus${activityCount - 1}" required>
                <option value="">Seleccionar estado</option>
                <option value="completed">Completada</option>
                <option value="in-progress">En Progreso</option>
                <option value="blocked">Bloqueada</option>
            </select>
        </div>
        <button type="button" class="btn btn-sm btn-danger" onclick="removeActivity(this)">
            <i class="bi bi-trash"></i> Eliminar Actividad
        </button>
    `;
    
    container.appendChild(activityDiv);
    loadAssignedProjects();
}

function removeActivity(button) {
    button.closest('.activity-item').remove();
}

// Guardar reporte diario
async function handleDailyReportSubmit(e) {
    e.preventDefault();
    
    if (!currentUserId) {
        showError('Error: No se pudo obtener el ID del usuario');
        return;
    }
    
    const reportDate = document.getElementById('reportDate').value;
    const activities = [];
    
    const activityItems = document.querySelectorAll('.activity-item');
    
    for (let i = 0; i < activityItems.length; i++) {
        const project = document.getElementById(`activityProject${i}`).value;
        const hours = parseFloat(document.getElementById(`activityHours${i}`).value);
        const description = document.getElementById(`activityDescription${i}`).value.trim();
        const status = document.getElementById(`activityStatus${i}`).value;
        
        if (!project || !hours || !description || !status) {
            showError('Complete todos los campos de las actividades');
            return;
        }
        
        if (description.length < 10) {
            showError(`La descripcion de la actividad ${i + 1} debe tener al menos 10 caracteres`);
            return;
        }
        
        if (description.length > 500) {
            showError(`La descripcion de la actividad ${i + 1} no puede exceder 500 caracteres`);
            return;
        }
        
        if (hours < 0.5 || hours > 24) {
            showError(`Las horas de la actividad ${i + 1} deben estar entre 0.5 y 24`);
            return;
        }
        
        activities.push({
            activityProject: project,
            activityHours: hours,
            activityDescription: description,
            activityStatus: status
        });
    }
    
    const totalHours = activities.reduce((sum, act) => sum + act.activityHours, 0);
    if (totalHours > 24) {
        showError(`El total de horas (${totalHours}h) no puede exceder 24 horas en un dia`);
        return;
    }
    
    if (activities.length === 0) {
        showError('Debe agregar al menos una actividad');
        return;
    }
    
    const reportData = {
        reportUser: currentUserId,
        reportDate: reportDate,
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
            document.getElementById('reportDate').value = new Date().toISOString().split('T')[0];
            document.getElementById('activitiesContainer').innerHTML = `
                <div class="activity-item border p-3 mb-3">
                    <h5>Actividad 1</h5>
                    <div class="row">
                        <div class="col-md-6">
                            <label for="activityProject0" class="form-label text-dark fw-semibold">
                                <i class="bi bi-folder"></i> Proyecto
                            </label>
                            <select class="form-select" id="activityProject0" required>
                                <option value="">Seleccionar proyecto</option>
                            </select>
                        </div>
                        <div class="col-md-6">
                            <label for="activityHours0" class="form-label text-dark fw-semibold">
                                <i class="bi bi-clock"></i> Horas Dedicadas
                            </label>
                            <input type="number" class="form-control" id="activityHours0" min="0.5" max="24" step="0.5" placeholder="Ej: 4.5" required>
                        </div>
                    </div>
                    <div class="mb-3">
                        <label for="activityDescription0" class="form-label text-dark fw-semibold">
                            <i class="bi bi-file-text"></i> Descripción de Actividad
                        </label>
                        <textarea class="form-control" id="activityDescription0" rows="3" placeholder="Describa las tareas realizadas" minlength="10" maxlength="500" required></textarea>
                    </div>
                    <div class="mb-3">
                        <label for="activityStatus0" class="form-label text-dark fw-semibold">
                            <i class="bi bi-flag"></i> Estado
                        </label>
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
            loadAssignedProjects();
        } else {
            const error = await response.json();
            showError(error.message || 'Error guardando reporte');
        }
    } catch (error) {
        console.error('Error:', error);
        showError('Error conectando con el servidor');
    }
}

// Cargar mis reportes
async function loadMyReports() {
    if (!currentUserId) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/reports/user/${currentUserId}`);
        const reports = await response.json();
        displayMyReports(reports);
    } catch (error) {
        console.error('Error:', error);
        showError('Error cargando reportes');
    }
}

function displayMyReports(reports) {
    const tbody = document.getElementById('myReportsTable');
    
    if (reports.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center">No tiene reportes registrados</td></tr>';
        return;
    }
    
    tbody.innerHTML = reports.map(report => `
        <tr>
            <td>${formatDate(report.reportDate)}</td>
            <td><strong>${report.reportTotalHours}h</strong></td>
            <td>${report.reportActivities.length}</td>
            <td>
                <button class="btn btn-sm btn-info" onclick="viewReportDetails('${report._id}')">
                    <i class="bi bi-eye"></i> Ver
                </button>
            </td>
        </tr>
    `).join('');
}

function viewReportDetails(reportId) {
    showError('Funcionalidad de ver detalles en desarrollo');
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('es-ES');
}

function showSuccess(message) {
    Swal.fire({
        title: 'Exitoso',
        text: message,
        icon: 'success',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#198754'
    });
}

function showError(message) {
    Swal.fire({
        title: 'Error',
        text: message,
        icon: 'error',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#dc3545'
    });
}

async function editVacation(vacationId) {
    try {
        const response = await fetch(`${API_BASE_URL}/vacations/${vacationId}`);
        const vacation = await response.json();
        
        document.getElementById('vacationStartDate').value = vacation.vacationStartDate.split('T')[0];
        document.getElementById('vacationEndDate').value = vacation.vacationEndDate.split('T')[0];
        document.getElementById('vacationReason').value = vacation.vacationReason;
        
        document.getElementById('vacationRequestForm').dataset.editId = vacationId;
        
        showSection('vacation-request');
        document.querySelectorAll('.list-group-item').forEach(btn => btn.classList.remove('active'));
        document.querySelector('[data-section="vacation-request"]').classList.add('active');
    } catch (error) {
        showError('Error cargando solicitud');
    }
}

async function deleteVacation(vacationId) {
    const result = await Swal.fire({
        title: '¿Está seguro?',
        text: 'Se eliminará esta solicitud de vacaciones',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d'
    });
    
    if (!result.isConfirmed) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/vacations/${vacationId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            showSuccess('Solicitud eliminada correctamente');
            loadMyVacations();
        } else {
            showError('Error eliminando solicitud');
        }
    } catch (error) {
        showError('Error conectando con el servidor');
    }
}

// Cargar periodos de vacaciones
async function loadVacationPeriods() {
    try {
        const response = await fetch(`${API_BASE_URL}/vacation-periods`);
        const result = await response.json();
        
        if (result.success) {
            displayVacationPeriods(result.periods);
        }
    } catch (error) {
        console.error('Error:', error);
        showError('Error cargando periodos');
    }
}

function displayVacationPeriods(periods) {
    const container = document.getElementById('periodsList');
    
    if (periods.length === 0) {
        container.innerHTML = '<p class="text-muted">No hay periodos bloqueados</p>';
        return;
    }
    
    container.innerHTML = periods.map(period => {
        const startDate = new Date(period.periodStartDate);
        const endDate = new Date(period.periodEndDate);
        const duration = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
        
        return `
            <div class="alert alert-warning mb-3">
                <h4 class="alert-heading"><i class="bi bi-exclamation-triangle"></i> ${period.periodName}</h4>
                <p class="mb-1">
                    <strong>Periodo:</strong> ${formatDate(period.periodStartDate)} - ${formatDate(period.periodEndDate)}
                    <span class="badge bg-secondary ms-2">${duration} días</span>
                </p>
                ${period.periodDescription ? `<p class="mb-0"><small>${period.periodDescription}</small></p>` : ''}
            </div>
        `;
    }).join('');
}
