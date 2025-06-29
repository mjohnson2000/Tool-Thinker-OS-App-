import React from 'react';
import styled from 'styled-components';

const TrackerContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 2rem 0 2rem 0.5rem;
  min-width: 210px;
  margin-left: 1rem;
`;

const StepItem = styled.button<{ $status: string; $isClickable: boolean }>`
  background: none;
  border: none;
  outline: none;
  display: flex;
  align-items: center;
  cursor: ${({ $isClickable }) => ($isClickable ? 'pointer' : 'default')};
  margin-bottom: 1.5rem;
  padding: 0;
  width: 100%;
  &:hover .circle {
    box-shadow: ${({ $isClickable }) =>
      $isClickable ? '0 4px 12px rgba(0, 122, 255, 0.25)' : 'none'};
  }
`;

const StepCircle = styled.div<{ $status: string }>`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${({ $status }) =>
    $status === 'completed' ? '#181a1b' : $status === 'current' ? '#888888' : '#e9ecef'};
  color: ${({ $status }) =>
    $status === 'current' ? '#fff' : $status === 'completed' ? '#181a1b' : '#b0b0b0'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.1rem;
  box-shadow: ${({ $status }) =>
    $status === 'current' ? '0 4px 12px rgba(136, 136, 136, 0.18)' : 'none'};
  border: 2px solid ${({ $status }) =>
    $status === 'current' ? '#888888' : $status === 'completed' ? '#181a1b' : '#e9ecef'};
  transition: background 0.2s, border 0.2s;
  margin-right: 1rem;
`;

const StepLabel = styled.div<{ $status: string }>`
  font-size: 1rem;
  font-weight: ${({ $status }) => ($status === 'current' ? '600' : '500')};
  color: ${({ $status }) => ($status === 'current' ? '#222' : '#6c757d')};
  display: flex;
  align-items: center;
`;

const Connector = styled.div<{ $active: boolean }>`
  width: 2px;
  height: 32px;
  background: ${({ $active }) => ($active ? 'linear-gradient(180deg, #181a1b 0%, #444 100%)' : '#e9ecef')};
  margin: 0 15px;
  align-self: center;
  border-radius: 1px;
`;

const PremiumBadge = styled.span`
  background: linear-gradient(135deg, #181a1b 0%, #444 100%);
  color: white;
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0.2rem 0.5rem;
  border-radius: 10px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-left: 0.3rem;
`;

const LockIcon = styled.span`
  color: #181a1b;
  font-size: 0.9rem;
  margin-left: 0.3rem;
`;

interface ProgressTrackerProps {
  steps: { key: string; label: string; isPremium?: boolean }[];
  currentStepKey: string;
  onStepClick: (stepKey: string) => void;
  isSubscribed?: boolean;
}

export function ProgressTracker({ steps, currentStepKey, onStepClick, isSubscribed = false }: ProgressTrackerProps) {
  const currentStepIndex = steps.findIndex(step => step.key === currentStepKey);

  const getStatus = (stepIndex: number) => {
    if (currentStepIndex === -1) return 'upcoming';
    if (stepIndex < currentStepIndex) return 'completed';
    if (stepIndex === currentStepIndex) return 'current';
    return 'upcoming';
  };

  const canAccessStep = (step: { key: string; isPremium?: boolean }) => {
    if (!step.isPremium) return true;
    return isSubscribed;
  };

  return (
    <TrackerContainer>
      {steps.map((step, index) => {
        const status = getStatus(index);
        const isClickable = status === 'completed' && canAccessStep(step);
        const isPremium = step.isPremium && !isSubscribed;
        return (
          <React.Fragment key={step.key}>
            <StepItem
              $status={status}
              $isClickable={isClickable}
              onClick={() => isClickable && onStepClick(step.key)}
              aria-current={status === 'current' ? 'step' : undefined}
              tabIndex={isClickable ? 0 : -1}
            >
              <StepCircle className="circle" $status={status}>
                {status === 'completed' ? (
                  <span style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 700, lineHeight: 1 }}>✓</span>
                ) : (
                  index + 1
                )}
              </StepCircle>
              <StepLabel $status={status}>
                {step.label.replace(/^\d+\.\s*/, '')}
                {step.isPremium && <PremiumBadge>Premium</PremiumBadge>}
                {isPremium && <LockIcon>🔒</LockIcon>}
              </StepLabel>
            </StepItem>
            {/* Remove the vertical connector lines */}
            {/* {index < steps.length - 1 && (
              <Connector $active={getStatus(index + 1) !== 'upcoming'} />
            )} */}
          </React.Fragment>
        );
      })}
    </TrackerContainer>
  );
} 