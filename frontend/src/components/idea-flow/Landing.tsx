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

const Tagline = styled.div`
  font-size: 1.1rem;
  font-weight: 700;
  color: #6c757d;
  letter-spacing: 0.03em;
  margin-bottom: 1.2rem;
  text-align: center;
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
      <Tagline>Find Your Perfect Side Hustle</Tagline>
      <Title>What's your situation?</Title>
      <Options>
        <OptionButton onClick={() => onSelect('idea')} aria-label="I need a side hustle idea">
          I need a side hustle idea
        </OptionButton>
        <OptionButton onClick={() => onSelect('customer')} aria-label="I have an idea but need help">
          I have an idea but need help
        </OptionButton>
      </Options>
    </Container>
  );
} 