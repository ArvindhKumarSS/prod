import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [data, setData] = useState(null);
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);

  const quotes = [
    {
      text: "In the monastery of markets,\nThe wise monk knows:\nWhen others FOMO,\nThat's when you HODL.",
      author: "The Degen Sutra"
    },
    {
      text: "A monk's patience is measured in blocks,\nNot in minutes.\nFor in the blockchain,\nTime is but a sequence of hashes.",
      author: "The Crypto Dharma"
    },
    {
      text: "The path to enlightenment\nIs paved with private keys.\nGuard them well,\nFor they are your digital soul.",
      author: "The Digital Bodhisattva"
    },
    {
      text: "In the garden of tokens,\nThe wise monk plants seeds of utility.\nFor value grows not from hype,\nBut from purpose.",
      author: "The Token Master"
    },
    {
      text: "When the market meditates,\nThe degen monk trades.\nWhen the market trades,\nThe degen monk meditates.",
      author: "The Market Zen"
    },
    {
      text: "The greatest wealth is not in your wallet,\nBut in your ability to HODL\nThrough the winter of bear markets.",
      author: "The Winter Monk"
    }
  ];

  const getApiUrl = () => {
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    return `${protocol}//${hostname}:3001/api`;
  };

  useEffect(() => {
    const apiUrl = getApiUrl();
    console.log('Connecting to backend at:', apiUrl);
    
    axios.get(apiUrl)
      .then(res => setData(res.data))
      .catch(err => {
        console.error('Error connecting to backend:', err);
        setData({ message: 'Error connecting to backend', time: new Date().toISOString() });
      });
  }, []);

  useEffect(() => {
    const quoteInterval = setInterval(() => {
      setCurrentQuoteIndex((prevIndex) => (prevIndex + 1) % quotes.length);
    }, 8000); // Change quote every 8 seconds

    return () => clearInterval(quoteInterval);
  }, []);

  return (
    <div className="App">
      <div className="hero-section">
        <div className="logo-container">
          <div className="monk-symbol">☸</div>
          <h1 className="title">
            <span className="degen">DEGEN</span>
            <span className="monk">MONK</span>
          </h1>
        </div>
        <p className="tagline">Where Enlightenment Meets the Digital Age</p>
      </div>

      <div className="content-section">
        <div className="quote-container">
          <div className="quote-content">
            {quotes.map((quote, index) => (
              <div
                key={index}
                className={`quote-slide ${index === currentQuoteIndex ? 'active' : ''}`}
              >
                <p className="quote-text">
                  {quote.text.split('\n').map((line, i) => (
                    <React.Fragment key={i}>
                      {line}
                      <br />
                    </React.Fragment>
                  ))}
                </p>
                <p className="quote-author">- {quote.author}</p>
              </div>
            ))}
          </div>
          <div className="quote-decoration">
            <span className="crypto-symbol">₿</span>
            <span className="zen-symbol">☸</span>
            <span className="crypto-symbol">Ξ</span>
          </div>
          <div className="quote-dots">
            {quotes.map((_, index) => (
              <span
                key={index}
                className={`dot ${index === currentQuoteIndex ? 'active' : ''}`}
                onClick={() => setCurrentQuoteIndex(index)}
              />
            ))}
          </div>
        </div>
        
        <div className="backend-status">
          <h2>Backend Connection Status</h2>
          {data ? (
            <div className="status-message">
              <p className="message">{data.message}</p>
              <p className="time">Server Time: {data.time}</p>
            </div>
          ) : (
            <div className="loading">
              <div className="spinner"></div>
              <p>Connecting to the digital monastery...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;