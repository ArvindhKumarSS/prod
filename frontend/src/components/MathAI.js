import React, { useState } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';
import './MathAI.css';

const MathAI = () => {
    const [query, setQuery] = useState('');
    const [solution, setSolution] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

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
        
        try {
            const apiUrl = getApiUrl();
            const response = await fetch(`${apiUrl}/math-gen`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query }),
            });
            
            const data = await response.json();
            if (data.error) {
                setError(data.error);
            } else {
                setSolution(data.solution);
            }
        } catch (err) {
            setError('Failed to get solution. Please try again.');
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
            
            <form onSubmit={handleSubmit} className="math-form">
                <div className="input-container">
                    <textarea
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Ask any math question... (e.g., 'Solve the quadratic equation x² + 5x + 6 = 0')"
                        className="math-input"
                        rows="4"
                    />
                </div>
                
                <button 
                    type="submit" 
                    className="submit-button"
                    disabled={loading || !query.trim()}
                >
                    {loading ? 'Solving...' : 'Solve'}
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

            {loading && (
                <div className="math-ai-loading">∞</div>
            )}
        </div>
    );
};

export default MathAI; 