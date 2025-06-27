import React from 'react';
import styled from 'styled-components';

const TrackerContainer = styled.div`
  padding: 1rem;
`;

const StepItem = styled.div<{ $status: string; $isClickable: boolean }>`
  display: flex;
  align-items: center;
  margin-bottom: 1.5rem;
  opacity: ${props => (props.$status === 'upcoming' ? 0.6 : 1)};
  transition: all 0.3s ease;
  cursor: ${props => (props.$isClickable ? 'pointer' : 'default')};

  &:hover {
    background-color: ${props => (props.$isClickable ? '#f8f9fa' : 'transparent')};
  }
`;

const StepIcon = styled.div<{ $status: string }>`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${props => {
    if (props.$status === 'completed') return '#28a745';
    if (props.$status === 'current') return '#007AFF';
    return '#e9ecef';
  }};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1rem;
  font-weight: bold;
  flex-shrink: 0;
  transform: ${props => (props.$status === 'current' ? 'scale(1.1)' : 'scale(1)')};
  box-shadow: ${props => (props.$status === 'current' ? '0 4px 12px rgba(0, 122, 255, 0.3)' : 'none')};
`;

const StepLabel = styled.div<{ $status: string }>`
  font-size: 1rem;
  font-weight: ${props => (props.$status === 'current' ? '600' : '500')};
  color: ${props => (props.$status === 'current' ? '#222' : '#6c757d')};
`;

interface ProgressTrackerProps {
  steps: { key: string; label: string }[];
  currentStepKey: string;
  onStepClick: (stepKey: string) => void;
}

export function ProgressTracker({ steps, currentStepKey, onStepClick }: ProgressTrackerProps) {
  const currentStepIndex = steps.findIndex(step => step.key === currentStepKey);

  const getStatus = (stepIndex: number) => {
    if (currentStepIndex === -1) return 'upcoming';
    if (stepIndex < currentStepIndex) return 'completed';
    if (stepIndex === currentStepIndex) return 'current';
    return 'upcoming';
  };

  return (
    <TrackerContainer>
      {steps.map((step, index) => {
        const status = getStatus(index);
        const isClickable = status === 'completed';
        return (
          <StepItem 
            key={step.key} 
            $status={status}
            $isClickable={isClickable}
            onClick={() => isClickable && onStepClick(step.key)}
          >
            <StepIcon $status={status}>
              {status === 'completed' ? '✓' : index + 1}
            </StepIcon>
            <StepLabel $status={status}>{step.label}</StepLabel>
          </StepItem>
        );
      })}
    </TrackerContainer>
  );
} 