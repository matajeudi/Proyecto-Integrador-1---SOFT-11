// Script para el panel de TI
const API_BASE_URL = 'http://localhost:3000/api';

document.addEventListener('DOMContentLoaded', function() {
    checkAuthAndRole('it');
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

function checkAuthAndRole(requiredRole) {
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
    document.getElementById('userName').textContent = user.name;
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
    
    // Renderiza calendario cuando se abre modal de proyecto
    const projectModal = document.getElementById('projectModal');
    if (projectModal) {
        projectModal.addEventListener('shown.bs.modal', async function() {
            const events = await CalendarView.fetchAllEvents();
            CalendarView.renderFullCalendar('projectModalCalendar', events);
        });
    }
}

function showSection(sectionId) {
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.add('d-none');
    });
    document.getElementById(sectionId).classList.remove('d-none');
    
    if (sectionId === 'holidays-view') {
        loadHolidays();
    } else if (sectionId === 'vacation-periods') {
        loadVacationPeriods();
    } else if (sectionId === 'project-management') {
        loadProjects();
    } else if (sectionId === 'project-catalog') {
        loadProjectCatalog();
    } else if (sectionId === 'user-assignment') {
        loadProjectsForAssignment();
    }
}

function updateActiveButton(activeButton) {
    document.querySelectorAll('.list-group-item').forEach(btn => {
        btn.classList.remove('active');
    });
    activeButton.classList.add('active');
}

// Cargar feriados
async function loadHolidays() {
    try {
        const response = await fetch(`${API_BASE_URL}/holidays`);
        const result = await response.json();
        
        if (result.success) {
            displayHolidays(result.holidays);
        }
    } catch (error) {
        console.error('Error:', error);
        showError('Error cargando feriados');
    }
}

function displayHolidays(holidays) {
    const container = document.getElementById('holidaysList');
    
    if (holidays.length === 0) {
        container.innerHTML = '<p class="text-muted">No hay feriados registrados</p>';
        return;
    }
    
    container.innerHTML = holidays.map(holiday => `
        <div class="holiday-item d-flex justify-content-between align-items-center mb-3 p-3 border rounded">
            <div>
                <h3 class="h6 fw-bold mb-1">${holiday.holidayName}</h3>
                <small class="text-muted">
                    <i class="bi bi-calendar-event"></i> ${formatDate(holiday.holidayDate)}
                </small>
            </div>
        </div>
    `).join('');
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

// Guardar proyecto
async function saveProject() {
    const projectName = document.getElementById('projectName').value.trim();
    const projectDescription = document.getElementById('projectDescription').value.trim();
    const projectBudget = parseFloat(document.getElementById('projectBudget').value);
    const projectStartDate = document.getElementById('projectStartDate').value;
    const projectEndDate = document.getElementById('projectEndDate').value;
    const projectStatus = document.getElementById('projectStatus').value;
    
    if (projectName.length < 3) {
        showError('El nombre del proyecto debe tener al menos 3 caracteres');
        return;
    }
    
    if (projectName.length > 100) {
        showError('El nombre del proyecto no puede exceder 100 caracteres');
        return;
    }
    
    if (projectDescription.length < 10) {
        showError('La descripcion debe tener al menos 10 caracteres');
        return;
    }
    
    if (projectDescription.length > 1000) {
        showError('La descripcion no puede exceder 1000 caracteres');
        return;
    }
    
    if (isNaN(projectBudget) || projectBudget <= 0) {
        showError('El presupuesto debe ser un numero positivo');
        return;
    }
    
    if (projectBudget > 999999999) {
        showError('El presupuesto no puede exceder 999,999,999');
        return;
    }
    
    if (new Date(projectEndDate) <= new Date(projectStartDate)) {
        showError('La fecha de fin debe ser posterior a la fecha de inicio');
        return;
    }
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const usersResponse = await fetch(`${API_BASE_URL}/users`);
    const users = await usersResponse.json();
    const currentUserData = users.find(u => u.userEmail === currentUser.email);
    
    const projectData = {
        projectName: projectName,
        projectDescription: projectDescription,
        projectBudget: projectBudget,
        projectStartDate: projectStartDate,
        projectEndDate: projectEndDate,
        projectStatus: projectStatus,
        projectCreatedBy: currentUserData._id
    };
    
    try {
        const response = await fetch(`${API_BASE_URL}/projects`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(projectData)
        });
        
        if (response.ok) {
            showSuccess('Proyecto creado correctamente');
            bootstrap.Modal.getInstance(document.getElementById('projectModal')).hide();
            document.getElementById('projectForm').reset();
            loadProjects();
        } else {
            const error = await response.json();
            showError(error.message || 'Error creando proyecto');
        }
    } catch (error) {
        console.error('Error:', error);
        showError('Error conectando con el servidor');
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
            <div class="mb-3 p-3 border rounded">
                <h3 class="h6 fw-bold mb-1">${period.periodName}</h3>
                <small class="text-muted">
                    <i class="bi bi-calendar-range"></i> 
                    ${formatDate(period.periodStartDate)} - ${formatDate(period.periodEndDate)}
                    <span class="badge bg-info ms-2">${duration} días</span>
                </small>
                ${period.periodDescription ? `<p class="mb-0 mt-2 small">${period.periodDescription}</p>` : ''}
            </div>
        `;
    }).join('');
}

// Cargar proyectos en tabla
async function loadProjects() {
    try {
        const response = await fetch(`${API_BASE_URL}/projects`);
        const projects = await response.json();
        displayProjects(projects);
    } catch (error) {
        console.error('Error:', error);
        showError('Error cargando proyectos');
    }
}

function displayProjects(projects) {
    const tbody = document.getElementById('projectsTable');
    
    if (projects.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center">No hay proyectos registrados</td></tr>';
        return;
    }
    
    tbody.innerHTML = projects.map(project => {
        let statusBadge = '';
        if (project.projectStatus === 'active') {
            statusBadge = '<span class="badge bg-success">Activo</span>';
        } else if (project.projectStatus === 'planning') {
            statusBadge = '<span class="badge bg-info">Planificacion</span>';
        } else if (project.projectStatus === 'completed') {
            statusBadge = '<span class="badge bg-secondary">Completado</span>';
        } else {
            statusBadge = '<span class="badge bg-danger">Cancelado</span>';
        }
        
        return `
            <tr>
                <td>${project.projectName}</td>
                <td>$${project.projectBudget.toLocaleString()}</td>
                <td>${formatDate(project.projectStartDate)}</td>
                <td>${formatDate(project.projectEndDate)}</td>
                <td>${statusBadge}</td>
                <td>${project.projectAssignedUsers ? project.projectAssignedUsers.length : 0}</td>
                <td>
                    <button class="btn btn-sm btn-warning me-1" onclick="editProject('${project._id}')">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteProject('${project._id}')">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// Editar proyecto
async function editProject(projectId) {
    try {
        const response = await fetch(`${API_BASE_URL}/projects/${projectId}`);
        const project = await response.json();
        
        document.getElementById('projectId').value = project._id;
        document.getElementById('projectName').value = project.projectName;
        document.getElementById('projectDescription').value = project.projectDescription;
        document.getElementById('projectBudget').value = project.projectBudget;
        document.getElementById('projectStartDate').value = project.projectStartDate.split('T')[0];
        document.getElementById('projectEndDate').value = project.projectEndDate.split('T')[0];
        document.getElementById('projectStatus').value = project.projectStatus;
        
        document.querySelector('#projectModal .modal-title').innerHTML = '<i class="bi bi-pencil"></i> Editar Proyecto';
        new bootstrap.Modal(document.getElementById('projectModal')).show();
    } catch (error) {
        console.error('Error:', error);
        showError('Error cargando proyecto');
    }
}

// Cargar catalogo de proyectos
async function loadProjectCatalog() {
    try {
        const response = await fetch(`${API_BASE_URL}/projects`);
        const projects = await response.json();
        displayProjectCatalog(projects);
    } catch (error) {
        console.error('Error:', error);
        showError('Error cargando catalogo');
    }
}

function displayProjectCatalog(projects) {
    const container = document.getElementById('projectCatalog');
    
    if (projects.length === 0) {
        container.innerHTML = '<div class="col-12"><p class="text-muted">No hay proyectos registrados</p></div>';
        return;
    }
    
    container.innerHTML = projects.map(project => {
        let statusClass = '';
        let statusText = '';
        if (project.projectStatus === 'active') {
            statusClass = 'success';
            statusText = 'Activo';
        } else if (project.projectStatus === 'planning') {
            statusClass = 'info';
            statusText = 'Planificacion';
        } else if (project.projectStatus === 'completed') {
            statusClass = 'secondary';
            statusText = 'Completado';
        } else {
            statusClass = 'danger';
            statusText = 'Cancelado';
        }
        
        return `
            <div class="col-md-6 mb-3">
                <div class="card">
                    <div class="card-header bg-${statusClass} text-white">
                        <h3 class="h6 mb-0">${project.projectName}</h3>
                    </div>
                    <div class="card-body">
                        <p class="card-text">${project.projectDescription}</p>
                        <ul class="list-unstyled">
                            <li><strong>Presupuesto:</strong> $${project.projectBudget.toLocaleString()}</li>
                            <li><strong>Inicio:</strong> ${formatDate(project.projectStartDate)}</li>
                            <li><strong>Fin:</strong> ${formatDate(project.projectEndDate)}</li>
                            <li><strong>Estado:</strong> <span class="badge bg-${statusClass}">${statusText}</span></li>
                            <li><strong>Usuarios:</strong> ${project.projectAssignedUsers ? project.projectAssignedUsers.length : 0}</li>
                        </ul>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Cargar proyectos para asignacion
async function loadProjectsForAssignment() {
    try {
        const response = await fetch(`${API_BASE_URL}/projects`);
        const projects = await response.json();
        const select = document.getElementById('assignmentProject');
        select.innerHTML = '<option value="">Seleccionar proyecto</option>' + 
            projects.map(p => `<option value="${p._id}">${p.projectName}</option>`).join('');
        
        loadAvailableUsers();
        
        select.addEventListener('change', function() {
            if (this.value) {
                loadAssignedUsers(this.value);
            } else {
                document.getElementById('assignedUsers').innerHTML = '<p class="text-muted">Seleccione un proyecto</p>';
            }
        });
    } catch (error) {
        console.error('Error:', error);
    }
}

// Cargar usuarios disponibles
async function loadAvailableUsers() {
    try {
        const response = await fetch(`${API_BASE_URL}/users`);
        const users = await response.json();
        displayAvailableUsers(users);
    } catch (error) {
        console.error('Error:', error);
        showError('Error cargando usuarios');
    }
}

function displayAvailableUsers(users) {
    const container = document.getElementById('availableUsers');
    
    if (users.length === 0) {
        container.innerHTML = '<p class="text-muted">No hay usuarios disponibles</p>';
        return;
    }
    
    container.innerHTML = users.map(user => {
        let roleBadge = '';
        if (user.userRole === 'admin') {
            roleBadge = '<span class="badge bg-primary">Admin</span>';
        } else if (user.userRole === 'worker') {
            roleBadge = '<span class="badge bg-success">Worker</span>';
        } else {
            roleBadge = '<span class="badge bg-info">IT</span>';
        }
        
        return `
            <div class="d-flex justify-content-between align-items-center mb-2 p-2 border rounded">
                <div>
                    <strong>${user.userFullName}</strong> ${roleBadge}<br>
                    <small class="text-muted">${user.userDepartment}</small>
                </div>
                <button class="btn btn-sm btn-primary" onclick="assignUserToProject('${user._id}')">
                    <i class="bi bi-plus"></i> Asignar
                </button>
            </div>
        `;
    }).join('');
}

// Cargar usuarios asignados a un proyecto
async function loadAssignedUsers(projectId) {
    try {
        const response = await fetch(`${API_BASE_URL}/projects/${projectId}`);
        const project = await response.json();
        displayAssignedUsers(project.projectAssignedUsers || [], projectId);
    } catch (error) {
        console.error('Error:', error);
    }
}

function displayAssignedUsers(users, projectId) {
    const container = document.getElementById('assignedUsers');
    
    if (users.length === 0) {
        container.innerHTML = '<p class="text-muted">No hay usuarios asignados a este proyecto</p>';
        return;
    }
    
    container.innerHTML = users.map(user => `
        <div class="d-flex justify-content-between align-items-center mb-2 p-2 border rounded bg-light">
            <div>
                <strong>${user.userFullName}</strong><br>
                <small class="text-muted">${user.userEmail}</small>
            </div>
            <button class="btn btn-sm btn-danger" onclick="unassignUserFromProject('${projectId}', '${user._id}')">
                <i class="bi bi-x"></i> Quitar
            </button>
        </div>
    `).join('');
}

// Asignar usuario a proyecto
async function assignUserToProject(userId) {
    const projectId = document.getElementById('assignmentProject').value;
    
    if (!projectId) {
        showError('Seleccione un proyecto primero');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/projects/${projectId}/assign-user`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userId })
        });
        
        if (response.ok) {
            showSuccess('Usuario asignado correctamente');
            loadAssignedUsers(projectId);
        } else {
            showError('Error asignando usuario');
        }
    } catch (error) {
        console.error('Error:', error);
        showError('Error conectando con el servidor');
    }
}

// Desasignar usuario de proyecto
async function unassignUserFromProject(projectId, userId) {
    try {
        const response = await fetch(`${API_BASE_URL}/projects/${projectId}`);
        const project = await response.json();
        
        const updatedUsers = project.projectAssignedUsers
            .filter(u => u._id !== userId)
            .map(u => u._id);
        
        const updateResponse = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ projectAssignedUsers: updatedUsers })
        });
        
        if (updateResponse.ok) {
            showSuccess('Usuario removido correctamente');
            loadAssignedUsers(projectId);
        } else {
            showError('Error removiendo usuario');
        }
    } catch (error) {
        console.error('Error:', error);
        showError('Error conectando con el servidor');
    }
}

// Eliminar proyecto
async function deleteProject(projectId) {
    const result = await Swal.fire({
        title: '¿Está seguro?',
        text: 'Se eliminará este proyecto',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d'
    });
    
    if (!result.isConfirmed) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            showSuccess('Proyecto eliminado correctamente');
            loadProjects();
        } else {
            showError('Error eliminando proyecto');
        }
    } catch (error) {
        console.error('Error:', error);
        showError('Error conectando con el servidor');
    }
}
