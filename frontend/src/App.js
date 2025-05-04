import React, { useEffect, useState } from 'react';
import axios from 'axios';
import SEO from './components/SEO';
import ComicStrip from './components/ComicStrip';
import './App.css';

function App() {
  const [data, setData] = useState(null);
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);

  const getApiUrl = () => {
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    return `${protocol}//${hostname}/api`;
  };

  useEffect(() => {
    const apiUrl = getApiUrl();
    console.log('Connecting to backend at:', apiUrl);
    
    // Fetch quotes
    axios.get(`${apiUrl}/quotes`)
      .then(res => {
        setQuotes(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching quotes:', err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (quotes.length > 0) {
      const quoteInterval = setInterval(() => {
        setCurrentQuoteIndex((prevIndex) => (prevIndex + 1) % quotes.length);
      }, 8000); // Change quote every 8 seconds

      return () => clearInterval(quoteInterval);
    }
  }, [quotes]);

  return (
    <div className="App">
      <SEO />
      
      <header className="hero-section">
        <div className="logo-container">
          <div className="monk-symbol" aria-label="Degen Monk Symbol">☸</div>
          <h1 className="title">
            <span className="degen">DEGEN</span>
            <span className="monk">MONK</span>
          </h1>
        </div>
        <p className="tagline">Where Enlightenment Meets the Digital Age</p>
      </header>

      <main className="content-section">
        <section className="quote-container" aria-label="Daily Crypto Wisdom">
          <div className="quote-content">
            {loading ? (
              <div className="loading">
                <div className="spinner"></div>
                <p>Loading wisdom from the digital monastery...</p>
              </div>
            ) : quotes.length > 0 ? (
              quotes.map((quote, index) => (
                <div
                  key={quote.id}
                  className={`quote-slide ${index === currentQuoteIndex ? 'active' : ''}`}
                  role="article"
                  aria-hidden={index !== currentQuoteIndex}
                >
                  <blockquote className="quote-text">
                    {quote.text.split('\n').map((line, i) => (
                      <React.Fragment key={i}>
                        {line}
                        <br />
                      </React.Fragment>
                    ))}
                  </blockquote>
                  <footer className="quote-author">- {quote.author}</footer>
                </div>
              ))
            ) : (
              <p className="quote-text">No wisdom available at the moment.</p>
            )}
          </div>
          <div className="quote-decoration" aria-hidden="true">
            <span className="crypto-symbol">₿</span>
            <span className="zen-symbol">☸</span>
            <span className="crypto-symbol">Ξ</span>
          </div>
          {quotes.length > 0 && (
            <nav className="quote-dots" aria-label="Quote navigation">
              {quotes.map((_, index) => (
                <button
                  key={index}
                  className={`dot ${index === currentQuoteIndex ? 'active' : ''}`}
                  onClick={() => setCurrentQuoteIndex(index)}
                  aria-label={`View quote ${index + 1}`}
                  aria-pressed={index === currentQuoteIndex}
                />
              ))}
            </nav>
          )}
        </section>
        
        <ComicStrip />
      </main>

      <footer className="site-footer">
        <p>&copy; {new Date().getFullYear()} Degen Monk. All rights reserved.</p>
        <nav aria-label="Social media links">
          <a href="https://twitter.com/degenmonk" target="_blank" rel="noopener noreferrer">Twitter</a>
          <a href="https://t.me/degenmonk" target="_blank" rel="noopener noreferrer">Telegram</a>
          <a href="https://discord.gg/degenmonk" target="_blank" rel="noopener noreferrer">Discord</a>
        </nav>
      </footer>
    </div>
  );
}

export default App;