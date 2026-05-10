// ==================== SHOPPING LIST ====================
function renderShopping(container) {
    const filterFn = State.filters.shopping === 'pending' ? i => !i.bought : State.filters.shopping === 'bought' ? i => i.bought : () => true;
    const filteredItems = State.shoppingItems.filter(filterFn);
    const totalItems = State.shoppingItems.length;
    const boughtItems = State.shoppingItems.filter(i => i.bought).length;
    const pendingItems = State.shoppingItems.filter(i => !i.bought).length;
    const progress = totalItems ? Math.round((boughtItems / totalItems) * 100) : 0;
    
    let html = `
    <div class="fade-in pb-12">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div class="flex items-center gap-3">
                <div class="text-3xl bg-white dark:bg-gray-800 w-12 h-12 flex items-center justify-center rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">🛒</div>
                <div>
                    <h3 class="text-xl font-bold">Lista de Compras</h3>
                    <p class="text-sm text-gray-500 font-medium">${boughtItems}/${totalItems} itens comprados</p>
                </div>
            </div>
            <div class="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
                <button onclick="navigateTo('shopping_market')" class="w-full sm:w-auto px-6 py-3 bg-amber-500 text-white text-sm font-bold rounded-xl hover:bg-amber-600 transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2">
                    <span>🛒</span> Modo Mercado
                </button>
                <button onclick="focusShoppingInput()" class="w-full sm:w-auto px-6 py-3 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                    Adicionar Itens
                </button>
            </div>
        </div>
        
        <div class="bg-white dark:bg-gray-800 rounded-3xl p-5 mb-6 border border-gray-100 dark:border-gray-700 shadow-sm">
            <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                <div>
                    <h4 class="font-bold">Adicionar à lista</h4>
                    <p class="text-xs text-gray-500">Escreve vários produtos (separados por vírgula ou nova linha).</p>
                </div>
                <span class="text-[10px] px-2 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-bold uppercase tracking-wider">Entrada Rápida</span>
            </div>
            <textarea id="shoppingQuickAdd" rows="4" placeholder="Leite, pão, fraldas\nDetergente\nIogurtes" class="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-gray-700/50 border-0 outline-none focus:ring-2 focus:ring-indigo-500 resize-none text-sm"></textarea>
            <div class="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
                <p class="text-[11px] text-gray-500 italic order-2 sm:order-1">O texto é normalizado automaticamente para PT-PT.</p>
                <button onclick="saveQuickShoppingItems()" class="w-full sm:w-auto order-1 sm:order-2 px-6 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 transition-all shadow-md">Adicionar à Lista</button>
            </div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-3xl p-5 mb-6 border border-gray-100 dark:border-gray-700 shadow-sm">
            <div class="flex items-center justify-between mb-3">
                <span class="text-sm font-bold">Progresso Total</span>
                <span class="text-sm font-black text-indigo-600 dark:text-indigo-400">${progress}%</span>
            </div>
            <div class="w-full bg-gray-100 dark:bg-gray-700/50 rounded-full h-4 p-1">
                <div class="bg-gradient-to-r from-green-400 to-emerald-600 h-2 rounded-full transition-all duration-700 shadow-sm" style="width: ${progress}%"></div>
            </div>
            <div class="flex items-center justify-around mt-4 pt-4 border-t border-gray-50 dark:border-gray-700">
                <div class="text-center">
                    <p class="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-1">Pendentes</p>
                    <p class="text-lg font-black text-amber-500">${pendingItems}</p>
                </div>
                <div class="w-px h-8 bg-gray-100 dark:bg-gray-700"></div>
                <div class="text-center">
                    <p class="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-1">Comprados</p>
                    <p class="text-lg font-black text-emerald-500">${boughtItems}</p>
                </div>
            </div>
        </div>
        
        <div class="flex flex-col sm:flex-row gap-3 mb-6">
            <div class="grid grid-cols-3 gap-2 flex-1">
                <button onclick="State.filters.shopping='all'; renderShopping(document.getElementById('contentArea'))" class="px-2 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${State.filters.shopping === 'all' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'bg-white dark:bg-gray-800 text-gray-500 border border-gray-100 dark:border-gray-700'}">Todos</button>
                <button onclick="State.filters.shopping='pending'; renderShopping(document.getElementById('contentArea'))" class="px-2 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${State.filters.shopping === 'pending' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'bg-white dark:bg-gray-800 text-gray-500 border border-gray-100 dark:border-gray-700'}">Falta</button>
                <button onclick="State.filters.shopping='bought'; renderShopping(document.getElementById('contentArea'))" class="px-2 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${State.filters.shopping === 'bought' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'bg-white dark:bg-gray-800 text-gray-500 border border-gray-100 dark:border-gray-700'}">OK</button>
            </div>
            <button onclick="clearBoughtItems()" class="w-full sm:w-auto px-6 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/30 hover:bg-red-100 transition-all flex items-center justify-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                Limpar Comprados
            </button>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm">
            <div class="p-4 bg-gray-50/50 dark:bg-gray-700/30 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                <span class="font-black text-xs uppercase tracking-widest text-gray-500">Itens na Lista</span>
                <span class="text-[10px] px-2 py-0.5 rounded-full bg-gray-200 dark:bg-gray-600 font-bold">${filteredItems.length}</span>
            </div>
            <div class="divide-y divide-gray-50 dark:divide-gray-700">
                ${filteredItems.map(item => {
                    const member = getMember(item.addedBy);
                    return `
                    <div class="p-4 flex items-center gap-4 ${item.bought ? 'opacity-50 grayscale-[0.5]' : ''} hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-all">
                        <div class="flex items-center justify-center">
                            <input type="checkbox" class="checkbox-custom w-6 h-6" ${item.bought ? 'checked' : ''} onchange="toggleShoppingItem(${item.id})">
                        </div>
                        <div class="flex-1 min-w-0">
                            <div class="font-bold text-sm ${item.bought ? 'line-through text-gray-400' : 'text-gray-800 dark:text-gray-100'}">${item.name}</div>
                            <div class="flex items-center gap-2 text-[11px] text-gray-500 mt-0.5">
                                <span class="bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded font-bold">Qtd: ${item.quantity}</span>
                                ${item.notes ? `<span class="truncate">• ${item.notes}</span>` : ''}
                            </div>
                        </div>
                        <div class="flex items-center gap-1.5">
                            <div class="w-8 h-8 rounded-xl ${getMemberBg(member.id)} flex items-center justify-center text-sm shadow-sm ring-2 ring-white dark:ring-gray-800" title="${member.name}">${member.avatar}</div>
                            <div class="flex flex-col sm:flex-row gap-1">
                                <button onclick="openShoppingModal(${item.id})" class="p-2 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                                    <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                                </button>
                                <button onclick="deleteShoppingItem(${item.id})" class="p-2 rounded-lg bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors">
                                    <svg class="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                                </button>
                            </div>
                        </div>
                    </div>`;
                }).join('')}
            </div>
        </div>`;
    
    if (!filteredItems.length) {
        html += `
        <div class="text-center py-16 px-4">
            <div class="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-5xl mx-auto mb-4 animate-bounce">🛒</div>
            <h4 class="text-lg font-bold text-gray-800 dark:text-gray-100">A lista está vazia!</h4>
            <p class="text-sm text-gray-500 max-w-xs mx-auto mt-2">Que tal adicionar alguns itens para a próxima ida ao supermercado? 🎉</p>
        </div>`;
    }

    html += '</div>';
    container.innerHTML = html;
}

function renderShoppingFocus(container) {
    const items = [...State.shoppingItems].sort((a, b) => Number(a.bought) - Number(b.bought));
    const pendingCount = items.filter(i => !i.bought).length;
    const totalCount = items.length;
    const title = pendingCount > 0 ? `${pendingCount} itens por comprar` : 'Tudo comprado';

    let html = `
    <div class="fade-in min-h-full pb-20">
        <div class="max-w-3xl mx-auto">
            <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div>
                    <p class="text-[10px] uppercase font-black tracking-[0.3em] text-indigo-500 mb-1">🛒 MODO MERCADO</p>
                    <h3 class="text-2xl font-black text-gray-800 dark:text-gray-100">${title}</h3>
                    <p class="text-sm text-gray-500 font-medium">${totalCount} produtos na lista</p>
                </div>
                <div class="flex items-center gap-2 w-full sm:w-auto">
                    <button onclick="shareShoppingOnWhatsApp()" class="flex-1 sm:flex-none px-4 py-3 rounded-xl bg-green-600 text-white text-xs font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-500/20 flex items-center justify-center gap-2">
                        <span>💬</span> WhatsApp
                    </button>
                    <button onclick="navigateTo('shopping')" class="flex-1 sm:flex-none px-4 py-3 rounded-xl bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-bold border border-gray-200 dark:border-gray-700 hover:bg-gray-50 transition-all">
                        Sair
                    </button>
                </div>
            </div>

            <div class="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-xl overflow-hidden">
                <div class="p-5 bg-indigo-50/50 dark:bg-indigo-900/10 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                    <div>
                        <h4 class="font-bold text-indigo-900 dark:text-indigo-100">Checklist de compras</h4>
                        <p class="text-xs text-indigo-600/70 dark:text-indigo-400/70">Pica os produtos à medida que vais comprando.</p>
                    </div>
                    <span class="text-xs px-3 py-1 rounded-full bg-indigo-600 text-white font-black shadow-md shadow-indigo-500/20">${pendingCount}</span>
                </div>

                <div class="divide-y divide-gray-50 dark:divide-gray-700">
                    ${items.length ? items.map(item => `
                        <div class="p-5 flex items-center gap-4 ${item.bought ? 'opacity-50 bg-gray-50/30 dark:bg-gray-900/5' : ''} transition-all">
                            <input type="checkbox" class="checkbox-custom w-8 h-8" ${item.bought ? 'checked' : ''} onchange="toggleShoppingItem(${item.id})">
                            <div class="flex-1 min-w-0">
                                <div class="font-bold text-lg ${item.bought ? 'line-through text-gray-400' : 'text-gray-800 dark:text-gray-100'}">${item.name}</div>
                                <div class="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                    <span class="font-black bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-indigo-600 dark:text-indigo-400">${item.quantity > 1 ? `x${item.quantity}` : '1 uni'}</span>
                                    ${item.notes ? `<span class="truncate italic">• ${item.notes}</span>` : ''}
                                </div>
                            </div>
                            <div class="shrink-0">
                                ${item.bought 
                                    ? '<span class="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-lg">OK</span>' 
                                    : '<span class="text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-lg">FALTA</span>'}
                            </div>
                        </div>
                    `).join('') : `
                        <div class="p-16 text-center">
                            <div class="text-6xl mb-4 grayscale">🛒</div>
                            <h4 class="text-xl font-bold text-gray-400">Não há produtos na lista.</h4>
                        </div>
                    `}
                </div>
            </div>
        </div>
    </div>`;

    container.innerHTML = html;
}

function buildShoppingWhatsappText() {
    const pendingItems = State.shoppingItems.filter(item => !item.bought);
    if (!pendingItems.length) return '';

    const lines = ['Lista de compras:', ''];
    pendingItems.forEach(item => {
        const quantityText = item.quantity > 1 ? ` x${item.quantity}` : '';
        lines.push(`- ${item.name}${quantityText}`);
    });
    return lines.join('\n');
}

function shareShoppingOnWhatsApp() {
    const text = buildShoppingWhatsappText();
    if (!text) {
        showToast('Não há itens pendentes para partilhar', 'warning');
        return;
    }

    const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent || '');
    const url = isMobile
        ? `https://wa.me/?text=${encodeURIComponent(text)}`
        : `https://web.whatsapp.com/send?text=${encodeURIComponent(text)}`;

    window.open(url, '_blank', 'noopener,noreferrer');
}

function focusShoppingInput() {
    const input = document.getElementById('shoppingQuickAdd');
    if (input) {
        input.focus();
        input.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

function parseShoppingQuickText(rawText) {
    return rawText
        .split(/\n|,|;|•/g)
        .map(line => line.trim())
        .map(line => line.replace(/^\d+[\).\-\s]*/, '').trim())
        .map(normalizeShoppingItemName)
        .filter(Boolean);
}

function normalizeShoppingItemName(name) {
    const cleaned = (name || '')
        .normalize('NFC')
        .replace(/\s+/g, ' ')
        .replace(/\s*-\s*/g, '-')
        .trim();

    if (!cleaned) return '';

    const corrections = {
        pao: 'Pão',
        ovos: 'Ovos',
        arroz: 'Arroz',
        leite: 'Leite',
        queijo: 'Queijo',
        iogurte: 'Iogurte',
        iogurtes: 'Iogurtes',
        fraldas: 'Fraldas',
        detergente: 'Detergente',
        shampoo: 'Champô',
        sabao: 'Sabão',
        cafe: 'Café',
        acucar: 'Açúcar',
        farmacia: 'Farmácia'
    };

    const lower = cleaned.toLocaleLowerCase('pt-PT');
    if (corrections[lower]) return corrections[lower];

    const parts = lower.split(' ');
    const first = parts[0];
    if (corrections[first]) {
        return [corrections[first], ...parts.slice(1)].join(' ');
    }

    return lower.charAt(0).toLocaleUpperCase('pt-PT') + lower.slice(1);
}

function openShoppingModal(itemId = null) {
    const item = itemId ? State.shoppingItems.find(i => i.id.toString() === itemId.toString()) : null;
    const isEdit = !!item;
    
    const content = `
    <div class="p-6">
        <div class="flex items-center justify-between mb-6">
            <h3 class="text-xl font-bold">${isEdit ? 'Editar Item' : 'Novo Item'}</h3>
            <button onclick="closeModal()" class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
        </div>
        <form onsubmit="saveShoppingItem(event, ${itemId || 'null'})" class="space-y-4">
            <div>
                <label class="block text-sm font-medium mb-1">Nome do item *</label>
                <input type="text" id="shopName" value="${isEdit ? item.name : ''}" required spellcheck="true" lang="pt-PT" autocapitalize="sentences" autocorrect="on" class="w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 border-0 outline-none focus:ring-2 focus:ring-indigo-500">
            </div>
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm font-medium mb-1">Quantidade</label>
                    <input type="number" id="shopQty" value="${isEdit ? item.quantity : 1}" min="1" class="w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 border-0 outline-none focus:ring-2 focus:ring-indigo-500">
                </div>
                <div>
                    <label class="block text-sm font-medium mb-1">Prioridade</label>
                    <select id="shopPriority" class="w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 border-0 outline-none focus:ring-2 focus:ring-indigo-500">
                        <option value="baixa" ${isEdit && item.priority === 'baixa' ? 'selected' : ''}>Baixa</option>
                        <option value="media" ${isEdit && item.priority === 'media' ? 'selected' : ''}>Média</option>
                        <option value="alta" ${isEdit && item.priority === 'alta' ? 'selected' : ''}>Alta</option>
                    </select>
                </div>
            </div>
            <div>
                <label class="block text-sm font-medium mb-1">Observações</label>
                <input type="text" id="shopNotes" value="${isEdit ? item.notes || '' : ''}" class="w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 border-0 outline-none focus:ring-2 focus:ring-indigo-500">
            </div>
            <div class="flex gap-3 pt-2">
                <button type="button" onclick="closeModal()" class="flex-1 px-4 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-200 dark:hover:bg-gray-600">Cancelar</button>
                <button type="submit" class="flex-1 px-4 py-2.5 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700">${isEdit ? 'Guardar' : 'Adicionar'}</button>
            </div>
        </form>
    </div>`;
    
    openModal(content);
}

// ==================== FUNÇÕES CORRIGIDAS (ASYNC/AWAIT) ====================

async function saveQuickShoppingItems() {
    const input = document.getElementById('shoppingQuickAdd');
    if (!input) return;

    const lines = parseShoppingQuickText(input.value);

    if (!lines.length) {
        showToast('Escreve pelo menos um item', 'warning');
        return;
    }

    lines.forEach(name => {
        State.shoppingItems.push({
            id: Date.now() + Math.random(),
            name: normalizeShoppingItemName(name),
            category: 'outros',
            quantity: 1,
            priority: 'baixa',
            notes: '',
            addedBy: 'andre',
            bought: false
        });
    });

    await State.saveData(); // <-- AWAIT ADICIONADO
    input.value = '';
    renderPage();
    showToast(`${lines.length} ${lines.length === 1 ? 'item adicionado' : 'itens adicionados'}`);
}

async function saveShoppingItem(e, itemId) {
    e.preventDefault();
    const existingItem = itemId ? State.shoppingItems.find(i => i.id.toString() === itemId.toString()) : null;
    const itemData = {
        id: itemId || Date.now(),
        name: normalizeShoppingItemName(document.getElementById('shopName').value),
        category: itemId ? (existingItem?.category || 'outros') : 'outros',
        quantity: parseInt(document.getElementById('shopQty').value),
        priority: document.getElementById('shopPriority').value,
        notes: document.getElementById('shopNotes').value,
        addedBy: 'andre',
        bought: itemId ? !!existingItem?.bought : false
    };
    
    if (itemId) {
        const idx = State.shoppingItems.findIndex(i => i.id.toString() === itemId.toString());
        State.shoppingItems[idx] = itemData;
        showToast('Item atualizado!');
    } else {
        State.shoppingItems.push(itemData);
        showToast('Item adicionado!');
    }
    
    await State.saveData(); // <-- AWAIT ADICIONADO
    closeModal();
    renderPage();
}

async function toggleShoppingItem(id) {
    const item = State.shoppingItems.find(i => i.id.toString() === id.toString());
    item.bought = !item.bought;
    await State.saveData(); // <-- AWAIT ADICIONADO
    renderPage();
    if (item.bought) showToast(`"${item.name}" marcado como comprado!`);
}

async function deleteShoppingItem(id) {
    State.shoppingItems = State.shoppingItems.filter(i => i.id.toString() !== id.toString());
    await State.saveData(); // <-- AWAIT ADICIONADO
    showToast('Item removido', 'warning');
    renderPage();
}

async function clearBoughtItems() {
    const count = State.shoppingItems.filter(i => i.bought).length;
    if (count === 0) return;
    if (confirm(`Remover ${count} itens comprados?`)) {
        State.shoppingItems = State.shoppingItems.filter(i => !i.bought);
        await State.saveData(); // <-- AWAIT ADICIONADO
        showToast(`${count} itens removidos!`);
        renderPage();
    }
}
