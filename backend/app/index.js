const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql2/promise');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

async function connectWithRetry(retries = 15, delay = 5000) {
    for (let i = 0; i < retries; i++) {
        try {
            const connection = await pool.getConnection();
            console.log('Successfully connected to MySQL database.');
            connection.release();
            return;
        } catch (err) {
            console.error(`Attempt ${i + 1}/${retries}: Error connecting to MySQL database: ${err.message}`);
            if (i < retries - 1) {
                console.log(`Retrying in ${delay / 1000} seconds...`);
                await new Promise(res => setTimeout(res, delay));
            } else {
                console.error('Max retries reached. Exiting application.');
                process.exit(1);
            }
        }
    }
}

async function createPostsTable() {
    try {
        const connection = await pool.getConnection();
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS posts (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                body TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        connection.release();
        console.log(" 'posts' table ensured.");
    } catch (err) {
        console.error('Error creating posts table:', err.message);
        process.exit(1);
    }
}

async function initializeApp() {
    await connectWithRetry();
    await createPostsTable();
    
    const PORT = 5000;
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

initializeApp();


app.post('/posts', async (req, res) => {
    const { title, body } = req.body;
    if (!title || !body) {
        return res.status(400).json({ error: 'Title and body are required.' });
    }

    try {
        const connection = await pool.getConnection();
        const [result] = await connection.execute(
            'INSERT INTO posts (title, body) VALUES (?, ?)',
            [title, body]
        );
        connection.release();

        const newPost = { id: result.insertId, title, body };
        res.status(201).json(newPost);
    } catch (err) {
        console.error('Error inserting post:', err.message);
        res.status(500).json({ error: 'Failed to create post.' });
    }
});


app.get('/posts', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const [rows] = await connection.execute('SELECT title, body FROM posts');
        connection.release();

        res.status(200).json(rows);
    } catch (err) {
        console.error('Error fetching posts:', err.message);
        res.status(500).json({ error: 'Failed to retrieve posts.' });
    }
});