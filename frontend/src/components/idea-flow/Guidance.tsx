import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
`;

const Message = styled.p`
  font-size: 1.2rem;
  color: var(--text-secondary);
  margin-bottom: 2.5rem;
  line-height: 1.6;
`;

const Highlight = styled.span`
  color: #181a1b;
  font-weight: 600;
`;

const ActionButton = styled.button`
  background: #181a1b;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
  &:hover {
    background: #000;
  }
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

interface GuidanceProps {
  message: string;
  buttonText: string;
  onContinue: () => void;
}

export function Guidance({ message, buttonText, onContinue }: GuidanceProps) {
  return (
    <Container>
      <Message>{message}</Message>
      <ActionButton onClick={onContinue}>{buttonText}</ActionButton>
    </Container>
  );
} 