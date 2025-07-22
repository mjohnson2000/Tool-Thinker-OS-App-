import React from 'react';

export interface BusinessPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  improvedSections: any;
  getCurrentSectionContent: (sectionKey: string) => string;
}

export function BusinessPlanModal({
  isOpen,
  onClose,
  improvedSections,
  getCurrentSectionContent,
}: BusinessPlanModalProps) {
  if (!isOpen) return null;

  const formatContent = (content: string) => {
    if (!content) return 'No content available';
    
    // Remove "Variation 1:" prefix
    let formatted = content.replace(/^Variation 1:\s*/i, '');
    
    // Remove unwanted dots at the beginning
    formatted = formatted.replace(/^\.\s*/, '');
    
    // Remove dashes from listed items
    formatted = formatted.replace(/^\s*[-•]\s*/gm, '• ');
    
    return formatted;
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
        width: '1000px',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
        }}>
          <h2 style={{ margin: 0, color: '#1f2937' }}>Full Business Plan</h2>
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
            const formattedCurrentContent = formatContent(currentContent);
            const formattedOriginalContent = formatContent(originalContent as string);
            
            console.log(`Modal section ${sectionKey}:`, { 
              currentContent: formattedCurrentContent, 
              originalContent: formattedOriginalContent 
            });
            
            return (
              <div key={sectionKey} style={{
                marginBottom: '2rem',
                padding: '1.5rem',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                background: '#fafafa',
              }}>
                <h3 style={{
                  marginBottom: '1rem',
                  color: '#374151',
                  textTransform: 'capitalize',
                  fontSize: '18px',
                  fontWeight: 600,
                }}>
                  {sectionKey.replace(/([A-Z])/g, ' $1').trim()}
                </h3>
                
                <div style={{ marginBottom: '1.5rem' }}>
                  <h4 style={{ 
                    marginBottom: '0.75rem', 
                    color: '#6b7280', 
                    fontSize: '14px',
                    fontWeight: 600,
                  }}>
                    Original Content:
                  </h4>
                  <div style={{
                    background: '#f9fafb',
                    padding: '1rem',
                    borderRadius: '6px',
                    fontSize: '14px',
                    color: '#374151',
                    whiteSpace: 'pre-wrap',
                    lineHeight: 1.6,
                    border: '1px solid #e5e7eb',
                  }}>
                    {formattedCurrentContent}
                  </div>
                </div>

                <div>
                  <h4 style={{ 
                    marginBottom: '0.75rem', 
                    color: '#059669', 
                    fontSize: '14px',
                    fontWeight: 600,
                  }}>
                    AI Improved Version:
                  </h4>
                  <div style={{
                    background: '#f0fdf4',
                    padding: '1rem',
                    borderRadius: '6px',
                    fontSize: '14px',
                    color: '#166534',
                    whiteSpace: 'pre-wrap',
                    lineHeight: 1.6,
                    border: '1px solid #bbf7d0',
                  }}>
                    {formattedOriginalContent}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '0.75rem 1.5rem',
              border: 'none',
              borderRadius: '6px',
              background: '#6b7280',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 600,
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
} 