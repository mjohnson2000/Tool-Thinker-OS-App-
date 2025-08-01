import React, { useState } from 'react';
import styled from 'styled-components';

export interface ScheduleGoalsData {
  hoursPerWeek: number;
  incomeTarget: number;
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 700px;
  margin: 0 auto;
  padding: 2rem;
`;

const Title = styled.h2`
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 2rem;
  text-align: center;
`;

const Subtitle = styled.p`
  color: var(--text-secondary);
  margin-bottom: 2rem;
  text-align: center;
`;

const Form = styled.form`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: 600;
  font-size: 1rem;
  color: var(--text-primary);
`;

const Select = styled.select`
  width: 100%;
  padding: 1rem;
  border: 2px solid #E5E5E5;
  border-radius: 12px;
  font-size: 1rem;
  background: #fafbfc;
  transition: border-color 0.2s;
  outline: none;
  cursor: pointer;
  
  &:focus {
    border-color: #181a1b;
  }
`;

const Button = styled.button`
  background: #181a1b;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
  margin-top: 1rem;
  
  &:hover {
    background: #000;
  }
  
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const InfoText = styled.p`
  font-size: 0.9rem;
  color: var(--text-secondary);
  text-align: center;
  margin-top: 1rem;
`;

const hoursOptions = [
  { value: 5, label: '5 hours per week' },
  { value: 10, label: '10 hours per week' },
  { value: 15, label: '15 hours per week' },
  { value: 20, label: '20+ hours per week' },
];

const incomeOptions = [
  { value: 300, label: '$100-500 per month' },
  { value: 750, label: '$500-1000 per month' },
  { value: 1500, label: '$1000+ per month' },
];

export interface ScheduleGoalsSelectionProps {
  onSelect: (scheduleGoals: ScheduleGoalsData) => void;
  interests?: string;
  businessArea?: { title: string; description: string; icon: string } | null;
  location?: { city: string; region: string } | null;
}

export function ScheduleGoalsSelection({ onSelect, interests, businessArea, location }: ScheduleGoalsSelectionProps) {
  const [hoursPerWeek, setHoursPerWeek] = useState<number>(0);
  const [incomeTarget, setIncomeTarget] = useState<number>(0);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (hoursPerWeek > 0 && incomeTarget > 0) {
      onSelect({ hoursPerWeek, incomeTarget });
    }
  }

  return (
    <Container>
      <Title>What's your availability and goals?</Title>
      <Subtitle>
        This helps us find side hustles that fit your schedule and income targets
      </Subtitle>
      
      <Form onSubmit={handleSubmit}>
        <InputGroup>
          <Label htmlFor="hours">How many hours per week can you dedicate?</Label>
          <Select
            id="hours"
            value={hoursPerWeek}
            onChange={(e) => setHoursPerWeek(Number(e.target.value))}
            required
          >
            <option value="">Select hours per week</option>
            {hoursOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </InputGroup>
        
        <InputGroup>
          <Label htmlFor="income">What's your monthly income target?</Label>
          <Select
            id="income"
            value={incomeTarget}
            onChange={(e) => setIncomeTarget(Number(e.target.value))}
            required
          >
            <option value="">Select income target</option>
            {incomeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </InputGroup>
        
        <Button 
          type="submit"
          disabled={hoursPerWeek === 0 || incomeTarget === 0}
        >
          Continue
        </Button>
      </Form>
      
      <InfoText>
        We'll match you with opportunities that fit your schedule and help you reach your income goals
      </InfoText>
    </Container>
  );
} 