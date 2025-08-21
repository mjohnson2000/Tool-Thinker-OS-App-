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
  
  @media (max-width: 1024px) {
    padding: 1.5rem 0.75rem;
    min-width: 200px;
    max-width: 220px;
    border-radius: 16px;
  }
  
  @media (max-width: 768px) {
    display: none;
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
  
  @media (max-width: 1024px) {
    margin-bottom: ${({ $isPremature }) => $isPremature ? '0.75rem' : '1rem'};
    padding: 0.6rem;
  }
  
  @media (max-width: 768px) {
    margin-bottom: ${({ $isPremature }) => $isPremature ? '0.5rem' : '0.75rem'};
    padding: 0.5rem;
  }
  
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
  
  @media (max-width: 1024px) {
    width: 28px;
    height: 28px;
    min-width: 28px;
    min-height: 28px;
    font-size: 1rem;
    margin-right: 0.75rem;
  }
  
  @media (max-width: 768px) {
    width: 24px;
    height: 24px;
    min-width: 24px;
    min-height: 24px;
    font-size: 0.9rem;
    margin-right: 0.5rem;
  }
  
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
    
    @media (max-width: 1024px) {
      width: 14px;
      height: 14px;
      min-width: 14px;
      min-height: 14px;
      max-width: 14px;
      max-height: 14px;
      font-size: 14px;
    }
    
    @media (max-width: 768px) {
      width: 12px;
      height: 12px;
      min-width: 12px;
      min-height: 12px;
      max-width: 12px;
      max-height: 12px;
      font-size: 12px;
    }
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
  font-family: 'Audiowide', 'Courier New', monospace;
  font-size: 1rem;
  font-weight: ${({ $status }) => ($status === 'current' ? '400' : '400')};
  color: ${({ $status }) => ($status === 'current' ? '#181a1b' : '#6c757d')};
  display: flex;
  align-items: center;
  gap: 0.4rem;
  line-height: 1.2;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-display: swap;
  
  @media (max-width: 1024px) {
    font-size: 0.9rem;
    gap: 0.3rem;
  }
  
  @media (max-width: 768px) {
    font-size: 0.8rem;
    gap: 0.2rem;
  }
  
  ${({ $status }) => $status === 'completed' && `
    color: #181a1b;
  `}
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
  const [forceUpdate, setForceUpdate] = React.useState(0);

  // Force re-render when steps or currentStepKey changes
  React.useEffect(() => {
    setForceUpdate(prev => prev + 1);
  }, [steps, currentStepKey]);

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
    <>
      {/* Desktop/Tablet Sidebar */}
      <TrackerContainer key={`${forceUpdate}-${currentStepKey}`}>
        {steps.map((step, index) => {
          const status = getStatus(index);
          const isClickable = status === 'completed' && canAccessStep(step);
          const isPremium = step.isPremium && !isSubscribed;
          return (
            <React.Fragment key={step.key}>
              <StepItem 
                key={step.key}
                $status={status}
                $isClickable={isClickable}
                onClick={() => isClickable && onStepClick(step.key)}
              >
                <StepCircle $status={status}>
                  {status === 'completed' ? (
                    <Coin $animate={animating.has(step.key)} />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </StepCircle>
                <StepLabel $status={status}>
                  {step.label.replace(/^[0-9]+\.\s*/, '')}
                  {/* Removed PremiumBadge and LockIcon */}
                </StepLabel>
              </StepItem>
            </React.Fragment>
          );
        })}
      </TrackerContainer>
    </>
  );
}

// Separate Mobile Tracker Component
const MobileTrackerContainer = styled.div<{ $isCollapsed: boolean }>`
  display: none;
  @media (max-width: 768px) {
    display: ${({ $isCollapsed }) => $isCollapsed ? 'none' : 'block'};
    position: fixed;
    top: calc(var(--topbar-height, 72px) + 2rem);
    left: 1rem;
    right: 1rem;
    z-index: 1001;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    border-radius: 12px;
    padding: 0.6rem 1rem;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
    border: 1px solid rgba(255, 255, 255, 0.8);
    overflow: hidden;
    scrollbar-width: none;
    -ms-overflow-style: none;
    margin-bottom: 1rem;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    max-height: 120px;
    
    &::-webkit-scrollbar { 
      display: none; 
    }
  }
`;

const MobileTrackerToggle = styled.button<{ $isCollapsed: boolean }>`
  display: none;
  @media (max-width: 768px) {
    display: flex;
    align-items: center;
    justify-content: center;
    position: fixed;
    top: calc(var(--topbar-height, 72px) + 2rem);
    left: 0.5rem;
    z-index: 1002;
    width: 40px;
    height: 40px;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.8);
    border-radius: 50%;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
    cursor: pointer;
    color: #181a1b;
    font-family: 'Audiowide', 'Courier New', monospace;
    font-size: 0.8rem;
    font-weight: 400;
    font-display: swap;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    
    &:hover {
      background: rgba(255, 255, 255, 1);
      transform: scale(1.05);
    }
    
    &:focus {
      outline: none;
    }
  }
`;

const MobileTrackerToggleIcon = styled.div<{ $isCollapsed: boolean }>`
  font-size: 1rem;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  transform: rotate(${({ $isCollapsed }) => $isCollapsed ? '0deg' : '180deg'});
`;

const MobileTrackerScroll = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: max-content;
  padding: 0.2rem 0;
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-width: none;
  -ms-overflow-style: none;
  
  &::-webkit-scrollbar { 
    display: none; 
  }
`;

const MobileStepItem = styled.div<{ $isCurrent: boolean; $isCompleted: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.3rem 0.6rem;
  border-radius: 8px;
  background: ${({ $isCurrent, $isCompleted }) => 
    $isCurrent ? 'linear-gradient(135deg, #181a1b 0%, #2d2d2d 100%)' :
    $isCompleted ? 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)' :
    'transparent'
  };
  color: ${({ $isCurrent, $isCompleted }) => 
    $isCurrent ? '#ffffff' :
    $isCompleted ? '#181a1b' :
    '#6c757d'
  };
  transition: all 0.2s ease;
  cursor: pointer;
  white-space: nowrap;
  
  &:hover {
    background: ${({ $isCurrent }) => 
      $isCurrent ? 'linear-gradient(135deg, #000 0%, #181a1b 100%)' :
      'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)'
    };
    transform: translateY(-1px);
  }
`;

const MobileStepCircle = styled.div<{ $isCurrent: boolean; $isCompleted: boolean }>`
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: ${({ $isCurrent, $isCompleted }) => 
    $isCurrent ? '#ffffff' :
    $isCompleted ? 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)' :
    '#f8f9fa'
  };
  border: ${({ $isCurrent, $isCompleted }) => 
    $isCurrent ? 'none' :
    $isCompleted ? '1px solid #ffd700' :
    '1px solid #e9ecef'
  };
  color: ${({ $isCurrent, $isCompleted }) => 
    $isCurrent ? '#181a1b' :
    $isCompleted ? '#8b6914' :
    '#6c757d'
  };
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: 700;
  flex-shrink: 0;
`;

const MobileStepLabel = styled.span`
  font-family: 'Audiowide', 'Courier New', monospace;
  font-size: 0.75rem;
  font-weight: 400;
  font-display: swap;
`;

const MobileStepDivider = styled.div`
  width: 1px;
  height: 16px;
  background: #e9ecef;
  flex-shrink: 0;
`;

export function MobileTracker({ steps, currentStepKey, onStepClick }: { 
  steps: { key: string; label: string; isPremium?: boolean }[]; 
  currentStepKey: string;
  onStepClick?: (stepKey: string) => void;
}) {
  const currentStepIndex = steps.findIndex(step => step.key === currentStepKey);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [isCollapsed, setIsCollapsed] = React.useState(true); // Start collapsed
  
  // Auto-scroll to current step on mount
  React.useEffect(() => {
    if (containerRef.current && !isCollapsed) {
      const currentStepElement = containerRef.current.children[currentStepIndex] as HTMLElement;
      if (currentStepElement) {
        currentStepElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'nearest', 
          inline: 'center' 
        });
      }
    }
  }, [currentStepIndex, isCollapsed]);
  
  const handleStepClick = (stepKey: string, stepIndex: number) => {
    if (onStepClick && stepIndex <= currentStepIndex) {
      onStepClick(stepKey);
    }
  };

  const handleToggle = () => {
    setIsCollapsed(!isCollapsed);
  };

  const currentStep = steps[currentStepIndex];
  const completedSteps = steps.filter((_, index) => index < currentStepIndex).length;
  
  return (
    <>
      <MobileTrackerToggle onClick={handleToggle} $isCollapsed={isCollapsed}>
        <MobileTrackerToggleIcon $isCollapsed={isCollapsed}>
          {isCollapsed ? '▶' : '◀'}
        </MobileTrackerToggleIcon>
      </MobileTrackerToggle>
      
      {!isCollapsed && (
        <MobileTrackerContainer $isCollapsed={isCollapsed}>
          <MobileTrackerScroll ref={containerRef}>
            {steps.map((step, index) => {
              const isCurrent = step.key === currentStepKey;
              const isCompleted = index < currentStepIndex;
              const canClick = index <= currentStepIndex;
              
              return (
                <React.Fragment key={step.key}>
                  <MobileStepItem 
                    $isCurrent={isCurrent} 
                    $isCompleted={isCompleted}
                    onClick={() => handleStepClick(step.key, index)}
                    style={{ cursor: canClick ? 'pointer' : 'default' }}
                  >
                    <MobileStepCircle $isCurrent={isCurrent} $isCompleted={isCompleted}>
                      {isCompleted ? '$' : index + 1}
                    </MobileStepCircle>
                    <MobileStepLabel>
                      {step.label.replace(/^[0-9]+\.\s*/, '')}
                    </MobileStepLabel>
                  </MobileStepItem>
                  {index < steps.length - 1 && <MobileStepDivider />}
                </React.Fragment>
              );
            })}
          </MobileTrackerScroll>
        </MobileTrackerContainer>
      )}
    </>
  );
}