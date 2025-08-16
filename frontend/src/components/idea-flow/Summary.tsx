import React from 'react';
import styled from 'styled-components';
import { fetchChatGPT } from '../../utils/chatgpt';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title as ChartTitle,
  Tooltip,
  Legend,
} from 'chart.js';
import Confetti from 'react-confetti';
import { useAuth } from '../../contexts/AuthContext';
import type { BusinessArea } from './IdeaSelection';
import type { CustomerOption } from './CustomerSelection';
import type { JobOption } from './JobSelection';

ChartJS.register(CategoryScale, LinearScale, BarElement, ChartTitle, Tooltip, Legend);

const Container = styled.div`
  max-width: 800px;
  margin: 2rem auto;
  padding: 2rem;
  background: linear-gradient(135deg, #ffffff 0%, #fafbfc 100%);
  border-radius: 20px;
  box-shadow: 
    0 4px 20px rgba(0,0,0,0.08),
    0 1px 3px rgba(0,0,0,0.1);
  border: 1px solid rgba(255,255,255,0.8);
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
  
  @media (max-width: 768px) {
    margin: 1rem auto;
    padding: 1.5rem;
    border-radius: 16px;
    max-width: 95%;
    
    &::before {
      border-radius: 16px 16px 0 0;
    }
  }
  
  @media (max-width: 480px) {
    margin: 0.5rem auto;
    padding: 1rem;
    border-radius: 12px;
    
    &::before {
      border-radius: 12px 12px 0 0;
    }
  }
`;

const Title = styled.h1`
  font-family: 'Audiowide', 'Courier New', monospace;
  font-size: 2.4rem;
  font-weight: 400;
  text-align: center;
  margin-bottom: 1.2rem;
  color: var(--text-primary);
  letter-spacing: -0.03em;
  background: linear-gradient(135deg, #181a1b 0%, #4a4a4a 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  position: relative;
  font-display: swap;
  
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

const Section = styled.div`
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: #181a1b;
  margin-bottom: 1rem;
  border-bottom: 2px solid #e5e5e5;
  padding-bottom: 0.5rem;
  letter-spacing: -0.01em;
`;

const Content = styled.p`
  font-size: 1.1rem;
  line-height: 1.6;
  color: #555;
  font-weight: 400;
  margin-bottom: 1rem;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 2.5rem;
`;

const Button = styled.button`
  padding: 1.4rem 2rem;
  font-size: 1.3rem;
  font-weight: 700;
  cursor: pointer;
  border-radius: 16px;
  border: 1px solid transparent;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  
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
  
  &:hover::before {
    left: 100%;
  }
`;

const PrimaryButton = styled(Button)`
  background: linear-gradient(135deg, #181a1b 0%, #2d2d2d 100%);
  color: #fff;
  border-color: #181a1b;

  &:hover {
    background: linear-gradient(135deg, #000 0%, #181a1b 100%);
    transform: translateY(-3px);
    box-shadow: 0 12px 32px rgba(0,0,0,0.25);
  }
  
  &:active {
    transform: translateY(-1px);
    box-shadow: 0 6px 16px rgba(0,0,0,0.2);
  }
`;

const SecondaryButton = styled(Button)`
  background: linear-gradient(135deg, #ffffff 0%, #fafbfc 100%);
  color: #181a1b;
  border-color: #e5e5e5;

  &:hover {
    background: linear-gradient(135deg, #f8f9fa 0%, #f1f3f4 100%);
    color: #181a1b;
    border-color: #181a1b;
    transform: translateY(-3px);
    box-shadow: 0 12px 32px rgba(0,0,0,0.15);
  }
  
  &:active {
    transform: translateY(-1px);
    box-shadow: 0 6px 16px rgba(0,0,0,0.1);
  }
`;

const RestartButton = styled(Button)`
  background: none;
  border: none;
  color: #6c757d;
  font-size: 0.9rem;
  text-decoration: underline;
  margin-top: 1.5rem;

  &:hover {
    color: #333;
  }
`;

interface SummaryProps {
  idea: {
    interests: string;
    area: BusinessArea;
    problemDescription: string | null;
    solutionDescription: string | null;
    competitionDescription: string | null;
  };
  customer: CustomerOption;
  job: JobOption;
  location?: { city: string; region: string; country: string } | null;
  scheduleGoals?: { hoursPerWeek: number; incomeTarget: number } | null;
  onRestart: () => void;
  onSignup: () => void;
  onLogin: () => void;
}

export function Summary({ idea, customer, job, location, scheduleGoals, onRestart, onSignup, onLogin }: SummaryProps) {
  // Debug logging
  console.log('Summary props:', { idea, customer, job, location, scheduleGoals });

  // Fallback UI for missing data
  if (!idea || !customer || !job) {
    return (
      <div style={{ color: 'red', textAlign: 'center', marginTop: '2rem' }}>
        Missing required data for summary.<br />
        Please complete all previous steps.
      </div>
    );
  }

  return (
    <Container>
      <Title>Your Personalized Business Idea Summary</Title>

      <Section>
        <SectionTitle>Business Idea</SectionTitle>
        <Content>
          Based on your interest in <strong>{idea.interests}</strong>, we've identified a promising area: <strong>{idea.area.title}</strong>. {idea.area.description}
          {location && (
            <span> This opportunity is specifically tailored for <strong>{location.city}, {location.region}, {location.country}</strong>.</span>
          )}
        </Content>
      </Section>

      <Section>
        <SectionTitle>Target Customer</SectionTitle>
        <Content>Your target customer is <strong>{customer.title}</strong>. {customer.description}</Content>
      </Section>

      <Section>
        <SectionTitle>Job-to-be-Done</SectionTitle>
        <Content>The primary job your customer is trying to get done is: <strong>{job.title}</strong>. {job.description}</Content>
      </Section>

      {location && (
        <Section>
          <SectionTitle>Local Market Opportunity</SectionTitle>
          <Content>
            This business idea is specifically designed for the <strong>{location.city}</strong> market, taking into account local needs, 
            competition, and opportunities in your area. The solution addresses problems that are particularly relevant to 
            <strong> {location.city}, {location.region}</strong> residents.
          </Content>
        </Section>
      )}

      {scheduleGoals && (
        <Section>
          <SectionTitle>Your Schedule & Goals</SectionTitle>
          <Content>
            This business idea is designed to work with your availability of <strong>{scheduleGoals.hoursPerWeek} hours per week</strong> 
            and your income target of <strong>${scheduleGoals.incomeTarget.toLocaleString()} per month</strong>. The opportunity 
            is structured to fit your part-time schedule while helping you reach your financial goals.
          </Content>
        </Section>
      )}

      <ButtonContainer>
        <SecondaryButton onClick={onLogin}>Log in to Continue</SecondaryButton>
        <PrimaryButton onClick={onSignup}>Sign Up & View Business Plan</PrimaryButton>
      </ButtonContainer>
      
      <div style={{textAlign: 'center'}}>
        <RestartButton onClick={onRestart}>Start Over</RestartButton>
      </div>
    </Container>
  );
} 