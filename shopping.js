// ==================== SHOPPING LIST ====================
function renderShopping(container) {
    const filterFn = State.filters.shopping === 'pending' ? i => !i.bought : State.filters.shopping === 'bought' ? i => i.bought : () => true;
    const filteredItems = State.shoppingItems.filter(filterFn);
    const totalItems = State.shoppingItems.length;
    const boughtItems = State.shoppingItems.filter(i => i.bought).length;
    const pendingItems = State.shoppingItems.filter(i => !i.bought).length;
    const progress = totalItems ? Math.round((boughtItems / totalItems) * 100) : 0;
    
    let html = `
    <div class="fade-in">
        <div class="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div class="flex items-center gap-3">
                <div class="text-3xl">🛒</div>
                <div>
                    <h3 class="text-xl font-bold">Lista de Compras</h3>
                    <p class="text-sm text-gray-500">${boughtItems}/${totalItems} itens comprados</p>
                </div>
            </div>
            <button onclick="focusShoppingInput()" class="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                Adicionar Itens
            </button>
        </div>
        
        <div class="bg-white dark:bg-gray-800 rounded-xl p-4 mb-6 border border-gray-100 dark:border-gray-700 shadow-sm">
            <div class="flex items-center justify-between gap-3 mb-2">
                <div>
                    <h4 class="font-bold">Adicionar à lista</h4>
                    <p class="text-xs text-gray-500">Escreve vários produtos de uma vez. Cada linha, vírgula ou ponto e vírgula vira um item com checkbox. O texto é normalizado em PT-PT.</p>
                </div>
                <span class="text-xs px-2 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300">Sem categorias</span>
            </div>
            <textarea id="shoppingQuickAdd" rows="4" placeholder="Leite, pão, fraldas\nDetergente\nIogurtes" spellcheck="true" lang="pt-PT" autocapitalize="sentences" autocorrect="on" class="shopping-quick-add w-full px-3 py-2 rounded-xl bg-gray-100 dark:bg-gray-700 border-0 outline-none focus:ring-2 focus:ring-indigo-500 resize-none"></textarea>
            <div class="flex items-center justify-between gap-3 mt-3">
                <p class="text-xs text-gray-500">Podes colar uma lista inteira de uma vez.</p>
                <button onclick="saveQuickShoppingItems()" class="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors">Adicionar à Lista</button>
            </div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-xl p-4 mb-6 border border-gray-100 dark:border-gray-700">
            <div class="flex items-center justify-between mb-2">
                <span class="text-sm font-medium">Progresso</span>
                <span class="text-sm font-bold">${progress}%</span>
            </div>
            <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div class="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full transition-all duration-500" style="width: ${progress}%"></div>
            </div>
            <div class="flex items-center gap-3 mt-3 text-xs text-gray-500">
                <span>Pendentes: <strong>${pendingItems}</strong></span>
                <span>Comprados: <strong>${boughtItems}</strong></span>
            </div>
        </div>
        
        <div class="flex items-center gap-3 mb-4">
            <button onclick="State.filters.shopping='all'; renderShopping(document.getElementById('contentArea'))" class="px-3 py-1.5 text-sm rounded-lg ${State.filters.shopping === 'all' ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' : 'bg-gray-100 dark:bg-gray-700'}">Todos</button>
            <button onclick="State.filters.shopping='pending'; renderShopping(document.getElementById('contentArea'))" class="px-3 py-1.5 text-sm rounded-lg ${State.filters.shopping === 'pending' ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' : 'bg-gray-100 dark:bg-gray-700'}">Pendentes</button>
            <button onclick="State.filters.shopping='bought'; renderShopping(document.getElementById('contentArea'))" class="px-3 py-1.5 text-sm rounded-lg ${State.filters.shopping === 'bought' ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' : 'bg-gray-100 dark:bg-gray-700'}">Comprados</button>
            <button onclick="clearBoughtItems()" class="ml-auto px-3 py-1.5 text-sm rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50">Limpar comprados</button>
        </div>`;

    html += `
        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div class="p-3 bg-gray-50 dark:bg-gray-700/50 flex items-center justify-between gap-2">
                <span class="font-bold text-sm">Itens da lista</span>
                <span class="text-xs text-gray-500">${filteredItems.length} ${filteredItems.length === 1 ? 'item' : 'itens'}</span>
            </div>
            <div class="divide-y divide-gray-100 dark:divide-gray-700">
                ${filteredItems.map(item => {
                    const member = getMember(item.addedBy);
                    return `
                    <div class="p-3 flex items-center gap-3 ${item.bought ? 'opacity-50' : ''} hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                        <input type="checkbox" class="checkbox-custom" ${item.bought ? 'checked' : ''} onchange="toggleShoppingItem(${item.id})">
                        <div class="flex-1 min-w-0">
                            <div class="font-medium ${item.bought ? 'line-through' : ''}">${item.name}</div>
                            <div class="flex items-center gap-2 text-xs text-gray-500">
                                <span>Qtd: ${item.quantity}</span>
                                ${item.notes ? `<span>• ${item.notes}</span>` : ''}
                            </div>
                        </div>
                        <div class="flex items-center gap-2">
                            <div class="w-6 h-6 rounded-full ${getMemberColor(member.id)} flex items-center justify-center text-xs">${member.avatar}</div>
                            <button onclick="openShoppingModal(${item.id})" class="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600">
                                <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                            </button>
                            <button onclick="deleteShoppingItem(${item.id})" class="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30">
                                <svg class="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                            </button>
                        </div>
                    </div>`;
                }).join('')}
            </div>
        </div>`;
    
    if (!filteredItems.length) {
        html += '<div class="text-center py-12 text-gray-500"><p class="text-4xl mb-2">🎉</p><p>Lista vazia!</p></div>';
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
    <div class="fade-in min-h-full">
        <div class="max-w-3xl mx-auto">
            <div class="flex items-center justify-between gap-4 mb-5">
                <div>
                    <p class="text-[10px] uppercase tracking-[0.28em] text-gray-400 dark:text-gray-500">Modo Mercado</p>
                    <h3 class="text-2xl font-bold">${title}</h3>
                    <p class="text-sm text-gray-500">${totalCount} ${totalCount === 1 ? 'produto' : 'produtos'} na lista</p>
                </div>
                <div class="flex items-center gap-2">
                    <button onclick="shareShoppingOnWhatsApp()" class="px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors shadow-sm">
                        Partilhar no WhatsApp
                    </button>
                    <button onclick="navigateTo('shopping')" class="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">Sair do modo mercado</button>
                </div>
            </div>

            <div class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
                <div class="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                    <div>
                        <h4 class="font-bold">Checklist de compras</h4>
                        <p class="text-xs text-gray-500">Pica os produtos à medida que vais comprando.</p>
                    </div>
                    <span class="text-xs px-2 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">${pendingCount} pendentes</span>
                </div>

                <div class="divide-y divide-gray-100 dark:divide-gray-700">
                    ${items.length ? items.map(item => `
                        <div class="p-4 flex items-center gap-3 ${item.bought ? 'opacity-50 bg-gray-50/60 dark:bg-gray-700/30' : ''} transition-colors">
                            <input type="checkbox" class="checkbox-custom" ${item.bought ? 'checked' : ''} onchange="toggleShoppingItem(${item.id})">
                            <div class="flex-1 min-w-0">
                                <div class="font-semibold ${item.bought ? 'line-through' : ''}">${item.name}</div>
                                <div class="text-xs text-gray-500 mt-0.5">
                                    ${item.quantity > 1 ? `Qtd: ${item.quantity}` : '1 unidade'}
                                    ${item.notes ? ` • ${item.notes}` : ''}
                                </div>
                            </div>
                            ${item.bought ? '<span class="text-xs px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">Comprado</span>' : '<span class="text-xs px-2 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">Por comprar</span>'}
                        </div>
                    `).join('') : `
                        <div class="p-10 text-center text-gray-500">
                            <div class="text-4xl mb-2">🛒</div>
                            <p>Não há produtos na lista.</p>
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
    const item = itemId ? State.shoppingItems.find(i => i.id === itemId) : null;
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
    const existingItem = itemId ? State.shoppingItems.find(i => i.id === itemId) : null;
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
        const idx = State.shoppingItems.findIndex(i => i.id === itemId);
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
    const item = State.shoppingItems.find(i => i.id === id);
    item.bought = !item.bought;
    await State.saveData(); // <-- AWAIT ADICIONADO
    renderPage();
    if (item.bought) showToast(`"${item.name}" marcado como comprado!`);
}

async function deleteShoppingItem(id) {
    State.shoppingItems = State.shoppingItems.filter(i => i.id !== id);
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
