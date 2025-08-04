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
  min-height: 80vh;
  padding: 2rem 1rem 2rem 1rem;
  margin-bottom: 250px;
`;

const FormCard = styled.div`
  background: linear-gradient(135deg, #ffffff 0%, #fafbfc 100%);
  border-radius: 20px;
  padding: 3rem 2.5rem;
  box-shadow: 
    0 4px 20px rgba(0,0,0,0.08),
    0 1px 3px rgba(0,0,0,0.1);
  border: 1px solid rgba(255,255,255,0.8);
  width: 100%;
  max-width: 600px;
  margin-top: 1.5rem;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, #181a1b, #4a4a4a, #181a1b);
    border-radius: 20px 20px 0 0;
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 100%);
    pointer-events: none;
  }
`;

const Tagline = styled.div`
  font-size: 2.4rem;
  font-weight: 800;
  margin-bottom: 1.2rem;
  text-align: center;
  color: var(--text-primary);
  letter-spacing: -0.03em;
  background: linear-gradient(135deg, #181a1b 0%, #4a4a4a 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -8px;
    left: 50%;
    transform: translateX(-50%);
    width: 60px;
    height: 3px;
    background: linear-gradient(90deg, #181a1b, #4a4a4a);
    border-radius: 2px;
  }
`;

const Title = styled.h1`
  font-size: 1.15rem;
  font-weight: 500;
  margin-bottom: 2rem;
  color: var(--text-secondary);
  text-align: center;
  line-height: 1.6;
  max-width: 550px;
  opacity: 0.9;
`;

const Options = styled.div`
  display: flex;
  gap: 2rem;
`;

const OptionButton = styled.button`
  padding: 1.8rem 2.5rem;
  font-size: 1.3rem;
  border: none;
  border-radius: 16px;
  background: linear-gradient(135deg, #ffffff 0%, #fafbfc 100%);
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  color: var(--text-primary);
  cursor: pointer;
  font-weight: 700;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  outline: none;
  position: relative;
  overflow: hidden;
  border: 2px solid #E5E5E5;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
    transition: left 0.6s ease;
  }
  
  &:hover, &:focus {
    background: linear-gradient(135deg, #f8f9fa 0%, #f1f3f4 100%);
    box-shadow: 0 8px 24px rgba(0,0,0,0.12);
    transform: translateY(-2px);
    border-color: #181a1b;
    
    &::before {
      left: 100%;
    }
  }
  
  &:active {
    transform: translateY(-1px);
    box-shadow: 0 6px 16px rgba(0,0,0,0.1);
  }
`;



export function Landing({ onSelect }: LandingProps) {
  return (
    <Container>
      <Tagline>Find Your Perfect Side Hustle</Tagline>
      <Title>What's your situation?</Title>
      <FormCard>
        <Options>
          <OptionButton onClick={() => onSelect('idea')} aria-label="I need a side hustle idea">
            I need a side hustle idea
          </OptionButton>
          <OptionButton onClick={() => onSelect('customer')} aria-label="I have an idea but need help">
            I have an idea but need help
          </OptionButton>
        </Options>
      </FormCard>
    </Container>
  );
} 