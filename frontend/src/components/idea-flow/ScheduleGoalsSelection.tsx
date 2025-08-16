import React, { useState } from 'react';
import styled, { keyframes, css } from 'styled-components';

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
  
  @media (max-width: 768px) {
    padding: 1rem 0.5rem;
    max-width: 95%;
  }
  
  @media (max-width: 480px) {
    padding: 0.5rem;
  }
`;

const FormCard = styled.div`
  background: linear-gradient(135deg, #ffffff 0%, #fafbfc 100%);
  border-radius: 20px;
  padding: 2.5rem;
  box-shadow: 
    0 4px 20px rgba(0,0,0,0.08),
    0 1px 3px rgba(0,0,0,0.1);
  border: 1px solid rgba(255,255,255,0.8);
  width: 100%;
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

const Title = styled.h2`
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
  
  @media (max-width: 768px) {
    font-size: 2rem;
    margin-bottom: 1rem;
    
    &::after {
      width: 50px;
    }
  }
  
  @media (max-width: 480px) {
    font-size: 1.8rem;
    margin-bottom: 0.8rem;
    
    &::after {
      width: 40px;
    }
  }
`;

const Subtitle = styled.p`
  color: var(--text-secondary);
  margin-bottom: 2rem;
  text-align: center;
  font-size: 1.15rem;
  line-height: 1.6;
  max-width: 550px;
  font-weight: 400;
  opacity: 0.9;
`;

const Form = styled.form`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
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
  padding: 1.2rem 1rem 1.2rem 3rem;
  border: 2px solid #E5E5E5;
  border-radius: 14px;
  font-size: 1.1rem;
  font-weight: 500;
  background: linear-gradient(135deg, #fafbfc 0%, #f8f9fa 100%) url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23444' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E") no-repeat 1rem center;
  background-size: 16px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  outline: none;
  cursor: pointer;
  appearance: none;
  color: #181a1b;
  box-shadow: 0 2px 4px rgba(0,0,0,0.04);
  
  &:focus {
    border-color: #181a1b;
    box-shadow: 0 0 0 3px rgba(24, 26, 27, 0.1), 0 4px 12px rgba(0,0,0,0.08);
    background: linear-gradient(135deg, #fff 0%, #fafbfc 100%) url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23181a1b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E") no-repeat 1rem center;
    background-size: 16px;
    transform: translateY(-1px);
  }
  
  &:hover {
    border-color: #ccc;
    background: linear-gradient(135deg, #f8f9fa 0%, #f1f3f4 100%) url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E") no-repeat 1rem center;
    background-size: 16px;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  }
  
  option {
    padding: 0.8rem;
    font-size: 1rem;
    background: #fff;
  }
`;

const Button = styled.button`
  background: linear-gradient(135deg, #181a1b 0%, #2d2d2d 100%);
  color: white;
  border: none;
  border-radius: 16px;
  padding: 1.4rem 2rem;
  font-size: 1.3rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  margin-top: 2rem;
  width: 100%;
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
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%, rgba(0,0,0,0.1) 100%);
    pointer-events: none;
  }
  
  &:hover {
    background: linear-gradient(135deg, #000 0%, #181a1b 100%);
    transform: translateY(-3px);
    box-shadow: 0 12px 32px rgba(0,0,0,0.25);
    
    &::before {
      left: 100%;
    }
  }
  
  &:active {
    transform: translateY(-1px);
    box-shadow: 0 6px 16px rgba(0,0,0,0.2);
  }
  
  &:disabled {
    background: linear-gradient(135deg, #ccc 0%, #ddd 100%);
    cursor: not-allowed;
    transform: none;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    
    &::before {
      display: none;
    }
  }
`;

const InfoText = styled.p`
  font-size: 0.9rem;
  color: var(--text-secondary);
  text-align: center;
  margin-top: 1rem;
`;

const hoursOptions = [
  { value: 5, label: '5 hours per week', icon: '⏰' },
  { value: 10, label: '10 hours per week', icon: '📅' },
  { value: 15, label: '15 hours per week', icon: '🕒' },
  { value: 20, label: '20+ hours per week', icon: '🚀' },
];

const incomeOptions = [
  { value: 300, label: '$100-500 per month', icon: '💰' },
  { value: 750, label: '$500-1000 per month', icon: '💵' },
  { value: 1500, label: '$1000+ per month', icon: '🏆' },
];

export interface ScheduleGoalsSelectionProps {
  onSelect: (scheduleGoals: ScheduleGoalsData) => void;
  interests?: string;
  businessArea?: { title: string; description: string; icon: string } | null;
  location?: { city: string; region: string; country: string } | null;
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
      
      <FormCard>
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
      </FormCard>
      
      <InfoText>
        We'll match you with opportunities that fit your schedule and help you reach your income goals
      </InfoText>
    </Container>
  );
} 