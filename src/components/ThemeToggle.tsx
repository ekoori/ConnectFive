import React from 'react';
import styled from 'styled-components';
import { useTheme } from '../contexts/ThemeContext';

const ToggleButton = styled.button`
  background-color: ${({ theme }) => theme.primary};
  color: ${({ theme }) => theme.backgroundSecondary};
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 100;
  box-shadow: 0 2px 5px ${({ theme }) => theme.shadow};
  transition: background-color 0.3s, transform 0.2s;
  
  &:hover {
    transform: scale(1.1);
  }
  
  &:active {
    transform: scale(0.95);
  }
`;

const ThemeToggle: React.FC = () => {
  const { themeMode, toggleTheme } = useTheme();
  
  return (
    <ToggleButton onClick={toggleTheme}>
      {themeMode === 'light' ? '🌙' : '☀️'}
    </ToggleButton>
  );
};

export default ThemeToggle;