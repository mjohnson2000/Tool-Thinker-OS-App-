import React from 'react';
import styled from 'styled-components';
import { FaCheck } from 'react-icons/fa';

const TrackerContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 2rem 1rem 2rem 1rem;
  min-width: 250px;
  margin-left: 1rem;
  background: linear-gradient(135deg, #ffffff 0%, #fafbfc 100%);
  border-radius: 20px;
  box-shadow: 
    0 4px 20px rgba(0,0,0,0.08),
    0 1px 3px rgba(0,0,0,0.1);
  border: 1px solid rgba(255,255,255,0.8);
  position: relative;
  overflow: visible;
  
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

const StepItem = styled.button<{ $status: string; $isClickable: boolean; $isPremature?: boolean }>`
  background: none;
  border: none;
  outline: none;
  display: flex;
  align-items: center;
  cursor: ${({ $isClickable }) => ($isClickable ? 'pointer' : 'default')};
  margin-bottom: ${({ $isPremature }) => $isPremature ? '1rem' : '1.5rem'};
  padding: 0.8rem;
  width: 100%;
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  
  &:hover {
    background: ${({ $isClickable }) => $isClickable ? 'linear-gradient(135deg, #f8f9fa 0%, #f1f3f4 100%)' : 'transparent'};
    transform: ${({ $isClickable }) => $isClickable ? 'translateX(4px)' : 'none'};
    box-shadow: ${({ $isClickable }) => $isClickable ? '0 4px 12px rgba(0,0,0,0.08)' : 'none'};
  }
  
  &:hover .circle {
    box-shadow: ${({ $isClickable }) =>
      $isClickable ? '0 6px 16px rgba(24, 26, 27, 0.25)' : 'none'};
    transform: ${({ $isClickable }) => $isClickable ? 'scale(1.1)' : 'none'};
  }
`;

const StepCircle = styled.div<{ $status: string }>`
  width: 36px;
  height: 36px;
  min-width: 36px;
  min-height: 36px;
  border-radius: 50%;
  background: ${({ $status }) =>
    $status === 'completed' ? 'linear-gradient(135deg, #181a1b 0%, #2d2d2d 100%)' : 
     $status === 'current' ? 'linear-gradient(135deg, #888888 0%, #666666 100%)' : 
     'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)'};
  color: ${({ $status }) =>
    $status === 'current' ? '#fff' : $status === 'completed' ? '#fff' : '#b0b0b0'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.2rem;
  box-shadow: ${({ $status }) =>
    $status === 'current' ? '0 6px 16px rgba(136, 136, 136, 0.25)' : 
     $status === 'completed' ? '0 4px 12px rgba(24, 26, 27, 0.2)' : 
     '0 2px 8px rgba(0,0,0,0.06)'};
  border: 2px solid ${({ $status }) =>
    $status === 'current' ? '#888888' : $status === 'completed' ? '#181a1b' : '#e9ecef'};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  margin-right: 1rem;
  position: relative;
  overflow: visible;
  
  /* Pulse animation for current step */
  ${({ $status }) => $status === 'current' && `
    &::after {
      content: '';
      position: absolute;
      top: -4px;
      left: -4px;
      right: -4px;
      bottom: -4px;
      border: 2px solid #888888;
      border-radius: 50%;
      animation: pulse 2s ease-in-out infinite;
    }
    
    @keyframes pulse {
      0%, 100% { opacity: 0.3; transform: scale(1); }
      50% { opacity: 0; transform: scale(1.2); }
    }
  `}
  
  /* Prevent font-size inheritance for icon */
  & svg {
    width: 18px;
    height: 18px;
    min-width: 18px;
    min-height: 18px;
    max-width: 18px;
    max-height: 18px;
    font-size: 18px;
    display: block;
  }
`;

/* Coin animation component */
const Coin = styled.div<{ $animate: boolean }>`
  position: absolute;
  top: 50%;
  left: 50%;
  width: 22px;
  height: 22px;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  z-index: 2;
  background: radial-gradient(circle at 30% 30%, #ffd700 0%, #ffed4e 22%, #ffd700 45%, #b8860b 68%, #ffd700 85%, #ffed4e 100%);
  box-shadow:
    0 1px 4px rgba(255, 215, 0, 0.45),
    inset 0 1px 2px rgba(255, 255, 255, 0.35),
    inset 0 -1px 2px rgba(139, 105, 20, 0.35);
  border: 2px solid #b8860b;
  will-change: transform, opacity, filter;
  animation: ${({ $animate }) => ($animate ? 'coinFlip 1.1s ease-in-out' : 'shine 2.8s ease-in-out infinite')};

  &::before {
    content: '$';
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    font-weight: 800;
    color: #8b6914;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.25);
    font-size: 0.95rem;
  }

  @keyframes coinFlip {
    0% {
      transform: translate(-50%, -50%) rotateY(0deg) scale(0.8);
      opacity: 0;
    }
    20% {
      transform: translate(-50%, -50%) rotateY(0deg) scale(1.2);
      opacity: 1;
    }
    40% {
      transform: translate(-50%, -50%) rotateY(180deg) scale(1.1);
    }
    60% {
      transform: translate(-50%, -50%) rotateY(360deg) scale(1.2);
    }
    80% {
      transform: translate(-50%, -50%) rotateY(540deg) scale(1.1);
    }
    100% {
      transform: translate(-50%, -50%) rotateY(720deg) scale(1);
      opacity: 1;
    }
  }

  @keyframes shine {
    0%, 100% {
      filter: brightness(1) saturate(1);
      transform: translate(-50%, -50%) scale(1);
    }
    50% {
      filter: brightness(1.2) saturate(1.3);
      transform: translate(-50%, -50%) scale(1.05);
    }
  }
`;

const StepLabel = styled.div<{ $status: string }>`
  font-size: 1rem;
  font-weight: ${({ $status }) => ($status === 'current' ? '700' : '500')};
  color: ${({ $status }) => ($status === 'current' ? '#181a1b' : '#6c757d')};
  display: flex;
  align-items: center;
  gap: 0.4rem;
  line-height: 1.2;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  ${({ $status }) => $status === 'completed' && `
    color: #181a1b;
    font-weight: 600;
  `}
`;

const Connector = styled.div<{ $active: boolean }>`
  width: 3px;
  height: 36px;
  background: ${({ $active }) => ($active ? 'linear-gradient(180deg, #181a1b 0%, #444 100%)' : 'linear-gradient(180deg, #e9ecef 0%, #f1f3f4 100%)')};
  margin: 0 16px;
  align-self: center;
  border-radius: 2px;
  position: relative;
  
  ${({ $active }) => $active && `
    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(180deg, #181a1b 0%, #444 100%);
      border-radius: 2px;
      animation: flow 2s ease-in-out infinite;
    }
    
    @keyframes flow {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.7; }
    }
  `}
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
  display: flex;
  align-items: center;
  height: 18px;
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
  isPremature?: boolean;
}

export function ProgressTracker({ steps, currentStepKey, onStepClick, isSubscribed = false, isPremature = false }: ProgressTrackerProps) {
  const currentStepIndex = steps.findIndex(step => step.key === currentStepKey);
  const [animating, setAnimating] = React.useState<Set<string>>(new Set());

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

  // Trigger coin animation when step becomes completed
  React.useEffect(() => {
    steps.forEach((step, index) => {
      const status = getStatus(index);
      if (status === 'completed' && !animating.has(step.key)) {
        setAnimating(prev => new Set(prev).add(step.key));
        
        // Remove animation flag after animation completes
        setTimeout(() => {
          setAnimating(prev => {
            const newSet = new Set(prev);
            newSet.delete(step.key);
            return newSet;
          });
        }, 3000);
      }
    });
  }, [currentStepKey, steps]);

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
              $isPremature={isPremature}
              onClick={() => isClickable && onStepClick(step.key)}
              aria-current={status === 'current' ? 'step' : undefined}
              tabIndex={isClickable ? 0 : -1}
            >
              <StepCircle className="circle" $status={status}>
                {status === 'completed' ? (
                  <FaCheck color="#fff" size={18} style={{ display: 'block' }} />
                ) : (
                  index + 1
                )}
                {status === 'completed' && (
                  <Coin $animate={animating.has(step.key)} />
                )}
              </StepCircle>
              <StepLabel $status={status}>
                {step.label.replace(/^[0-9]+\.\s*/, '')}
                {/* Removed PremiumBadge and LockIcon */}
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