import "./CourseInfoBox.css";
import type { Course } from "../types";

interface CourseInfoBoxProps {
  course: Course | null;
  onClose: () => void;
  onRecenter: (course: Course) => void;
}

export function CourseInfoBox({ course, onClose, onRecenter }: CourseInfoBoxProps) {
  if (!course) return null;

  return (
    <div className="info-box">
      <button
        onClick={onClose}
        className="close-button"
        aria-label="Close"
      >
        ×
      </button>
      <h3 className="course-title">
        {course.code}: {course.title}
      </h3>
      <p className="course-description">{course.description}</p>
      <div style={{ display: "flex", gap: "10px" }}>
        <button
          onClick={() => onRecenter(course)}
          className="info-box-button"
        >
          Recenter map on this course
        </button>
        <button
          className="info-box-button"
          onClick={() => {
            const query = `Duke ${course.code}: ${course.title}`;
            window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank', 'noopener,noreferrer');
          }}
        >
          Google Search
        </button>
      </div>
    </div>
  );
} 