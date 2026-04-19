const http = require('http');
const fs = require('fs/promises');
const path = require('path');
const { URL } = require('url');

const PORT = Number(process.env.PORT || 3035);
// No Docker, DATA_DIR será /app/data
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');
const STATE_FILE = path.join(DATA_DIR, 'store.json');
const PUBLIC_DIR = __dirname;

const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.ico': 'image/x-icon'
};

function emptyState() {
    return {
        theme: 'midnight',
        events: [],
        shoppingItems: [],
        tasks: [],
        notifications: []
    };
}

async function ensureDataDir() {
    try {
        await fs.mkdir(DATA_DIR, { recursive: true });
    } catch (err) {
        if (err.code !== 'EEXIST') throw err;
    }
}

async function readState() {
    try {
        const content = await fs.readFile(STATE_FILE, 'utf8');
        const parsed = JSON.parse(content);
        return {
            ...emptyState(),
            ...parsed,
            events: Array.isArray(parsed.events) ? parsed.events : [],
            shoppingItems: Array.isArray(parsed.shoppingItems) ? parsed.shoppingItems : [],
            tasks: Array.isArray(parsed.tasks) ? parsed.tasks : [],
            notifications: Array.isArray(parsed.notifications) ? parsed.notifications : []
        };
    } catch (error) {
        // Se o arquivo não existir ou estiver corrompido, retorna o estado vazio
        console.error("Erro ao ler estado, retornando vazio:", error.message);
        return emptyState();
    }
}

/**
 * VERSÃO CORRIGIDA PARA DOCKER/UNRAID
 * Removemos o fs.rename que causa erros EXDEV em volumes montados.
 */
async function writeState(payload) {
    try {
        await ensureDataDir();
        const data = JSON.stringify(payload, null, 2);
        
        // Escrevemos diretamente no ficheiro final. 
        // Em volumes Docker/Network shares, o rename entre .tmp e o original costuma falhar.
        await fs.writeFile(STATE_FILE, data, 'utf8');
        console.log("Estado salvo com sucesso em:", STATE_FILE);
    } catch (error) {
        console.error("ERRO FATAL AO SALVAR:", error);
        throw error; // Lança para o handleApiState tratar
    }
}

function contentType(filePath) {
    return MIME_TYPES[path.extname(filePath).toLowerCase()] || 'application/octet-stream';
}

async function sendFile(res, filePath) {
    try {
        const data = await fs.readFile(filePath);
        res.writeHead(200, { 'Content-Type': contentType(filePath) });
        res.end(data);
    } catch {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Not found');
    }
}

function sendJson(res, statusCode, payload) {
    res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(payload));
}

async function handleApiState(req, res) {
    if (req.method === 'GET') {
        const state = await readState();
        sendJson(res, 200, state);
        return;
    }

    if (req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString('utf8');
        });

        req.on('end', async () => {
            try {
                const parsed = JSON.parse(body || '{}');
                const payload = {
                    ...emptyState(),
                    ...parsed,
                    events: Array.isArray(parsed.events) ? parsed.events : [],
                    shoppingItems: Array.isArray(parsed.shoppingItems) ? parsed.shoppingItems : [],
                    tasks: Array.isArray(parsed.tasks) ? parsed.tasks : [],
                    notifications: Array.isArray(parsed.notifications) ? parsed.notifications : []
                };
                await writeState(payload);
                sendJson(res, 200, { ok: true });
            } catch (error) {
                console.error("Erro no processamento do POST:", error);
                sendJson(res, 400, { ok: false, error: 'Invalid state or write error' });
            }
        });
        return;
    }

    res.writeHead(405, { 'Content-Type': 'text/plain; charset=utf-8', 'Allow': 'GET, POST' });
    res.end('Method not allowed');
}

const server = http.createServer(async (req, res) => {
    try {
        const requestUrl = new URL(req.url, `http://${req.headers.host}`);
        const pathname = decodeURIComponent(requestUrl.pathname);

        if (pathname === '/api/state') {
            await handleApiState(req, res);
            return;
        }

        let filePath = path.join(PUBLIC_DIR, pathname === '/' ? 'index.html' : pathname);
        
        // Proteção básica contra Directory Traversal
        if (!filePath.startsWith(PUBLIC_DIR)) {
            res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
            res.end('Forbidden');
            return;
        }

        try {
            const stat = await fs.stat(filePath);
            if (stat.isDirectory()) {
                filePath = path.join(filePath, 'index.html');
            }
            await sendFile(res, filePath);
        } catch {
            await sendFile(res, path.join(PUBLIC_DIR, 'index.html'));
        }
    } catch (error) {
        console.error("Erro no servidor:", error);
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Internal server error');
    }
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`Agenda Familiar ativa na porta ${PORT}`);
    console.log(`Diretório de dados: ${DATA_DIR}`);
});
