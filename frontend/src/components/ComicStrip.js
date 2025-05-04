import React from 'react';
import './ComicStrip.css';

const ComicStrip = () => {
  const panels = [
    {
      id: 1,
      image: '/images/comics/comic-1.png',
      alt: 'Degen Monk and Crypto Novice discussing a new token'
    },
    {
      id: 2,
      image: '/images/comics/comic-2.png',
      alt: 'The token price is mooning'
    },
    {
      id: 3,
      image: '/images/comics/comic-3.png',
      alt: 'The price continues to rise'
    },
    {
      id: 4,
      image: '/images/comics/comic-4.png',
      alt: 'The novice decides to invest'
    },
    {
      id: 5,
      image: '/images/comics/comic-5.png',
      alt: 'The price crashes after the novice invests'
    }
  ];

  return (
    <section className="comic-strip" aria-label="The Degen Chronicles">
      <h2>The Degen Chronicles</h2>
      <div className="comic-panels">
        {panels.map(panel => (
          <article key={panel.id} className="comic-panel">
            <img src={panel.image} alt={panel.alt} />
          </article>
        ))}
      </div>
    </section>
  );
};

export default ComicStrip; 