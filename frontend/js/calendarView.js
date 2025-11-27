// Modulo reutilizable para renderizar calendario visual con eventos de colores
const CalendarView = {
  // Colores asignados a cada tipo de evento
  eventColors: {
    holiday: '#dc3545',
    vacation: '#0d6efd',
    period: '#6c757d'
  },

  // Renderiza calendario mensual completo con eventos marcados
  renderFullCalendar(containerId, events, currentMonth = new Date()) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    // Calcula primer y ultimo dia del mes
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    let html = `
      <div class="calendar-header">
        <button class="btn btn-sm btn-outline-secondary" onclick="CalendarView.previousMonth('${containerId}')">
          <i class="bi bi-chevron-left"></i>
        </button>
        <h5 class="mb-0">${this.getMonthName(month)} ${year}</h5>
        <button class="btn btn-sm btn-outline-secondary" onclick="CalendarView.nextMonth('${containerId}')">
          <i class="bi bi-chevron-right"></i>
        </button>
      </div>
      <div class="calendar-legend">
        <span class="legend-item"><span class="legend-color" style="background: ${this.eventColors.holiday}"></span> Feriados</span>
        <span class="legend-item"><span class="legend-color" style="background: ${this.eventColors.vacation}"></span> Vacaciones</span>
        <span class="legend-item"><span class="legend-color" style="background: ${this.eventColors.period}"></span> Periodos</span>
      </div>
      <div class="calendar-grid">
        <div class="calendar-day-header">Dom</div>
        <div class="calendar-day-header">Lun</div>
        <div class="calendar-day-header">Mar</div>
        <div class="calendar-day-header">Mié</div>
        <div class="calendar-day-header">Jue</div>
        <div class="calendar-day-header">Vie</div>
        <div class="calendar-day-header">Sáb</div>
    `;

    // Renderiza celdas vacias antes del primer dia
    for (let i = 0; i < startingDayOfWeek; i++) {
      html += '<div class="calendar-day empty"></div>';
    }

    // Renderiza cada dia del mes con sus eventos
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(year, month, day);
      const dateStr = this.formatDate(currentDate);
      const dayEvents = this.getEventsForDate(events, dateStr);
      const isToday = this.isToday(currentDate);

      html += `
        <div class="calendar-day ${isToday ? 'today' : ''}" data-date="${dateStr}">
          <div class="day-number">${day}</div>
          ${this.renderDayEvents(dayEvents)}
        </div>
      `;
    }

    html += '</div>';
    container.innerHTML = html;
    // Guarda mes actual en atributo data para navegacion
    container.dataset.currentMonth = currentMonth.toISOString();
  },

  // Renderiza cuadritos con nombre de evento para cada dia
  renderDayEvents(dayEvents) {
    if (dayEvents.length === 0) return '';
    
    let html = '<div class="day-events">';
    // Crea cuadrito con nombre por cada evento
    dayEvents.forEach(event => {
      const color = this.eventColors[event.type] || '#6c757d';
      html += `
        <div class="event-badge" style="background: ${color}" title="${event.title}">
          ${event.title}
        </div>
      `;
    });
    html += '</div>';
    return html;
  },

  // Agrega listener a input date para mostrar eventos al seleccionar fecha
  highlightDatesInInput(inputId, events) {
    const input = document.getElementById(inputId);
    if (!input) return;

    input.addEventListener('change', (e) => {
      const selectedDate = e.target.value;
      const dayEvents = this.getEventsForDate(events, selectedDate);
      
      if (dayEvents.length > 0) {
        const eventList = dayEvents.map(ev => `• ${ev.title}`).join('<br>');
        Swal.fire({
          title: 'Eventos en esta fecha',
          html: eventList,
          icon: 'info',
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#4a6fa5'
        });
      }
    });
  },

  // Filtra eventos que ocurren en una fecha especifica
  getEventsForDate(events, dateStr) {
    // Filtra eventos que incluyen la fecha especificada en su rango
    return events.filter(event => {
      const eventStart = new Date(event.startDate);
      const eventEnd = new Date(event.endDate);
      const checkDate = new Date(dateStr);
      
      return checkDate >= eventStart && checkDate <= eventEnd;
    });
  },

  // Convierte fecha a formato YYYY-MM-DD
  formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  // Verifica si la fecha es el dia actual
  isToday(date) {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  },

  // Retorna nombre del mes en espanol
  getMonthName(month) {
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return months[month];
  },

  // Navega al mes anterior y recarga calendario
  previousMonth(containerId) {
    const container = document.getElementById(containerId);
    const currentMonth = new Date(container.dataset.currentMonth);
    currentMonth.setMonth(currentMonth.getMonth() - 1);
    
    this.reloadCalendar(containerId, currentMonth);
  },

  // Navega al mes siguiente y recarga calendario
  nextMonth(containerId) {
    const container = document.getElementById(containerId);
    const currentMonth = new Date(container.dataset.currentMonth);
    currentMonth.setMonth(currentMonth.getMonth() + 1);
    
    this.reloadCalendar(containerId, currentMonth);
  },

  // Recarga calendario obteniendo eventos actualizados del backend
  async reloadCalendar(containerId, currentMonth) {
    const events = await this.fetchAllEvents();
    this.renderFullCalendar(containerId, events, currentMonth);
  },

  // Obtiene todos los eventos (feriados, periodos, vacaciones) desde API
  async fetchAllEvents() {
    const token = localStorage.getItem('token');
    const events = [];

    try {
      // Obtiene feriados desde API
      const holidaysRes = await fetch('http://localhost:3000/api/holidays', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const holidaysData = await holidaysRes.json();
      
      if (holidaysData.success) {
        holidaysData.holidays.forEach(holiday => {
          events.push({
            type: 'holiday',
            title: holiday.holidayName,
            startDate: holiday.holidayDate,
            endDate: holiday.holidayDate
          });
        });
      }

      // Obtiene periodos bloqueados desde API
      const periodsRes = await fetch('http://localhost:3000/api/vacation-periods', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const periodsData = await periodsRes.json();
      
      if (periodsData.success) {
        periodsData.periods.forEach(period => {
          events.push({
            type: 'period',
            title: period.periodName,
            startDate: period.periodStartDate,
            endDate: period.periodEndDate
          });
        });
      }

      // Obtiene vacaciones aprobadas desde API
      const vacationsRes = await fetch('http://localhost:3000/api/vacations', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const vacationsData = await vacationsRes.json();
      
      if (vacationsData.success) {
        vacationsData.vacations
          .filter(vac => vac.vacationStatus === 'approved')
          .forEach(vacation => {
            events.push({
              type: 'vacation',
              title: 'Vacaciones',
              startDate: vacation.vacationStartDate,
              endDate: vacation.vacationEndDate
            });
          });
      }

    } catch (error) {
      console.error('Error cargando eventos:', error);
    }

    return events;
  }
};
