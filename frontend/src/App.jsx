import { useCallback, useEffect, useState } from 'react'

// API URL - The backend is running on port 5001 as defined in docker-compose.yml
const API_URL = 'http://localhost:5001/api'

// --- Reusable Icon Components ---
const CopyIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        fill="currentColor"
        viewBox="0 0 16 16">
        <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z" />
        <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zM-1 7a.5.5 0 0 1 .5-.5h15a.5.5 0 0 1 0 1H-.5A.5.5 0 0 1-1 7zM5 1.5A1.5 1.5 0 0 1 6.5 0h3A1.5 1.5 0 0 1 11 1.5v1A1.5 1.5 0 0 1 9.5 4h-3A1.5 1.5 0 0 1 5 2.5v-1z" />
    </svg>
)
const TrashIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        fill="currentColor"
        viewBox="0 0 16 16">
        <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z" />
        <path
            fillRule="evenodd"
            d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"
        />
    </svg>
)

function App() {
    const [dbConnected, setDbConnected] = useState(null)
    const [prompts, setPrompts] = useState([])
    const [newPrompt, setNewPrompt] = useState('')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [copiedId, setCopiedId] = useState(null)

    // --- API Functions ---

    const fetchStatus = useCallback(async () => {
        try {
            const response = await fetch(`${API_URL}/status`)
            if (!response.ok) throw new Error('Network response was not ok')
            const data = await response.json()
            setDbConnected(data.dbConnected)
        } catch (err) {
            console.error('Failed to fetch DB status:', err)
            setDbConnected(false)
        }
    }, [])

    const fetchPrompts = useCallback(async () => {
        try {
            setError(null)
            const response = await fetch(`${API_URL}/prompts`)
            if (!response.ok) throw new Error('Failed to fetch prompts')
            const data = await response.json()
            setPrompts(data)
        } catch (err) {
            setError('Could not load prompts. Is the backend running?')
        } finally {
            setLoading(false)
        }
    }, [])

    // --- Effects ---

    useEffect(() => {
        fetchStatus()
        fetchPrompts()
        // Check status periodically
        const interval = setInterval(fetchStatus, 5000)
        return () => clearInterval(interval)
    }, [fetchStatus, fetchPrompts])

    // --- Event Handlers ---

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!newPrompt.trim()) return
        try {
            const response = await fetch(`${API_URL}/prompts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: newPrompt }),
            })
            if (!response.ok) throw new Error('Failed to add prompt')
            const addedPrompt = await response.json()
            setPrompts([addedPrompt, ...prompts])
            setNewPrompt('')
        } catch (err) {
            setError('Failed to save prompt.')
        }
    }

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this prompt?'))
            return
        try {
            const response = await fetch(`${API_URL}/prompts/${id}`, {
                method: 'DELETE',
            })
            if (!response.ok) throw new Error('Failed to delete prompt')
            setPrompts(prompts.filter((p) => p.id !== id))
        } catch (err) {
            setError('Failed to delete prompt.')
        }
    }

    const handleCopy = (prompt) => {
        navigator.clipboard
            .writeText(prompt.content)
            .then(() => {
                setCopiedId(prompt.id)
                setTimeout(() => setCopiedId(null), 2000) // Reset after 2 seconds
            })
            .catch((err) => console.error('Failed to copy text: ', err))
    }

    // --- Render ---

    return (
        <div className="bg-gray-900 text-white min-h-screen font-sans p-4 sm:p-6 lg:p-8">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <header className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-200">
                        Prompt Save
                    </h1>
                    <div className="flex items-center space-x-2 text-sm">
                        <span
                            className={`h-3 w-3 rounded-full ${
                                dbConnected === null
                                    ? 'bg-yellow-500 animate-pulse'
                                    : dbConnected
                                    ? 'bg-green-500'
                                    : 'bg-red-500'
                            }`}></span>
                        <span>
                            {dbConnected === null
                                ? 'Checking DB...'
                                : dbConnected
                                ? 'DB Connected'
                                : 'DB Disconnected'}
                        </span>
                    </div>
                </header>

                {/* New Prompt Form */}
                <div className="mb-8">
                    <form
                        onSubmit={handleSubmit}
                        className="bg-gray-800 p-4 rounded-lg shadow-lg">
                        <textarea
                            value={newPrompt}
                            onChange={(e) => setNewPrompt(e.target.value)}
                            placeholder="Enter your new prompt here..."
                            className="w-full bg-gray-700 p-3 rounded-md border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none transition resize-y"
                            rows="4"
                            disabled={!dbConnected}
                        />
                        <button
                            type="submit"
                            className="mt-3 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-md transition duration-300"
                            disabled={!dbConnected || !newPrompt.trim()}>
                            Save Prompt
                        </button>
                    </form>
                </div>

                {/* Prompt List */}
                <div>
                    <h2 className="text-xl font-semibold mb-4 text-gray-400">
                        Saved Prompts
                    </h2>
                    {loading && <p>Loading prompts...</p>}
                    {error && <p className="text-red-400">{error}</p>}
                    {!loading && !error && prompts.length === 0 && (
                        <div className="text-center text-gray-500 py-8">
                            <p>No prompts saved yet.</p>
                            <p>Add one above to get started!</p>
                        </div>
                    )}
                    <ul className="space-y-4">
                        {prompts.map((prompt) => (
                            <li
                                key={prompt.id}
                                className="bg-gray-800 p-4 rounded-lg shadow-lg group">
                                <p className="text-gray-300 whitespace-pre-wrap mb-3">
                                    {prompt.content}
                                </p>
                                <div className="flex justify-end items-center space-x-3 border-t border-gray-700 pt-3">
                                    <button
                                        onClick={() => handleCopy(prompt)}
                                        className="flex items-center text-gray-400 hover:text-white transition">
                                        <CopyIcon />
                                        <span className="ml-2 text-sm">
                                            {copiedId === prompt.id
                                                ? 'Copied!'
                                                : 'Copy'}
                                        </span>
                                    </button>
                                    <button
                                        onClick={() => handleDelete(prompt.id)}
                                        className="flex items-center text-gray-400 hover:text-red-500 transition">
                                        <TrashIcon />
                                        <span className="ml-2 text-sm">
                                            Delete
                                        </span>
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    )
}

export default App
