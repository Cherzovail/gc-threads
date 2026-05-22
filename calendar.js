import { state } from '../state.js';
import { getHolidayForDate, getHolidaysByMonth, getHolidayClass } from './filipinoHolidays.js';

function hasEvent(day) {
  return state.events.some(event => event.month === state.currentMonth && event.year === state.currentYear && event.day === day);
}

function isToday(day) {
  const now = new Date();
  return now.getFullYear() === state.currentYear && now.getMonth() === state.currentMonth && now.getDate() === day;
}

function isHoliday(day) {
  const dateStr = `${state.currentYear}-${String(state.currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  return getHolidayForDate(dateStr) !== null;
}

export function generateCalendar(containerId, isFull) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';

  const daysInMonth = new Date(state.currentYear, state.currentMonth + 1, 0).getDate();
  const firstDayIndex = new Date(state.currentYear, state.currentMonth, 1).getDay();

  for (let i = 0; i < firstDayIndex; i++) {
    const placeholder = document.createElement('div');
    placeholder.className = 'calendar-day empty';
    container.appendChild(placeholder);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const cell = document.createElement('div');
    cell.className = 'calendar-day';
    if (isToday(day)) cell.classList.add('today');
    if (hasEvent(day)) cell.classList.add('has-event');
    if (isHoliday(day)) cell.classList.add('holiday');
    if (state.selectedDay === day && !isFull) cell.classList.add('selected');

    const dateStr = `${state.currentYear}-${String(state.currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const holiday = getHolidayForDate(dateStr);

    let dayContent = `<div class="calendar-day-number">${day}</div>`;
    
    if (holiday) {
      dayContent += `<div class="holiday-indicator" title="${holiday.name}">●</div>`;
    } else if (hasEvent(day)) {
      dayContent += `<div class="event-dot"></div>`;
    }

    cell.innerHTML = dayContent;
    cell.tabIndex = 0;
    cell.title = holiday ? holiday.name : '';

    cell.addEventListener('click', () => {
      state.selectedDay = day;
      if (isFull) {
        showSelectedDayEvents(day);
      } else {
        const current = document.getElementById(containerId);
        if (current) {
          const children = current.querySelectorAll('.calendar-day');
          children.forEach(child => child.classList.remove('selected'));
          cell.classList.add('selected');
        }
      }
    });

    container.appendChild(cell);
  }
}

export function updateMonthDisplay() {
  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const label = `${monthNames[state.currentMonth]} ${state.currentYear}`;
  document.getElementById('currentMonthYear')?.textContent = label;
  document.getElementById('currentMonthYearFull')?.textContent = label;
}

export function loadEvents() {
  const container = document.getElementById('eventsContainer');
  if (!container) return;
  container.innerHTML = '';

  const monthEvents = state.events.filter(event => event.month === state.currentMonth && event.year === state.currentYear);
  const monthHolidays = getHolidaysByMonth(state.currentMonth + 1, state.currentYear);

  // Show holidays first
  if (monthHolidays.length > 0) {
    const holidaysTitle = document.createElement('h3');
    holidaysTitle.className = 'section-title' ;
    holidaysTitle.textContent = 'National Holidays & Observances';
    container.appendChild(holidaysTitle);

    monthHolidays.forEach(holiday => {
      const card = document.createElement('div');
      card.className = `event-card ${getHolidayClass(holiday.type)}`;
      const dayNum = holiday.date.split('-')[2];
      card.innerHTML = `
        <div class="event-content">
          <div class="event-icon holiday-icon" style="background: var(--gray-800);">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>
          <div class="event-details">
            <h4>${holiday.name}</h4>
            <div class="event-info"><span>${holiday.date}</span></div>
            <div class="holiday-type">${holiday.type === 'national' ? 'National Holiday' : holiday.type === 'special' ? 'Special Non-Working Day' : 'Observance'}</div>
          </div>
        </div>`;
      container.appendChild(card);
    });
  }

  // Then show regular events
  if (monthEvents.length > 0) {
    const eventsTitle = document.createElement('h3');
    eventsTitle.className = 'section-title';
    eventsTitle.textContent = monthHolidays.length > 0 ? 'Other Events' : 'Events';
    container.appendChild(eventsTitle);

    monthEvents.forEach(event => {
      const card = document.createElement('div');
      card.className = 'event-card';
      card.innerHTML = `
        <div class="event-content">
          <div class="event-icon" style="background:${event.color}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M8 7V3h8v4" />
              <rect x="3" y="7" width="18" height="14" rx="2" />
            </svg>
          </div>
          <div class="event-details">
            <h4>${event.title}</h4>
            <div class="event-info"><span>${event.date || `${event.month + 1}/${event.day}/${event.year}`}</span></div>
            <div class="event-info"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 8v4l3 3"/></svg><span>${event.time}</span></div>
            <div class="event-info"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8c0 3.866 2.774 7.088 6.4 7.852"/></svg><span>${event.location}</span></div>
          </div>
        </div>`;
      container.appendChild(card);
    });
  }

  if (monthHolidays.length === 0 && monthEvents.length === 0) {
    container.innerHTML = '<div style="text-align:center;padding:2rem;color:#64748b;">No events or holidays scheduled for this month.</div>';
  }
}

export function changeMonth(delta) {
  state.currentMonth += delta;
  if (state.currentMonth < 0) {
    state.currentMonth = 11;
    state.currentYear -= 1;
  }
  if (state.currentMonth > 11) {
    state.currentMonth = 0;
    state.currentYear += 1;
  }
  generateCalendar('calendarGrid', false);
  generateCalendar('calendarGridFull', true);
  updateMonthDisplay();
  loadEvents();
}

export function initCalendar() {
  generateCalendar('calendarGrid', false);
  generateCalendar('calendarGridFull', true);
  updateMonthDisplay();
  loadEvents();
}
