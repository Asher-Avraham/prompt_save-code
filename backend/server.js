const express = require('express')
const { Pool } = require('pg')
const cors = require('cors')

const app = express()
const port = 5001

// --- Middleware ---
app.use(cors()) // Allow requests from the frontend
app.use(express.json()) // Parse JSON request bodies

// --- PostgreSQL Connection ---
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
})

// --- Database Initialization ---
const initializeDb = async () => {
    try {
        const client = await pool.connect()
        console.log('Successfully connected to the database.')

        // Create the 'prompts' table if it doesn't already exist
        await client.query(`
      CREATE TABLE IF NOT EXISTS prompts (
        id SERIAL PRIMARY KEY,
        content TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `)
        console.log("Table 'prompts' is ready.")
        client.release()
    } catch (err) {
        console.error('Error connecting to or initializing the database:', err)
        // We don't exit here, to allow Docker to keep the container running for retries
    }
}

// --- API Routes ---

// 1. Health/Status Check
app.get('/api/status', async (req, res) => {
    try {
        const client = await pool.connect()
        // A simple query to check if the connection is live
        await client.query('SELECT NOW()')
        client.release()
        res.json({ dbConnected: true })
    } catch (error) {
        console.error('Database connection check failed:', error.message)
        res.status(500).json({ dbConnected: false })
    }
})

// 2. Get all prompts (READ)
app.get('/api/prompts', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM prompts ORDER BY created_at DESC',
        )
        res.json(result.rows)
    } catch (err) {
        console.error(err)
        res.status(500).send('Error fetching prompts')
    }
})

// 3. Create a new prompt (CREATE)
app.post('/api/prompts', async (req, res) => {
    const { content } = req.body
    if (!content) {
        return res.status(400).send('Content cannot be empty')
    }
    try {
        const result = await pool.query(
            'INSERT INTO prompts (content) VALUES ($1) RETURNING *',
            [content],
        )
        res.status(201).json(result.rows[0])
    } catch (err) {
        console.error(err)
        res.status(500).send('Error creating prompt')
    }
})

// 4. Delete a prompt (DELETE)
app.delete('/api/prompts/:id', async (req, res) => {
    const { id } = req.params
    try {
        const result = await pool.query('DELETE FROM prompts WHERE id = $1', [
            id,
        ])
        if (result.rowCount === 0) {
            return res.status(404).send('Prompt not found')
        }
        res.status(204).send() // 204 No Content for successful deletion
    } catch (err) {
        console.error(err)
        res.status(500).send('Error deleting prompt')
    }
})

// --- Start Server ---
if (require.main === module) {
    app.listen(port, () => {
        console.log(`Backend server listening at http://localhost:${port}`)
        initializeDb()
    })
}

module.exports = app
