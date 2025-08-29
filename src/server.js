import express from 'express';
import path from 'path';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import bodyParser from 'body-parser';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use('/static', express.static(path.join(__dirname, '..', 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

let db;

async function initDb() {
	db = await open({ filename: path.join(__dirname, 'polls.db'), driver: sqlite3.Database });
	await db.exec(`
		PRAGMA foreign_keys = ON;
		CREATE TABLE IF NOT EXISTS polls (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			question TEXT NOT NULL,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP
		);
		CREATE TABLE IF NOT EXISTS options (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			poll_id INTEGER NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
			label TEXT NOT NULL
		);
		CREATE TABLE IF NOT EXISTS votes (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			option_id INTEGER NOT NULL REFERENCES options(id) ON DELETE CASCADE,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP
		);
	`);
}

app.get('/', async (req, res) => {
	const polls = await db.all('SELECT id, question, created_at FROM polls ORDER BY created_at DESC');
	res.render('index', { polls });
});

app.get('/poll/new', (req, res) => {
	res.render('new');
});

app.post('/poll', async (req, res) => {
	const { question, options } = req.body;
	if (!question || !options) {
		return res.status(400).send('Invalid payload');
	}
	const optionLabels = Array.isArray(options) ? options : String(options).split('\n');
	const cleaned = optionLabels.map(s => String(s).trim()).filter(Boolean);
	if (cleaned.length < 2) {
		return res.status(400).send('Provide at least two options');
	}
	await db.exec('BEGIN');
	try {
		const result = await db.run('INSERT INTO polls (question) VALUES (?)', question.trim());
		const pollId = result.lastID;
		for (const label of cleaned) {
			await db.run('INSERT INTO options (poll_id, label) VALUES (?, ?)', pollId, label);
		}
		await db.exec('COMMIT');
		res.redirect(`/poll/${pollId}`);
	} catch (e) {
		await db.exec('ROLLBACK');
		console.error(e);
		res.status(500).send('Failed to create poll');
	}
});

app.get('/poll/:id', async (req, res) => {
	const id = Number(req.params.id);
	const poll = await db.get('SELECT * FROM polls WHERE id = ?', id);
	if (!poll) return res.status(404).send('Poll not found');
	const options = await db.all('SELECT id, label FROM options WHERE poll_id = ?', id);
	res.render('vote', { poll, options });
});

app.post('/poll/:id/vote', async (req, res) => {
	const { option } = req.body;
	if (!option) return res.status(400).send('Select an option');
	await db.run('INSERT INTO votes (option_id) VALUES (?)', Number(option));
	const row = await db.get('SELECT poll_id FROM options WHERE id = ?', Number(option));
	res.redirect(`/poll/${row.poll_id}/results`);
});

app.get('/poll/:id/results', async (req, res) => {
	const id = Number(req.params.id);
	const poll = await db.get('SELECT * FROM polls WHERE id = ?', id);
	if (!poll) return res.status(404).send('Poll not found');
	const rows = await db.all(`
		SELECT o.id, o.label, COUNT(v.id) as votes
		FROM options o
		LEFT JOIN votes v ON v.option_id = o.id
		WHERE o.poll_id = ?
		GROUP BY o.id, o.label
		ORDER BY votes DESC, o.id ASC
	`, id);
	const total = rows.reduce((s, r) => s + r.votes, 0);
	res.render('results', { poll, rows, total });
});

app.delete('/poll/:id', async (req, res) => {
	const id = Number(req.params.id);
	await db.run('DELETE FROM polls WHERE id = ?', id);
	res.status(204).end();
});

initDb().then(() => {
	app.listen(PORT, () => console.log(`Polling app running on http://localhost:${PORT}`));
});
