import React, { useState } from 'react';
import './Button.css';
import './HelpButton.css';

export const HelpButton: React.FC = () => {
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
        aria-label="Help"
        title="Help"
      >
        <svg 
          viewBox="0 0 24 24" 
          width="16" 
          height="16" 
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/>
        </svg>
        <span>Help</span>
      </button>
      
      {isPopupOpen && (
        <div className="help-popup-overlay" onClick={handleClose}>
          <div className="help-popup" onClick={(e) => e.stopPropagation()}>
            <button className="help-popup-close" onClick={handleClose}>
              ×
            </button>
            <h2>How to Use Course Map</h2>
            <div className="help-content">
              <section>
                <h3>🔍 Search Courses</h3>
                <p>Use the search bar at the top to find specific courses by name or code. Click on any course in the search results to center it on the map.</p>
              </section>
              
              <section>
                <h3>🔗 Understanding Connections</h3>
                <p>After selecting a course, the map will show the course's <strong>inputs</strong> (prerequisites) and <strong>outputs</strong> (courses that are unlocked by the selected course).</p>
              </section>

              <section>
                <h3>🗺️ Navigate the Map</h3>
                <p>• <strong>Zoom:</strong> Use mouse wheel or pinch gestures to zoom in/out</p>
                <p>• <strong>Pan:</strong> Click and drag to move around the map</p>
                <p>• <strong>Click nodes:</strong> Click on any course node to view its details</p>
              </section>
              
              <section>
                <h3>📋 Course Information</h3>
                <p>When you click on a course, a popup will show:</p>
                <ul>
                  <li>Course code and name</li>
                  <li>Prerequisites and corequisites (as text)</li>
                  <li>Description and credits</li>
                  <li>Option to recenter the map on that course</li>
                </ul>
              </section>
              
            </div>
          </div>
        </div>
      )}
    </>
  );
}; 