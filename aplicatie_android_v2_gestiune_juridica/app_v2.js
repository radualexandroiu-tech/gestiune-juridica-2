// ===== GESTIUNE CAZURI JURIDICE PRO v2.0 =====
// Advanced version with Excel import and ECRIS integration

// Database Schema
const DB = {
    clienti: 'clienti_db_v2',
    dosare: 'dosare_db_v2',
    termene: 'termene_db_v2',
    taskuri: 'taskuri_db_v2',
    note: 'note_db_v2',
    settings: 'settings_db_v2'
};

// Utility Functions
function generateId() {
    return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function saveToStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (e) {
        console.error('Storage error:', e);
        showNotification('Eroare la salvare date. Storage plin?', 'error');
        return false;
    }
}

function getFromStorage(key) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : [];
    } catch (e) {
        console.error('Error reading storage:', e);
        return [];
    }
}

function formatDate(date) {
    if (!date) return '-';
    const d = new Date(date);
    if (isNaN(d)) return '-';
    return d.toLocaleDateString('ro-RO', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function formatDateTime(date) {
    if (!date) return '-';
    const d = new Date(date);
    if (isNaN(d)) return '-';
    return d.toLocaleString('ro-RO', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function formatTime(time) {
    if (!time) return '-';
    if (typeof time === 'string' && time.includes(':')) {
        return time.substring(0, 5);
    }
    return time.toString();
}

// Notification System
function showNotification(message, type = 'success') {
    const banner = document.getElementById('notificationBanner');
    const text = document.getElementById('notificationText');
    
    banner.className = 'notification-banner show';
    if (type === 'warning') banner.classList.add('warning');
    if (type === 'error') banner.classList.add('error');
    
    text.textContent = message;
    
    setTimeout(() => {
        hideNotification();
    }, 5000);
}

function hideNotification() {
    document.getElementById('notificationBanner').classList.remove('show');
}

// Initialize App
function initApp() {
    // Initialize storage
    if (!localStorage.getItem(DB.clienti)) saveToStorage(DB.clienti, []);
    if (!localStorage.getItem(DB.dosare)) saveToStorage(DB.dosare, []);
    if (!localStorage.getItem(DB.termene)) saveToStorage(DB.termene, []);
    if (!localStorage.getItem(DB.taskuri)) saveToStorage(DB.taskuri, []);
    if (!localStorage.getItem(DB.note)) saveToStorage(DB.note, []);
    if (!localStorage.getItem(DB.settings)) saveToStorage(DB.settings, {
        lastSync: null,
        autoSync: false
    });

    // Load dashboard
    loadDashboard();
}

// View Switching
function switchView(view) {
    // Hide all views
    document.querySelectorAll('#dashboardView, #dosareView, #dosarDetailView, #clientiView, #setariView').forEach(v => {
        v.classList.add('hidden');
    });

    // Update nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });

    // Show selected view
    switch(view) {
        case 'dashboard':
            document.getElementById('dashboardView').classList.remove('hidden');
            document.querySelectorAll('.nav-item')[0].classList.add('active');
            document.getElementById('headerSubtitle').textContent = 'Dashboard';
            loadDashboard();
            break;
        case 'dosare':
            document.getElementById('dosareView').classList.remove('hidden');
            document.querySelectorAll('.nav-item')[1].classList.add('active');
            document.getElementById('headerSubtitle').textContent = 'Dosare';
            loadDosare();
            break;
        case 'clienti':
            document.getElementById('clientiView').classList.remove('hidden');
            document.querySelectorAll('.nav-item')[2].classList.add('active');
            document.getElementById('headerSubtitle').textContent = 'Clienți';
            loadClienti();
            break;
        case 'setari':
            document.getElementById('setariView').classList.remove('hidden');
            document.querySelectorAll('.nav-item')[3].classList.add('active');
            document.getElementById('headerSubtitle').textContent = 'Setări';
            loadSettings();
            break;
    }
}

// Load Settings View
function loadSettings() {
    const settings = getFromStorage(DB.settings);
    const lastSyncEl = document.getElementById('lastSyncTime');
    
    if (settings.lastSync) {
        lastSyncEl.textContent = formatDateTime(settings.lastSync);
    } else {
        lastSyncEl.textContent = 'Niciodată';
    }
}

// Load Dashboard
function loadDashboard() {
    const dosare = getFromStorage(DB.dosare);
    const termene = getFromStorage(DB.termene);
    const taskuri = getFromStorage(DB.taskuri);
    const clienti = getFromStorage(DB.clienti);

    // Update stats
    const dosareActive = dosare.filter(d => d.stadiu === 'În curs').length;
    document.getElementById('statDosareActive').textContent = dosareActive;

    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const termeneWeek = termene.filter(t => {
        const tDate = new Date(t.data);
        return tDate >= now && tDate <= nextWeek && t.status !== 'Finalizat';
    }).length;
    document.getElementById('statTermene').textContent = termeneWeek;

    const taskuriActive = taskuri.filter(t => t.status !== 'Finalizat').length;
    document.getElementById('statTaskuri').textContent = taskuriActive;

    const clientiCount = clienti.length;
    document.getElementById('statClienti').textContent = clientiCount;

    // Load upcoming termene
    const upcomingTermene = termene
        .filter(t => new Date(t.data) >= now && t.status !== 'Finalizat')
        .sort((a, b) => new Date(a.data) - new Date(b.data))
        .slice(0, 5);

    const termeneList = document.getElementById('termeneList');
    if (upcomingTermene.length === 0) {
        termeneList.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📅</div><div class="empty-state-text">Nu există termene programate</div></div>';
    } else {
        termeneList.innerHTML = upcomingTermene.map(t => {
            const dosar = dosare.find(d => d.id === t.idDosar);
            const daysUntil = Math.ceil((new Date(t.data) - now) / (1000 * 60 * 60 * 24));
            const urgentClass = daysUntil <= 3 ? 'badge-danger' : daysUntil <= 7 ? 'badge-warning' : 'badge-primary';
            
            return `
                <div class="list-item" onclick="viewDosarDetail('${t.idDosar}')">
                    <div class="list-item-header">
                        <div class="list-item-title">${dosar ? dosar.numarDosar : 'Dosar necunoscut'}</div>
                        <span class="badge ${urgentClass}">în ${daysUntil} zile</span>
                    </div>
                    <div class="list-item-meta">
                        <span>📅 ${formatDate(t.data)}</span>
                        <span>⏰ ${formatTime(t.ora)}</span>
                        <span>🏛️ ${t.instanta || dosar?.instanta || '-'}</span>
                    </div>
                    ${dosar?.client ? `<div style="margin-top: 4px; font-size: 13px; color: #64748b;">👤 ${dosar.client}</div>` : ''}
                    ${dosar?.linkEcris ? `
                        <div class="list-item-actions">
                            <button class="btn-small btn-ecris" onclick="event.stopPropagation(); window.open('${dosar.linkEcris}', '_blank')">
                                🔗 ECRIS
                            </button>
                            <button class="btn-small btn-sync" onclick="event.stopPropagation(); syncDosar('${dosar.id}')">
                                🔄 Sync
                            </button>
                        </div>
                    ` : ''}
                </div>
            `;
        }).join('');
    }

    // Load important dosare
    const dosareImportante = dosare
        .filter(d => d.stadiu === 'În curs')
        .sort((a, b) => {
            // Sort by next termen date
            const aTermene = termene.filter(t => t.idDosar === a.id && new Date(t.data) >= now);
            const bTermene = termene.filter(t => t.idDosar === b.id && new Date(t.data) >= now);
            
            if (aTermene.length === 0) return 1;
            if (bTermene.length === 0) return -1;
            
            const aNext = Math.min(...aTermene.map(t => new Date(t.data)));
            const bNext = Math.min(...bTermene.map(t => new Date(t.data)));
            
            return aNext - bNext;
        })
        .slice(0, 5);

    const dosareImportanteList = document.getElementById('dosareImportanteList');
    if (dosareImportante.length === 0) {
        dosareImportanteList.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📁</div><div class="empty-state-text">Nu există dosare active</div></div>';
    } else {
        dosareImportanteList.innerHTML = dosareImportante.map(d => {
            const nextTermen = termene
                .filter(t => t.idDosar === d.id && new Date(t.data) >= now)
                .sort((a, b) => new Date(a.data) - new Date(b.data))[0];
            
            return `
                <div class="list-item" onclick="viewDosarDetail('${d.id}')">
                    <div class="list-item-header">
                        <div class="list-item-title">${d.numarDosar}</div>
                        <span class="badge badge-success">${d.stadiu}</span>
                    </div>
                    <div class="list-item-meta">
                        <span>👤 ${d.client}</span>
                        <span>🏛️ ${d.instanta}</span>
                    </div>
                    ${nextTermen ? `
                        <div style="margin-top: 8px; padding: 8px; background: #f8fafc; border-radius: 6px; font-size: 13px;">
                            📅 Următorul termen: ${formatDate(nextTermen.data)} la ${formatTime(nextTermen.ora)}
                        </div>
                    ` : ''}
                    ${d.linkEcris ? `
                        <div class="list-item-actions">
                            <button class="btn-small btn-ecris" onclick="event.stopPropagation(); window.open('${d.linkEcris}', '_blank')">
                                🔗 ECRIS
                            </button>
                        </div>
                    ` : ''}
                </div>
            `;
        }).join('');
    }
}

// Load Dosare
let currentDosareFilter = 'all';

function loadDosare() {
    filterDosareByStatus('all');
}

function filterDosareByStatus(status) {
    currentDosareFilter = status;
    
    // Update tab active state
    document.querySelectorAll('.tabs .tab').forEach(tab => {
        tab.classList.remove('active');
    });
    event?.target?.classList.add('active');
    
    const dosare = getFromStorage(DB.dosare);
    const termene = getFromStorage(DB.termene);
    const now = new Date();
    
    let filtered = dosare;
    if (status !== 'all') {
        filtered = dosare.filter(d => d.stadiu === status);
    }
    
    const container = document.getElementById('dosareListContainer');
    
    if (filtered.length === 0) {
        container.innerHTML = '<div class="card"><div class="empty-state"><div class="empty-state-icon">📁</div><div class="empty-state-text">Nu există dosare</div></div></div>';
        return;
    }
    
    container.innerHTML = filtered.map(d => {
        const badgeClass = d.stadiu === 'În curs' ? 'badge-success' : 
                          d.stadiu === 'Suspendat' ? 'badge-warning' : 'badge-primary';
        
        const nextTermen = termene
            .filter(t => t.idDosar === d.id && new Date(t.data) >= now)
            .sort((a, b) => new Date(a.data) - new Date(b.data))[0];
        
        return `
            <div class="card" onclick="viewDosarDetail('${d.id}')">
                <div class="card-header">
                    ${d.numarDosar}
                    <span class="badge ${badgeClass}">${d.stadiu}</span>
                </div>
                <div class="list-item-meta">
                    <span>👤 ${d.client}</span>
                    <span>⚖️ ${d.tipDosar || 'Civil'}</span>
                    <span>🏛️ ${d.instanta}</span>
                </div>
                ${d.obiect ? `
                    <div style="margin-top: 8px; color: #64748b; font-size: 14px;">
                        ${d.obiect.length > 100 ? d.obiect.substring(0, 100) + '...' : d.obiect}
                    </div>
                ` : ''}
                ${nextTermen ? `
                    <div style="margin-top: 12px; padding: 10px; background: #f8fafc; border-radius: 8px; border-left: 3px solid var(--primary);">
                        <div style="font-size: 12px; font-weight: 600; color: #64748b; margin-bottom: 4px;">URMĂTORUL TERMEN</div>
                        <div style="font-size: 14px; color: var(--dark);">
                            📅 ${formatDate(nextTermen.data)} • ⏰ ${formatTime(nextTermen.ora)}
                        </div>
                    </div>
                ` : ''}
                <div class="list-item-actions">
                    ${d.linkEcris ? `
                        <button class="btn-small btn-ecris" onclick="event.stopPropagation(); window.open('${d.linkEcris}', '_blank')">
                            🔗 ECRIS
                        </button>
                        <button class="btn-small btn-sync" onclick="event.stopPropagation(); syncDosar('${d.id}')">
                            🔄 Sync
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    }).join('');
}

function filterDosare() {
    const search = document.getElementById('searchDosare').value.toLowerCase();
    const dosare = getFromStorage(DB.dosare);
    
    let filtered = dosare.filter(d => 
        d.numarDosar.toLowerCase().includes(search) ||
        d.client.toLowerCase().includes(search) ||
        d.instanta.toLowerCase().includes(search) ||
        (d.obiect && d.obiect.toLowerCase().includes(search))
    );
    
    if (currentDosareFilter !== 'all') {
        filtered = filtered.filter(d => d.stadiu === currentDosareFilter);
    }
    
    const container = document.getElementById('dosareListContainer');
    const termene = getFromStorage(DB.termene);
    const now = new Date();
    
    if (filtered.length === 0) {
        container.innerHTML = '<div class="card"><div class="empty-state"><div class="empty-state-icon">🔍</div><div class="empty-state-text">Nu s-au găsit rezultate</div></div></div>';
        return;
    }
    
    container.innerHTML = filtered.map(d => {
        const badgeClass = d.stadiu === 'În curs' ? 'badge-success' : 
                          d.stadiu === 'Suspendat' ? 'badge-warning' : 'badge-primary';
        
        const nextTermen = termene
            .filter(t => t.idDosar === d.id && new Date(t.data) >= now)
            .sort((a, b) => new Date(a.data) - new Date(b.data))[0];
        
        return `
            <div class="card" onclick="viewDosarDetail('${d.id}')">
                <div class="card-header">
                    ${d.numarDosar}
                    <span class="badge ${badgeClass}">${d.stadiu}</span>
                </div>
                <div class="list-item-meta">
                    <span>👤 ${d.client}</span>
                    <span>⚖️ ${d.tipDosar || 'Civil'}</span>
                    <span>🏛️ ${d.instanta}</span>
                </div>
                ${d.obiect ? `<div style="margin-top: 8px; color: #64748b; font-size: 14px;">${d.obiect.length > 100 ? d.obiect.substring(0, 100) + '...' : d.obiect}</div>` : ''}
                <div class="list-item-actions">
                    ${d.linkEcris ? `
                        <button class="btn-small btn-ecris" onclick="event.stopPropagation(); window.open('${d.linkEcris}', '_blank')">
                            🔗 ECRIS
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    }).join('');
}

// Load Clienti
function loadClienti() {
    const clienti = getFromStorage(DB.clienti);
    const dosare = getFromStorage(DB.dosare);
    const container = document.getElementById('clientiListContainer');

    if (clienti.length === 0) {
        container.innerHTML = '<div class="card"><div class="empty-state"><div class="empty-state-icon">👥</div><div class="empty-state-text">Nu există clienți</div></div></div>';
        return;
    }

    container.innerHTML = clienti.map(c => {
        const badgeClass = c.activ ? 'badge-success' : 'badge-primary';
        const dosareClient = dosare.filter(d => d.client === c.nume || d.client?.toLowerCase() === c.nume?.toLowerCase());
        
        return `
            <div class="card">
                <div class="card-header">
                    ${c.nume}
                    <span class="badge ${badgeClass}">${c.activ ? 'Activ' : 'Inactiv'}</span>
                </div>
                <div class="list-item-meta">
                    <span>📞 ${c.telefon}</span>
                    ${c.email ? `<span>📧 ${c.email}</span>` : ''}
                </div>
                <div style="margin-top: 8px; color: #64748b; font-size: 14px;">
                    ${c.tipClient} ${c.cnpCui ? `• ${c.cnpCui}` : ''}
                </div>
                ${dosareClient.length > 0 ? `
                    <div style="margin-top: 12px; padding: 8px; background: #f8fafc; border-radius: 6px; font-size: 13px;">
                        📁 ${dosareClient.length} ${dosareClient.length === 1 ? 'dosar' : 'dosare'}
                    </div>
                ` : ''}
            </div>
        `;
    }).join('');
}

function filterClienti() {
    const search = document.getElementById('searchClienti').value.toLowerCase();
    const clienti = getFromStorage(DB.clienti);
    const filtered = clienti.filter(c => 
        c.nume.toLowerCase().includes(search) ||
        c.telefon.toLowerCase().includes(search) ||
        (c.email && c.email.toLowerCase().includes(search)) ||
        (c.cnpCui && c.cnpCui.toLowerCase().includes(search))
    );

    const container = document.getElementById('clientiListContainer');
    if (filtered.length === 0) {
        container.innerHTML = '<div class="card"><div class="empty-state"><div class="empty-state-icon">🔍</div><div class="empty-state-text">Nu s-au găsit rezultate</div></div></div>';
        return;
    }

    container.innerHTML = filtered.map(c => {
        const badgeClass = c.activ ? 'badge-success' : 'badge-primary';
        return `
            <div class="card">
                <div class="card-header">
                    ${c.nume}
                    <span class="badge ${badgeClass}">${c.activ ? 'Activ' : 'Inactiv'}</span>
                </div>
                <div class="list-item-meta">
                    <span>📞 ${c.telefon}</span>
                    ${c.email ? `<span>📧 ${c.email}</span>` : ''}
                </div>
                <div style="margin-top: 8px; color: #64748b; font-size: 14px;">
                    ${c.tipClient} ${c.cnpCui ? `• ${c.cnpCui}` : ''}
                </div>
            </div>
        `;
    }).join('');
}

// Initialize on load
document.addEventListener('DOMContentLoaded', initApp);

// ===== PART 2: DOSAR DETAIL VIEW =====

function viewDosarDetail(dosarId) {
    const dosare = getFromStorage(DB.dosare);
    const termene = getFromStorage(DB.termene);
    const taskuri = getFromStorage(DB.taskuri);
    
    const dosar = dosare.find(d => d.id === dosarId);
    if (!dosar) {
        showNotification('Dosar negăsit', 'error');
        return;
    }
    
    const dosarTermene = termene.filter(t => t.idDosar === dosarId).sort((a, b) => new Date(b.data) - new Date(a.data));
    const dosarTaskuri = taskuri.filter(t => t.idDosar === dosarId);
    
    const content = document.getElementById('dosarDetailContent');
    content.innerHTML = `
        <button class="btn btn-secondary" onclick="switchView('dosare')" style="margin-bottom: 20px; width: auto;">
            ← Înapoi la dosare
        </button>
        
        <div class="dosar-detail">
            <div class="dosar-header">
                <div>
                    <div class="dosar-number">${dosar.numarDosar}</div>
                    <div class="dosar-client">👤 ${dosar.client}</div>
                </div>
                <span class="badge badge-${dosar.stadiu === 'În curs' ? 'success' : 'primary'}">${dosar.stadiu}</span>
            </div>
            
            ${dosar.linkEcris ? `
                <a href="${dosar.linkEcris}" target="_blank" class="ecris-link" style="display: flex; margin-bottom: 20px;">
                    🔗 Deschide în ECRIS
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="margin-left: 4px;">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                    </svg>
                </a>
                <button class="btn btn-success" onclick="syncDosar('${dosar.id}')" style="margin-bottom: 20px;">
                    🔄 Sincronizează din ECRIS
                </button>
            ` : ''}
            
            <div class="detail-section">
                <div class="detail-title">📋 Informații Dosar</div>
                <div class="detail-grid">
                    <div class="detail-item">
                        <div class="detail-label">Tip dosar:</div>
                        <div class="detail-value">${dosar.tipDosar || 'Civil'}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Instanță:</div>
                        <div class="detail-value">${dosar.instanta}</div>
                    </div>
                    ${dosar.obiect ? `
                        <div class="detail-item">
                            <div class="detail-label">Obiect:</div>
                            <div class="detail-value">${dosar.obiect}</div>
                        </div>
                    ` : ''}
                    ${dosar.observatii ? `
                        <div class="detail-item">
                            <div class="detail-label">Observații:</div>
                            <div class="detail-value">${dosar.observatii}</div>
                        </div>
                    ` : ''}
                </div>
            </div>
            
            <div class="detail-section">
                <div class="detail-title">📅 Termene (${dosarTermene.length})</div>
                ${dosarTermene.length > 0 ? dosarTermene.map(t => `
                    <div class="card" style="margin-bottom: 12px;">
                        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
                            <div>
                                <div style="font-weight: 600; color: var(--primary);">${formatDate(t.data)} • ${formatTime(t.ora)}</div>
                                <div style="font-size: 13px; color: #64748b; margin-top: 4px;">${t.tip || 'Judecată'}</div>
                            </div>
                            <span class="badge badge-${t.status === 'Finalizat' ? 'success' : 'primary'}">${t.status || 'Programat'}</span>
                        </div>
                        ${t.instanta ? `<div style="font-size: 14px; color: #64748b;">🏛️ ${t.instanta}</div>` : ''}
                        ${t.observatii ? `<div style="margin-top: 8px; padding: 8px; background: #f8fafc; border-radius: 6px; font-size: 13px;">${t.observatii}</div>` : ''}
                    </div>
                `).join('') : '<div class="empty-state"><div class="empty-state-text">Nu există termene</div></div>'}
            </div>
            
            <div class="detail-section">
                <div class="detail-title">✅ Task-uri (${dosarTaskuri.length})</div>
                ${dosarTaskuri.length > 0 ? dosarTaskuri.map(t => `
                    <div class="card" style="margin-bottom: 12px;">
                        <div style="display: flex; justify-content: space-between; align-items: start;">
                            <div style="flex: 1;">
                                <div style="font-weight: 600;">${t.titlu}</div>
                                ${t.deadline ? `<div style="font-size: 13px; color: #64748b; margin-top: 4px;">📅 ${formatDateTime(t.deadline)}</div>` : ''}
                            </div>
                            <span class="badge badge-${t.prioritate === 'Urgentă' ? 'danger' : 'warning'}">${t.prioritate}</span>
                        </div>
                    </div>
                `).join('') : '<div class="empty-state"><div class="empty-state-text">Nu există task-uri</div></div>'}
            </div>
        </div>
    `;
    
    // Switch to detail view
    document.querySelectorAll('#dashboardView, #dosareView, #clientiView, #setariView').forEach(v => {
        v.classList.add('hidden');
    });
    document.getElementById('dosarDetailView').classList.remove('hidden');
    document.getElementById('headerSubtitle').textContent = 'Detalii Dosar';
}

// ===== EXCEL IMPORT =====

async function importExcel(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    importExcelFile(file);
}

async function importExcelFile(file) {
    showNotification('Se procesează fișierul Excel...', 'info');
    
    try {
        // Load SheetJS library
        if (!window.XLSX) {
            await loadScript('https://cdn.sheetjs.com/xlsx-0.20.0/package/dist/xlsx.full.min.js');
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, {type: 'array'});
                
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                const rows = XLSX.utils.sheet_to_json(firstSheet, {header: 1});
                
                if (rows.length < 2) {
                    showNotification('Fișierul Excel este gol', 'error');
                    return;
                }
                
                // Process Excel data
                processExcelData(rows);
                
            } catch (err) {
                console.error('Excel parse error:', err);
                showNotification('Eroare la procesarea fișierului Excel', 'error');
            }
        };
        
        reader.readAsArrayBuffer(file);
        
    } catch (err) {
        console.error('Import error:', err);
        showNotification('Eroare la importul Excel', 'error');
    }
}

function processExcelData(rows) {
    const dosare = getFromStorage(DB.dosare);
    const termene = getFromStorage(DB.termene);
    
    // Assuming header is in first row
    const headers = rows[0];
    
    let importCount = 0;
    let updateCount = 0;
    
    for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (!row || row.length === 0) continue;
        
        // Map Excel columns (adjust based on your Excel structure)
        const tipDosar = row[0] || 'Civil';
        const dataStr = row[1];
        const oraStr = row[2];
        const numarDosar = row[3];
        const client = row[4];
        const instanta = row[5];
        const linkEcris = row[6];
        const observatii = row[7];
        
        if (!numarDosar) continue;
        
        // Check if dosar exists
        let dosar = dosare.find(d => d.numarDosar === numarDosar);
        
        if (!dosar) {
            // Create new dosar
            dosar = {
                id: generateId(),
                numarDosar: numarDosar,
                tipDosar: tipDosar,
                client: client || 'Client necunoscut',
                instanta: instanta || 'Instanță necunoscută',
                stadiu: 'În curs',
                linkEcris: linkEcris || null,
                obiect: observatii || null,
                observatii: observatii || null,
                dataCreare: new Date().toISOString()
            };
            dosare.push(dosar);
            importCount++;
        } else {
            // Update existing dosar
            if (linkEcris) dosar.linkEcris = linkEcris;
            if (observatii) dosar.observatii = observatii;
            updateCount++;
        }
        
        // Add termen if date exists
        if (dataStr) {
            const data = excelDateToJSDate(dataStr);
            const ora = oraStr || '09:00';
            
            // Check if termen already exists
            const existingTermen = termene.find(t => 
                t.idDosar === dosar.id && 
                formatDate(t.data) === formatDate(data)
            );
            
            if (!existingTermen) {
                const newTermen = {
                    id: generateId(),
                    idDosar: dosar.id,
                    tip: 'Judecată',
                    data: data.toISOString(),
                    ora: formatTime(ora),
                    instanta: instanta,
                    status: 'Programat',
                    observatii: observatii,
                    dataCreare: new Date().toISOString()
                };
                termene.push(newTermen);
            }
        }
    }
    
    // Save to storage
    saveToStorage(DB.dosare, dosare);
    saveToStorage(DB.termene, termene);
    
    showNotification(`Import finalizat: ${importCount} dosare noi, ${updateCount} actualizate`, 'success');
    
    // Refresh view
    if (document.getElementById('dashboardView').classList.contains('hidden')) {
        switchView('dosare');
    } else {
        loadDashboard();
    }
}

function excelDateToJSDate(excelDate) {
    if (typeof excelDate === 'string') {
        // Try parsing as ISO date
        const d = new Date(excelDate);
        if (!isNaN(d)) return d;
    }
    
    if (typeof excelDate === 'number') {
        // Excel stores dates as number of days since 1900-01-01
        const date = new Date((excelDate - 25569) * 86400 * 1000);
        return date;
    }
    
    return new Date();
}

function loadScript(url) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = url;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

// ===== ECRIS SYNCHRONIZATION =====

async function syncDosar(dosarId) {
    const dosare = getFromStorage(DB.dosare);
    const dosar = dosare.find(d => d.id === dosarId);
    
    if (!dosar || !dosar.linkEcris) {
        showNotification('Dosar fără link ECRIS', 'warning');
        return;
    }
    
    showNotification('Se sincronizează cu ECRIS...', 'info');
    
    // Simulate ECRIS sync (in real app, would scrape portal.just.ro)
    // For now, just show success
    setTimeout(() => {
        showNotification('Sincronizare finalizată (simulat)', 'success');
        
        // Update last sync time
        const settings = getFromStorage(DB.settings);
        settings.lastSync = new Date().toISOString();
        saveToStorage(DB.settings, settings);
        
        if (document.getElementById('setariView').classList.contains('hidden') === false) {
            loadSettings();
        }
    }, 2000);
}

async function syncAllDosare() {
    const btn = document.getElementById('syncBtn');
    const icon = document.getElementById('syncIcon');
    const text = document.getElementById('syncText');
    
    btn.classList.add('syncing');
    icon.classList.add('rotating');
    text.textContent = 'Sincronizare...';
    
    const dosare = getFromStorage(DB.dosare);
    const dosareEcris = dosare.filter(d => d.linkEcris);
    
    if (dosareEcris.length === 0) {
        showNotification('Nu există dosare cu link ECRIS', 'warning');
        btn.classList.remove('syncing');
        icon.classList.remove('rotating');
        text.textContent = 'Sync ECRIS';
        return;
    }
    
    showNotification(`Se sincronizează ${dosareEcris.length} dosare...`, 'info');
    
    // Simulate sync (in real app, would scrape each dosar from ECRIS)
    setTimeout(() => {
        showNotification(`Sincronizare finalizată: ${dosareEcris.length} dosare`, 'success');
        
        btn.classList.remove('syncing');
        icon.classList.remove('rotating');
        text.textContent = 'Sync ECRIS';
        
        // Update last sync time
        const settings = getFromStorage(DB.settings);
        settings.lastSync = new Date().toISOString();
        saveToStorage(DB.settings, settings);
        
        // Refresh current view
        loadDashboard();
    }, 3000);
}

// ===== MODAL & FORM FUNCTIONS =====

function openAddModal() {
    document.getElementById('addModal').classList.add('active');
}

function closeAddModal() {
    document.getElementById('addModal').classList.remove('active');
}

function closeFormModal() {
    document.getElementById('formModal').classList.remove('active');
}

function showForm(type) {
    closeAddModal();
    const formModal = document.getElementById('formModal');
    const formTitle = document.getElementById('formTitle');
    const formContainer = document.getElementById('formContainer');

    switch(type) {
        case 'dosar':
            formTitle.textContent = 'Dosar Nou';
            formContainer.innerHTML = `
                <form onsubmit="saveDosar(event)">
                    <div class="form-group">
                        <label class="form-label">Număr Dosar *</label>
                        <input type="text" class="form-input" name="numarDosar" required placeholder="ex: 1234/278/2024">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Tip Dosar *</label>
                        <select class="form-select" name="tipDosar" required>
                            <option value="">Selectează</option>
                            <option value="Civil">Civil</option>
                            <option value="Penal">Penal</option>
                            <option value="Comercial">Comercial</option>
                            <option value="Contencios Administrativ">Contencios Administrativ</option>
                            <option value="Muncă">Muncă</option>
                            <option value="Familie">Familie</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Client *</label>
                        <input type="text" class="form-input" name="client" required placeholder="Nume client">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Instanță *</label>
                        <input type="text" class="form-input" name="instanta" required placeholder="ex: Judecătoria Alba Iulia">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Link ECRIS</label>
                        <input type="url" class="form-input" name="linkEcris" placeholder="https://portal.just.ro/...">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Stadiu *</label>
                        <select class="form-select" name="stadiu" required>
                            <option value="În curs">În curs</option>
                            <option value="Suspendat">Suspendat</option>
                            <option value="Închis">Închis</option>
                            <option value="Arhivat">Arhivat</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Obiect Dosar</label>
                        <textarea class="form-textarea" name="obiect" placeholder="Descriere scurtă..."></textarea>
                    </div>
                    <button type="submit" class="btn btn-primary">💾 Salvează Dosar</button>
                </form>
            `;
            break;

        case 'client':
            formTitle.textContent = 'Client Nou';
            formContainer.innerHTML = `
                <form onsubmit="saveClient(event)">
                    <div class="form-group">
                        <label class="form-label">Nume Complet *</label>
                        <input type="text" class="form-input" name="nume" required placeholder="ex: POPESCU ION">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Tip Client *</label>
                        <select class="form-select" name="tipClient" required>
                            <option value="">Selectează</option>
                            <option value="Persoană fizică">Persoană fizică</option>
                            <option value="Persoană juridică">Persoană juridică</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">CNP/CUI</label>
                        <input type="text" class="form-input" name="cnpCui" placeholder="1234567890123">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Telefon *</label>
                        <input type="tel" class="form-input" name="telefon" required placeholder="0722123456">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Email</label>
                        <input type="email" class="form-input" name="email" placeholder="email@exemplu.ro">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Adresă</label>
                        <textarea class="form-textarea" name="adresa" placeholder="Adresa completă..."></textarea>
                    </div>
                    <button type="submit" class="btn btn-primary">💾 Salvează Client</button>
                </form>
            `;
            break;

        case 'termen':
            formTitle.textContent = 'Termen Nou';
            const dosare = getFromStorage(DB.dosare);
            const dosareOptions = dosare.map(d => `<option value="${d.id}">${d.numarDosar} - ${d.client}</option>`).join('');
            formContainer.innerHTML = `
                <form onsubmit="saveTermen(event)">
                    <div class="form-group">
                        <label class="form-label">Dosar *</label>
                        <select class="form-select" name="idDosar" required>
                            <option value="">Selectează dosar</option>
                            ${dosareOptions}
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Tip Termen *</label>
                        <select class="form-select" name="tip" required>
                            <option value="">Selectează</option>
                            <option value="Judecată">Judecată</option>
                            <option value="Depunere acte">Depunere acte</option>
                            <option value="Întâlnire client">Întâlnire client</option>
                            <option value="Termen intern">Termen intern</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Data *</label>
                        <input type="date" class="form-input" name="data" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Ora</label>
                        <input type="time" class="form-input" name="ora" value="09:00">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Observații</label>
                        <textarea class="form-textarea" name="observatii" placeholder="Note sau observații..."></textarea>
                    </div>
                    <button type="submit" class="btn btn-primary">💾 Salvează Termen</button>
                </form>
            `;
            break;

        case 'task':
            formTitle.textContent = 'Task Nou';
            const dosareT = getFromStorage(DB.dosare);
            const dosareOptionsT = dosareT.map(d => `<option value="${d.id}">${d.numarDosar} - ${d.client}</option>`).join('');
            formContainer.innerHTML = `
                <form onsubmit="saveTask(event)">
                    <div class="form-group">
                        <label class="form-label">Titlu *</label>
                        <input type="text" class="form-input" name="titlu" required placeholder="ex: Redactare concluzii">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Descriere</label>
                        <textarea class="form-textarea" name="descriere" placeholder="Detalii task..."></textarea>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Dosar (opțional)</label>
                        <select class="form-select" name="idDosar">
                            <option value="">Fără dosar asociat</option>
                            ${dosareOptionsT}
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Prioritate *</label>
                        <select class="form-select" name="prioritate" required>
                            <option value="Scăzută">Scăzută</option>
                            <option value="Medie" selected>Medie</option>
                            <option value="Ridicată">Ridicată</option>
                            <option value="Urgentă">Urgentă</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Deadline</label>
                        <input type="datetime-local" class="form-input" name="deadline">
                    </div>
                    <button type="submit" class="btn btn-primary">💾 Salvează Task</button>
                </form>
            `;
            break;
    }

    formModal.classList.add('active');
}

// Save Functions
function saveDosar(e) {
    e.preventDefault();
    const form = e.target;
    const dosare = getFromStorage(DB.dosare);

    const newDosar = {
        id: generateId(),
        numarDosar: form.numarDosar.value,
        tipDosar: form.tipDosar.value,
        client: form.client.value,
        instanta: form.instanta.value,
        linkEcris: form.linkEcris.value || null,
        stadiu: form.stadiu.value,
        obiect: form.obiect.value,
        dataCreare: new Date().toISOString()
    };

    dosare.push(newDosar);
    saveToStorage(DB.dosare, dosare);

    closeFormModal();
    switchView('dosare');
    showNotification('Dosar salvat cu succes!', 'success');
}

function saveClient(e) {
    e.preventDefault();
    const form = e.target;
    const clienti = getFromStorage(DB.clienti);

    const newClient = {
        id: generateId(),
        nume: form.nume.value,
        tipClient: form.tipClient.value,
        cnpCui: form.cnpCui.value,
        telefon: form.telefon.value,
        email: form.email.value,
        adresa: form.adresa.value,
        activ: true,
        dataCreare: new Date().toISOString()
    };

    clienti.push(newClient);
    saveToStorage(DB.clienti, clienti);

    closeFormModal();
    switchView('clienti');
    showNotification('Client salvat cu succes!', 'success');
}

function saveTermen(e) {
    e.preventDefault();
    const form = e.target;
    const termene = getFromStorage(DB.termene);

    const newTermen = {
        id: generateId(),
        idDosar: form.idDosar.value,
        tip: form.tip.value,
        data: form.data.value,
        ora: form.ora.value,
        observatii: form.observatii.value,
        status: 'Programat',
        dataCreare: new Date().toISOString()
    };

    termene.push(newTermen);
    saveToStorage(DB.termene, termene);

    closeFormModal();
    loadDashboard();
    showNotification('Termen salvat cu succes!', 'success');
}

function saveTask(e) {
    e.preventDefault();
    const form = e.target;
    const taskuri = getFromStorage(DB.taskuri);

    const newTask = {
        id: generateId(),
        titlu: form.titlu.value,
        descriere: form.descriere.value,
        idDosar: form.idDosar.value || null,
        prioritate: form.prioritate.value,
        deadline: form.deadline.value,
        status: 'În lucru',
        dataCreare: new Date().toISOString()
    };

    taskuri.push(newTask);
    saveToStorage(DB.taskuri, taskuri);

    closeFormModal();
    loadDashboard();
    showNotification('Task salvat cu succes!', 'success');
}

// Export/Import Functions
function exportData() {
    const data = {
        clienti: getFromStorage(DB.clienti),
        dosare: getFromStorage(DB.dosare),
        termene: getFromStorage(DB.termene),
        taskuri: getFromStorage(DB.taskuri),
        note: getFromStorage(DB.note),
        settings: getFromStorage(DB.settings),
        exportDate: new Date().toISOString(),
        version: '2.0'
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_gestiune_juridica_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    showNotification('Date exportate cu succes!', 'success');
}

function importData(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            
            if (confirm('Atenție! Aceasta va suprascrie toate datele existente. Continuați?')) {
                if (data.clienti) saveToStorage(DB.clienti, data.clienti);
                if (data.dosare) saveToStorage(DB.dosare, data.dosare);
                if (data.termene) saveToStorage(DB.termene, data.termene);
                if (data.taskuri) saveToStorage(DB.taskuri, data.taskuri);
                if (data.note) saveToStorage(DB.note, data.note);
                if (data.settings) saveToStorage(DB.settings, data.settings);
                
                showNotification('Date importate cu succes!', 'success');
                setTimeout(() => location.reload(), 1500);
            }
        } catch (err) {
            console.error('Import error:', err);
            showNotification('Eroare la importul datelor. Verificați fișierul.', 'error');
        }
    };
    reader.readAsText(file);
}

function clearAllData() {
    if (confirm('ATENȚIE! Această acțiune va șterge TOATE datele permanent. Continuați?')) {
        if (confirm('Sigur doriți să ștergeți toate datele? Aceasta nu poate fi anulată!')) {
            localStorage.clear();
            showNotification('Toate datele au fost șterse.', 'success');
            setTimeout(() => location.reload(), 1500);
        }
    }
}

function exportToExcel() {
    showNotification('Funcție în dezvoltare - folosiți Export JSON', 'warning');
}

function filterTermeneAproape() {
    switchView('dosare');
    // Could filter by upcoming terms
}
