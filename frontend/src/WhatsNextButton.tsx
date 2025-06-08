import React, { useState } from 'react';

interface WhatsNextButtonProps {
  currentStage: 'discovery' | 'idea' | 'validation' | 'mvp' | 'launch';
  userProgress: Record<string, { completed: boolean }>;
  onAdvanceStage: (nextStage: 'discovery' | 'idea' | 'validation' | 'mvp' | 'launch') => void;
  onSuggestTask: (stage: string) => void;
}

const stageOrder = ['discovery', 'idea', 'validation', 'mvp', 'launch'] as const;
const stageLabels = {
  discovery: 'Discovery',
  idea: 'Idea',
  validation: 'Validation',
  mvp: 'MVP',
  launch: 'Launch',
};

export function WhatsNextButton({ currentStage, userProgress, onAdvanceStage, onSuggestTask }: WhatsNextButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const currentIdx = stageOrder.indexOf(currentStage);

  // Find the next incomplete stage
  let nextStage: typeof stageOrder[number] | null = null;
  for (let i = currentIdx + 1; i < stageOrder.length; i++) {
    if (!userProgress[stageOrder[i]]?.completed) {
      nextStage = stageOrder[i];
      break;
    }
  }

  let suggestion = '';
  if (userProgress[currentStage]?.completed && nextStage) {
    suggestion = `Advance to ${stageLabels[nextStage]}`;
  } else if (!userProgress[currentStage]?.completed) {
    suggestion = `Complete a key task in ${stageLabels[currentStage]}`;
  } else {
    suggestion = 'You are ready to launch!';
  }

  function handleClick() {
    if (userProgress[currentStage]?.completed && nextStage) {
      onAdvanceStage(nextStage);
    } else if (!userProgress[currentStage]?.completed) {
      setShowModal(true);
    } else {
      setShowModal(true);
    }
  }

  return (
    <>
      <button
        className="whats-next-btn"
        aria-label="What's Next?"
        onClick={handleClick}
      >
        <span className="wnb-icon">✨</span>
        <span className="wnb-label">What's Next?</span>
      </button>
      {showModal && (
        <div className="wnb-modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="wnb-modal" onClick={e => e.stopPropagation()}>
            <h3>What's Next?</h3>
            <p>{suggestion}</p>
            {!userProgress[currentStage]?.completed && (
              <button className="wnb-action" onClick={() => { onSuggestTask(currentStage); setShowModal(false); }}>
                Show me a key task
              </button>
            )}
            <button className="wnb-close" onClick={() => setShowModal(false)}>Close</button>
          </div>
        </div>
      )}
    </>
  );
} 