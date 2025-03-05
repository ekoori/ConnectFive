import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 24px;
`;

const Button = styled.button`
  background-color: #4CAF50;
  border: none;
  color: white;
  padding: 16px 32px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 16px;
  margin: 4px 2px;
  transition-duration: 0.4s;
  cursor: pointer;
  border-radius: 8px;
  
  &:hover {
    background-color: #45a049;
    box-shadow: 0 8px 16px 0 rgba(0,0,0,0.2);
  }
`;

const HumanButton = styled(Button)`
  background-color: #2196F3;
  
  &:hover {
    background-color: #0b7dda;
  }
`;

const EasyButton = styled(Button)`
  background-color: #4CAF50;
  
  &:hover {
    background-color: #45a049;
  }
`;

const MediumButton = styled(Button)`
  background-color: #ff9800;
  
  &:hover {
    background-color: #e68a00;
  }
`;

const HardButton = styled(Button)`
  background-color: #f44336;
  
  &:hover {
    background-color: #da190b;
  }
`;

interface DifficultySelectorProps {
  onSelect: (mode: 'human' | 'ai-easy' | 'ai-medium' | 'ai-hard') => void;
}

const DifficultySelector: React.FC<DifficultySelectorProps> = ({ onSelect }) => {
  return (
    <Container>
      <h2>Choose Game Mode</h2>
      <HumanButton onClick={() => onSelect('human')}>
        Two Players
      </HumanButton>
      <EasyButton onClick={() => onSelect('ai-easy')}>
        AI - Easy
      </EasyButton>
      <MediumButton onClick={() => onSelect('ai-medium')}>
        AI - Medium
      </MediumButton>
      <HardButton onClick={() => onSelect('ai-hard')}>
        AI - Hard
      </HardButton>
    </Container>
  );
};

export default DifficultySelector;