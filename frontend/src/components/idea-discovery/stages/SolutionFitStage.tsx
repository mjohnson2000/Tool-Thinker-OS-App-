import React, { useState, useEffect } from 'react';
import { usePersonas } from '../hooks/usePersonas';
import { useValidationScore } from '../hooks/useValidationScore';

export interface SolutionFitStageProps {
  businessIdea: string;
  customerDescription: string;
  planData: any;
  businessPlanId: string;
  onStageComplete: (data: any) => void;
  onStageUpdate: (data: any) => void;
}

export function SolutionFitStage({
  businessIdea,
  customerDescription,
  planData,
  businessPlanId,
  onStageComplete,
  onStageUpdate,
}: SolutionFitStageProps) {
  const { personas, setPersonas, collectiveSummary, setCollectiveSummary } = usePersonas();
  const { validationScore, setValidationScore } = useValidationScore();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [solutionOptions, setSolutionOptions] = useState<any[]>([]);
  const [selectedSolution, setSelectedSolution] = useState<any>(null);
  const [solutionAnalysis, setSolutionAnalysis] = useState<any>(null);
  const [fitScore, setFitScore] = useState<number | null>(null);
  const [hasFetchedValidation, setHasFetchedValidation] = useState(false);

  // Fetch existing data on mount
  useEffect(() => {
    fetchSolutionOptions();
    // Only fetch validation data if we don't already have it and haven't fetched it yet
    if (!validationScore && !hasFetchedValidation) {
      fetchValidationData();
    }
  }, [validationScore, hasFetchedValidation]);

  const fetchSolutionOptions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.VITE_API_URL || 'http://localhost:5001/api'}/automated-discovery/solution-options`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setSolutionOptions(data.solutions || []);
        setSolutionAnalysis(data.analysis);
        setFitScore(data.fitScore);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch solution options');
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

  const handleGenerateSolutions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.VITE_API_URL || 'http://localhost:5001/api'}/automated-discovery/solution-fit`, {
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
          stage: 'Solution Fit',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        setSolutionOptions(data.solution ? [data.solution] : []);
        setSolutionAnalysis(data.analysis);
        setFitScore(data.validationScore?.score || 0);
        setCollectiveSummary(data.summary);
        setValidationScore(data.validationScore);
        setHasFetchedValidation(true); // Mark as fetched since we got new validation data
        
        // Save solution fit data to the business plan
        await saveSolutionFitData(data);
        
        onStageComplete({
          solutionOptions: data.solution ? [data.solution] : [],
          analysis: data.analysis,
          fitScore: data.validationScore?.score || 0,
          summary: data.summary,
          validationScore: data.validationScore,
        });
      } else {
        throw new Error('Failed to generate solution options');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to generate solution options');
    } finally {
      setLoading(false);
    }
  };

  const handleSolutionSelect = (solution: any) => {
    setSelectedSolution(solution);
    onStageUpdate({ selectedSolution: solution });
    setLogs(prev => [...prev, `Selected solution: ${solution.name}`]);
  };

  const getFitScoreColor = (score: number) => {
    if (score >= 8) return '#059669';
    if (score >= 6) return '#d97706';
    return '#dc2626';
  };

  const getFitScoreLabel = (score: number) => {
    if (score >= 8) return 'Excellent Fit';
    if (score >= 6) return 'Good Fit';
    if (score >= 4) return 'Moderate Fit';
    return 'Poor Fit';
  };

  // Function to save solution fit data to the business plan
  const saveSolutionFitData = async (data: any) => {
    try {
      const token = localStorage.getItem('token');
      if (!businessPlanId) {
        console.warn('No business plan ID found, skipping save');
        return;
      }

      // Prepare solution fit sections to save
      const solutionFitSections = {
        solutionFit: JSON.stringify(data.solution || {}),
        solutionFitAnalysis: data.analysis?.summary || '',
        solutionDescription: data.solution?.description || '',
        keyFeatures: data.solution?.keyFeatures ? JSON.stringify(data.solution.keyFeatures) : '',
        benefits: data.solution?.benefits ? JSON.stringify(data.solution.benefits) : '',
        competitiveAdvantages: data.solution?.competitiveAdvantages ? JSON.stringify(data.solution.competitiveAdvantages) : '',
        valueProposition: data.solution?.valueProposition || '',
        implementationRoadmap: data.solution?.implementationRoadmap || '',
        technicalRequirements: data.solution?.technicalRequirements ? JSON.stringify(data.solution.technicalRequirements) : '',
        resourceRequirements: data.solution?.resourceRequirements ? JSON.stringify(data.solution.resourceRequirements) : ''
      };

      const saveResponse = await fetch(`${process.env.VITE_API_URL || 'http://localhost:5001/api'}/business-plan/${businessPlanId}`, {
        method: 'PUT',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sections: solutionFitSections
        }),
      });

      if (saveResponse.ok) {
        console.log('Solution fit data saved successfully');
      } else {
        console.error('Failed to save solution fit data');
      }
    } catch (error) {
      console.error('Error saving solution fit data:', error);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '2rem', color: '#1f2937' }}>
        Solution Fit Stage
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

      {/* Generate Solutions Button */}
      <button
        onClick={handleGenerateSolutions}
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
        {loading ? 'Analyzing Solution Fit...' : 'Analyze Solution Fit'}
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

      {/* Fit Score Display */}
      {fitScore !== null && (
        <div style={{ 
          background: '#f0fdf4', 
          border: '1px solid #bbf7d0', 
          padding: '1.5rem', 
          borderRadius: '8px', 
          marginBottom: '2rem' 
        }}>
          <h3 style={{ marginBottom: '1rem', color: '#166534' }}>Solution Fit Score</h3>
          <div style={{ 
            fontSize: '2rem', 
            fontWeight: 'bold', 
            color: getFitScoreColor(fitScore),
            marginBottom: '0.5rem'
          }}>
            {fitScore}/10
          </div>
          <p style={{ 
            color: getFitScoreColor(fitScore), 
            marginTop: '0.5rem',
            fontWeight: 600
          }}>
            {getFitScoreLabel(fitScore)}
          </p>
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
          <h3 style={{ marginBottom: '1rem', color: '#166534' }}>Solution Validation</h3>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#166534' }}>
            {validationScore.score}/10
          </div>
          <p style={{ color: '#166534', marginTop: '0.5rem' }}>
            Confidence: {validationScore.confidence}
          </p>
        </div>
      )}

      {/* Solution Options */}
      {solutionOptions.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1rem', color: '#374151' }}>Solution Options</h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', 
            gap: '1rem' 
          }}>
            {solutionOptions.map((solution, index) => (
              <div 
                key={index}
                onClick={() => handleSolutionSelect(solution)}
                style={{ 
                  background: selectedSolution === solution ? '#f0fdf4' : '#fff', 
                  border: selectedSolution === solution ? '2px solid #10b981' : '1px solid #e5e7eb', 
                  borderRadius: '8px', 
                  padding: '1.5rem', 
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <h4 style={{ marginBottom: '0.5rem', color: '#374151' }}>{solution.name}</h4>
                <p style={{ color: '#6b7280', marginBottom: '1rem', fontSize: '14px' }}>
                  {solution.description}
                </p>
                
                {solution.fitScore && (
                  <div style={{ marginBottom: '0.5rem' }}>
                    <span style={{ 
                      fontSize: '12px', 
                      color: getFitScoreColor(solution.fitScore), 
                      fontWeight: 600,
                      background: '#d1fae5',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                    }}>
                      Fit Score: {solution.fitScore}/10
                    </span>
                  </div>
                )}
                
                {solution.advantages && solution.advantages.length > 0 && (
                  <div style={{ marginBottom: '1rem' }}>
                    <h5 style={{ marginBottom: '0.5rem', color: '#374151', fontSize: '14px' }}>Advantages:</h5>
                    <ul style={{ color: '#6b7280', fontSize: '12px', paddingLeft: '1rem' }}>
                      {solution.advantages.map((advantage: string, idx: number) => (
                        <li key={idx}>{advantage}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {solution.challenges && solution.challenges.length > 0 && (
                  <div style={{ marginBottom: '1rem' }}>
                    <h5 style={{ marginBottom: '0.5rem', color: '#374151', fontSize: '14px' }}>Challenges:</h5>
                    <ul style={{ color: '#6b7280', fontSize: '12px', paddingLeft: '1rem' }}>
                      {solution.challenges.map((challenge: string, idx: number) => (
                        <li key={idx}>{challenge}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {solution.implementation && (
                  <div>
                    <h5 style={{ marginBottom: '0.5rem', color: '#374151', fontSize: '14px' }}>Implementation:</h5>
                    <p style={{ color: '#6b7280', fontSize: '12px' }}>{solution.implementation}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Solution Analysis */}
      {solutionAnalysis && (
        <div style={{ 
          background: '#fef3c7', 
          border: '1px solid #fde68a', 
          padding: '1.5rem', 
          borderRadius: '8px', 
          marginBottom: '2rem' 
        }}>
          <h3 style={{ marginBottom: '1rem', color: '#92400e' }}>Solution Analysis</h3>
          
          {solutionAnalysis.recommendations && (
            <div style={{ marginBottom: '1rem' }}>
              <h4 style={{ marginBottom: '0.5rem', color: '#92400e', fontSize: '16px' }}>Recommendations:</h4>
              <ul style={{ color: '#92400e', paddingLeft: '1.5rem' }}>
                {solutionAnalysis.recommendations.map((rec: string, idx: number) => (
                  <li key={idx} style={{ marginBottom: '0.25rem' }}>{rec}</li>
                ))}
              </ul>
            </div>
          )}
          
          {solutionAnalysis.risks && (
            <div style={{ marginBottom: '1rem' }}>
              <h4 style={{ marginBottom: '0.5rem', color: '#92400e', fontSize: '16px' }}>Potential Risks:</h4>
              <ul style={{ color: '#92400e', paddingLeft: '1.5rem' }}>
                {solutionAnalysis.risks.map((risk: string, idx: number) => (
                  <li key={idx} style={{ marginBottom: '0.25rem' }}>{risk}</li>
                ))}
              </ul>
            </div>
          )}
          
          {solutionAnalysis.nextSteps && (
            <div>
              <h4 style={{ marginBottom: '0.5rem', color: '#92400e', fontSize: '16px' }}>Next Steps:</h4>
              <p style={{ color: '#92400e', lineHeight: 1.6 }}>{solutionAnalysis.nextSteps}</p>
            </div>
          )}
        </div>
      )}

      {/* Selected Solution Details */}
      {selectedSolution && (
        <div style={{ 
          background: '#f0f9ff', 
          border: '1px solid #bae6fd', 
          padding: '1.5rem', 
          borderRadius: '8px', 
          marginBottom: '2rem' 
        }}>
          <h3 style={{ marginBottom: '1rem', color: '#0369a1' }}>Selected Solution: {selectedSolution.name}</h3>
          <div style={{ color: '#0369a1', lineHeight: 1.6 }}>
            <p><strong>Description:</strong> {selectedSolution.description}</p>
            {selectedSolution.fitScore && (
              <p><strong>Fit Score:</strong> {selectedSolution.fitScore}/10</p>
            )}
            {selectedSolution.advantages && (
              <p><strong>Advantages:</strong> {selectedSolution.advantages.join(', ')}</p>
            )}
            {selectedSolution.challenges && (
              <p><strong>Challenges:</strong> {selectedSolution.challenges.join(', ')}</p>
            )}
            {selectedSolution.implementation && (
              <p><strong>Implementation:</strong> {selectedSolution.implementation}</p>
            )}
          </div>
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
          <h3 style={{ marginBottom: '1rem', color: '#0369a1' }}>Solution Fit Summary</h3>
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