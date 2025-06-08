import React from 'react';

interface SmartJourneyMapProps {
  currentStage: 'discovery' | 'idea' | 'validation' | 'mvp' | 'launch';
  userProgress: Record<string, { completed: boolean }>;
  onStageSelect: (stage: 'discovery' | 'idea' | 'validation' | 'mvp' | 'launch') => void;
}

const stages = [
  { key: 'discovery', label: 'Discovery', icon: '🔍' },
  { key: 'idea', label: 'Jobs', icon: '💡' },
  { key: 'validation', label: 'Validation', icon: '✅' },
  { key: 'mvp', label: 'MVP', icon: '🛠️' },
  { key: 'launch', label: 'Launch', icon: '🚀' },
] as const;

export function SmartJourneyMap({ currentStage, userProgress, onStageSelect }: SmartJourneyMapProps) {
  function getStatus(stage: string, idx: number) {
    if (userProgress[stage]?.completed) return 'completed';
    if (idx === 0 || userProgress[stages[idx - 1].key]?.completed) return 'ready';
    return 'locked';
  }

  return (
    <nav className="smart-journey-map" aria-label="Startup Journey">
      <ul>
        {stages.map((stage, idx) => {
          const status = getStatus(stage.key, idx);
          const isActive = currentStage === stage.key;
          return (
            <li key={stage.key} className={`journey-step ${isActive ? 'active' : ''} ${status}`}
                aria-current={isActive ? 'step' : undefined}>
              <button
                className="journey-btn"
                onClick={() => status !== 'locked' && onStageSelect(stage.key)}
                disabled={status === 'locked'}
                aria-label={stage.label}
              >
                <span className="step-icon">{stage.icon}</span>
                <span className="step-label">{stage.label}</span>
                <span className="step-status">
                  {status === 'completed' && '✔️'}
                  {status === 'ready' && '🟢'}
                  {status === 'locked' && '🔒'}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
} 