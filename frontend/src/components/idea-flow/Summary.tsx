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
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
`;

const Title = styled.h1`
  font-size: 2rem;
  color: #333;
  text-align: center;
  margin-bottom: 2rem;
`;

const Section = styled.div`
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  color: #181a1b;
  margin-bottom: 1rem;
  border-bottom: 2px solid #e5e5e5;
  padding-bottom: 0.5rem;
`;

const Content = styled.p`
  font-size: 1.1rem;
  line-height: 1.6;
  color: #555;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 2.5rem;
`;

const Button = styled.button`
  padding: 0.8rem 1.5rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  border-radius: 8px;
  border: 1px solid transparent;
  transition: all 0.2s;
`;

const PrimaryButton = styled(Button)`
  background-color: #181a1b;
  color: #fff;
  border-color: #181a1b;

  &:hover {
    background-color: #000;
  }
`;

const SecondaryButton = styled(Button)`
  background-color: #fff;
  color: #181a1b;
  border-color: #e5e5e5;

  &:hover {
    background-color: #f5f5f7;
    color: #181a1b;
    border-color: #181a1b;
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
  onRestart: () => void;
  onSignup: () => void;
  onLogin: () => void;
}

export function Summary({ idea, customer, job, onRestart, onSignup, onLogin }: SummaryProps) {
  return (
    <Container>
      <Title>Your Business Idea Summary</Title>

      <Section>
        <SectionTitle>Business Idea</SectionTitle>
        <Content>Based on your interest in <strong>{idea.interests}</strong>, we've identified a promising area: <strong>{idea.area.title}</strong>. {idea.area.description}</Content>
      </Section>

      <Section>
        <SectionTitle>Target Customer</SectionTitle>
        <Content>Your target customer is <strong>{customer.title}</strong>. {customer.description}</Content>
      </Section>

      <Section>
        <SectionTitle>Job-to-be-Done</SectionTitle>
        <Content>The primary job your customer is trying to get done is: <strong>{job.title}</strong>. {job.description}</Content>
      </Section>

      <ButtonContainer>
        <SecondaryButton onClick={onLogin}>Log in to Continue</SecondaryButton>
        <PrimaryButton onClick={onSignup}>Sign Up & View Startup Plan</PrimaryButton>
      </ButtonContainer>
      
      <div style={{textAlign: 'center'}}>
        <RestartButton onClick={onRestart}>Start Over</RestartButton>
      </div>
    </Container>
  );
} 