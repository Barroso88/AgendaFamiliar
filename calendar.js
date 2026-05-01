// ==================== CALENDAR ====================
function renderCalendar(container) {
    const view = State.calendarView;
    const calendarVars = getCalendarThemeVars();
    
    let html = `
    <div class="fade-in calendar-shell rounded-[32px] p-1" style="${calendarVars}">
        <div class="calendar-panel rounded-[28px] overflow-hidden">
        <div class="flex flex-col md:flex-row items-center justify-between gap-4 px-4 lg:px-6 pt-5 pb-4">
            <div class="flex items-center justify-between w-full md:w-auto">
                <div class="flex items-center gap-2">
                    <button onclick="changeDate(-1)" class="calendar-nav-btn p-2 rounded-xl border shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
                    </button>
                    <div>
                        <p class="text-[9px] md:text-[10px] uppercase tracking-[0.28em] text-gray-400 dark:text-gray-500 mb-0.5 md:mb-1">Calendário</p>
                        <h3 class="text-base md:text-lg font-bold tracking-tight text-gray-900 dark:text-white">${getCurrentPeriodLabel()}</h3>
                    </div>
                    <button onclick="changeDate(1)" class="calendar-nav-btn p-2 rounded-xl border shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                    </button>
                </div>
                <button onclick="goToToday()" class="md:ml-2 px-3 py-1.5 text-xs md:text-sm rounded-full text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all calendar-accent-btn">Hoje</button>
            </div>
            <div class="flex items-center w-full md:w-auto gap-2 justify-between md:justify-end">
                <div class="inline-flex items-center gap-0.5 rounded-2xl border border-gray-200/80 dark:border-gray-700/80 bg-white/80 dark:bg-gray-800/80 p-1 shadow-sm overflow-x-auto" style="scrollbar-width: none;">
                    <button onclick="setCalendarView('day')" class="calendar-tab px-3 md:px-3.5 py-1.5 md:py-1.5 text-xs md:text-sm font-medium rounded-xl whitespace-nowrap ${view === 'day' ? 'active text-white' : 'text-gray-600 dark:text-gray-300'}">Dia</button>
                    <button onclick="setCalendarView('week')" class="calendar-tab px-3 md:px-3.5 py-1.5 md:py-1.5 text-xs md:text-sm font-medium rounded-xl whitespace-nowrap ${view === 'week' ? 'active text-white' : 'text-gray-600 dark:text-gray-300'}">Semana</button>
                    <button onclick="setCalendarView('month')" class="calendar-tab px-3 md:px-3.5 py-1.5 md:py-1.5 text-xs md:text-sm font-medium rounded-xl whitespace-nowrap ${view === 'month' ? 'active text-white' : 'text-gray-600 dark:text-gray-300'}">Mês</button>
                    <button onclick="setCalendarView('year')" class="calendar-tab px-3 md:px-3.5 py-1.5 md:py-1.5 text-xs md:text-sm font-medium rounded-xl whitespace-nowrap ${view === 'year' ? 'active text-white' : 'text-gray-600 dark:text-gray-300'}">Ano</button>
                </div>
                <button onclick="openEventModal()" class="px-3 md:px-4 py-1.5 md:py-2 text-white text-xs md:text-sm rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-1 calendar-accent-btn whitespace-nowrap">
                    <svg class="w-4 h-4 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                    Novo
                </button>
            </div>
        </div>
        
        <div class="calendar-filter-bar flex flex-wrap items-center gap-3 mx-4 lg:mx-6 mb-4 p-3 rounded-2xl shadow-sm">
            <span class="text-sm font-medium text-gray-500">Filtros:</span>
            <select onchange="State.filters.member=this.value; renderCalendar(document.getElementById('contentArea'))" class="calendar-select text-sm px-3 py-1.5 rounded-xl outline-none shadow-sm">
                <option value="all" ${State.filters.member === 'all' ? 'selected' : ''}>Todos os membros</option>
                ${State.members.map(m => `<option value="${m.id}" ${State.filters.member === m.id ? 'selected' : ''}>${m.name}</option>`).join('')}
            </select>
            <select onchange="State.filters.category=this.value; renderCalendar(document.getElementById('contentArea'))" class="calendar-select text-sm px-3 py-1.5 rounded-xl outline-none shadow-sm">
                <option value="all" ${State.filters.category === 'all' ? 'selected' : ''}>Todas as categorias</option>
                ${State.categories.map(c => `<option value="${c.id}" ${State.filters.category === c.id ? 'selected' : ''}>${c.name}</option>`).join('')}
            </select>
        </div>
        
        <div class="mx-4 lg:mx-6 pb-6">
            <div class="bg-transparent overflow-hidden">
                ${view === 'month' ? renderMonthView() : view === 'week' ? renderWeekView() : view === 'year' ? renderYearView() : renderDayView()}
            </div>
        </div>
        </div>
    </div>`;
    
    container.innerHTML = html;
}

function renderMonthView() {
    const year = State.currentDate.getFullYear();
    const month = State.currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDay = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
    const today = todayISO();
    
    let html = `
    <div class="calendar-panel rounded-3xl overflow-visible bg-transparent !border-none !shadow-none !p-0">
    <div class="grid grid-cols-7 gap-1.5 md:gap-3">
        ${['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map((d, idx) => {
            const weekendClass = idx === 5 ? 'weekend-sat' : idx === 6 ? 'weekend-sun' : '';
            return `<div class="calendar-weekday ${weekendClass} p-1.5 md:p-3 text-center text-[9px] md:text-[10px] uppercase tracking-[0.1em] md:tracking-[0.22em] font-semibold">${d}</div>`;
        }).join('')}`;
    
    // Empty cells before first day
    for (let i = 0; i < startDay; i++) {
        html += `<div class="calendar-day p-1 md:p-2 min-h-[45px] md:min-h-[80px] opacity-20 bg-gray-50/30 dark:bg-gray-800/20 border-dashed"></div>`;
    }
    
    // Days
    for (let day = 1; day <= lastDay.getDate(); day++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const isToday = dateStr === today;
        const weekdayIndex = (startDay + day - 1) % 7;
        const weekendClass = weekdayIndex === 5 ? 'weekend-sat' : weekdayIndex === 6 ? 'weekend-sun' : '';
        const dayEvents = getFilteredEvents().filter(e => isEventOnDate(e, dateStr));
        
        html += `<div role="button" tabindex="0" onclick="openTaskModal(null, '${dateStr}')" class="calendar-day ${weekendClass} p-1 md:p-2 min-h-[45px] md:min-h-[80px] ${isToday ? 'today' : ''} cursor-pointer group transition-all duration-300 relative">
            <div class="flex flex-col md:flex-row items-center md:justify-between mb-0.5 md:mb-2">
                <div class="text-[11px] md:text-sm font-bold ${isToday ? 'text-indigo-600 dark:text-indigo-300 md:scale-110 origin-left transition-transform' : 'text-gray-700 dark:text-gray-300'} group-hover:text-indigo-500 transition-colors">${day}</div>
                ${isToday ? '<span class="hidden md:inline-block calendar-badge bg-blue-600 text-[10px] px-2 py-0.5 rounded-full text-white shadow-md animate-pulse">Hoje</span>' : ''}
            </div>
            
            <div class="hidden md:block space-y-1 relative z-10">
                ${dayEvents.slice(0, 3).map(e => {
                    return `<div class="calendar-event-pill text-[10px] px-2 py-1 rounded-lg truncate cursor-pointer transition-all duration-200 hover:scale-[1.03] hover:-translate-y-0.5 hover:shadow-md active:scale-95" style="background: linear-gradient(135deg, #4ade80, #22c55e) !important; border: 1px solid #16a34a !important; box-shadow: 0 0 12px rgba(34,197,94,0.4) !important; color: #022c22 !important;" onclick="event.stopPropagation(); openEventModal(${e.id})" title="${e.title}"><span class="font-extrabold opacity-90 mr-1">${e.time ? e.time : ''}</span><span class="font-extrabold">${e.title}</span></div>`;
                }).join('')}
                ${dayEvents.length > 3 ? `<div class="text-[10px] font-medium text-gray-500 px-1 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-md inline-block mt-1">+${dayEvents.length - 3} mais</div>` : ''}
            </div>

            ${dayEvents.length > 0 ? `
            <div class="md:hidden flex justify-center flex-wrap gap-0.5 mt-0.5 relative z-10">
                ${dayEvents.slice(0, 3).map(e => `<span class="w-1.5 h-1.5 rounded-full ${getMemberBg(e.members[0], '500')}" title="${e.title}"></span>`).join('')}
                ${dayEvents.length > 3 ? `<span class="w-1.5 h-1.5 rounded-full bg-gray-400"></span>` : ''}
            </div>` : ''}
            
            <div class="absolute inset-0 bg-indigo-50/0 dark:bg-indigo-900/0 group-hover:bg-indigo-50/50 dark:group-hover:bg-indigo-900/20 transition-colors pointer-events-none"></div>
        </div>`;
    }
    
    html += '</div></div>';
    return html;
}

function renderWeekView() {
    const today = new Date();
    const dayOfWeek = today.getDay() === 0 ? 6 : today.getDay() - 1;
    const startOfWeek = new Date(State.currentDate);
    startOfWeek.setDate(State.currentDate.getDate() - dayOfWeek);
    const todayStr = todayISO();
    
    let html = `<div class="calendar-panel rounded-3xl overflow-hidden overflow-x-auto" style="scrollbar-width: thin;">
        <div class="min-w-[600px] md:min-w-0">
        <div class="grid grid-cols-7">`;
    
    // Header
    for (let i = 0; i < 7; i++) {
        const d = new Date(startOfWeek);
        d.setDate(startOfWeek.getDate() + i);
        const dateStr = d.toISOString().split('T')[0];
        const isToday = dateStr === todayStr;
        const weekendClass = i === 5 ? 'weekend-sat' : i === 6 ? 'weekend-sun' : '';
        html += `<div role="button" tabindex="0" onclick="openTaskModal(null, '${dateStr}')" class="calendar-week-header ${weekendClass} p-3 text-center cursor-pointer ${isToday ? 'calendar-week-header-today' : ''}">
            <div class="text-[10px] uppercase tracking-[0.22em] text-gray-500">${d.toLocaleDateString('pt-PT', { weekday: 'short' })}</div>
            <div class="mt-1 inline-flex items-center justify-center w-10 h-10 rounded-full text-lg font-bold ${isToday ? 'calendar-day-chip today-glow' : 'calendar-day-chip'}">${d.getDate()}</div>
        </div>`;
    }
    html += '</div>';
    
    // Time slots
    html += `<div class="grid grid-cols-7 divide-x divide-gray-100/70 dark:divide-gray-700/70">`;
    for (let i = 0; i < 7; i++) {
        const d = new Date(startOfWeek);
        d.setDate(startOfWeek.getDate() + i);
        const dateStr = d.toISOString().split('T')[0];
        const dayEvents = getFilteredEvents().filter(e => isEventOnDate(e, dateStr));
        const weekendClass = i === 5 ? 'weekend-sat' : i === 6 ? 'weekend-sun' : '';
        
        html += `<div role="button" tabindex="0" onclick="openTaskModal(null, '${dateStr}')" class="calendar-week-column ${weekendClass} p-2 min-h-[420px] cursor-pointer ${dateStr === todayStr ? 'calendar-week-column-today' : ''}">`;
        for (let hour = 7; hour <= 21; hour++) {
            const hourEvents = dayEvents.filter(e => {
                const h = parseInt((e.time || '').split(':')[0]);
                return h === hour;
            });
            html += `<div class="text-[10px] text-gray-400 border-t border-gray-50/80 dark:border-gray-700/70 py-1">${String(hour).padStart(2, '0')}:00</div>`;
            hourEvents.forEach(e => {
                const pillGlow = dateStr === todayStr ? 'today-glow' : '';
                html += `<div class="calendar-event-pill text-[10px] p-2 rounded-xl mb-1.5 cursor-pointer ${pillGlow} transition-all hover:scale-[1.02] active:scale-95" style="background: linear-gradient(135deg, #4ade80, #22c55e) !important; border: 1px solid #16a34a !important; box-shadow: 0 0 12px rgba(34,197,94,0.4) !important; color: #022c22 !important;" onclick="event.stopPropagation(); openEventModal(${e.id})"><span class="font-bold mr-1 opacity-90">${e.time || ''}</span><span class="font-bold">${e.title}</span></div>`;
            });
        }
        html += '</div>';
    }
    html += '</div></div></div>';
    return html;
}

function renderDayView() {
    const dateStr = State.currentDate.toISOString().split('T')[0];
    const dayEvents = getFilteredEvents().filter(e => isEventOnDate(e, dateStr)).sort((a, b) => (a.time || '').localeCompare(b.time || ''));
    const isToday = dateStr === todayISO();
    const displayDate = formatDate(dateStr);
    
    let html = `
    <div class="calendar-panel rounded-3xl overflow-hidden border border-gray-200/70 dark:border-gray-700/70 p-4">
        <div role="button" tabindex="0" onclick="openTaskModal(null, '${dateStr}')" class="text-center mb-4 cursor-pointer">
            <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 dark:bg-gray-800/80 border border-gray-200/70 dark:border-gray-700/70 shadow-sm mb-3">
                <span class="h-2 w-2 rounded-full ${isToday ? 'bg-indigo-500 today-glow' : 'bg-gray-400'}"></span>
                <span class="text-xs uppercase tracking-[0.22em] text-gray-500">${isToday ? 'Data atual' : 'Agenda diária'}</span>
            </div>
            <h3 class="text-xl font-bold ${isToday ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-900 dark:text-white'}">${displayDate}</h3>
            <p class="text-sm text-gray-500 mt-1">${dayEvents.length} eventos</p>
        </div>
        <div class="space-y-2">`;
    
    if (dayEvents.length === 0) {
        html += '<p class="text-center text-gray-500 py-8">Sem eventos para este dia</p>';
    } else {
        dayEvents.forEach(e => {
            html += `
            <div class="flex items-start gap-4 p-4 rounded-2xl cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ${isToday ? 'today-glow' : ''}" style="background: linear-gradient(135deg, #4ade80, #22c55e) !important; border: 1px solid #16a34a !important; box-shadow: 0 0 16px rgba(34,197,94,0.4) !important; color: #022c22 !important;" onclick="openEventModal(${e.id})">
                <div class="text-center min-w-[65px] pt-1">
                    <div class="text-sm font-extrabold" style="color: rgba(2, 44, 34, 0.9) !important;">${e.time || '--:--'}</div>
                    ${e.endTime ? `<div class="text-[10px] font-bold uppercase tracking-wider mt-0.5" style="color: rgba(2, 44, 34, 0.6) !important;">${e.endTime}</div>` : ''}
                </div>
                <div class="flex-1" style="color: #022c22 !important;">
                    <div class="font-bold">${e.title}</div>
                    ${e.description ? `<div class="text-sm text-gray-500 mt-1">${e.description}</div>` : ''}
                    ${e.location ? `<div class="text-xs text-gray-400 mt-1">📍 ${e.location}</div>` : ''}
                    <div class="flex items-center gap-2 mt-2">
                        <span class="text-xs px-2 py-0.5 rounded-full ${getCategoryColor(e.category)}">${getCategoryName(e.category)}</span>
                        <div class="flex -space-x-1">
                            ${e.members.map(m => `<div class="w-5 h-5 rounded-full ${getMemberColor(m)} flex items-center justify-center text-[10px]">${getMember(m).avatar}</div>`).join('')}
                        </div>
                    </div>
                </div>
                    <button onclick="event.stopPropagation(); openEventModal(${e.id})" class="p-2 rounded-xl hover:bg-white dark:hover:bg-gray-700 opacity-0 group-hover:opacity-100 transition-opacity">
                        <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                    </button>
                    <button onclick="event.stopPropagation(); deleteEvent(${e.id})" class="p-2 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 opacity-0 group-hover:opacity-100 transition-opacity">
                        <svg class="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                    </button>
                </div>
            </div>`;
        });
    }
    
    html += '</div></div>';
    return html;
}

function renderYearView() {
    const year = State.currentDate.getFullYear();
    const today = todayISO();
    const monthLabels = Array.from({ length: 12 }, (_, monthIndex) => {
        const firstDay = new Date(year, monthIndex, 1);
        const lastDay = new Date(year, monthIndex + 1, 0);
        const startDay = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
            const monthName = titleCase(firstDay.toLocaleDateString('pt-PT', { month: 'long' }));
        let monthHtml = `
        <div role="button" tabindex="0" onclick="State.currentDate=new Date(${year}, ${monthIndex}, 1); setCalendarView('month')" class="calendar-tab calendar-year-card text-left rounded-2xl p-4 shadow-sm hover:shadow-lg transition-all cursor-pointer">
            <div class="flex items-center justify-between mb-3">
                <div>
                    <p class="text-[10px] uppercase tracking-[0.28em] text-gray-400">Mês</p>
                    <h4 class="text-lg font-semibold text-gray-900 dark:text-white">${monthName}</h4>
                </div>
                <span class="calendar-badge bg-blue-600 text-xs px-2 py-1 rounded-full text-white">${lastDay.getDate()}</span>
            </div>
            <div class="grid grid-cols-7 gap-1 text-[10px] text-gray-400 mb-2">
                ${['S', 'T', 'Q', 'Q', 'S', 'S', 'D'].map((day, idx) => {
                    const weekendClass = idx === 5 ? 'weekend-sat' : idx === 6 ? 'weekend-sun' : '';
                    return `<span class="calendar-weekday-mini ${weekendClass} text-center">${day}</span>`;
                }).join('')}
            </div>
            <div class="grid grid-cols-7 gap-1">`;

        for (let i = 0; i < startDay; i++) {
            monthHtml += '<div class="calendar-mini-day"></div>';
        }

        for (let day = 1; day <= lastDay.getDate(); day++) {
            const dateStr = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayEvents = getFilteredEvents().filter(e => isEventOnDate(e, dateStr));
            const isToday = dateStr === today;
            const weekdayIndex = (startDay + day - 1) % 7;
            const weekendClass = weekdayIndex === 5 ? 'weekend-sat' : weekdayIndex === 6 ? 'weekend-sun' : '';
            const isHoliday = dayEvents.some(e => e.category === 'feriado');
            const baseClass = isToday ? 'today-glow' : isHoliday ? 'calendar-mini-holiday' : 'calendar-mini-default';
            monthHtml += `
                <button type="button" onclick="event.stopPropagation(); State.currentDate=new Date('${dateStr}T00:00:00'); setCalendarView('day')" class="calendar-mini-day ${isToday ? 'today' : ''} ${weekendClass === 'weekend-sat' ? 'calendar-mini-weekend-sat' : weekendClass === 'weekend-sun' ? 'calendar-mini-weekend-sun' : ''} flex items-center justify-center rounded-full text-xs font-medium ${baseClass}">
                    ${day}
                    ${dayEvents.length ? `<span class="ml-1 text-[9px] opacity-80">${dayEvents.length}</span>` : ''}
                </button>`;
        }

        monthHtml += `
            </div>
        </div>`;
        return monthHtml;
    });

    return `
    <div class="calendar-panel rounded-3xl overflow-hidden border border-gray-200/70 dark:border-gray-700/70 p-4 lg:p-6">
        <div class="flex items-center justify-between gap-3 mb-4">
            <div>
                <p class="text-[10px] uppercase tracking-[0.28em] text-gray-400 dark:text-gray-500">Vista anual</p>
                <h3 class="text-xl font-bold text-gray-900 dark:text-white">${year}</h3>
            </div>
            <div class="text-xs text-gray-500 dark:text-gray-400">Clique num mês para abrir a vista mensal</div>
        </div>
        <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            ${monthLabels.join('')}
        </div>
    </div>`;
}

function getFilteredEvents() {
    let events = [...State.events];
    if (State.filters.member !== 'all') events = events.filter(e => e.members.includes(State.filters.member));
    if (State.filters.category !== 'all') events = events.filter(e => e.category === State.filters.category);
    return events;
}

function getCurrentPeriodLabel() {
    const d = State.currentDate;
    const view = State.calendarView;
    if (view === 'day') return formatDate(d.toISOString().split('T')[0]);
    if (view === 'week') {
        const dayOfWeek = d.getDay() === 0 ? 6 : d.getDay() - 1;
        const start = new Date(d); start.setDate(d.getDate() - dayOfWeek);
        const end = new Date(start); end.setDate(start.getDate() + 6);
        return `${titleCase(start.toLocaleDateString('pt-PT', { day: 'numeric', month: 'short' }))} - ${titleCase(end.toLocaleDateString('pt-PT', { day: 'numeric', month: 'short', year: 'numeric' }))}`;
    }
    if (view === 'year') return `${d.getFullYear()}`;
    return `${titleCase(d.toLocaleDateString('pt-PT', { month: 'long' }))} ${d.getFullYear()}`;
}

function setCalendarView(view) {
    State.calendarView = view;
    renderCalendar(document.getElementById('contentArea'));
}

function changeDate(direction) {
    const d = new Date(State.currentDate);
    const view = State.calendarView;
    if (view === 'day') d.setDate(d.getDate() + direction);
    else if (view === 'week') d.setDate(d.getDate() + (direction * 7));
    else if (view === 'year') d.setFullYear(d.getFullYear() + direction);
    else d.setMonth(d.getMonth() + direction);
    State.currentDate = d;
    renderCalendar(document.getElementById('contentArea'));
}

function goToToday() {
    State.currentDate = new Date();
    renderCalendar(document.getElementById('contentArea'));
}

// ==================== EVENT MODAL ====================
function openEventModal(eventId = null) {
    const event = eventId ? State.events.find(e => e.id === eventId) : null;
    const isEdit = !!event;
    
    const content = `
    <div class="p-6">
        <div class="flex items-center justify-between mb-6">
            <h3 class="text-xl font-bold">${isEdit ? 'Editar Evento' : 'Novo Evento'}</h3>
            <button onclick="closeModal()" class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
        </div>
        <form onsubmit="saveEvent(event, ${eventId || 'null'})" class="space-y-4">
            <div>
                <label class="block text-sm font-medium mb-1">Título *</label>
                <input type="text" id="evtTitle" value="${isEdit ? event.title : ''}" required class="w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 border-0 outline-none focus:ring-2 focus:ring-indigo-500">
            </div>
            <div>
                <label class="block text-sm font-medium mb-1">Descrição</label>
                <textarea id="evtDesc" rows="2" class="w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 border-0 outline-none focus:ring-2 focus:ring-indigo-500">${isEdit ? event.description || '' : ''}</textarea>
            </div>
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm font-medium mb-1">Data início *</label>
                    <input type="date" id="evtDate" value="${isEdit ? event.date : todayISO()}" required class="w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 border-0 outline-none focus:ring-2 focus:ring-indigo-500">
                </div>
                <div>
                    <label class="block text-sm font-medium mb-1">Data fim (Opcional)</label>
                    <input type="date" id="evtEndDate" value="${isEdit ? event.endDate || '' : ''}" class="w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 border-0 outline-none focus:ring-2 focus:ring-indigo-500">
                </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
                <div class="grid grid-cols-2 gap-2">
                    <div>
                        <label class="block text-sm font-medium mb-1">Hora início</label>
                        <input type="time" id="evtTime" value="${isEdit ? event.time || '' : ''}" class="w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 border-0 outline-none focus:ring-2 focus:ring-indigo-500">
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-1">Hora fim</label>
                        <input type="time" id="evtEndTime" value="${isEdit ? event.endTime || '' : ''}" class="w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 border-0 outline-none focus:ring-2 focus:ring-indigo-500">
                    </div>
                </div>
                <div>
                    <label class="block text-sm font-medium mb-1">Local</label>
                    <input type="text" id="evtLocation" value="${isEdit ? event.location || '' : ''}" class="w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 border-0 outline-none focus:ring-2 focus:ring-indigo-500">
                </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm font-medium mb-1">Categoria</label>
                    <select id="evtCategory" class="w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 border-0 outline-none focus:ring-2 focus:ring-indigo-500">
                        ${State.categories.map(c => `<option value="${c.id}" ${isEdit && event.category === c.id ? 'selected' : ''}>${c.name}</option>`).join('')}
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-medium mb-1">Membros</label>
                    <select id="evtMembers" multiple class="w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 border-0 outline-none focus:ring-2 focus:ring-indigo-500 h-20">
                        ${State.members.map(m => `<option value="${m.id}" ${isEdit && event.members.includes(m.id) ? 'selected' : ''}>${m.name}</option>`).join('')}
                    </select>
                </div>
            </div>
            <div class="flex items-center gap-2">
                <input type="checkbox" id="evtReminder" ${isEdit && event.reminder ? 'checked' : ''} class="checkbox-custom">
                <label for="evtReminder" class="text-sm">Ativar lembrete</label>
            </div>
            <div class="flex gap-3 pt-2">
                <button type="button" onclick="closeModal()" class="flex-1 px-4 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-200 dark:hover:bg-gray-600">Cancelar</button>
                <button type="submit" class="flex-1 px-4 py-2.5 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700">${isEdit ? 'Guardar' : 'Criar Evento'}</button>
            </div>
        </form>
    </div>`;
    
    openModal(content);
}

async function saveEvent(e, eventId) {
    e.preventDefault();
    const members = Array.from(document.getElementById('evtMembers').selectedOptions).map(o => o.value);
    
    const eventData = {
        id: eventId || Date.now(),
        title: document.getElementById('evtTitle').value,
        description: document.getElementById('evtDesc').value,
        date: document.getElementById('evtDate').value,
        endDate: document.getElementById('evtEndDate').value || null,
        time: document.getElementById('evtTime').value,
        endTime: document.getElementById('evtEndTime').value,
        location: document.getElementById('evtLocation').value,
        category: document.getElementById('evtCategory').value,
        members: members.length ? members : [State.members[0].id],
        reminder: document.getElementById('evtReminder').checked
    };
    
    if (eventId) {
        const idx = State.events.findIndex(ev => ev.id === eventId);
        State.events[idx] = eventData;
        showToast('Evento atualizado!');
    } else {
        State.events.push(eventData);
        showToast('Evento criado!');
    }
    
    await State.saveData(); // <-- CORRIGIDO AQUI
    closeModal();
    renderPage();
}

async function deleteEvent(id) {
    if (confirm('Tem a certeza que deseja eliminar este evento?')) {
        State.events = State.events.filter(e => e.id !== id);
        await State.saveData(); // <-- CORRIGIDO AQUI
        showToast('Evento eliminado', 'warning');
        renderPage();
    }
}

// ==================== EVENTS LIST PAGE ====================
function renderEventsList(container) {
    const sortedEvents = [...State.events].sort((a, b) => {
        return new Date(a.date) - new Date(b.date) || (a.time || '').localeCompare(b.time || '');
    });
    
    let html = `
    <div class="fade-in space-y-6">
        <div class="flex items-center justify-between mb-6">
            <h2 class="text-2xl font-bold">Eventos Agendados</h2>
            <button onclick="openEventModal()" class="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-md">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                Novo Evento
            </button>
        </div>
        
        <div class="grid gap-3">
    `;
    
    if (sortedEvents.length === 0) {
        html += '<p class="text-gray-500 text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">Nenhum evento agendado. Cria o teu primeiro evento!</p>';
    } else {
        const todayStr = todayISO();
        sortedEvents.forEach(e => {
            const isPast = e.endDate ? e.endDate < todayStr : e.date < todayStr;
            const isUpcoming = e.date > todayStr;
            const isOngoing = !isPast && !isUpcoming;
            const opacityClass = isPast ? 'opacity-60 grayscale-[0.2]' : '';
            const borderClass = isOngoing ? 'border-indigo-400 dark:border-indigo-500 shadow-md ring-1 ring-indigo-500/20' : 'border-gray-100 dark:border-gray-700 hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600';
            
            html += `
                <div class="bg-white dark:bg-gray-800 rounded-xl p-4 border transition-all relative overflow-hidden ${borderClass} ${opacityClass} flex flex-col md:flex-row gap-4 items-start md:items-center group">
                    <div class="flex flex-col items-center justify-center min-w-[70px] bg-gray-50 dark:bg-gray-900/50 rounded-lg p-2 border border-gray-100 dark:border-gray-700">
                        <span class="text-xs text-gray-500 uppercase font-semibold tracking-wider">${new Date(e.date + 'T00:00:00').toLocaleDateString('pt-PT', { month: 'short' })}</span>
                        <span class="text-2xl font-bold text-gray-900 dark:text-gray-100 leading-none my-0.5">${new Date(e.date + 'T00:00:00').getDate()}</span>
                        <span class="text-[10px] text-gray-400">${new Date(e.date + 'T00:00:00').getFullYear()}</span>
                    </div>
                    
                    <div class="flex-1 min-w-0 w-full">
                        <div class="flex flex-wrap items-center gap-2 mb-1">
                            <h3 class="font-bold text-lg text-gray-900 dark:text-gray-100">${e.title}</h3>
                            <span class="text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold ${getCategoryColor(e.category)}">${getCategoryName(e.category)}</span>
                            ${isOngoing ? '<span class="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 font-bold animate-pulse">HOJE</span>' : ''}
                            ${isPast ? '<span class="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400 font-semibold">Passado</span>' : ''}
                        </div>
                        <div class="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mt-1">
                            ${e.endDate ? `<span class="flex items-center gap-1"><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7"/></svg> Até ${formatShortDate(e.endDate)}</span>` : ''}
                            ${e.time ? `<span class="flex items-center gap-1"><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg> ${e.time}${e.endTime ? ' - ' + e.endTime : ''}</span>` : ''}
                            ${e.location ? `<span class="flex items-center gap-1"><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg> ${e.location}</span>` : ''}
                        </div>
                        ${e.description ? `<p class="text-sm mt-2 text-gray-600 dark:text-gray-300 line-clamp-2">${e.description}</p>` : ''}
                    </div>
                    
                    <div class="flex items-center justify-between md:justify-end gap-4 mt-2 md:mt-0 w-full md:w-auto">
                        <div class="flex -space-x-2">
                            ${e.members.map(m => `<div class="w-8 h-8 rounded-full ${getMemberColor(m)} flex items-center justify-center text-xs border-2 border-white dark:border-gray-800 shadow-sm" title="${getMember(m).name}">${getMember(m).avatar}</div>`).join('')}
                        </div>
                        <div class="flex gap-1">
                            <button onclick="openEventModal(${e.id})" class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400" title="Editar evento">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                            </button>
                            <button onclick="deleteEvent(${e.id})" class="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-gray-400 hover:text-red-600 dark:hover:text-red-400" title="Eliminar evento">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });
    }
    
    html += `
        </div>
    </div>`;
    
    container.innerHTML = html;
}
