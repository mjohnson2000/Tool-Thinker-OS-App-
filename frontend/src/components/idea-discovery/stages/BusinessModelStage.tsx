import React, { useState, useEffect } from 'react';
import { usePersonas } from '../hooks/usePersonas';
import { useValidationScore } from '../hooks/useValidationScore';

export interface BusinessModelStageProps {
  businessIdea: string;
  customerDescription: string;
  planData: any;
  onStageComplete: (data: any) => void;
  onStageUpdate: (data: any) => void;
}

export function BusinessModelStage({
  businessIdea,
  customerDescription,
  planData,
  onStageComplete,
  onStageUpdate,
}: BusinessModelStageProps) {
  const { personas, setPersonas, collectiveSummary, setCollectiveSummary } = usePersonas();
  const { validationScore, setValidationScore } = useValidationScore();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [businessModels, setBusinessModels] = useState<any[]>([]);
  const [selectedModel, setSelectedModel] = useState<any>(null);
  const [modelAnalysis, setModelAnalysis] = useState<any>(null);
  const [financialProjections, setFinancialProjections] = useState<any>(null);
  const [hasFetchedValidation, setHasFetchedValidation] = useState(false);

  // Fetch existing data on mount
  useEffect(() => {
    fetchBusinessModels();
    // Only fetch validation data if we don't already have it and haven't fetched it yet
    if (!validationScore && !hasFetchedValidation) {
      fetchValidationData();
    }
  }, [validationScore, hasFetchedValidation]);

  const fetchBusinessModels = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.VITE_API_URL || 'http://localhost:5001/api'}/automated-discovery/business-models`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setBusinessModels(data.models || []);
        setModelAnalysis(data.analysis);
        setFinancialProjections(data.financialProjections);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch business models');
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

  const handleGenerateBusinessModels = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.VITE_API_URL || 'http://localhost:5001/api'}/automated-discovery/business-models`, {
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
          stage: 'Business Model',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        setBusinessModels(data.models || []);
        setModelAnalysis(data.analysis);
        setFinancialProjections(data.financialProjections);
        setCollectiveSummary(data.summary);
        setValidationScore(data.validationScore);
        setHasFetchedValidation(true); // Mark as fetched since we got new validation data
        
        onStageComplete({
          businessModels: data.models,
          analysis: data.analysis,
          financialProjections: data.financialProjections,
          summary: data.summary,
          validationScore: data.validationScore,
        });
      } else {
        throw new Error('Failed to generate business models');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to generate business models');
    } finally {
      setLoading(false);
    }
  };

  const handleModelSelect = (model: any) => {
    setSelectedModel(model);
    onStageUpdate({ selectedModel: model });
    setLogs(prev => [...prev, `Selected business model: ${model.name}`]);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '2rem', color: '#1f2937' }}>
        Business Model Stage
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

      {/* Generate Business Models Button */}
      <button
        onClick={handleGenerateBusinessModels}
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
        {loading ? 'Generating Business Models...' : 'Generate Business Models'}
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
          <h3 style={{ marginBottom: '1rem', color: '#166534' }}>Business Model Validation</h3>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#166534' }}>
            {validationScore.score}/10
          </div>
          <p style={{ color: '#166534', marginTop: '0.5rem' }}>
            Confidence: {validationScore.confidence}
          </p>
        </div>
      )}

      {/* Business Models Grid */}
      {businessModels.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1rem', color: '#374151' }}>Business Model Options</h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
            gap: '1rem' 
          }}>
            {businessModels.map((model, index) => (
              <div 
                key={index}
                onClick={() => handleModelSelect(model)}
                style={{ 
                  background: selectedModel === model ? '#f0fdf4' : '#fff', 
                  border: selectedModel === model ? '2px solid #10b981' : '1px solid #e5e7eb', 
                  borderRadius: '8px', 
                  padding: '1.5rem', 
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <h4 style={{ marginBottom: '0.5rem', color: '#374151' }}>{model.name}</h4>
                <p style={{ color: '#6b7280', marginBottom: '1rem', fontSize: '14px' }}>
                  {model.description}
                </p>
                
                {model.revenueStreams && (
                  <div style={{ marginBottom: '1rem' }}>
                    <h5 style={{ marginBottom: '0.5rem', color: '#374151', fontSize: '14px' }}>Revenue Streams:</h5>
                    <ul style={{ color: '#6b7280', fontSize: '12px', paddingLeft: '1rem' }}>
                      {model.revenueStreams.map((stream: any, idx: number) => (
                        <li key={idx}>
                          {stream.name}: {formatCurrency(stream.price)}/{stream.frequency}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {model.costStructure && (
                  <div style={{ marginBottom: '1rem' }}>
                    <h5 style={{ marginBottom: '0.5rem', color: '#374151', fontSize: '14px' }}>Cost Structure:</h5>
                    <ul style={{ color: '#6b7280', fontSize: '12px', paddingLeft: '1rem' }}>
                      {Object.entries(model.costStructure).map(([key, value]) => (
                        <li key={key}>{key}: {formatCurrency(value as number)}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {model.advantages && model.advantages.length > 0 && (
                  <div style={{ marginBottom: '1rem' }}>
                    <h5 style={{ marginBottom: '0.5rem', color: '#374151', fontSize: '14px' }}>Advantages:</h5>
                    <ul style={{ color: '#6b7280', fontSize: '12px', paddingLeft: '1rem' }}>
                      {model.advantages.map((advantage: string, idx: number) => (
                        <li key={idx}>{advantage}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {model.challenges && model.challenges.length > 0 && (
                  <div>
                    <h5 style={{ marginBottom: '0.5rem', color: '#374151', fontSize: '14px' }}>Challenges:</h5>
                    <ul style={{ color: '#6b7280', fontSize: '12px', paddingLeft: '1rem' }}>
                      {model.challenges.map((challenge: string, idx: number) => (
                        <li key={idx}>{challenge}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Financial Projections */}
      {financialProjections && (
        <div style={{ 
          background: '#fef3c7', 
          border: '1px solid #fde68a', 
          padding: '1.5rem', 
          borderRadius: '8px', 
          marginBottom: '2rem' 
        }}>
          <h3 style={{ marginBottom: '1rem', color: '#92400e' }}>Financial Projections</h3>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '1rem',
            marginBottom: '1rem'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#92400e' }}>
                {formatCurrency(financialProjections.totalProjectedRevenue)}
              </div>
              <div style={{ fontSize: '12px', color: '#92400e' }}>Projected Revenue</div>
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#92400e' }}>
                {financialProjections.grossMargin}%
              </div>
              <div style={{ fontSize: '12px', color: '#92400e' }}>Gross Margin</div>
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#92400e' }}>
                {formatCurrency(financialProjections.customerLifetimeValue)}
              </div>
              <div style={{ fontSize: '12px', color: '#92400e' }}>Customer LTV</div>
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#92400e' }}>
                {formatCurrency(financialProjections.customerAcquisitionCost)}
              </div>
              <div style={{ fontSize: '12px', color: '#92400e' }}>CAC</div>
            </div>
          </div>
          
          {financialProjections.monthlyRevenue && (
            <div>
              <h4 style={{ marginBottom: '0.5rem', color: '#92400e', fontSize: '16px' }}>Monthly Revenue Growth:</h4>
              <div style={{ 
                display: 'flex', 
                gap: '0.5rem', 
                overflowX: 'auto',
                paddingBottom: '0.5rem'
              }}>
                {financialProjections.monthlyRevenue.slice(0, 12).map((revenue: number, idx: number) => (
                  <div key={idx} style={{ 
                    background: '#fde68a', 
                    padding: '0.5rem', 
                    borderRadius: '4px',
                    minWidth: '60px',
                    textAlign: 'center',
                    fontSize: '12px'
                  }}>
                    <div style={{ fontWeight: 'bold', color: '#92400e' }}>
                      {formatCurrency(revenue)}
                    </div>
                    <div style={{ fontSize: '10px', color: '#92400e' }}>
                      Month {idx + 1}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Model Analysis */}
      {modelAnalysis && (
        <div style={{ 
          background: '#f0f9ff', 
          border: '1px solid #bae6fd', 
          padding: '1.5rem', 
          borderRadius: '8px', 
          marginBottom: '2rem' 
        }}>
          <h3 style={{ marginBottom: '1rem', color: '#0369a1' }}>Business Model Analysis</h3>
          
          {modelAnalysis.recommendations && (
            <div style={{ marginBottom: '1rem' }}>
              <h4 style={{ marginBottom: '0.5rem', color: '#0369a1', fontSize: '16px' }}>Recommendations:</h4>
              <ul style={{ color: '#0369a1', paddingLeft: '1.5rem' }}>
                {modelAnalysis.recommendations.map((rec: string, idx: number) => (
                  <li key={idx} style={{ marginBottom: '0.25rem' }}>{rec}</li>
                ))}
              </ul>
            </div>
          )}
          
          {modelAnalysis.risks && (
            <div style={{ marginBottom: '1rem' }}>
              <h4 style={{ marginBottom: '0.5rem', color: '#0369a1', fontSize: '16px' }}>Potential Risks:</h4>
              <ul style={{ color: '#0369a1', paddingLeft: '1.5rem' }}>
                {modelAnalysis.risks.map((risk: string, idx: number) => (
                  <li key={idx} style={{ marginBottom: '0.25rem' }}>{risk}</li>
                ))}
              </ul>
            </div>
          )}
          
          {modelAnalysis.nextSteps && (
            <div>
              <h4 style={{ marginBottom: '0.5rem', color: '#0369a1', fontSize: '16px' }}>Next Steps:</h4>
              <p style={{ color: '#0369a1', lineHeight: 1.6 }}>{modelAnalysis.nextSteps}</p>
            </div>
          )}
        </div>
      )}

      {/* Selected Model Details */}
      {selectedModel && (
        <div style={{ 
          background: '#f0f9ff', 
          border: '1px solid #bae6fd', 
          padding: '1.5rem', 
          borderRadius: '8px', 
          marginBottom: '2rem' 
        }}>
          <h3 style={{ marginBottom: '1rem', color: '#0369a1' }}>Selected Model: {selectedModel.name}</h3>
          <div style={{ color: '#0369a1', lineHeight: 1.6 }}>
            <p><strong>Description:</strong> {selectedModel.description}</p>
            {selectedModel.revenueStreams && (
              <p><strong>Revenue Streams:</strong> {selectedModel.revenueStreams.map((s: any) => `${s.name} (${formatCurrency(s.price)})`).join(', ')}</p>
            )}
            {selectedModel.costStructure && (
              <p><strong>Cost Structure:</strong> {Object.entries(selectedModel.costStructure).map(([k, v]) => `${k}: ${formatCurrency(v as number)}`).join(', ')}</p>
            )}
            {selectedModel.advantages && (
              <p><strong>Advantages:</strong> {selectedModel.advantages.join(', ')}</p>
            )}
            {selectedModel.challenges && (
              <p><strong>Challenges:</strong> {selectedModel.challenges.join(', ')}</p>
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
          <h3 style={{ marginBottom: '1rem', color: '#0369a1' }}>Business Model Summary</h3>
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