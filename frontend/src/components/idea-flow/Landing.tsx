import React from 'react';
import styled from 'styled-components';

interface LandingProps {
  onSelect: (step: 'idea' | 'customer') => void;
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 2rem;
  color: var(--text-primary);
`;

const Options = styled.div`
  display: flex;
  gap: 2rem;
`;

const OptionButton = styled.button`
  padding: 1.5rem 2.5rem;
  font-size: 1.25rem;
  border: none;
  border-radius: 12px;
  background: var(--card-background);
  box-shadow: var(--shadow);
  color: var(--text-primary);
  cursor: pointer;
  font-weight: 500;
  transition: background 0.2s, box-shadow 0.2s;
  outline: none;
  &:hover, &:focus {
    background: #f0f4ff;
    box-shadow: 0 6px 18px rgba(0,0,0,0.10);
  }
`;

export function Landing({ onSelect }: LandingProps) {
  return (
    <Container>
      <Title>Where are you in your startup journey?</Title>
      <Options>
        <OptionButton onClick={() => onSelect('idea')} aria-label="I need an idea">
          I need an idea
        </OptionButton>
        <OptionButton onClick={() => onSelect('customer')} aria-label="I already have an idea">
          I already have an idea
        </OptionButton>
      </Options>
    </Container>
  );
} 