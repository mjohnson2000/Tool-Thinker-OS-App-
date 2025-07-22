import React, { useState, useEffect } from 'react';
import { usePersonas } from '../hooks/usePersonas';
import { useValidationScore } from '../hooks/useValidationScore';

export interface ProblemDiscoveryStageProps {
  businessIdea: string;
  customerDescription: string;
  planData: any;
  businessPlanId: string;
  onStageComplete: (data: any) => void;
  onStageUpdate: (data: any) => void;
}

export function ProblemDiscoveryStage({
  businessIdea,
  customerDescription,
  planData,
  businessPlanId,
  onStageComplete,
  onStageUpdate,
}: ProblemDiscoveryStageProps) {
  const { personas, setPersonas, collectiveSummary, setCollectiveSummary } = usePersonas();
  const { validationScore, setValidationScore } = useValidationScore();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [hasFetchedValidation, setHasFetchedValidation] = useState(false);

  // Fetch personas and validation data on mount
  useEffect(() => {
    fetchPersonas();
    // Only fetch validation data if we don't already have it and haven't fetched it yet
    if (!validationScore && !hasFetchedValidation) {
      fetchValidationData();
    }
  }, [validationScore, hasFetchedValidation]);

  const fetchPersonas = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.VITE_API_URL || 'http://localhost:5001/api'}/automated-discovery/personas`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setPersonas(data.personas || []);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch personas');
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

  const handleGenerateFeedback = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.VITE_API_URL || 'http://localhost:5001/api'}/automated-discovery/problem-discovery`, {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personas: personas.map(({ id, name, summary }) => ({
            id: typeof id === 'string' ? id : String(id),
            name,
            summary
          })),
          stage: 'Problem Discovery',
          businessIdea,
          customerDescription,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        setCollectiveSummary(data.summary);
        setValidationScore(data.validationScore);
        setHasFetchedValidation(true); // Mark as fetched since we got new validation data
        
        // Save problem discovery data to the business plan
        await saveProblemDiscoveryData(data);
        
        onStageComplete({
          problem: data.problem,
          analysis: data.analysis,
          summary: data.summary,
          validationScore: data.validationScore,
        });
      } else {
        throw new Error('Failed to generate feedback');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to generate feedback');
    } finally {
      setLoading(false);
    }
  };

  // Function to save problem discovery data to the business plan
  const saveProblemDiscoveryData = async (data: any) => {
    try {
      const token = localStorage.getItem('token');
      if (!businessPlanId) {
        console.warn('No business plan ID found, skipping save');
        return;
      }

      // Prepare problem discovery sections to save
      const problemDiscoverySections = {
        problemDiscovery: JSON.stringify(data.problem || {}),
        problemDiscoveryAnalysis: data.analysis?.summary || '',
        problemStatement: data.problem?.statement || '',
        problemScope: data.problem?.scope || '',
        problemUrgency: data.problem?.urgency || '',
        problemImpact: data.problem?.impact || '',
        problemEvidence: data.problem?.evidence || '',
        rootCauses: data.problem?.rootCauses ? JSON.stringify(data.problem.rootCauses) : '',
        customerInsights: data.problem?.customerInsights ? JSON.stringify(data.problem.customerInsights) : '',
        problemValidation: data.problem?.validation || ''
      };

      const saveResponse = await fetch(`${process.env.VITE_API_URL || 'http://localhost:5001/api'}/business-plan/${businessPlanId}`, {
        method: 'PUT',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sections: problemDiscoverySections
        }),
      });

      if (saveResponse.ok) {
        console.log('Problem discovery data saved successfully');
        setLogs(prev => [...prev, 'Problem discovery data saved successfully']);
      } else {
        console.error('Failed to save problem discovery data');
      }
    } catch (error) {
      console.error('Error saving problem discovery data:', error);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '2rem', color: '#1f2937' }}>
        Problem Discovery Stage
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
        <h3 style={{ marginBottom: '1rem', color: '#374151' }}>Customer Description</h3>
        <p style={{ color: '#6b7280', lineHeight: 1.6 }}>{customerDescription}</p>
      </div>

      {/* Generate Feedback Button */}
      <button
        onClick={handleGenerateFeedback}
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
        {loading ? 'Generating Feedback...' : 'Generate Customer Feedback'}
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
          <h3 style={{ marginBottom: '1rem', color: '#166534' }}>Validation Score</h3>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#166534' }}>
            {validationScore.score}/10
          </div>
          <p style={{ color: '#166534', marginTop: '0.5rem' }}>
            Confidence: {validationScore.confidence}
          </p>
        </div>
      )}

      {/* Collective Summary */}
      {collectiveSummary && (
        <div style={{ 
          background: '#fef3c7', 
          border: '1px solid #fde68a', 
          padding: '1.5rem', 
          borderRadius: '8px', 
          marginBottom: '2rem' 
        }}>
          <h3 style={{ marginBottom: '1rem', color: '#92400e' }}>Customer Feedback Summary</h3>
          <p style={{ color: '#92400e', lineHeight: 1.6 }}>{collectiveSummary}</p>
        </div>
      )}

      {/* Personas List */}
      {personas.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1rem', color: '#374151' }}>Customer Personas</h3>
          {personas.map((persona) => (
            <div key={persona.id} style={{ 
              background: '#fff', 
              border: '1px solid #e5e7eb', 
              borderRadius: '8px', 
              padding: '1.5rem', 
              marginBottom: '1rem' 
            }}>
              <h4 style={{ marginBottom: '0.5rem', color: '#374151' }}>{persona.name}</h4>
              <p style={{ color: '#6b7280', marginBottom: '1rem' }}>{persona.summary}</p>
              
              {persona.feedback && persona.feedback.length > 0 && (
                <div>
                  <h5 style={{ marginBottom: '0.5rem', color: '#374151' }}>Feedback:</h5>
                  <ul style={{ color: '#6b7280', paddingLeft: '1.5rem' }}>
                    {persona.feedback.map((feedback, index) => (
                      <li key={index} style={{ marginBottom: '0.5rem' }}>{feedback}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
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