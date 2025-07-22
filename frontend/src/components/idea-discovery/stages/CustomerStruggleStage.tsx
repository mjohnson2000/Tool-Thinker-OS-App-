import React, { useState, useEffect } from 'react';
import { usePersonas } from '../hooks/usePersonas';
import { useValidationScore } from '../hooks/useValidationScore';

export interface CustomerStruggleStageProps {
  businessIdea: string;
  customerDescription: string;
  planData: any;
  onStageComplete: (data: any) => void;
  onStageUpdate: (data: any) => void;
}

export function CustomerStruggleStage({
  businessIdea,
  customerDescription,
  planData,
  onStageComplete,
  onStageUpdate,
}: CustomerStruggleStageProps) {
  const { personas, setPersonas, collectiveSummary, setCollectiveSummary } = usePersonas();
  const { validationScore, setValidationScore } = useValidationScore();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [customerStruggles, setCustomerStruggles] = useState<any[]>([]);
  const [selectedStruggles, setSelectedStruggles] = useState<string[]>([]);
  const [struggleAnalysis, setStruggleAnalysis] = useState<any>(null);
  const [hasFetchedValidation, setHasFetchedValidation] = useState(false);

  // Fetch existing data on mount
  useEffect(() => {
    fetchCustomerStruggles();
    // Only fetch validation data if we don't already have it and haven't fetched it yet
    if (!validationScore && !hasFetchedValidation) {
      fetchValidationData();
    }
  }, [validationScore, hasFetchedValidation]);

  const fetchCustomerStruggles = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.VITE_API_URL || 'http://localhost:5001/api'}/automated-discovery/customer-struggles`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setCustomerStruggles(data.struggles || []);
        setStruggleAnalysis(data.analysis);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch customer struggles');
    } finally {
      setLoading(false);
    }
  };

  const fetchValidationData = async () => {
    // Prevent multiple simultaneous calls
    if (hasFetchedValidation) return;
    
    try {
      setHasFetchedValidation(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.VITE_API_URL || 'http://localhost:5001/api'}/automated-discovery/validation-score`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setValidationScore(data.validationScore);
      }
    } catch (err: any) {
      console.error('Failed to fetch validation data:', err);
      setHasFetchedValidation(false); // Reset on error to allow retry
    }
  };

  const handleGenerateStruggles = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.VITE_API_URL || 'http://localhost:5001/api'}/automated-discovery/customer-struggles`, {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessIdea,
          customerDescription,
          personas: personas.map(({ id, name, summary }) => ({
            id: typeof id === 'string' ? id : String(id),
            name,
            summary
          })),
          stage: 'Customer Struggle',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        setCustomerStruggles(data.struggles || []);
        setStruggleAnalysis(data.analysis);
        setCollectiveSummary(data.summary);
        setValidationScore(data.validationScore);
        setHasFetchedValidation(true); // Mark as fetched since we got new validation data
        
        onStageComplete({
          customerStruggles: data.struggles,
          analysis: data.analysis,
          summary: data.summary,
          validationScore: data.validationScore,
        });
      } else {
        throw new Error('Failed to generate customer struggles');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to generate customer struggles');
    } finally {
      setLoading(false);
    }
  };

  const handleStruggleToggle = (struggleId: string) => {
    setSelectedStruggles(prev => 
      prev.includes(struggleId) 
        ? prev.filter(id => id !== struggleId)
        : [...prev, struggleId]
    );
  };

  const handleSaveSelectedStruggles = () => {
    onStageUpdate({ selectedStruggles });
    setLogs(prev => [...prev, `Selected ${selectedStruggles.length} struggles for analysis`]);
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '2rem', color: '#1f2937' }}>
        Customer Struggle Stage
      </h2>
      
      {/* Business Idea Display */}
      <div style={{ 
        background: '#f9fafb', 
        padding: '1.5rem', 
        borderRadius: '8px', 
        marginBottom: '2rem' 
      }}>
        <h3 style={{ marginBottom: '1rem', color: '#374151' }}>Business Idea</h3>
        <p style={{ color: '#6b7280', lineHeight: 1.6 }}>{businessIdea}</p>
      </div>

      {/* Customer Description */}
      <div style={{ 
        background: '#f9fafb', 
        padding: '1.5rem', 
        borderRadius: '8px', 
        marginBottom: '2rem' 
      }}>
        <h3 style={{ marginBottom: '1rem', color: '#374151' }}>Customer Context</h3>
        <p style={{ color: '#6b7280', lineHeight: 1.6 }}>{customerDescription}</p>
      </div>

      {/* Generate Struggles Button */}
      <button
        onClick={handleGenerateStruggles}
        disabled={loading}
        style={{
          background: loading ? '#9ca3af' : '#10b981',
          color: '#fff',
          padding: '12px 24px',
          border: 'none',
          borderRadius: '6px',
          fontSize: '16px',
          fontWeight: 600,
          cursor: loading ? 'not-allowed' : 'pointer',
          marginBottom: '2rem',
        }}
      >
        {loading ? 'Analyzing Customer Struggles...' : 'Analyze Customer Struggles'}
      </button>

      {/* Error Display */}
      {error && (
        <div style={{ 
          background: '#fef2f2', 
          border: '1px solid #fecaca', 
          color: '#dc2626', 
          padding: '1rem', 
          borderRadius: '6px', 
          marginBottom: '2rem' 
        }}>
          {error}
        </div>
      )}

      {/* Validation Score Display */}
      {validationScore && (
        <div style={{ 
          background: '#f0fdf4', 
          border: '1px solid #bbf7d0', 
          padding: '1.5rem', 
          borderRadius: '8px', 
          marginBottom: '2rem' 
        }}>
          <h3 style={{ marginBottom: '1rem', color: '#166534' }}>Struggle Analysis Validation</h3>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#166534' }}>
            {validationScore.score}/10
          </div>
          <p style={{ color: '#166534', marginTop: '0.5rem' }}>
            Confidence: {validationScore.confidence}
          </p>
        </div>
      )}

      {/* Customer Struggles List */}
      {customerStruggles.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1rem', color: '#374151' }}>Identified Customer Struggles</h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', 
            gap: '1rem' 
          }}>
            {customerStruggles.map((struggle, index) => (
              <div 
                key={index}
                onClick={() => handleStruggleToggle(struggle.id)}
                style={{ 
                  background: selectedStruggles.includes(struggle.id) ? '#f0fdf4' : '#fff', 
                  border: selectedStruggles.includes(struggle.id) ? '2px solid #10b981' : '1px solid #e5e7eb', 
                  borderRadius: '8px', 
                  padding: '1.5rem', 
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <input
                    type="checkbox"
                    checked={selectedStruggles.includes(struggle.id)}
                    onChange={() => handleStruggleToggle(struggle.id)}
                    style={{ marginRight: '0.5rem' }}
                  />
                  <h4 style={{ margin: 0, color: '#374151' }}>{struggle.title}</h4>
                </div>
                
                <p style={{ color: '#6b7280', marginBottom: '1rem', fontSize: '14px' }}>
                  {struggle.description}
                </p>
                
                {struggle.impact && (
                  <div style={{ marginBottom: '0.5rem' }}>
                    <span style={{ 
                      fontSize: '12px', 
                      color: '#059669', 
                      fontWeight: 600,
                      background: '#d1fae5',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                    }}>
                      Impact: {struggle.impact}
                    </span>
                  </div>
                )}
                
                {struggle.frequency && (
                  <div style={{ marginBottom: '0.5rem' }}>
                    <span style={{ 
                      fontSize: '12px', 
                      color: '#7c3aed', 
                      fontWeight: 600,
                      background: '#ede9fe',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                    }}>
                      Frequency: {struggle.frequency}
                    </span>
                  </div>
                )}
                
                {struggle.examples && struggle.examples.length > 0 && (
                  <div>
                    <h5 style={{ marginBottom: '0.5rem', color: '#374151', fontSize: '14px' }}>Examples:</h5>
                    <ul style={{ color: '#6b7280', fontSize: '12px', paddingLeft: '1rem' }}>
                      {struggle.examples.map((example: string, idx: number) => (
                        <li key={idx}>{example}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {/* Save Selection Button */}
          <button
            onClick={handleSaveSelectedStruggles}
            disabled={selectedStruggles.length === 0}
            style={{
              background: selectedStruggles.length === 0 ? '#9ca3af' : '#10b981',
              color: '#fff',
              padding: '0.75rem 1.5rem',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: selectedStruggles.length === 0 ? 'not-allowed' : 'pointer',
              marginTop: '1rem',
            }}
          >
            Save Selected Struggles ({selectedStruggles.length})
          </button>
        </div>
      )}

      {/* Struggle Analysis */}
      {struggleAnalysis && (
        <div style={{ 
          background: '#fef3c7', 
          border: '1px solid #fde68a', 
          padding: '1.5rem', 
          borderRadius: '8px', 
          marginBottom: '2rem' 
        }}>
          <h3 style={{ marginBottom: '1rem', color: '#92400e' }}>Struggle Analysis</h3>
          
          {struggleAnalysis.patterns && (
            <div style={{ marginBottom: '1rem' }}>
              <h4 style={{ marginBottom: '0.5rem', color: '#92400e', fontSize: '16px' }}>Common Patterns:</h4>
              <ul style={{ color: '#92400e', paddingLeft: '1.5rem' }}>
                {struggleAnalysis.patterns.map((pattern: string, idx: number) => (
                  <li key={idx} style={{ marginBottom: '0.25rem' }}>{pattern}</li>
                ))}
              </ul>
            </div>
          )}
          
          {struggleAnalysis.priorities && (
            <div style={{ marginBottom: '1rem' }}>
              <h4 style={{ marginBottom: '0.5rem', color: '#92400e', fontSize: '16px' }}>Priority Struggles:</h4>
              <ul style={{ color: '#92400e', paddingLeft: '1.5rem' }}>
                {struggleAnalysis.priorities.map((priority: string, idx: number) => (
                  <li key={idx} style={{ marginBottom: '0.25rem' }}>{priority}</li>
                ))}
              </ul>
            </div>
          )}
          
          {struggleAnalysis.insights && (
            <div>
              <h4 style={{ marginBottom: '0.5rem', color: '#92400e', fontSize: '16px' }}>Key Insights:</h4>
              <p style={{ color: '#92400e', lineHeight: 1.6 }}>{struggleAnalysis.insights}</p>
            </div>
          )}
        </div>
      )}

      {/* Collective Summary */}
      {collectiveSummary && (
        <div style={{ 
          background: '#f0f9ff', 
          border: '1px solid #bae6fd', 
          padding: '1.5rem', 
          borderRadius: '8px', 
          marginBottom: '2rem' 
        }}>
          <h3 style={{ marginBottom: '1rem', color: '#0369a1' }}>Struggle Summary</h3>
          <p style={{ color: '#0369a1', lineHeight: 1.6 }}>{collectiveSummary}</p>
        </div>
      )}

      {/* Logs */}
      {logs.length > 0 && (
        <div style={{ 
          background: '#f3f4f6', 
          padding: '1rem', 
          borderRadius: '6px', 
          fontSize: '14px' 
        }}>
          <h4 style={{ marginBottom: '0.5rem' }}>Activity Log:</h4>
          {logs.map((log, index) => (
            <div key={index} style={{ color: '#6b7280', marginBottom: '0.25rem' }}>
              {log}
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 