import React, { useState } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';
import './MathAI.css';
import axios from 'axios';

const MathAI = () => {
    const [query, setQuery] = useState('');
    const [solution, setSolution] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [selectedModel, setSelectedModel] = useState('openai'); // Default to OpenAI

    function getApiUrl() {
        const hostname = window.location.hostname;
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
          return 'http://localhost:3001/api';
        } else {
          return window.location.protocol + '//' + window.location.host + '/api';
        }
      }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSolution('');

        try {
            const response = await axios.post('/api/math-gen', {
                query,
                model: selectedModel // Include the selected model in the payload
            });
            setSolution(response.data.solution);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to generate solution');
        } finally {
            setLoading(false);
        }
    };

    // Function to render LaTeX in the solution
    const renderMath = (text) => {
        // Split text by LaTeX delimiters
        const parts = text.split(/(\$\$.*?\$\$|\$.*?\$)/g);
        
        return parts.map((part, i) => {
            if (part.startsWith('$$') && part.endsWith('$$')) {
                // Block math
                const math = part.slice(2, -2);
                return <BlockMath key={i} math={math} />;
            } else if (part.startsWith('$') && part.endsWith('$')) {
                // Inline math
                const math = part.slice(1, -1);
                return <InlineMath key={i} math={math} />;
            } else {
                // Regular text
                return <span key={i}>{part}</span>;
            }
        });
    };

    return (
        <div className="math-ai-container">
            <div className="math-symbol">∞</div>
            <div className="math-symbol">∫</div>
            <div className="math-symbol">∑</div>
            <div className="math-symbol">π</div>

            <div className="math-header">
                <h1>Math AI Assistant</h1>
                <p className="subtitle">Your personal mathematics tutor</p>
            </div>
            
            <form className="math-form" onSubmit={handleSubmit}>
                <div className="input-container">
                    <textarea
                        className="math-input"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Enter your math problem here..."
                        required
                    />
                </div>

                <div className="model-selection">
                    <label className="model-label">
                        <input
                            type="radio"
                            name="model"
                            value="openai"
                            checked={selectedModel === 'openai'}
                            onChange={(e) => setSelectedModel(e.target.value)}
                        />
                        OpenAI GPT-3.5
                    </label>
                    <label className="model-label">
                        <input
                            type="radio"
                            name="model"
                            value="custom"
                            checked={selectedModel === 'custom'}
                            onChange={(e) => setSelectedModel(e.target.value)}
                        />
                        Custom Model
                    </label>
                </div>

                <button 
                    type="submit" 
                    className="submit-button"
                    disabled={loading}
                >
                    {loading ? (
                        <div className="math-ai-loading">∞</div>
                    ) : (
                        'Solve'
                    )}
                </button>
            </form>

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            {solution && (
                <div className="solution-container">
                    <h2>Solution</h2>
                    <div className="solution-content">
                        {renderMath(solution)}
                    </div>
                </div>
            )}
        </div>
    );
};

export default MathAI; 