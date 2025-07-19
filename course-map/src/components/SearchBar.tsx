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
      <div>
        <input
          {...getInputProps()}
          placeholder="Search for a course..."
          className="search-input"
        />
      </div>
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