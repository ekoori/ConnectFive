import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 24px;
`;

const Button = styled.button`
  background-color: ${({ theme }) => theme.secondary};
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
    filter: brightness(1.1);
    box-shadow: 0 8px 16px 0 ${({ theme }) => theme.shadow};
  }
`;

const HumanButton = styled(Button)`
  background-color: ${({ theme }) => theme.primary};
  
  &:hover {
    background-color: ${({ theme }) => theme.primary};
    filter: brightness(1.2);
  }
`;

const EasyButton = styled(Button)`
  background-color: #4CAF50;
  
  &:hover {
    background-color: #4CAF50;
    filter: brightness(1.1);
  }
`;

const MediumButton = styled(Button)`
  background-color: #ff9800;
  
  &:hover {
    background-color: #ff9800;
    filter: brightness(1.1);
  }
`;

const HardButton = styled(Button)`
  background-color: #f44336;
  
  &:hover {
    background-color: #f44336;
    filter: brightness(1.1);
  }
`;

interface DifficultySelectorProps {
  onSelect: (mode: 'human' | 'ai-easy' | 'ai-medium' | 'ai-hard') => void;
}

const Header = styled.h2`
  color: ${({ theme }) => theme.text};
  margin-bottom: 10px;
  text-align: center;
`;

const DifficultySelector: React.FC<DifficultySelectorProps> = ({ onSelect }) => {
  return (
    <Container>
      <Header>Choose Game Mode</Header>
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