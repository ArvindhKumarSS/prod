import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [data, setData] = useState(null);

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
        <div className="zen-garden">
          <div className="rock">🪨</div>
          <div className="sand">～～～</div>
          <div className="tree">🌳</div>
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