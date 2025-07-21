import "./LoadingScreen.css";

export default function LoadingScreen() {
  return (
    <div className="loading-screen-bg">
      <div className="loading-screen-content">
        <div className="loading-spinner" aria-label="Loading" />
        <h2 className="loading-title">Course Map</h2>
        <p className="loading-message">Loading courses…</p>
      </div>
    </div>
  );
} 