import { useMemo } from "react";
import { useCombobox } from "downshift";
import "./SearchBar.css";
import type { Course, Data } from "../types";

interface SearchBarProps {
  data: Data | null;
  inputValue: string;
  setInputValue: (value: string) => void;
  onCourseSelect: (course: Course) => void;
}

export function SearchBar({ data, inputValue, setInputValue, onCourseSelect }: SearchBarProps) {
  const courseOptions = useMemo(() => {
    if (!data) return [];
    return data.courses.map((course) => ({
      value: course.code,
      label: `${course.code}: ${course.title}`,
      course,
    }));
  }, [data]);

  const {
    isOpen,
    getMenuProps,
    getInputProps,
    getItemProps,
    highlightedIndex,
  } = useCombobox({
    items: courseOptions.filter((option) =>
      option.label.toLowerCase().includes(inputValue.toLowerCase())
    ),
    inputValue,
    onInputValueChange: ({ inputValue }) => setInputValue(inputValue || ""),
    onSelectedItemChange: ({ selectedItem }) => {
      if (selectedItem) {
        onCourseSelect(selectedItem.course);
        setInputValue("");
      }
    },
    itemToString: (item) => (item ? item.label : ""),
  });

  return (
    <div className="search-container">
      <input
        {...getInputProps()}
        placeholder="Search for a course..."
        className={`search-input${isOpen ? ' dropdown-open' : ''}`}
      />
      {inputValue && (
        <button
          type="button"
          className="search-clear-btn"
          onClick={() => setInputValue("")}
          aria-label="Clear search"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <line x1="5" y1="5" x2="13" y2="13" stroke="#888" strokeWidth="2" strokeLinecap="round"/>
            <line x1="13" y1="5" x2="5" y2="13" stroke="#888" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      )}
      <ul {...getMenuProps()} className={`search-dropdown ${isOpen ? 'open' : ''}`}>
        {isOpen &&
          courseOptions
            .filter((option) =>
              option.label.toLowerCase().includes(inputValue.toLowerCase())
            )
            .slice(0, 15)
            .map((item, index) => (
              <li
                key={item.value}
                {...getItemProps({ item, index })}
                className={`search-item ${highlightedIndex === index ? 'highlighted' : ''}`}
              >
                {item.label}
              </li>
            ))}
      </ul>
    </div>
  );
}