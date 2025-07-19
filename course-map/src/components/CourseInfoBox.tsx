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
      <button
        onClick={() => onRecenter(course)}
        className="recenter-button"
      >
        Recenter Graph
      </button>
    </div>
  );
} 