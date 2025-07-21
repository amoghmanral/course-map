import React from 'react';
import { SearchBar } from './SearchBar';
import { GitHubButton } from './GitHubButton';
import { HelpButton } from './HelpButton';
import { DisclaimerButton } from './DisclaimerButton';
import './Header.css';
import type { Course, Data } from '../types';

interface HeaderProps {
  data: Data | null;
  inputValue: string;
  setInputValue: (value: string) => void;
  onCourseSelect: (course: Course) => void;
}

export const Header: React.FC<HeaderProps> = ({ data, inputValue, setInputValue, onCourseSelect }) => {
  return (
    <header className="invisible-header">
      <div className="header-left">
        <SearchBar
          data={data}
          inputValue={inputValue}
          setInputValue={setInputValue}
          onCourseSelect={onCourseSelect}
        />
      </div>
      <div className="header-right">
        <HelpButton />
        <DisclaimerButton />
        <GitHubButton />
      </div>
    </header>
  );
}; 