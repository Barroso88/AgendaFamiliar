const fs = require('fs');
let content = fs.readFileSync('server.js', 'utf8');

const replacement = `async function initDatabase() {
    const config = process.env.DATABASE_URL 
        ? { connectionString: process.env.DATABASE_URL }
        : {
            host: process.env.DB_HOST || 'localhost',
            port: Number(process.env.DB_PORT) || 5432,
            user: process.env.DB_USER || 'postgres',
            password: process.env.DB_PASSWORD || 'postgres',
            database: process.env.DB_NAME || 'agenda'
        };

    pool = new Pool(config);

    await pool.query(\`
        CREATE TABLE IF NOT EXISTS app_state (
            id INTEGER PRIMARY KEY CHECK (id = 1),
            payload TEXT NOT NULL,
            updated_at BIGINT NOT NULL
        );
    \`);
}`;

content = content.replace(/async function initDatabase\(\) \{[\s\S]*?\}\n/, replacement + '\n');
fs.writeFileSync('server.js', content, 'utf8');
