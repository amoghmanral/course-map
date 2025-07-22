import "./GitHubNudge.css";

interface GitHubNudgeProps {
  onClose: () => void;
}

export default function GitHubNudge({ onClose }: GitHubNudgeProps) {
  return (
    <div className="github-nudge-box">
      <button className="github-nudge-close" onClick={onClose} aria-label="Close nudge">×</button>
      <div className="github-nudge-message">
        <strong>Like this project?</strong><br />
        Star it on GitHub!
      </div>
      <div className="github-nudge-arrow-up" />
    </div>
  );
} 