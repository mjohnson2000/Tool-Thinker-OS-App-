import React, { useState, useEffect } from 'react';
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
  
  @media (max-width: 768px) {
    padding: 1rem 0.5rem 1rem 0.5rem;
    min-height: 70vh;
  }
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
  
  @media (max-width: 768px) {
    padding: 2rem 1.5rem;
    margin-top: 1rem;
    border-radius: 16px;
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, #181a1b, #4a4a4a, #181a1b);
    border-radius: 20px 20px 0 0;
    
    @media (max-width: 768px) {
      border-radius: 16px 16px 0 0;
    }
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
  font-family: 'Audiowide', 'Courier New', monospace;
  font-size: 2.4rem;
  font-weight: 400;
  margin-bottom: 1.2rem;
  text-align: center;
  color: var(--text-primary);
  letter-spacing: -0.03em;
  background: linear-gradient(135deg, #181a1b 0%, #4a4a4a 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  position: relative;
  font-display: swap;
  
  @media (max-width: 768px) {
    font-size: 2rem;
    margin-bottom: 1rem;
  }
  
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
  
  @media (max-width: 768px) {
    font-size: 1rem;
    margin-bottom: 1.5rem;
    padding: 0 0.5rem;
  }
`;

const Options = styled.div`
  display: flex;
  gap: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1.5rem;
  }
`;

const OptionButton = styled.button`
  padding: 2rem 2.5rem;
  font-family: 'Audiowide', 'Courier New', monospace;
  font-size: 1.2rem;
  font-weight: 400;
  border: none;
  border-radius: 16px;
  background: linear-gradient(135deg, #ffffff 0%, #fafbfc 100%);
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  outline: none;
  position: relative;
  overflow: hidden;
  border: 2px solid #E5E5E5;
  text-align: center;
  font-display: swap;
  
  @media (max-width: 768px) {
    padding: 2rem 1.5rem;
    font-size: 1.1rem;
    min-height: 120px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
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



const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999999;
  padding: 1rem;
  
  @media (max-width: 768px) {
    padding: 0.5rem;
    align-items: flex-start;
    padding-top: 2rem;
  }
`;

const ModalCard = styled.div`
  background: linear-gradient(135deg, #ffffff 0%, #fafbfc 100%);
  border-radius: 20px;
  padding: 2.5rem;
  box-shadow: 
    0 4px 20px rgba(0,0,0,0.08),
    0 1px 3px rgba(0,0,0,0.1);
  border: 1px solid rgba(255,255,255,0.8);
  max-width: 500px;
  width: 100%;
  position: relative;
  overflow: hidden;
  
  @media (max-width: 768px) {
    padding: 1.5rem 1rem;
    border-radius: 16px;
    max-width: calc(100vw - 1rem);
    margin: 0 0.5rem;
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, #181a1b, #4a4a4a, #181a1b);
    border-radius: 20px 20px 0 0;
    
    @media (max-width: 768px) {
      border-radius: 16px 16px 0 0;
    }
  }
`;

const ModalTitle = styled.div`
  font-family: 'Audiowide', 'Courier New', monospace;
  font-size: 1.5rem;
  font-weight: 400;
  margin-bottom: 1rem;
  text-align: center;
  color: var(--text-primary);
  letter-spacing: -0.03em;
  background: linear-gradient(135deg, #181a1b 0%, #4a4a4a 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  
  @media (max-width: 768px) {
    font-size: 1.2rem;
    margin-bottom: 0.75rem;
  }
`;

const ModalMessage = styled.div`
  font-size: 1rem;
  color: var(--text-secondary);
  text-align: center;
  line-height: 1.6;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    font-size: 0.9rem;
    line-height: 1.5;
    margin-bottom: 1.5rem;
  }
`;

const ModalButtons = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0.75rem;
    width: 100%;
  }
`;

const ModalButton = styled.button`
  padding: 0.75rem 1.5rem;
  font-family: 'Audiowide', 'Courier New', monospace;
  font-size: 0.9rem;
  font-weight: 400;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  outline: none;
  position: relative;
  overflow: hidden;
  text-align: center;
  font-display: swap;
  
  @media (max-width: 768px) {
    padding: 0.875rem 1rem;
    font-size: 0.85rem;
    min-height: 44px;
    width: 100%;
  }
  
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
    transform: translateY(-1px);
    
    &::before {
      left: 100%;
    }
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &.primary {
    background: linear-gradient(135deg, #181a1b 0%, #4a4a4a 100%);
    color: white;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    
    &:hover {
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
  }
  
  &.secondary {
    background: linear-gradient(135deg, #ffffff 0%, #fafbfc 100%);
    color: var(--text-primary);
    border: 2px solid #E5E5E5;
    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
    
    &:hover {
      border-color: #181a1b;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
  }
`;

export function Landing({ onSelect }: LandingProps) {
  const [showFallbackMessage, setShowFallbackMessage] = useState(false);

  // Check for unprocessed idea data from trending ideas
  useEffect(() => {
    const prefilledIdea = localStorage.getItem('prefilledIdea');
    const explorationInitiated = localStorage.getItem('ideaExplorationInitiated');
    const fromTrendingIdeas = localStorage.getItem('fromTrendingIdeas');
    
    console.log('Landing useEffect - prefilledIdea:', prefilledIdea);
    console.log('Landing useEffect - explorationInitiated:', explorationInitiated);
    console.log('Landing useEffect - fromTrendingIdeas:', fromTrendingIdeas);
    
    if (prefilledIdea && explorationInitiated && fromTrendingIdeas) {
      console.log('Landing: Found unprocessed idea data, showing fallback message');
      setShowFallbackMessage(true);
    } else {
      console.log('Landing: No unprocessed idea data found, not showing fallback');
    }
  }, []);

  return (
    <>
      {showFallbackMessage && (
        <ModalOverlay>
          <ModalCard>
            <ModalTitle>🚀 Continue Your Idea Exploration</ModalTitle>
            <ModalMessage>
              We found your trending idea data! Click the button below to continue exploring this opportunity and turn it into a profitable side hustle.
            </ModalMessage>
            <ModalButtons>
              <ModalButton
                className="primary"
                onClick={() => {
                  // Don't clear the flags - let the app process them
                  setShowFallbackMessage(false);
                  // Navigate to the app which will process the idea data
                  window.location.href = '/app';
                }}
              >
                Continue to Idea Explorer
              </ModalButton>
              <ModalButton
                className="secondary"
                onClick={() => {
                  localStorage.removeItem('prefilledIdea');
                  localStorage.removeItem('ideaExplorationInitiated');
                  localStorage.removeItem('fromTrendingIdeas');
                  setShowFallbackMessage(false);
                }}
              >
                Dismiss
              </ModalButton>
            </ModalButtons>
          </ModalCard>
        </ModalOverlay>
      )}
              <Container>
          <Tagline>How It Works</Tagline>
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
      </>
    );
  } 