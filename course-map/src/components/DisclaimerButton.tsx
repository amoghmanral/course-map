import React, { useState } from 'react';
import './Button.css';
import './DisclaimerButton.css';

export const DisclaimerButton: React.FC = () => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const handleClick = () => {
    setIsPopupOpen(!isPopupOpen);
  };

  const handleClose = () => {
    setIsPopupOpen(false);
  };

  return (
    <>
      <button
        className="header-button"
        onClick={handleClick}
        aria-label="Disclaimer"
        title="Disclaimer"
      >
        <svg
          viewBox="0 0 24 24"
          width="16"
          height="16"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
        </svg>
        <span>Disclaimer</span>
      </button>
      {isPopupOpen && (
        <div className="disclaimer-popup-overlay" onClick={handleClose}>
          <div className="disclaimer-popup" onClick={e => e.stopPropagation()}>
            <button className="disclaimer-popup-close" onClick={handleClose}>
              ×
            </button>
            <h2>Disclaimer</h2>
            <div className="disclaimer-content">
              <p>
                This course map is based on Duke University's publicly available curriculum data, and is meant for informational purposes 
                only. This is not an official resource. While every effort has been made to ensure accuracy, there may be errors or omissions. Please consult  university and department websites or academic advisors for authoritative and up-to-date information.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}; 