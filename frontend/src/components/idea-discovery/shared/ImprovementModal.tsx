import React, { useState } from 'react';

export interface ImprovementModalProps {
  isOpen: boolean;
  onClose: () => void;
  improvedSections: any;
  editableSections: any;
  onSave: (sections: any) => void;
  getCurrentSectionContent: (sectionKey: string) => string;
}

export function ImprovementModal({
  isOpen,
  onClose,
  improvedSections,
  editableSections,
  onSave,
  getCurrentSectionContent,
}: ImprovementModalProps) {
  const [localEditableSections, setLocalEditableSections] = useState(editableSections);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(localEditableSections);
    onClose();
  };

  const handleCancel = () => {
    setLocalEditableSections(editableSections);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    }}>
      <div style={{
        background: '#fff',
        borderRadius: '12px',
        padding: '2rem',
        maxWidth: '90vw',
        maxHeight: '90vh',
        overflow: 'auto',
        width: '800px',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
        }}>
          <h2 style={{ margin: 0, color: '#1f2937' }}>AI Improvements</h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#6b7280',
            }}
          >
            ×
          </button>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          {Object.entries(improvedSections).map(([sectionKey, originalContent]) => {
            const currentContent = getCurrentSectionContent(sectionKey);
            const editableContent = localEditableSections[sectionKey as keyof typeof localEditableSections];
            
            console.log(`Modal section ${sectionKey}:`, { currentContent, editableContent, originalContent });
            
            return (
              <div key={sectionKey} style={{
                marginBottom: '1.5rem',
                padding: '1rem',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
              }}>
                <h3 style={{
                  marginBottom: '1rem',
                  color: '#374151',
                  textTransform: 'capitalize',
                }}>
                  {sectionKey.replace(/([A-Z])/g, ' $1').trim()}
                </h3>
                
                <div style={{ marginBottom: '1rem' }}>
                  <h4 style={{ marginBottom: '0.5rem', color: '#6b7280', fontSize: '14px' }}>
                    Original Content:
                  </h4>
                  <div style={{
                    background: '#f9fafb',
                    padding: '0.75rem',
                    borderRadius: '6px',
                    fontSize: '14px',
                    color: '#6b7280',
                    whiteSpace: 'pre-wrap',
                  }}>
                    {currentContent || 'No content available'}
                  </div>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <h4 style={{ marginBottom: '0.5rem', color: '#059669', fontSize: '14px' }}>
                    AI Improved Version:
                  </h4>
                  <textarea
                    value={editableContent || ''}
                    onChange={(e) => setLocalEditableSections((prev: any) => ({
                      ...prev,
                      [sectionKey]: e.target.value
                    }))}
                    style={{
                      width: '100%',
                      minHeight: '100px',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontFamily: 'inherit',
                      resize: 'vertical',
                    }}
                    placeholder="AI improved content will appear here..."
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div style={{
          display: 'flex',
          gap: '1rem',
          justifyContent: 'flex-end',
        }}>
          <button
            onClick={handleCancel}
            style={{
              padding: '0.75rem 1.5rem',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              background: '#fff',
              color: '#374151',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            style={{
              padding: '0.75rem 1.5rem',
              border: 'none',
              borderRadius: '6px',
              background: '#10b981',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 600,
            }}
          >
            Save Improvements
          </button>
        </div>
      </div>
    </div>
  );
} 