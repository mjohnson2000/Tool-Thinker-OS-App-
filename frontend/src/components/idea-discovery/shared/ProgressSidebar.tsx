import React from 'react';

export interface ProgressSidebarProps {
  stages: string[];
  currentStage: number;
  completedStages: string[];
  onStageClick: (stage: number) => void;
  showCompletedStagesModal: boolean;
  setShowCompletedStagesModal: (show: boolean) => void;
}

export function ProgressSidebar({
  stages,
  currentStage,
  completedStages,
  onStageClick,
  showCompletedStagesModal,
  setShowCompletedStagesModal,
}: ProgressSidebarProps) {
  return (
    <aside style={{ 
      width: 120, 
      background: '#fff', 
      borderRight: '1px solid #eee', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      paddingTop: 32, 
      height: '100vh', 
      justifyContent: 'space-between' 
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {stages.map((stage, idx) => (
          <div 
            key={stage} 
            style={{ 
              marginBottom: 32, 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              cursor: (idx <= currentStage || completedStages.includes(idx.toString())) ? 'pointer' : 'default',
              opacity: (idx <= currentStage || completedStages.includes(idx.toString())) ? 1 : 0.5,
              transition: 'all 0.2s ease'
            }}
            onClick={() => {
              if (idx <= currentStage || completedStages.includes(idx.toString())) {
                onStageClick(idx);
              }
            }}
            onMouseEnter={(e) => {
              if (idx <= currentStage || completedStages.includes(idx.toString())) {
                e.currentTarget.style.transform = 'scale(1.05)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
            title={idx <= currentStage || completedStages.includes(idx.toString()) ? `Go to ${stage}` : `${stage} (not yet available)`}
          >
            <div style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              background: (idx < currentStage || completedStages.includes(idx.toString()))
                ? '#232323'
                : idx === currentStage
                  ? 'linear-gradient(135deg, #5ad6ff 0%, #5a6ee6 100%)'
                  : '#e5e5e5',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: 16,
              marginBottom: 4,
              boxShadow: idx === currentStage ? '0 2px 8px #5ad6ff44' : undefined,
              transition: 'all 0.2s ease'
            }}>{(idx < currentStage || completedStages.includes(idx.toString())) ? '✓' : idx + 1}</div>
            <span style={{ 
              fontSize: 12, 
              color: idx === currentStage ? '#181a1b' : (idx < currentStage || completedStages.includes(idx.toString())) ? '#666' : '#888', 
              textAlign: 'center', 
              maxWidth: 80,
              fontWeight: idx === currentStage ? 600 : 400
            }}>{stage}</span>
          </div>
        ))}
      </div>
      
      {/* Completed Stages Icon */}
      {completedStages.length > 0 && (
        <div 
          style={{
            marginBottom: 32,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onClick={() => setShowCompletedStagesModal(true)}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
          title="View completed stages"
        >
          <div style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            background: '#10b981',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: 16,
            marginBottom: 4,
            boxShadow: '0 2px 8px #10b98144',
            transition: 'all 0.2s ease'
          }}>📊</div>
          <span style={{ 
            fontSize: 10, 
            color: '#10b981', 
            textAlign: 'center', 
            maxWidth: 80,
            fontWeight: 600
          }}>Progress</span>
        </div>
      )}
    </aside>
  );
} 