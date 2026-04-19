// ==================== RENDER PAGES ====================
function renderPage() {
    const content = document.getElementById('contentArea');
    const renderers = {
        dashboard: renderDashboard,
        calendar: renderCalendar,
        shopping: renderShopping,
        shopping_market: renderShoppingFocus,
        tasks: renderTasks,
        gucci: renderGucci,
        sofia: renderSofia,
        andre: renderAndre,
        nayara: renderNayara,
        profiles: renderProfiles
    };
    const renderer = renderers[State.currentPage] || renderDashboard;
    content.innerHTML = '';
    renderer(content);
}

// ==================== DASHBOARD ====================
function renderDashboard(container) {
    const today = todayISO();
    const todayEvents = State.events.filter(e => e.date === today).sort((a, b) => (a.time || '').localeCompare(b.time || ''));
    const weekEvents = State.events.filter(e => isThisWeek(e.date) && e.date !== today).sort((a, b) => a.date.localeCompare(b.date));
    const pendingShopping = State.shoppingItems.filter(i => !i.bought);
    const urgentShopping = pendingShopping.filter(i => i.priority === 'alta');
    const pendingTasks = State.tasks.filter(t => !t.completed);
    const urgentTasks = pendingTasks.filter(t => { const d = new Date(t.dueDate); const now = new Date(); return d <= now; });
    
    let html = `
    <div class="fade-in space-y-6">
        <!-- Welcome -->
        <div class="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white">
            <h2 class="text-2xl font-bold mb-1">${getGreeting()}</h2>
            <p class="text-indigo-100">${formatDate(today)} • ${todayEvents.length} eventos hoje</p>
        </div>
        
        <!-- Quick Stats -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <button type="button" onclick="navigateTo('calendar')" class="text-left bg-white dark:bg-gray-800 rounded-xl p-4 card-hover border border-gray-100 dark:border-gray-700 w-full">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-blue-600">📅</div>
                    <div>
                        <p class="text-2xl font-bold">${todayEvents.length}</p>
                        <p class="text-xs text-gray-500">Eventos Hoje</p>
                    </div>
                </div>
            </button>
            <button type="button" onclick="navigateTo('shopping_market')" class="text-left bg-white dark:bg-gray-800 rounded-xl p-4 card-hover border border-gray-100 dark:border-gray-700 w-full">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center text-amber-600">🛒</div>
                    <div>
                        <p class="text-2xl font-bold">${pendingShopping.length}</p>
                        <p class="text-xs text-gray-500">Itens por Comprar</p>
                    </div>
                </div>
            </button>
            <button type="button" onclick="navigateTo('tasks')" class="text-left bg-white dark:bg-gray-800 rounded-xl p-4 card-hover border border-gray-100 dark:border-gray-700 w-full">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center text-green-600">✅</div>
                    <div>
                        <p class="text-2xl font-bold">${pendingTasks.length}</p>
                        <p class="text-xs text-gray-500">Tarefas Pendentes</p>
                    </div>
                </div>
            </button>
            <button type="button" onclick="navigateTo('${urgentShopping.length ? 'shopping_market' : 'tasks'}')" class="text-left bg-white dark:bg-gray-800 rounded-xl p-4 card-hover border border-gray-100 dark:border-gray-700 w-full">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center text-red-600">⚠️</div>
                    <div>
                        <p class="text-2xl font-bold">${urgentTasks.length + urgentShopping.length}</p>
                        <p class="text-xs text-gray-500">Alertas Urgentes</p>
                    </div>
                </div>
            </button>
        </div>
        
        <!-- Main Grid -->
        <div class="grid lg:grid-cols-3 gap-6">
            <!-- Today's Events -->
            <div class="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="font-bold text-lg">📅 Eventos de Hoje</h3>
                    <button onclick="navigateTo('calendar')" class="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">Ver calendário</button>
                </div>
                ${todayEvents.length ? `
                    <div class="space-y-2">
                        ${todayEvents.map(e => `
                            <div class="flex items-center gap-3 p-3 rounded-lg ${getMemberBg(e.members[0], '50')} border border-gray-100 dark:border-gray-700">
                                <div class="w-2 h-2 rounded-full ${getMemberColor(e.members[0]).split(' ')[0]}"></div>
                                <div class="flex-1 min-w-0">
                                    <div class="font-medium text-sm truncate">${e.title}</div>
                                    <div class="text-xs text-gray-500">${e.time || ''} ${e.location ? '• ' + e.location : ''}</div>
                                </div>
                                <span class="text-xs px-2 py-1 rounded-full ${getCategoryColor(e.category)}">${getCategoryName(e.category)}</span>
                            </div>
                        `).join('')}
                    </div>
                ` : '<p class="text-gray-500 text-sm py-4">Sem eventos para hoje 🎉</p>'}
            </div>
            
            <!-- Urgent Items -->
            <div class="h-full min-h-[420px] bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 flex flex-col">
                <h3 class="font-bold text-lg mb-4">⚠️ Urgente</h3>
                ${urgentShopping.length ? `
                    <div class="mb-3">
                        <p class="text-xs font-semibold text-gray-500 mb-2">COMPRAS</p>
                        ${urgentShopping.map(i => `
                            <div class="flex items-center gap-2 p-2 rounded-lg bg-red-50 dark:bg-red-900/20 mb-1">
                                <span class="text-red-500 text-sm">🔴</span>
                                <span class="text-sm flex-1">${i.name}</span>
                                <span class="text-xs text-gray-500">x${i.quantity}</span>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
                ${urgentTasks.length ? `
                    <div>
                        <p class="text-xs font-semibold text-gray-500 mb-2">TAREFAS</p>
                        ${urgentTasks.map(t => {
                            const member = getMember(t.assignedTo);
                            return `
                            <div class="flex items-center gap-2 p-2 rounded-lg bg-orange-50 dark:bg-orange-900/20 mb-1">
                                <span class="text-orange-500 text-sm">⏰</span>
                                <span class="text-sm flex-1">${t.title}</span>
                                <span class="text-xs px-1.5 py-0.5 rounded ${getMemberColor(member.id)}">${member.avatar}</span>
                            </div>
                        `}).join('')}
                    </div>
                ` : ''}
                ${!urgentShopping.length && !urgentTasks.length ? '<p class="text-gray-500 text-sm">Tudo em dia! ✅</p>' : ''}
            </div>
        </div>
        
        <!-- Upcoming Events & Pending Tasks -->
        <div class="grid lg:grid-cols-2 gap-6">
            <!-- This Week -->
            <div class="h-full min-h-[420px] bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 flex flex-col">
                <h3 class="font-bold text-lg mb-4">📆 Esta Semana</h3>
                ${weekEvents.length ? `
                    <div class="space-y-2">
                        ${weekEvents.slice(0, 5).map(e => `
                            <div class="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                <div class="text-center min-w-[50px]">
                                    <div class="text-xs text-gray-500">${new Date(e.date + 'T00:00:00').toLocaleDateString('pt-PT', { weekday: 'short' })}</div>
                                    <div class="font-bold text-lg">${new Date(e.date + 'T00:00:00').getDate()}</div>
                                </div>
                                <div class="flex-1 min-w-0">
                                    <div class="font-medium text-sm truncate">${e.title}</div>
                                    <div class="text-xs text-gray-500">${e.time || ''}</div>
                                </div>
                                <div class="flex -space-x-1">
                                    ${e.members.map(m => `<div class="w-6 h-6 rounded-full ${getMemberColor(m)} flex items-center justify-center text-xs">${getMember(m).avatar}</div>`).join('')}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                ` : '<p class="text-gray-500 text-sm">Sem eventos esta semana</p>'}
            </div>
            
            <!-- Member Overview -->
            <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
                <h3 class="font-bold text-lg mb-4">👨‍👩‍👧‍🐕 Resumo por Membro</h3>
                <div class="space-y-3">
                    ${State.members.map(m => {
                        const memberEvents = State.events.filter(e => e.members.includes(m.id) && isThisWeek(e.date));
                        const memberTasks = State.tasks.filter(t => t.assignedTo === m.id && !t.completed);
                        return `
                        <div class="flex items-center gap-3 p-3 rounded-lg ${getMemberBg(m.id)}">
                            <div class="w-10 h-10 rounded-full ${getMemberColor(m.id)} flex items-center justify-center text-sm font-bold">${m.avatar}</div>
                            <div class="flex-1">
                                <div class="font-medium">${m.name} <span class="text-xs text-gray-500">(${m.role})</span></div>
                                <div class="text-xs text-gray-500">${memberEvents.length} eventos esta semana • ${memberTasks.length} tarefas pendentes</div>
                            </div>
                            <button onclick="State.filters.member='${m.id}'; navigateTo('calendar')" class="text-xs px-2 py-1 rounded-lg bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600">Ver</button>
                        </div>
                        `;
                    }).join('')}
                </div>
            </div>
        </div>
    </div>`;
    
    container.innerHTML = html;
}

// ==================== GUCCI AREA ====================
function renderGucci(container) {
    const gucciEvents = State.events.filter(e => e.category === 'gucci' || e.members.includes('gucci'));
    const gucciTasks = State.tasks.filter(t => t.category === 'gucci' || t.assignedTo === 'gucci');
    const gucciShopping = State.shoppingItems.filter(i => i.category === 'animais');
    
    const getEventMoment = (event) => new Date(`${event.date}T${event.time || '00:00'}`);
    const upcomingVet = gucciEvents.filter(e => e.date >= todayISO() && (e.title.toLowerCase().includes('consulta') || e.title.toLowerCase().includes('vet'))).sort((a, b) => a.date.localeCompare(b.date));
    const upcomingVaccine = gucciEvents.filter(e => e.title.toLowerCase().includes('vacina') || e.title.toLowerCase().includes('desparasit')).sort((a, b) => a.date.localeCompare(b.date));
    const gucciConsultEvents = gucciEvents.filter(e => e.title.toLowerCase().includes('consulta') || e.title.toLowerCase().includes('vet'));
    const lastConsult = [...gucciConsultEvents].filter(e => getEventMoment(e) <= new Date()).sort((a, b) => getEventMoment(b) - getEventMoment(a))[0];
    const nextConsult = [...gucciConsultEvents].filter(e => getEventMoment(e) > new Date()).sort((a, b) => getEventMoment(a) - getEventMoment(b))[0];
    const gucciVaccineEvents = gucciEvents.filter(e => e.title.toLowerCase().includes('vacina') || e.title.toLowerCase().includes('desparasit'));
    const lastVaccine = [...gucciVaccineEvents].filter(e => getEventMoment(e) <= new Date()).sort((a, b) => getEventMoment(b) - getEventMoment(a))[0];
    const nextVaccine = [...gucciVaccineEvents].filter(e => getEventMoment(e) > new Date()).sort((a, b) => getEventMoment(a) - getEventMoment(b))[0];
    const gucciBathEvents = gucciEvents.filter(e => e.title.toLowerCase().includes('banho'));
    const lastBath = [...gucciBathEvents].filter(e => e.date <= todayISO()).sort((a, b) => b.date.localeCompare(a.date))[0];
    const gucciTosaEvents = gucciEvents.filter(e => e.title.toLowerCase().includes('tosa'));
    const lastTosa = [...gucciTosaEvents].filter(e => e.date <= todayISO()).sort((a, b) => b.date.localeCompare(a.date))[0];
    
    let html = `
    <div class="fade-in">
        <!-- Header -->
        <!-- Quick Stats -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div class="bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-amber-900/25 dark:via-orange-900/25 dark:to-yellow-900/25 rounded-xl p-4 card-hover border border-amber-100 dark:border-amber-800 shadow-lg shadow-amber-500/10">
                <div class="flex items-start justify-between gap-3 mb-2">
                    <div class="text-2xl">🏥</div>
                    <span class="text-[10px] font-semibold uppercase tracking-[0.18em] px-2 py-1 rounded-full bg-white/70 dark:bg-gray-900/40 text-amber-700 dark:text-amber-200 border border-amber-100 dark:border-amber-800">Próxima</span>
                </div>
                <p class="text-sm font-semibold text-gray-900 dark:text-gray-100 leading-tight">${nextConsult ? nextConsult.title : 'Sem consulta futura'}</p>
                <p class="text-xl font-bold text-amber-700 dark:text-amber-200 mt-1">${nextConsult ? `${new Date(nextConsult.date + 'T00:00:00').toLocaleDateString('pt-PT', { weekday: 'short', day: '2-digit', month: 'short' })}` : '—'}</p>
                <p class="text-sm font-medium text-amber-700/90 dark:text-amber-200/90">${nextConsult ? `${nextConsult.time || 'Sem hora'}` : 'Adiciona uma nova consulta'}</p>
            </div>
            <div class="bg-gradient-to-br from-rose-50 via-pink-50 to-fuchsia-50 dark:from-rose-900/25 dark:via-pink-900/25 dark:to-fuchsia-900/25 rounded-xl p-4 card-hover border border-rose-100 dark:border-rose-800 shadow-lg shadow-rose-500/10">
                <div class="flex items-start justify-between gap-3 mb-2">
                    <div class="text-2xl">💉</div>
                    <span class="text-[10px] font-semibold uppercase tracking-[0.18em] px-2 py-1 rounded-full bg-white/70 dark:bg-gray-900/40 text-rose-700 dark:text-rose-200 border border-rose-100 dark:border-rose-800">Próxima</span>
                </div>
                <p class="text-sm font-semibold text-gray-900 dark:text-gray-100 leading-tight">${nextVaccine ? nextVaccine.title : 'Sem vacina futura'}</p>
                <p class="text-xl font-bold text-rose-700 dark:text-rose-200 mt-1">${nextVaccine ? `${new Date(nextVaccine.date + 'T00:00:00').toLocaleDateString('pt-PT', { weekday: 'short', day: '2-digit', month: 'short' })}` : '—'}</p>
                <p class="text-sm font-medium text-rose-700/90 dark:text-rose-200/90">${nextVaccine ? `${nextVaccine.time || 'Sem hora'}` : 'Adiciona uma nova vacina'}</p>
            </div>
        </div>
        
        <div class="grid lg:grid-cols-2 gap-6">
            <!-- Veterinary & Health -->
            <div class="h-full min-h-[420px] bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-amber-900/20 dark:via-orange-900/20 dark:to-yellow-900/20 rounded-xl border border-amber-100 dark:border-amber-800 p-4 flex flex-col">
                <h3 class="font-bold text-lg mb-4 flex items-center gap-2">🏥 Veterinário</h3>
                <div class="mb-4 p-4 bg-white/70 dark:bg-gray-900/25 rounded-2xl border border-amber-100 dark:border-amber-800">
                    <div class="flex items-center justify-between gap-3 mb-3">
                        <div>
                            <p class="text-sm font-semibold">Registar veterinário</p>
                            <p class="text-xs text-gray-500">Data e hora da próxima marcação</p>
                        </div>
                        <span class="text-lg">🏥</span>
                    </div>
                    <div class="grid grid-cols-2 gap-2 mb-2">
                        <input type="date" id="gucciConsultDate" value="${todayISO()}" class="px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-amber-100 dark:border-amber-800 text-sm outline-none focus:ring-2 focus:ring-amber-500">
                        <input type="time" id="gucciConsultTime" value="${new Date().toTimeString().slice(0,5)}" class="px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-amber-100 dark:border-amber-800 text-sm outline-none focus:ring-2 focus:ring-amber-500">
                    </div>
                    <input type="text" id="gucciConsultNote" placeholder="Notas da marcação (opcional)" class="w-full px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-amber-100 dark:border-amber-800 text-sm outline-none focus:ring-2 focus:ring-amber-500 mb-3">
                    <button type="button" onclick="registerGucciConsult()" class="w-full px-4 py-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-semibold shadow-lg shadow-amber-500/25 hover:shadow-xl hover:-translate-y-0.5 transition-all">
                        Registar veterinário
                    </button>
                </div>
                <div class="grid gap-3">
                    <div class="p-3 rounded-xl bg-white/70 dark:bg-gray-900/25 border border-rose-100 dark:border-rose-800">
                        <div class="flex items-center justify-between gap-2 mb-2">
                            <p class="text-xs font-semibold uppercase tracking-wide text-rose-600 dark:text-rose-300">Último Veterinário</p>
                            ${lastConsult ? `
                                <div class="flex items-center gap-1">
                                    <button type="button" onclick="openEventModal(${lastConsult.id})" class="p-1.5 rounded-lg hover:bg-white/70 dark:hover:bg-gray-700/60 text-rose-600 dark:text-rose-300" title="Editar veterinário">✏️</button>
                                    <button type="button" onclick="deleteEvent(${lastConsult.id})" class="p-1.5 rounded-lg hover:bg-white/70 dark:hover:bg-gray-700/60 text-rose-600 dark:text-rose-300" title="Apagar veterinário">🗑️</button>
                                </div>
                            ` : ''}
                        </div>
                        ${lastConsult ? `
                            <div class="flex items-center gap-3">
                                <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center text-lg text-white shadow-lg shadow-rose-500/20">🏥</div>
                                <div class="flex-1">
                                    <div class="font-medium text-sm">${lastConsult.title}</div>
                                    <div class="text-xs text-gray-500">${new Date(lastConsult.date + 'T00:00:00').toLocaleDateString('pt-PT', { weekday: 'short', day: '2-digit', month: 'short' })}${lastConsult.time ? ' • ' + lastConsult.time : ''}${lastConsult.description ? ' • ' + lastConsult.description : ''}</div>
                                </div>
                            </div>
                        ` : '<p class="text-sm text-gray-500">Ainda não existe nenhum registo de veterinário.</p>'}
                    </div>
                    <div class="p-3 rounded-xl bg-white/70 dark:bg-gray-900/25 border border-sky-100 dark:border-sky-800">
                        <div class="flex items-center justify-between gap-2 mb-2">
                            <p class="text-xs font-semibold uppercase tracking-wide text-sky-600 dark:text-sky-300">Próximo Veterinário</p>
                            ${nextConsult ? `
                                <div class="flex items-center gap-1">
                                    <button type="button" onclick="openEventModal(${nextConsult.id})" class="p-1.5 rounded-lg hover:bg-white/70 dark:hover:bg-gray-700/60 text-sky-600 dark:text-sky-300" title="Editar veterinário">✏️</button>
                                    <button type="button" onclick="deleteEvent(${nextConsult.id})" class="p-1.5 rounded-lg hover:bg-white/70 dark:hover:bg-gray-700/60 text-sky-600 dark:text-sky-300" title="Apagar veterinário">🗑️</button>
                                </div>
                            ` : ''}
                        </div>
                        ${nextConsult ? `
                            <div class="flex items-center gap-3">
                                <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-cyan-500 flex items-center justify-center text-lg text-white shadow-lg shadow-sky-500/20">📅</div>
                                <div class="flex-1">
                                    <div class="font-medium text-sm">${nextConsult.title}</div>
                                    <div class="text-xs text-gray-500">${new Date(nextConsult.date + 'T00:00:00').toLocaleDateString('pt-PT', { weekday: 'short', day: '2-digit', month: 'short' })}${nextConsult.time ? ' • ' + nextConsult.time : ''}${nextConsult.description ? ' • ' + nextConsult.description : ''}</div>
                                </div>
                            </div>
                        ` : '<p class="text-sm text-gray-500">Ainda não existe nenhuma marcação futura.</p>'}
                    </div>
                </div>
            </div>

            <!-- Vaccines -->
            <div class="h-full min-h-[420px] bg-gradient-to-br from-rose-50 via-pink-50 to-fuchsia-50 dark:from-rose-900/20 dark:via-pink-900/20 dark:to-fuchsia-900/20 rounded-xl border border-rose-100 dark:border-rose-800 p-4 flex flex-col">
                <h3 class="font-bold text-lg mb-4 flex items-center gap-2">💉 Vacinas</h3>
                <div class="mb-4 p-4 bg-white/70 dark:bg-gray-900/25 rounded-2xl border border-rose-100 dark:border-rose-800">
                    <div class="flex items-center justify-between gap-3 mb-3">
                        <div>
                            <p class="text-sm font-semibold">Registar vacina</p>
                            <p class="text-xs text-gray-500">Data e hora da próxima vacina</p>
                        </div>
                        <span class="text-lg">💉</span>
                    </div>
                    <div class="grid grid-cols-2 gap-2 mb-2">
                        <input type="date" id="gucciVaccineDate" value="${todayISO()}" class="px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-rose-100 dark:border-rose-800 text-sm outline-none focus:ring-2 focus:ring-rose-500">
                        <input type="time" id="gucciVaccineTime" value="${new Date().toTimeString().slice(0,5)}" class="px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-rose-100 dark:border-rose-800 text-sm outline-none focus:ring-2 focus:ring-rose-500">
                    </div>
                    <input type="text" id="gucciVaccineNote" placeholder="Notas da vacina (opcional)" class="w-full px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-rose-100 dark:border-rose-800 text-sm outline-none focus:ring-2 focus:ring-rose-500 mb-3">
                    <button type="button" onclick="registerGucciVaccine()" class="w-full px-4 py-2.5 rounded-lg bg-gradient-to-r from-rose-500 to-fuchsia-500 text-white text-sm font-semibold shadow-lg shadow-rose-500/25 hover:shadow-xl hover:-translate-y-0.5 transition-all">
                        Registar vacina
                    </button>
                </div>
                <div class="grid gap-3">
                    <div class="p-3 rounded-xl bg-white/70 dark:bg-gray-900/25 border border-rose-100 dark:border-rose-800">
                        <div class="flex items-center justify-between gap-2 mb-2">
                            <p class="text-xs font-semibold uppercase tracking-wide text-rose-600 dark:text-rose-300">Última Vacina</p>
                            ${lastVaccine ? `
                                <div class="flex items-center gap-1">
                                    <button type="button" onclick="openEventModal(${lastVaccine.id})" class="p-1.5 rounded-lg hover:bg-white/70 dark:hover:bg-gray-700/60 text-rose-600 dark:text-rose-300" title="Editar vacina">✏️</button>
                                    <button type="button" onclick="deleteEvent(${lastVaccine.id})" class="p-1.5 rounded-lg hover:bg-white/70 dark:hover:bg-gray-700/60 text-rose-600 dark:text-rose-300" title="Apagar vacina">🗑️</button>
                                </div>
                            ` : ''}
                        </div>
                        ${lastVaccine ? `
                            <div class="flex items-center gap-3">
                                <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-fuchsia-500 flex items-center justify-center text-lg text-white shadow-lg shadow-rose-500/20">💉</div>
                                <div class="flex-1">
                                    <div class="font-medium text-sm">${lastVaccine.title}</div>
                                    <div class="text-xs text-gray-500">${new Date(lastVaccine.date + 'T00:00:00').toLocaleDateString('pt-PT', { weekday: 'short', day: '2-digit', month: 'short' })}${lastVaccine.time ? ' • ' + lastVaccine.time : ''}${lastVaccine.description ? ' • ' + lastVaccine.description : ''}</div>
                                </div>
                            </div>
                        ` : '<p class="text-sm text-gray-500">Ainda não existe nenhum registo de vacina.</p>'}
                    </div>
                    <div class="p-3 rounded-xl bg-white/70 dark:bg-gray-900/25 border border-fuchsia-100 dark:border-fuchsia-800">
                        <div class="flex items-center justify-between gap-2 mb-2">
                            <p class="text-xs font-semibold uppercase tracking-wide text-fuchsia-600 dark:text-fuchsia-300">Próxima Vacina</p>
                            ${nextVaccine ? `
                                <div class="flex items-center gap-1">
                                    <button type="button" onclick="openEventModal(${nextVaccine.id})" class="p-1.5 rounded-lg hover:bg-white/70 dark:hover:bg-gray-700/60 text-fuchsia-600 dark:text-fuchsia-300" title="Editar vacina">✏️</button>
                                    <button type="button" onclick="deleteEvent(${nextVaccine.id})" class="p-1.5 rounded-lg hover:bg-white/70 dark:hover:bg-gray-700/60 text-fuchsia-600 dark:text-fuchsia-300" title="Apagar vacina">🗑️</button>
                                </div>
                            ` : ''}
                        </div>
                        ${nextVaccine ? `
                            <div class="flex items-center gap-3">
                                <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-fuchsia-500 to-rose-500 flex items-center justify-center text-lg text-white shadow-lg shadow-fuchsia-500/20">📅</div>
                                <div class="flex-1">
                                    <div class="font-medium text-sm">${nextVaccine.title}</div>
                                    <div class="text-xs text-gray-500">${new Date(nextVaccine.date + 'T00:00:00').toLocaleDateString('pt-PT', { weekday: 'short', day: '2-digit', month: 'short' })}${nextVaccine.time ? ' • ' + nextVaccine.time : ''}${nextVaccine.description ? ' • ' + nextVaccine.description : ''}</div>
                                </div>
                            </div>
                        ` : '<p class="text-sm text-gray-500">Ainda não existe nenhuma vacina futura.</p>'}
                    </div>
                </div>
            </div>
            
            <div class="lg:col-span-2 grid lg:grid-cols-2 gap-6">
                <!-- Hygiene -->
                <div class="h-full min-h-[420px] bg-gradient-to-br from-sky-50 via-cyan-50 to-blue-50 dark:from-sky-900/20 dark:via-cyan-900/20 dark:to-blue-900/20 rounded-xl border border-sky-100 dark:border-sky-800 p-4 flex flex-col">
                <h3 class="font-bold text-lg mb-4 flex items-center gap-2">🛁 Banho</h3>
                <div class="mb-4 p-4 bg-white/70 dark:bg-gray-900/25 rounded-2xl border border-blue-100 dark:border-blue-800">
                    <div class="flex items-center justify-between gap-3 mb-3">
                        <div>
                            <p class="text-sm font-semibold">Registar banho</p>
                            <p class="text-xs text-gray-500">Adiciona um novo registo ao histórico</p>
                        </div>
                        <span class="text-lg">🫧</span>
                    </div>
                    <div class="mb-2">
                        <input type="date" id="gucciBathDate" value="${todayISO()}" class="w-full px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-blue-100 dark:border-blue-800 text-sm outline-none focus:ring-2 focus:ring-blue-500">
                    </div>
                    <input type="text" id="gucciBathNote" placeholder="Notas do banho (opcional)" class="w-full px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-blue-100 dark:border-blue-800 text-sm outline-none focus:ring-2 focus:ring-blue-500 mb-3">
                    <button type="button" onclick="registerGucciBath()" class="w-full px-4 py-2.5 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-sm font-semibold shadow-lg shadow-blue-500/25 hover:shadow-xl hover:-translate-y-0.5 transition-all">
                        Registar banho
                    </button>
                </div>
                <div class="mt-3 p-3 rounded-xl bg-white/70 dark:bg-gray-900/25 border border-amber-100 dark:border-amber-800">
                    <div class="flex items-center justify-between gap-2 mb-2">
                        <p class="text-xs font-semibold uppercase tracking-wide text-gray-500">Último Banho</p>
                        ${lastBath ? `
                            <div class="flex items-center gap-1">
                                <button type="button" onclick="openEventModal(${lastBath.id})" class="p-1.5 rounded-lg hover:bg-white/70 dark:hover:bg-gray-700/60 text-blue-600 dark:text-blue-300" title="Editar banho">✏️</button>
                                <button type="button" onclick="deleteEvent(${lastBath.id})" class="p-1.5 rounded-lg hover:bg-white/70 dark:hover:bg-gray-700/60 text-blue-600 dark:text-blue-300" title="Apagar banho">🗑️</button>
                            </div>
                        ` : ''}
                    </div>
                    ${lastBath ? `
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-lg">🛁</div>
                            <div class="flex-1">
                                <div class="font-medium text-sm">${lastBath.title}</div>
                                <div class="text-xs text-gray-500">${new Date(lastBath.date + 'T00:00:00').toLocaleDateString('pt-PT', { weekday: 'short', day: '2-digit', month: 'short' })}${lastBath.description ? ' • ' + lastBath.description : ''}</div>
                            </div>
                        </div>
                    ` : '<p class="text-sm text-gray-500">Ainda não existe nenhum registo de banho.</p>'}
                </div>
            </div>

            <!-- Grooming -->
            <div class="h-full min-h-[420px] bg-gradient-to-br from-purple-50 via-violet-50 to-fuchsia-50 dark:from-purple-900/20 dark:via-violet-900/20 dark:to-fuchsia-900/20 rounded-xl border border-purple-100 dark:border-purple-800 p-4 flex flex-col">
                <h3 class="font-bold text-lg mb-4 flex items-center gap-2">✂️ Tosa</h3>
                <div class="mb-4 p-4 bg-white/70 dark:bg-gray-900/25 rounded-2xl border border-purple-100 dark:border-purple-800">
                    <div class="flex items-center justify-between gap-3 mb-3">
                        <div>
                            <p class="text-sm font-semibold">Registar tosa</p>
                            <p class="text-xs text-gray-500">Adiciona um novo registo ao histórico</p>
                        </div>
                        <span class="text-lg">✂️</span>
                    </div>
                    <div class="mb-2">
                        <input type="date" id="gucciTosaDate" value="${todayISO()}" class="w-full px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-indigo-100 dark:border-indigo-800 text-sm outline-none focus:ring-2 focus:ring-indigo-500">
                    </div>
                    <input type="text" id="gucciTosaNote" placeholder="Notas da tosa (opcional)" class="w-full px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-indigo-100 dark:border-indigo-800 text-sm outline-none focus:ring-2 focus:ring-indigo-500 mb-3">
                    <button type="button" onclick="registerGucciTosa()" class="w-full px-4 py-2.5 rounded-lg bg-gradient-to-r from-indigo-500 to-violet-500 text-white text-sm font-semibold shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:-translate-y-0.5 transition-all">
                        Registar tosa
                    </button>
                </div>
                <div class="mt-3 p-3 rounded-xl bg-white/70 dark:bg-gray-900/25 border border-purple-100 dark:border-purple-800">
                    <div class="flex items-center justify-between gap-2 mb-2">
                        <p class="text-xs font-semibold uppercase tracking-wide text-gray-500">Última Tosa</p>
                        ${lastTosa ? `
                            <div class="flex items-center gap-1">
                                <button type="button" onclick="openEventModal(${lastTosa.id})" class="p-1.5 rounded-lg hover:bg-white/70 dark:hover:bg-gray-700/60 text-purple-600 dark:text-purple-300" title="Editar tosa">✏️</button>
                                <button type="button" onclick="deleteEvent(${lastTosa.id})" class="p-1.5 rounded-lg hover:bg-white/70 dark:hover:bg-gray-700/60 text-purple-600 dark:text-purple-300" title="Apagar tosa">🗑️</button>
                            </div>
                        ` : ''}
                    </div>
                    ${lastTosa ? `
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-lg">✂️</div>
                            <div class="flex-1">
                                <div class="font-medium text-sm">${lastTosa.title}</div>
                                <div class="text-xs text-gray-500">${new Date(lastTosa.date + 'T00:00:00').toLocaleDateString('pt-PT', { weekday: 'short', day: '2-digit', month: 'short' })}${lastTosa.description ? ' • ' + lastTosa.description : ''}</div>
                            </div>
                        </div>
                    ` : '<p class="text-sm text-gray-500">Ainda não existe nenhum registo de tosa.</p>'}
                </div>
            </div>
            </div>
            
        </div>
        
    </div>`;
    
    container.innerHTML = html;
}

function registerGucciBath() {
    const bathDate = document.getElementById('gucciBathDate')?.value || todayISO();
    const bathNote = document.getElementById('gucciBathNote')?.value.trim() || '';

    State.events.push({
        id: Date.now(),
        title: 'Banho da Gucci',
        description: bathNote ? bathNote : 'Registo de banho',
        date: bathDate,
        time: '',
        endTime: '',
        location: '',
        category: 'gucci',
        members: ['gucci'],
        reminder: false
    });

    State.saveData();
    showToast('Banho registado!');
    renderPage();
}

function registerGucciConsult() {
    const consultDate = document.getElementById('gucciConsultDate')?.value || todayISO();
    const consultTime = document.getElementById('gucciConsultTime')?.value || '';
    const consultNote = document.getElementById('gucciConsultNote')?.value.trim() || '';

    State.events.push({
        id: Date.now(),
        title: 'Consulta da Gucci',
        description: consultNote ? consultNote : 'Registo de consulta',
        date: consultDate,
        time: consultTime,
        endTime: '',
        location: '',
        category: 'gucci',
        members: ['gucci'],
        reminder: false
    });

    State.saveData();
    showToast('Consulta registada!');
    renderPage();
}

function registerGucciVaccine() {
    const vaccineDate = document.getElementById('gucciVaccineDate')?.value || todayISO();
    const vaccineTime = document.getElementById('gucciVaccineTime')?.value || '';
    const vaccineNote = document.getElementById('gucciVaccineNote')?.value.trim() || '';

    State.events.push({
        id: Date.now(),
        title: 'Vacina da Gucci',
        description: vaccineNote ? vaccineNote : 'Registo de vacina',
        date: vaccineDate,
        time: vaccineTime,
        endTime: '',
        location: '',
        category: 'gucci',
        members: ['gucci'],
        reminder: false
    });

    State.saveData();
    showToast('Vacina registada!');
    renderPage();
}

function registerGucciTosa() {
    const tosaDate = document.getElementById('gucciTosaDate')?.value || todayISO();
    const tosaNote = document.getElementById('gucciTosaNote')?.value.trim() || '';

    State.events.push({
        id: Date.now(),
        title: 'Tosa da Gucci',
        description: tosaNote ? tosaNote : 'Registo de tosa',
        date: tosaDate,
        time: '',
        endTime: '',
        location: '',
        category: 'gucci',
        members: ['gucci'],
        reminder: false
    });

    State.saveData();
    showToast('Tosa registada!');
    renderPage();
}

function registerSofiaConsult() {
    const consultDate = document.getElementById('sofiaConsultDate')?.value || todayISO();
    const consultTime = document.getElementById('sofiaConsultTime')?.value || '';
    const consultNote = document.getElementById('sofiaConsultNote')?.value.trim() || '';

    State.events.push({
        id: Date.now(),
        title: 'Consulta da Sofia',
        description: consultNote ? consultNote : 'Registo de consulta',
        date: consultDate,
        time: consultTime,
        endTime: '',
        location: '',
        category: 'saude',
        members: ['sofia'],
        reminder: false
    });

    State.saveData();
    showToast('Consulta registada!');
    renderPage();
}

function registerSofiaVaccine() {
    const vaccineDate = document.getElementById('sofiaVaccineDate')?.value || todayISO();
    const vaccineTime = document.getElementById('sofiaVaccineTime')?.value || '';
    const vaccineNote = document.getElementById('sofiaVaccineNote')?.value.trim() || '';

    State.events.push({
        id: Date.now(),
        title: 'Vacina da Sofia',
        description: vaccineNote ? vaccineNote : 'Registo de vacina',
        date: vaccineDate,
        time: vaccineTime,
        endTime: '',
        location: '',
        category: 'saude',
        members: ['sofia'],
        reminder: false
    });

    State.saveData();
    showToast('Vacina registada!');
    renderPage();
}

function registerPersonalConsult(memberId, displayName) {
    const consultDate = document.getElementById(`${memberId}ConsultDate`)?.value || todayISO();
    const consultTime = document.getElementById(`${memberId}ConsultTime`)?.value || '';
    const consultNote = document.getElementById(`${memberId}ConsultNote`)?.value.trim() || '';

    State.events.push({
        id: Date.now(),
        title: `Consulta de ${displayName}`,
        description: consultNote ? consultNote : 'Registo de consulta',
        date: consultDate,
        time: consultTime,
        endTime: '',
        location: '',
        category: 'saude',
        members: [memberId],
        reminder: false
    });

    State.saveData();
    showToast('Consulta registada!');
    renderPage();
}

function registerPersonalVaccine(memberId, displayName) {
    const vaccineDate = document.getElementById(`${memberId}VaccineDate`)?.value || todayISO();
    const vaccineTime = document.getElementById(`${memberId}VaccineTime`)?.value || '';
    const vaccineNote = document.getElementById(`${memberId}VaccineNote`)?.value.trim() || '';

    State.events.push({
        id: Date.now(),
        title: `Vacina de ${displayName}`,
        description: vaccineNote ? vaccineNote : 'Registo de vacina',
        date: vaccineDate,
        time: vaccineTime,
        endTime: '',
        location: '',
        category: 'saude',
        members: [memberId],
        reminder: false
    });

    State.saveData();
    showToast('Vacina registada!');
    renderPage();
}

function registerAndreConsult() {
    registerPersonalConsult('andre', 'André');
}

function registerAndreVaccine() {
    registerPersonalVaccine('andre', 'André');
}

function registerNayaraConsult() {
    registerPersonalConsult('nayara', 'Nayara');
}

function registerNayaraVaccine() {
    registerPersonalVaccine('nayara', 'Nayara');
}

function renderPersonalArea(container, config) {
    const { memberId, title, accentName, accentClass, accentSoftClass, consultPrefix, vaccinePrefix, emptyConsultText, emptyVaccineText } = config;
    const showBabyExtras = config.showBabyExtras ?? (memberId === 'sofia');
    const member = getMember(memberId);
    const displayTitle = title || (member ? member.name : 'Área Pessoal');
    const familyEvents = State.events.filter(e => {
        const text = (e.title || '').toLowerCase();
        return e.members.includes(memberId) ||
            e.category === 'saude' ||
            e.category === 'family' ||
            text.includes('pediatra') ||
            text.includes('vacina') ||
            text.includes('consulta') ||
            text.includes('banho') ||
            text.includes('sesta') ||
            text.includes('alimentação') ||
            text.includes('alimentacao');
    });
    const familyTasks = State.tasks.filter(t => {
        const text = (t.title || '').toLowerCase();
        return t.assignedTo === memberId ||
            t.category === 'baby' ||
            t.category === 'saude' ||
            t.category === 'family' ||
            text.includes('fralda') ||
            text.includes('leite') ||
            text.includes('papinha') ||
            text.includes('pediatra') ||
            text.includes('sesta');
    });
    const familyShopping = State.shoppingItems.filter(i => {
        const text = `${i.name || ''} ${i.notes || ''}`.toLowerCase();
        return i.category === 'bebé' ||
            i.category === 'baby' ||
            i.category === 'family' ||
            text.includes(memberId) ||
            text.includes('fralda') ||
            text.includes('leite') ||
            text.includes('toalhitas') ||
            text.includes('pomada') ||
            text.includes('biberão') ||
            text.includes('biberao') ||
            text.includes('chupeta');
    });

    const upcomingCare = familyEvents.filter(e => e.date >= todayISO() && (
        e.title.toLowerCase().includes('pediatra') ||
        e.title.toLowerCase().includes('consulta') ||
        e.title.toLowerCase().includes('vacina') ||
        e.title.toLowerCase().includes('leite') ||
        e.title.toLowerCase().includes('banho')
    )).sort((a, b) => a.date.localeCompare(b.date));
    const upcomingActivities = familyEvents.filter(e => e.date >= todayISO() && (
        e.title.toLowerCase().includes('sesta') ||
        e.title.toLowerCase().includes('soninho') ||
        e.title.toLowerCase().includes('brincar') ||
        e.title.toLowerCase().includes('passeio') ||
        e.title.toLowerCase().includes('colo')
    )).sort((a, b) => a.date.localeCompare(b.date));
    const pendingTasks = familyTasks.filter(t => !t.completed).sort((a, b) => (a.dueDate || '').localeCompare(b.dueDate || ''));
    const pendingSupplies = familyShopping.filter(i => !i.bought);
    const getEventMoment = (event) => new Date(`${event.date}T${event.time || '00:00'}`);
    const consultEvents = familyEvents.filter(e => e.title.toLowerCase().includes('consulta') || e.title.toLowerCase().includes('pediatra'));
    const lastConsult = [...consultEvents].filter(e => getEventMoment(e) <= new Date()).sort((a, b) => getEventMoment(b) - getEventMoment(a))[0];
    const nextConsult = [...consultEvents].filter(e => getEventMoment(e) > new Date()).sort((a, b) => getEventMoment(a) - getEventMoment(b))[0];
    const vaccineEvents = familyEvents.filter(e => e.title.toLowerCase().includes('vacina'));
    const lastVaccine = [...vaccineEvents].filter(e => getEventMoment(e) <= new Date()).sort((a, b) => getEventMoment(b) - getEventMoment(a))[0];
    const nextVaccine = [...vaccineEvents].filter(e => getEventMoment(e) > new Date()).sort((a, b) => getEventMoment(a) - getEventMoment(b))[0];
    let html = `
    <div class="fade-in">
        <div class="grid grid-cols-2 lg:grid-cols-${showBabyExtras ? '4' : '2'} gap-4 mb-6">
            <div class="bg-gradient-to-br from-cyan-50 via-sky-50 to-blue-50 dark:from-cyan-900/25 dark:via-sky-900/25 dark:to-blue-900/25 rounded-xl p-4 card-hover border border-cyan-100 dark:border-cyan-800 shadow-lg shadow-cyan-500/10">
                <div class="flex items-start justify-between gap-3 mb-2">
                    <div class="text-2xl">🏥</div>
                    <span class="text-[10px] font-semibold uppercase tracking-[0.18em] px-2 py-1 rounded-full bg-white/70 dark:bg-gray-900/40 text-cyan-700 dark:text-cyan-200 border border-cyan-100 dark:border-cyan-800">Próximo</span>
                </div>
                <p class="text-sm font-semibold text-gray-900 dark:text-gray-100 leading-tight">${nextConsult ? nextConsult.title : 'Sem consulta futura'}</p>
                <p class="text-xl font-bold text-cyan-700 dark:text-cyan-200 mt-1">${nextConsult ? `${new Date(nextConsult.date + 'T00:00:00').toLocaleDateString('pt-PT', { weekday: 'short', day: '2-digit', month: 'short' })}` : '—'}</p>
                <p class="text-sm font-medium text-cyan-700/90 dark:text-cyan-200/90">${nextConsult ? `${nextConsult.time || 'Adiciona uma nova consulta'}` : 'Adiciona uma nova consulta'}</p>
            </div>
            <div class="bg-gradient-to-br from-violet-50 via-fuchsia-50 to-purple-50 dark:from-violet-900/25 dark:via-fuchsia-900/25 dark:to-purple-900/25 rounded-xl p-4 card-hover border border-violet-100 dark:border-violet-800 shadow-lg shadow-violet-500/10">
                <div class="flex items-start justify-between gap-3 mb-2">
                    <div class="text-2xl">💉</div>
                    <span class="text-[10px] font-semibold uppercase tracking-[0.18em] px-2 py-1 rounded-full bg-white/70 dark:bg-gray-900/40 text-violet-700 dark:text-violet-200 border border-violet-100 dark:border-violet-800">Próxima</span>
                </div>
                <p class="text-sm font-semibold text-gray-900 dark:text-gray-100 leading-tight">${nextVaccine ? nextVaccine.title : 'Sem vacina futura'}</p>
                <p class="text-xl font-bold text-violet-700 dark:text-violet-200 mt-1">${nextVaccine ? `${new Date(nextVaccine.date + 'T00:00:00').toLocaleDateString('pt-PT', { weekday: 'short', day: '2-digit', month: 'short' })}` : '—'}</p>
                <p class="text-sm font-medium text-violet-700/90 dark:text-violet-200/90">${nextVaccine ? `${nextVaccine.time || 'Adiciona uma nova vacina'}` : 'Adiciona uma nova vacina'}</p>
            </div>
            ${showBabyExtras ? `
            <div class="bg-white dark:bg-gray-800 rounded-xl p-4 card-hover border border-gray-100 dark:border-gray-700">
                <div class="text-2xl mb-2">🧷</div>
                <p class="text-2xl font-bold">${pendingSupplies.length}</p>
                <p class="text-xs text-gray-500">Essenciais Pendentes</p>
            </div>
            <div class="bg-white dark:bg-gray-800 rounded-xl p-4 card-hover border border-gray-100 dark:border-gray-700">
                <div class="text-2xl mb-2">🧸</div>
                <p class="text-2xl font-bold">${upcomingActivities.length}</p>
                <p class="text-xs text-gray-500">Momentos de Colo</p>
            </div>
            ` : ''}
        </div>

        <div class="grid lg:grid-cols-2 gap-6">
            <div class="${accentClass} rounded-xl border p-4">
                <h3 class="font-bold text-lg mb-4 flex items-center gap-2">🩺 ${consultPrefix}</h3>
                <div class="mb-4 p-4 bg-white/70 dark:bg-gray-900/25 rounded-2xl border border-amber-100 dark:border-amber-800">
                    <div class="flex items-center justify-between gap-3 mb-3">
                        <div>
                            <p class="text-sm font-semibold">Registar ${consultPrefix.toLowerCase()}</p>
                            <p class="text-xs text-gray-500">Data e hora da próxima marcação</p>
                        </div>
                        <span class="text-lg">🩺</span>
                    </div>
                    <div class="grid grid-cols-2 gap-2 mb-2">
                        <input type="date" id="${memberId}ConsultDate" value="${todayISO()}" class="px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-amber-100 dark:border-amber-800 text-sm outline-none focus:ring-2 focus:ring-amber-500">
                        <input type="time" id="${memberId}ConsultTime" value="${new Date().toTimeString().slice(0,5)}" class="px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-amber-100 dark:border-amber-800 text-sm outline-none focus:ring-2 focus:ring-amber-500">
                    </div>
                    <input type="text" id="${memberId}ConsultNote" placeholder="Notas da marcação (opcional)" class="w-full px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-amber-100 dark:border-amber-800 text-sm outline-none focus:ring-2 focus:ring-amber-500 mb-3">
                    <button type="button" onclick="register${memberId.charAt(0).toUpperCase() + memberId.slice(1)}Consult()" class="w-full px-4 py-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-semibold shadow-lg shadow-amber-500/25 hover:shadow-xl hover:-translate-y-0.5 transition-all">
                        Registar ${consultPrefix.toLowerCase()}
                    </button>
                </div>
                <div class="grid gap-3">
                    <div class="p-3 rounded-xl bg-white/70 dark:bg-gray-900/25 border border-rose-100 dark:border-rose-800">
                        <div class="flex items-center justify-between gap-2 mb-2">
                            <p class="text-xs font-semibold uppercase tracking-wide text-rose-600 dark:text-rose-300">Última ${consultPrefix}</p>
                            ${lastConsult ? `
                                <div class="flex items-center gap-1">
                                    <button type="button" onclick="openEventModal(${lastConsult.id})" class="p-1.5 rounded-lg hover:bg-white/70 dark:hover:bg-gray-700/60 text-rose-600 dark:text-rose-300" title="Editar ${consultPrefix.toLowerCase()}">✏️</button>
                                    <button type="button" onclick="deleteEvent(${lastConsult.id})" class="p-1.5 rounded-lg hover:bg-white/70 dark:hover:bg-gray-700/60 text-rose-600 dark:text-rose-300" title="Apagar ${consultPrefix.toLowerCase()}">🗑️</button>
                                </div>
                            ` : ''}
                        </div>
                        ${lastConsult ? `
                            <div class="flex items-center gap-3">
                                <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center text-lg text-white shadow-lg shadow-rose-500/20">🩺</div>
                                <div class="flex-1">
                                    <div class="font-medium text-sm">${lastConsult.title}</div>
                                    <div class="text-xs text-gray-500">${new Date(lastConsult.date + 'T00:00:00').toLocaleDateString('pt-PT', { weekday: 'short', day: '2-digit', month: 'short' })}${lastConsult.time ? ' • ' + lastConsult.time : ''}${lastConsult.description ? ' • ' + lastConsult.description : ''}</div>
                                </div>
                            </div>
                        ` : `<p class="text-sm text-gray-500">${emptyConsultText || 'Ainda não existe nenhum registo.'}</p>`}
                    </div>
                    <div class="p-3 rounded-xl bg-white/70 dark:bg-gray-900/25 border border-sky-100 dark:border-sky-800">
                        <div class="flex items-center justify-between gap-2 mb-2">
                            <p class="text-xs font-semibold uppercase tracking-wide text-sky-600 dark:text-sky-300">Próxima ${consultPrefix}</p>
                            ${nextConsult ? `
                                <div class="flex items-center gap-1">
                                    <button type="button" onclick="openEventModal(${nextConsult.id})" class="p-1.5 rounded-lg hover:bg-white/70 dark:hover:bg-gray-700/60 text-sky-600 dark:text-sky-300" title="Editar ${consultPrefix.toLowerCase()}">✏️</button>
                                    <button type="button" onclick="deleteEvent(${nextConsult.id})" class="p-1.5 rounded-lg hover:bg-white/70 dark:hover:bg-gray-700/60 text-sky-600 dark:text-sky-300" title="Apagar ${consultPrefix.toLowerCase()}">🗑️</button>
                                </div>
                            ` : ''}
                        </div>
                        ${nextConsult ? `
                            <div class="flex items-center gap-3">
                                <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-cyan-500 flex items-center justify-center text-lg text-white shadow-lg shadow-sky-500/20">📅</div>
                                <div class="flex-1">
                                    <div class="font-medium text-sm">${nextConsult.title}</div>
                                    <div class="text-xs text-gray-500">${new Date(nextConsult.date + 'T00:00:00').toLocaleDateString('pt-PT', { weekday: 'short', day: '2-digit', month: 'short' })}${nextConsult.time ? ' • ' + nextConsult.time : ''}${nextConsult.description ? ' • ' + nextConsult.description : ''}</div>
                                </div>
                            </div>
                        ` : `<p class="text-sm text-gray-500">${emptyConsultText || 'Ainda não existe nenhuma marcação futura.'}</p>`}
                    </div>
                </div>
            </div>

            <div class="${accentSoftClass} rounded-xl border p-4">
                <h3 class="font-bold text-lg mb-4 flex items-center gap-2">💉 Vacinas</h3>
                <div class="mb-4 p-4 bg-white/70 dark:bg-gray-900/25 rounded-2xl border border-rose-100 dark:border-rose-800">
                    <div class="flex items-center justify-between gap-3 mb-3">
                        <div>
                            <p class="text-sm font-semibold">Registar vacina</p>
                            <p class="text-xs text-gray-500">Data e hora da próxima vacina</p>
                        </div>
                        <span class="text-lg">💉</span>
                    </div>
                    <div class="grid grid-cols-2 gap-2 mb-2">
                        <input type="date" id="${memberId}VaccineDate" value="${todayISO()}" class="px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-rose-100 dark:border-rose-800 text-sm outline-none focus:ring-2 focus:ring-rose-500">
                        <input type="time" id="${memberId}VaccineTime" value="${new Date().toTimeString().slice(0,5)}" class="px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-rose-100 dark:border-rose-800 text-sm outline-none focus:ring-2 focus:ring-rose-500">
                    </div>
                    <input type="text" id="${memberId}VaccineNote" placeholder="Notas da vacina (opcional)" class="w-full px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-rose-100 dark:border-rose-800 text-sm outline-none focus:ring-2 focus:ring-rose-500 mb-3">
                    <button type="button" onclick="register${memberId.charAt(0).toUpperCase() + memberId.slice(1)}Vaccine()" class="w-full px-4 py-2.5 rounded-lg bg-gradient-to-r from-rose-500 to-fuchsia-500 text-white text-sm font-semibold shadow-lg shadow-rose-500/25 hover:shadow-xl hover:-translate-y-0.5 transition-all">
                        Registar vacina
                    </button>
                </div>
                <div class="grid gap-3">
                    <div class="p-3 rounded-xl bg-white/70 dark:bg-gray-900/25 border border-rose-100 dark:border-rose-800">
                        <div class="flex items-center justify-between gap-2 mb-2">
                            <p class="text-xs font-semibold uppercase tracking-wide text-rose-600 dark:text-rose-300">Última Vacina</p>
                            ${lastVaccine ? `
                                <div class="flex items-center gap-1">
                                    <button type="button" onclick="openEventModal(${lastVaccine.id})" class="p-1.5 rounded-lg hover:bg-white/70 dark:hover:bg-gray-700/60 text-rose-600 dark:text-rose-300" title="Editar vacina">✏️</button>
                                    <button type="button" onclick="deleteEvent(${lastVaccine.id})" class="p-1.5 rounded-lg hover:bg-white/70 dark:hover:bg-gray-700/60 text-rose-600 dark:text-rose-300" title="Apagar vacina">🗑️</button>
                                </div>
                            ` : ''}
                        </div>
                        ${lastVaccine ? `
                            <div class="flex items-center gap-3">
                                <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-fuchsia-500 flex items-center justify-center text-lg text-white shadow-lg shadow-rose-500/20">💉</div>
                                <div class="flex-1">
                                    <div class="font-medium text-sm">${lastVaccine.title}</div>
                                    <div class="text-xs text-gray-500">${new Date(lastVaccine.date + 'T00:00:00').toLocaleDateString('pt-PT', { weekday: 'short', day: '2-digit', month: 'short' })}${lastVaccine.time ? ' • ' + lastVaccine.time : ''}${lastVaccine.description ? ' • ' + lastVaccine.description : ''}</div>
                                </div>
                            </div>
                        ` : `<p class="text-sm text-gray-500">${emptyVaccineText || 'Ainda não existe nenhum registo de vacina.'}</p>`}
                    </div>
                    <div class="p-3 rounded-xl bg-white/70 dark:bg-gray-900/25 border border-fuchsia-100 dark:border-fuchsia-800">
                        <div class="flex items-center justify-between gap-2 mb-2">
                            <p class="text-xs font-semibold uppercase tracking-wide text-fuchsia-600 dark:text-fuchsia-300">Próxima Vacina</p>
                            ${nextVaccine ? `
                                <div class="flex items-center gap-1">
                                    <button type="button" onclick="openEventModal(${nextVaccine.id})" class="p-1.5 rounded-lg hover:bg-white/70 dark:hover:bg-gray-700/60 text-fuchsia-600 dark:text-fuchsia-300" title="Editar vacina">✏️</button>
                                    <button type="button" onclick="deleteEvent(${nextVaccine.id})" class="p-1.5 rounded-lg hover:bg-white/70 dark:hover:bg-gray-700/60 text-fuchsia-600 dark:text-fuchsia-300" title="Apagar vacina">🗑️</button>
                                </div>
                            ` : ''}
                        </div>
                        ${nextVaccine ? `
                            <div class="flex items-center gap-3">
                                <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-fuchsia-500 to-rose-500 flex items-center justify-center text-lg text-white shadow-lg shadow-fuchsia-500/20">📅</div>
                                <div class="flex-1">
                                    <div class="font-medium text-sm">${nextVaccine.title}</div>
                                    <div class="text-xs text-gray-500">${new Date(nextVaccine.date + 'T00:00:00').toLocaleDateString('pt-PT', { weekday: 'short', day: '2-digit', month: 'short' })}${nextVaccine.time ? ' • ' + nextVaccine.time : ''}${nextVaccine.description ? ' • ' + nextVaccine.description : ''}</div>
                                </div>
                            </div>
                        ` : `<p class="text-sm text-gray-500">${emptyVaccineText || 'Ainda não existe nenhuma vacina futura.'}</p>`}
                    </div>
                </div>
            </div>
        </div>
    </div>`;

    container.innerHTML = html;
}

function renderAndre(container) {
    renderPersonalArea(container, {
        memberId: 'andre',
        title: 'Área do André',
        consultPrefix: 'Consulta',
        vaccinePrefix: 'Vacina',
        accentClass: 'bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 dark:from-sky-900/20 dark:via-blue-900/20 dark:to-indigo-900/20 border-sky-100 dark:border-sky-800',
        accentSoftClass: 'bg-gradient-to-br from-cyan-50 via-sky-50 to-blue-50 dark:from-cyan-900/20 dark:via-sky-900/20 dark:to-blue-900/20 border-cyan-100 dark:border-cyan-800',
        emptyConsultText: 'Ainda não existe nenhum registo de consulta.',
        emptyVaccineText: 'Ainda não existe nenhum registo de vacina.'
    });
}

function renderNayara(container) {
    renderPersonalArea(container, {
        memberId: 'nayara',
        title: 'Área da Nayara',
        consultPrefix: 'Consulta',
        vaccinePrefix: 'Vacina',
        accentClass: 'bg-gradient-to-br from-rose-50 via-pink-50 to-fuchsia-50 dark:from-rose-900/20 dark:via-pink-900/20 dark:to-fuchsia-900/20 border-rose-100 dark:border-rose-800',
        accentSoftClass: 'bg-gradient-to-br from-fuchsia-50 via-pink-50 to-rose-50 dark:from-fuchsia-900/20 dark:via-pink-900/20 dark:to-rose-900/20 border-fuchsia-100 dark:border-fuchsia-800',
        emptyConsultText: 'Ainda não existe nenhum registo de consulta.',
        emptyVaccineText: 'Ainda não existe nenhum registo de vacina.'
    });
}

// ==================== SOFIA AREA ====================
function renderSofia(container) {
    const sofiaEvents = State.events.filter(e => {
        const title = (e.title || '').toLowerCase();
        return e.members.includes('sofia') ||
            e.category === 'saude' ||
            e.category === 'family' ||
            title.includes('pediatra') ||
            title.includes('vacina') ||
            title.includes('consulta') ||
            title.includes('banho') ||
            title.includes('sesta') ||
            title.includes('alimentação') ||
            title.includes('alimentacao');
    });
    const sofiaTasks = State.tasks.filter(t => {
        const title = (t.title || '').toLowerCase();
        return t.assignedTo === 'sofia' ||
            t.category === 'baby' ||
            t.category === 'saude' ||
            title.includes('fralda') ||
            title.includes('leite') ||
            title.includes('papinha') ||
            title.includes('pediatra') ||
            title.includes('sesta');
    });
    const sofiaShopping = State.shoppingItems.filter(i => {
        const text = `${i.name || ''} ${i.notes || ''}`.toLowerCase();
        return i.category === 'bebé' ||
            i.category === 'baby' ||
            text.includes('fralda') ||
            text.includes('leite') ||
            text.includes('toalhitas') ||
            text.includes('pomada') ||
            text.includes('biberão') ||
            text.includes('biberao') ||
            text.includes('chupeta');
    });

    const upcomingSchool = sofiaEvents.filter(e => e.date >= todayISO() && (
        e.title.toLowerCase().includes('pediatra') ||
        e.title.toLowerCase().includes('consulta') ||
        e.title.toLowerCase().includes('vacina') ||
        e.title.toLowerCase().includes('leite') ||
        e.title.toLowerCase().includes('banho')
    )).sort((a, b) => a.date.localeCompare(b.date));
    const upcomingActivities = sofiaEvents.filter(e => e.date >= todayISO() && (
        e.title.toLowerCase().includes('sesta') ||
        e.title.toLowerCase().includes('soninho') ||
        e.title.toLowerCase().includes('brincar') ||
        e.title.toLowerCase().includes('passeio') ||
        e.title.toLowerCase().includes('colo')
    )).sort((a, b) => a.date.localeCompare(b.date));
    const studyTasks = sofiaTasks.filter(t => !t.completed).sort((a, b) => (a.dueDate || '').localeCompare(b.dueDate || ''));
    const pendingSupplies = sofiaShopping.filter(i => !i.bought);
    const getSofiaEventMoment = (event) => new Date(`${event.date}T${event.time || '00:00'}`);
    const sofiaConsultEvents = sofiaEvents.filter(e => e.title.toLowerCase().includes('consulta') || e.title.toLowerCase().includes('pediatra'));
    const lastSofiaConsult = [...sofiaConsultEvents].filter(e => getSofiaEventMoment(e) <= new Date()).sort((a, b) => getSofiaEventMoment(b) - getSofiaEventMoment(a))[0];
    const nextSofiaConsult = [...sofiaConsultEvents].filter(e => getSofiaEventMoment(e) > new Date()).sort((a, b) => getSofiaEventMoment(a) - getSofiaEventMoment(b))[0];
    const sofiaVaccineEvents = sofiaEvents.filter(e => e.title.toLowerCase().includes('vacina'));
    const lastSofiaVaccine = [...sofiaVaccineEvents].filter(e => getSofiaEventMoment(e) <= new Date()).sort((a, b) => getSofiaEventMoment(b) - getSofiaEventMoment(a))[0];
    const nextSofiaVaccine = [...sofiaVaccineEvents].filter(e => getSofiaEventMoment(e) > new Date()).sort((a, b) => getSofiaEventMoment(a) - getSofiaEventMoment(b))[0];

    let html = `
    <div class="fade-in">
        <!-- Quick Stats -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div class="bg-white dark:bg-gray-800 rounded-xl p-4 card-hover border border-gray-100 dark:border-gray-700">
                <div class="text-2xl mb-2">🍼</div>
                <p class="text-2xl font-bold">${upcomingSchool.length}</p>
                <p class="text-xs text-gray-500">Cuidados Próximos</p>
            </div>
            <div class="bg-white dark:bg-gray-800 rounded-xl p-4 card-hover border border-gray-100 dark:border-gray-700">
                <div class="text-2xl mb-2">😴</div>
                <p class="text-2xl font-bold">${studyTasks.length}</p>
                <p class="text-xs text-gray-500">Rotinas Pendentes</p>
            </div>
            <div class="bg-white dark:bg-gray-800 rounded-xl p-4 card-hover border border-gray-100 dark:border-gray-700">
                <div class="text-2xl mb-2">🧷</div>
                <p class="text-2xl font-bold">${pendingSupplies.length}</p>
                <p class="text-xs text-gray-500">Essenciais Pendentes</p>
            </div>
            <div class="bg-white dark:bg-gray-800 rounded-xl p-4 card-hover border border-gray-100 dark:border-gray-700">
                <div class="text-2xl mb-2">🧸</div>
                <p class="text-2xl font-bold">${upcomingActivities.length}</p>
                <p class="text-xs text-gray-500">Momentos de Colo</p>
            </div>
        </div>
        
        <div class="grid lg:grid-cols-2 gap-6">
            <!-- Consultations -->
            <div class="bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-amber-900/20 dark:via-orange-900/20 dark:to-yellow-900/20 rounded-xl border border-amber-100 dark:border-amber-800 p-4">
                <h3 class="font-bold text-lg mb-4 flex items-center gap-2">🩺 Consultas</h3>
                <div class="mb-4 p-4 bg-white/70 dark:bg-gray-900/25 rounded-2xl border border-amber-100 dark:border-amber-800">
                    <div class="flex items-center justify-between gap-3 mb-3">
                        <div>
                            <p class="text-sm font-semibold">Registar consulta</p>
                            <p class="text-xs text-gray-500">Data e hora da próxima consulta</p>
                        </div>
                        <span class="text-lg">🩺</span>
                    </div>
                    <div class="grid grid-cols-2 gap-2 mb-2">
                        <input type="date" id="sofiaConsultDate" value="${todayISO()}" class="px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-amber-100 dark:border-amber-800 text-sm outline-none focus:ring-2 focus:ring-amber-500">
                        <input type="time" id="sofiaConsultTime" value="${new Date().toTimeString().slice(0,5)}" class="px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-amber-100 dark:border-amber-800 text-sm outline-none focus:ring-2 focus:ring-amber-500">
                    </div>
                    <input type="text" id="sofiaConsultNote" placeholder="Notas da consulta (opcional)" class="w-full px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-amber-100 dark:border-amber-800 text-sm outline-none focus:ring-2 focus:ring-amber-500 mb-3">
                    <button type="button" onclick="registerSofiaConsult()" class="w-full px-4 py-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-semibold shadow-lg shadow-amber-500/25 hover:shadow-xl hover:-translate-y-0.5 transition-all">
                        Registar consulta
                    </button>
                </div>
                <div class="grid gap-3">
                    <div class="p-3 rounded-xl bg-white/70 dark:bg-gray-900/25 border border-rose-100 dark:border-rose-800">
                        <div class="flex items-center justify-between gap-2 mb-2">
                            <p class="text-xs font-semibold uppercase tracking-wide text-rose-600 dark:text-rose-300">Última Consulta</p>
                            ${lastSofiaConsult ? `
                                <div class="flex items-center gap-1">
                                    <button type="button" onclick="openEventModal(${lastSofiaConsult.id})" class="p-1.5 rounded-lg hover:bg-white/70 dark:hover:bg-gray-700/60 text-rose-600 dark:text-rose-300" title="Editar consulta">✏️</button>
                                    <button type="button" onclick="deleteEvent(${lastSofiaConsult.id})" class="p-1.5 rounded-lg hover:bg-white/70 dark:hover:bg-gray-700/60 text-rose-600 dark:text-rose-300" title="Apagar consulta">🗑️</button>
                                </div>
                            ` : ''}
                        </div>
                        ${lastSofiaConsult ? `
                            <div class="flex items-center gap-3">
                                <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center text-lg text-white shadow-lg shadow-rose-500/20">🩺</div>
                                <div class="flex-1">
                                    <div class="font-medium text-sm">${lastSofiaConsult.title}</div>
                                    <div class="text-xs text-gray-500">${new Date(lastSofiaConsult.date + 'T00:00:00').toLocaleDateString('pt-PT', { weekday: 'short', day: '2-digit', month: 'short' })}${lastSofiaConsult.time ? ' • ' + lastSofiaConsult.time : ''}${lastSofiaConsult.description ? ' • ' + lastSofiaConsult.description : ''}</div>
                                </div>
                            </div>
                        ` : '<p class="text-sm text-gray-500">Ainda não existe nenhum registo de consulta.</p>'}
                    </div>
                    <div class="p-3 rounded-xl bg-white/70 dark:bg-gray-900/25 border border-sky-100 dark:border-sky-800">
                        <div class="flex items-center justify-between gap-2 mb-2">
                            <p class="text-xs font-semibold uppercase tracking-wide text-sky-600 dark:text-sky-300">Próxima Consulta</p>
                            ${nextSofiaConsult ? `
                                <div class="flex items-center gap-1">
                                    <button type="button" onclick="openEventModal(${nextSofiaConsult.id})" class="p-1.5 rounded-lg hover:bg-white/70 dark:hover:bg-gray-700/60 text-sky-600 dark:text-sky-300" title="Editar consulta">✏️</button>
                                    <button type="button" onclick="deleteEvent(${nextSofiaConsult.id})" class="p-1.5 rounded-lg hover:bg-white/70 dark:hover:bg-gray-700/60 text-sky-600 dark:text-sky-300" title="Apagar consulta">🗑️</button>
                                </div>
                            ` : ''}
                        </div>
                        ${nextSofiaConsult ? `
                            <div class="flex items-center gap-3">
                                <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-cyan-500 flex items-center justify-center text-lg text-white shadow-lg shadow-sky-500/20">📅</div>
                                <div class="flex-1">
                                    <div class="font-medium text-sm">${nextSofiaConsult.title}</div>
                                    <div class="text-xs text-gray-500">${new Date(nextSofiaConsult.date + 'T00:00:00').toLocaleDateString('pt-PT', { weekday: 'short', day: '2-digit', month: 'short' })}${nextSofiaConsult.time ? ' • ' + nextSofiaConsult.time : ''}${nextSofiaConsult.description ? ' • ' + nextSofiaConsult.description : ''}</div>
                                </div>
                            </div>
                        ` : '<p class="text-sm text-gray-500">Ainda não existe nenhuma consulta futura.</p>'}
                    </div>
                </div>
            </div>

            <!-- Vaccines -->
            <div class="bg-gradient-to-br from-rose-50 via-pink-50 to-fuchsia-50 dark:from-rose-900/20 dark:via-pink-900/20 dark:to-fuchsia-900/20 rounded-xl border border-rose-100 dark:border-rose-800 p-4">
                <h3 class="font-bold text-lg mb-4 flex items-center gap-2">💉 Vacinas</h3>
                <div class="mb-4 p-4 bg-white/70 dark:bg-gray-900/25 rounded-2xl border border-rose-100 dark:border-rose-800">
                    <div class="flex items-center justify-between gap-3 mb-3">
                        <div>
                            <p class="text-sm font-semibold">Registar vacina</p>
                            <p class="text-xs text-gray-500">Data e hora da próxima vacina</p>
                        </div>
                        <span class="text-lg">💉</span>
                    </div>
                    <div class="grid grid-cols-2 gap-2 mb-2">
                        <input type="date" id="sofiaVaccineDate" value="${todayISO()}" class="px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-rose-100 dark:border-rose-800 text-sm outline-none focus:ring-2 focus:ring-rose-500">
                        <input type="time" id="sofiaVaccineTime" value="${new Date().toTimeString().slice(0,5)}" class="px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-rose-100 dark:border-rose-800 text-sm outline-none focus:ring-2 focus:ring-rose-500">
                    </div>
                    <input type="text" id="sofiaVaccineNote" placeholder="Notas da vacina (opcional)" class="w-full px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-rose-100 dark:border-rose-800 text-sm outline-none focus:ring-2 focus:ring-rose-500 mb-3">
                    <button type="button" onclick="registerSofiaVaccine()" class="w-full px-4 py-2.5 rounded-lg bg-gradient-to-r from-rose-500 to-fuchsia-500 text-white text-sm font-semibold shadow-lg shadow-rose-500/25 hover:shadow-xl hover:-translate-y-0.5 transition-all">
                        Registar vacina
                    </button>
                </div>
                <div class="grid gap-3">
                    <div class="p-3 rounded-xl bg-white/70 dark:bg-gray-900/25 border border-rose-100 dark:border-rose-800">
                        <div class="flex items-center justify-between gap-2 mb-2">
                            <p class="text-xs font-semibold uppercase tracking-wide text-rose-600 dark:text-rose-300">Última Vacina</p>
                            ${lastSofiaVaccine ? `
                                <div class="flex items-center gap-1">
                                    <button type="button" onclick="openEventModal(${lastSofiaVaccine.id})" class="p-1.5 rounded-lg hover:bg-white/70 dark:hover:bg-gray-700/60 text-rose-600 dark:text-rose-300" title="Editar vacina">✏️</button>
                                    <button type="button" onclick="deleteEvent(${lastSofiaVaccine.id})" class="p-1.5 rounded-lg hover:bg-white/70 dark:hover:bg-gray-700/60 text-rose-600 dark:text-rose-300" title="Apagar vacina">🗑️</button>
                                </div>
                            ` : ''}
                        </div>
                        ${lastSofiaVaccine ? `
                            <div class="flex items-center gap-3">
                                <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-fuchsia-500 flex items-center justify-center text-lg text-white shadow-lg shadow-rose-500/20">💉</div>
                                <div class="flex-1">
                                    <div class="font-medium text-sm">${lastSofiaVaccine.title}</div>
                                    <div class="text-xs text-gray-500">${new Date(lastSofiaVaccine.date + 'T00:00:00').toLocaleDateString('pt-PT', { weekday: 'short', day: '2-digit', month: 'short' })}${lastSofiaVaccine.time ? ' • ' + lastSofiaVaccine.time : ''}${lastSofiaVaccine.description ? ' • ' + lastSofiaVaccine.description : ''}</div>
                                </div>
                            </div>
                        ` : '<p class="text-sm text-gray-500">Ainda não existe nenhum registo de vacina.</p>'}
                    </div>
                    <div class="p-3 rounded-xl bg-white/70 dark:bg-gray-900/25 border border-fuchsia-100 dark:border-fuchsia-800">
                        <div class="flex items-center justify-between gap-2 mb-2">
                            <p class="text-xs font-semibold uppercase tracking-wide text-fuchsia-600 dark:text-fuchsia-300">Próxima Vacina</p>
                            ${nextSofiaVaccine ? `
                                <div class="flex items-center gap-1">
                                    <button type="button" onclick="openEventModal(${nextSofiaVaccine.id})" class="p-1.5 rounded-lg hover:bg-white/70 dark:hover:bg-gray-700/60 text-fuchsia-600 dark:text-fuchsia-300" title="Editar vacina">✏️</button>
                                    <button type="button" onclick="deleteEvent(${nextSofiaVaccine.id})" class="p-1.5 rounded-lg hover:bg-white/70 dark:hover:bg-gray-700/60 text-fuchsia-600 dark:text-fuchsia-300" title="Apagar vacina">🗑️</button>
                                </div>
                            ` : ''}
                        </div>
                        ${nextSofiaVaccine ? `
                            <div class="flex items-center gap-3">
                                <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-fuchsia-500 to-rose-500 flex items-center justify-center text-lg text-white shadow-lg shadow-fuchsia-500/20">📅</div>
                                <div class="flex-1">
                                    <div class="font-medium text-sm">${nextSofiaVaccine.title}</div>
                                    <div class="text-xs text-gray-500">${new Date(nextSofiaVaccine.date + 'T00:00:00').toLocaleDateString('pt-PT', { weekday: 'short', day: '2-digit', month: 'short' })}${nextSofiaVaccine.time ? ' • ' + nextSofiaVaccine.time : ''}${nextSofiaVaccine.description ? ' • ' + nextSofiaVaccine.description : ''}</div>
                                </div>
                            </div>
                        ` : '<p class="text-sm text-gray-500">Ainda não existe nenhuma vacina futura.</p>'}
                    </div>
                </div>
            </div>

        </div>
    </div>`;
    
    container.innerHTML = html;
}

function renderSofia(container) {
    renderPersonalArea(container, {
        memberId: 'sofia',
        title: 'Área da Sofia',
        consultPrefix: 'Consulta',
        vaccinePrefix: 'Vacina',
        accentClass: 'bg-gradient-to-br from-fuchsia-50 via-pink-50 to-rose-50 dark:from-fuchsia-900/20 dark:via-pink-900/20 dark:to-rose-900/20 border-fuchsia-100 dark:border-fuchsia-800',
        accentSoftClass: 'bg-gradient-to-br from-rose-50 via-fuchsia-50 to-pink-50 dark:from-rose-900/20 dark:via-fuchsia-900/20 dark:to-pink-900/20 border-rose-100 dark:border-rose-800',
        emptyConsultText: 'Ainda não existe nenhuma consulta futura.',
        emptyVaccineText: 'Ainda não existe nenhuma vacina futura.',
        showBabyExtras: false
    });
}

// ==================== PROFILES ====================
function renderProfiles(container) {
    let html = `
    <div class="fade-in">
        <h3 class="text-xl font-bold mb-6">👨‍👩‍👧‍🐕 Perfis da Família</h3>
        <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">`;
    
    State.members.forEach(m => {
        const memberEvents = State.events.filter(e => e.members.includes(m.id));
        const memberTasks = State.tasks.filter(t => t.assignedTo === m.id);
        const upcomingEvents = memberEvents.filter(e => e.date >= todayISO()).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 3);
        const pendingTasks = memberTasks.filter(t => !t.completed);
        const sidebarIcons = {
            andre: '👨',
            nayara: '👩',
            sofia: '🎀',
            gucci: '🐾'
        };
        const icon = sidebarIcons[m.id] || m.avatar;
        const iconClass = m.id === 'gucci' ? 'icon-white' : '';
        
        html += `
        <div class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden card-hover">
            <div class="${getMemberBg(m.id)} p-6 text-center">
                <div class="text-4xl font-bold mx-auto mb-3 leading-none"><span class="${iconClass}">${icon}</span></div>
                <h4 class="text-lg font-bold">${m.name}</h4>
                <p class="text-sm opacity-70">${m.role}</p>
            </div>
            <div class="p-4 space-y-3">
                <div class="flex justify-between text-sm">
                    <span class="text-gray-500">Eventos</span>
                    <span class="font-bold">${memberEvents.length}</span>
                </div>
                <div class="flex justify-between text-sm">
                    <span class="text-gray-500">Tarefas Pendentes</span>
                    <span class="font-bold">${pendingTasks.length}</span>
                </div>
                <div class="flex justify-between text-sm">
                    <span class="text-gray-500">Tarefas Concluídas</span>
                    <span class="font-bold">${memberTasks.filter(t => t.completed).length}</span>
                </div>
                
                ${upcomingEvents.length ? `
                    <div class="pt-3 border-t border-gray-100 dark:border-gray-700">
                        <p class="text-xs font-semibold text-gray-500 mb-2">PRÓXIMOS EVENTOS</p>
                        <div class="space-y-1">
                            ${upcomingEvents.map(e => `
                                <div class="text-xs flex items-center gap-2">
                                    <span class="event-dot ${getMemberColor(m.id).split(' ')[0].replace('text-white', '').replace('bg-', 'bg-').replace('500', '400')}"></span>
                                    <span class="truncate">${e.title}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
                
                ${pendingTasks.length ? `
                    <div class="pt-3 border-t border-gray-100 dark:border-gray-700">
                        <p class="text-xs font-semibold text-gray-500 mb-2">TAREFAS</p>
                        <div class="space-y-1">
                            ${pendingTasks.slice(0, 2).map(t => `
                                <div class="text-xs flex items-center gap-2">
                                    <span class="text-amber-500">⏰</span>
                                    <span class="truncate">${t.title}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
                
                <button onclick="State.filters.member='${m.id}'; navigateTo('calendar')" class="w-full mt-2 px-3 py-2 rounded-lg ${getMemberBg(m.id)} ${getMemberText(m.id)} text-sm font-medium hover:opacity-80 transition-opacity">
                    Ver Calendário
                </button>
            </div>
        </div>`;
    });
    
    html += '</div></div>';
    container.innerHTML = html;
}

// ==================== INIT ====================
document.addEventListener('DOMContentLoaded', async () => {
    State.currentPage = 'dashboard';
    await State.init();
    applyTheme(State.theme);
    
    // Close sidebar on mobile
    if (window.innerWidth < 1024) {
        document.getElementById('sidebar').classList.add('collapsed');
    }
    
    // Close sidebar on outside click (mobile)
    document.addEventListener('click', (e) => {
        const sidebar = document.getElementById('sidebar');
        const themePanel = document.getElementById('themePanel');
        if (themePanel && !themePanel.contains(e.target) && !e.target.closest('#themeButton')) {
            closeThemeMenu();
        }
        if (window.innerWidth < 1024 && !sidebar.classList.contains('collapsed') && !sidebar.contains(e.target) && !e.target.closest('button[onclick="toggleSidebar()"]')) {
            sidebar.classList.add('collapsed');
        }
    });
    
    navigateTo('dashboard');
});
