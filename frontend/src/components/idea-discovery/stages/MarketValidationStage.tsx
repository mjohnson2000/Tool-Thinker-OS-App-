import React, { useState, useEffect } from 'react';
import { usePersonas } from '../hooks/usePersonas';
import { useValidationScore } from '../hooks/useValidationScore';

export interface MarketValidationStageProps {
  businessIdea: string;
  customerDescription: string;
  planData: any;
  businessPlanId: string;
  onStageComplete: (data: any) => void;
  onStageUpdate: (data: any) => void;
}

export function MarketValidationStage({
  businessIdea,
  customerDescription,
  planData,
  businessPlanId,
  onStageComplete,
  onStageUpdate,
}: MarketValidationStageProps) {
  const { personas, setPersonas, collectiveSummary, setCollectiveSummary } = usePersonas();
  const { validationScore, setValidationScore } = useValidationScore();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [marketData, setMarketData] = useState<any>(null);
  const [competitors, setCompetitors] = useState<any[]>([]);
  const [validationTests, setValidationTests] = useState<any[]>([]);
  const [marketAnalysis, setMarketAnalysis] = useState<any>(null);
  const [hasFetchedValidation, setHasFetchedValidation] = useState(false);

  // Fetch existing data on mount
  useEffect(() => {
    fetchMarketData();
    // Only fetch validation data if we don't already have it and haven't fetched it yet
    if (!validationScore && !hasFetchedValidation) {
      fetchValidationData();
    }
  }, [validationScore, hasFetchedValidation]);

  const fetchMarketData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.VITE_API_URL || 'http://localhost:5001/api'}/automated-discovery/market-validation`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setMarketData(data.marketData);
        setCompetitors(data.competitors || []);
        setValidationTests(data.validationTests || []);
        setMarketAnalysis(data.analysis);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch market data');
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

  const handleGenerateMarketValidation = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.VITE_API_URL || 'http://localhost:5001/api'}/automated-discovery/market-validation`, {
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
          stage: 'Market Validation',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        setMarketData(data.marketData);
        setCompetitors(data.competitors || []);
        setValidationTests(data.validationTests || []);
        setMarketAnalysis(data.analysis);
        setCollectiveSummary(data.summary);
        setValidationScore(data.validationScore);
        setHasFetchedValidation(true); // Mark as fetched since we got new validation data
        
        // Save market validation data to the business plan
        await saveMarketValidationData(data);
        
        onStageComplete({
          marketData: data.marketData,
          competitors: data.competitors,
          validationTests: data.validationTests,
          analysis: data.analysis,
          summary: data.summary,
          validationScore: data.validationScore,
        });
      } else {
        throw new Error('Failed to generate market validation');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to generate market validation');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Function to save market validation data to the business plan
  const saveMarketValidationData = async (data: any) => {
    try {
      const token = localStorage.getItem('token');
      if (!businessPlanId) {
        console.warn('No business plan ID found, skipping save');
        return;
      }

      // Prepare market validation sections to save
      const marketValidationSections = {
        marketData: JSON.stringify(data.marketData || {}),
        marketValidationAnalysis: data.analysis?.summary || '',
        competitors: JSON.stringify(data.competitors || []),
        validationTests: JSON.stringify(data.validationTests || []),
        marketSize: data.marketData?.marketSize ? JSON.stringify(data.marketData.marketSize) : '',
        marketDemand: data.marketData?.marketDemand || '',
        marketTiming: data.marketData?.marketTiming || '',
        marketEntryStrategy: data.marketData?.marketEntryStrategy || '',
        customerDemand: data.marketData?.customerDemand || '',
        marketTrends: data.marketData?.marketTrends ? JSON.stringify(data.marketData.marketTrends) : '',
        growthPotential: data.marketData?.growthPotential || ''
      };

      const saveResponse = await fetch(`${process.env.VITE_API_URL || 'http://localhost:5001/api'}/business-plan/${businessPlanId}`, {
        method: 'PUT',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sections: marketValidationSections
        }),
      });

      if (saveResponse.ok) {
        console.log('Market validation data saved successfully');
      } else {
        console.error('Failed to save market validation data');
      }
    } catch (error) {
      console.error('Error saving market validation data:', error);
    }
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '2rem', color: '#1f2937' }}>
        Market Validation Stage
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

      {/* Generate Market Validation Button */}
      <button
        onClick={handleGenerateMarketValidation}
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
        {loading ? 'Analyzing Market...' : 'Analyze Market Validation'}
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
          <h3 style={{ marginBottom: '1rem', color: '#166534' }}>Market Validation Score</h3>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#166534' }}>
            {validationScore.score}/10
          </div>
          <p style={{ color: '#166534', marginTop: '0.5rem' }}>
            Confidence: {validationScore.confidence}
          </p>
        </div>
      )}

      {/* Market Data */}
      {marketData && (
        <div style={{ 
          background: '#fef3c7', 
          border: '1px solid #fde68a', 
          padding: '1.5rem', 
          borderRadius: '8px', 
          marginBottom: '2rem' 
        }}>
          <h3 style={{ marginBottom: '1rem', color: '#92400e' }}>Market Data</h3>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '1rem',
            marginBottom: '1rem'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#92400e' }}>
                {formatCurrency(marketData.tam)}
              </div>
              <div style={{ fontSize: '12px', color: '#92400e' }}>Total Addressable Market</div>
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#92400e' }}>
                {formatCurrency(marketData.sam)}
              </div>
              <div style={{ fontSize: '12px', color: '#92400e' }}>Serviceable Addressable Market</div>
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#92400e' }}>
                {formatCurrency(marketData.som)}
              </div>
              <div style={{ fontSize: '12px', color: '#92400e' }}>Serviceable Obtainable Market</div>
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#92400e' }}>
                {marketData.growthRate}%
              </div>
              <div style={{ fontSize: '12px', color: '#92400e' }}>Annual Growth Rate</div>
            </div>
          </div>
          
          {marketData.keyInsights && (
            <div>
              <h4 style={{ marginBottom: '0.5rem', color: '#92400e', fontSize: '16px' }}>Key Market Insights:</h4>
              <ul style={{ color: '#92400e', paddingLeft: '1.5rem' }}>
                {marketData.keyInsights.map((insight: string, idx: number) => (
                  <li key={idx} style={{ marginBottom: '0.25rem' }}>{insight}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Competitors */}
      {competitors.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1rem', color: '#374151' }}>Competitive Landscape</h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', 
            gap: '1rem' 
          }}>
            {competitors.map((competitor, index) => (
              <div 
                key={index}
                style={{ 
                  background: '#fff', 
                  border: '1px solid #e5e7eb', 
                  borderRadius: '8px', 
                  padding: '1.5rem',
                }}
              >
                <h4 style={{ marginBottom: '0.5rem', color: '#374151' }}>{competitor.name}</h4>
                <p style={{ color: '#6b7280', marginBottom: '1rem', fontSize: '14px' }}>
                  {competitor.description}
                </p>
                
                {competitor.pricing && (
                  <div style={{ marginBottom: '0.5rem' }}>
                    <span style={{ 
                      fontSize: '12px', 
                      color: '#059669', 
                      fontWeight: 600,
                      background: '#d1fae5',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                    }}>
                      Pricing: {formatCurrency(competitor.pricing)}
                    </span>
                  </div>
                )}
                
                {competitor.marketShare && (
                  <div style={{ marginBottom: '0.5rem' }}>
                    <span style={{ 
                      fontSize: '12px', 
                      color: '#7c3aed', 
                      fontWeight: 600,
                      background: '#ede9fe',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                    }}>
                      Market Share: {competitor.marketShare}%
                    </span>
                  </div>
                )}
                
                {competitor.strengths && competitor.strengths.length > 0 && (
                  <div style={{ marginBottom: '1rem' }}>
                    <h5 style={{ marginBottom: '0.5rem', color: '#374151', fontSize: '14px' }}>Strengths:</h5>
                    <ul style={{ color: '#6b7280', fontSize: '12px', paddingLeft: '1rem' }}>
                      {competitor.strengths.map((strength: string, idx: number) => (
                        <li key={idx}>{strength}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {competitor.weaknesses && competitor.weaknesses.length > 0 && (
                  <div>
                    <h5 style={{ marginBottom: '0.5rem', color: '#374151', fontSize: '14px' }}>Weaknesses:</h5>
                    <ul style={{ color: '#6b7280', fontSize: '12px', paddingLeft: '1rem' }}>
                      {competitor.weaknesses.map((weakness: string, idx: number) => (
                        <li key={idx}>{weakness}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Validation Tests */}
      {validationTests.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1rem', color: '#374151' }}>Market Validation Tests</h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: '1rem' 
          }}>
            {validationTests.map((test, index) => (
              <div 
                key={index}
                style={{ 
                  background: '#fff', 
                  border: '1px solid #e5e7eb', 
                  borderRadius: '8px', 
                  padding: '1.5rem',
                }}
              >
                <h4 style={{ marginBottom: '0.5rem', color: '#374151' }}>{test.name}</h4>
                <p style={{ color: '#6b7280', marginBottom: '1rem', fontSize: '14px' }}>
                  {test.description}
                </p>
                
                {test.method && (
                  <div style={{ marginBottom: '0.5rem' }}>
                    <span style={{ 
                      fontSize: '12px', 
                      color: '#059669', 
                      fontWeight: 600,
                      background: '#d1fae5',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                    }}>
                      Method: {test.method}
                    </span>
                  </div>
                )}
                
                {test.successCriteria && (
                  <div style={{ marginBottom: '1rem' }}>
                    <h5 style={{ marginBottom: '0.5rem', color: '#374151', fontSize: '14px' }}>Success Criteria:</h5>
                    <ul style={{ color: '#6b7280', fontSize: '12px', paddingLeft: '1rem' }}>
                      {test.successCriteria.map((criteria: string, idx: number) => (
                        <li key={idx}>{criteria}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {test.timeline && (
                  <div>
                    <h5 style={{ marginBottom: '0.5rem', color: '#374151', fontSize: '14px' }}>Timeline:</h5>
                    <p style={{ color: '#6b7280', fontSize: '12px' }}>{test.timeline}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Market Analysis */}
      {marketAnalysis && (
        <div style={{ 
          background: '#f0f9ff', 
          border: '1px solid #bae6fd', 
          padding: '1.5rem', 
          borderRadius: '8px', 
          marginBottom: '2rem' 
        }}>
          <h3 style={{ marginBottom: '1rem', color: '#0369a1' }}>Market Analysis</h3>
          
          {marketAnalysis.opportunities && (
            <div style={{ marginBottom: '1rem' }}>
              <h4 style={{ marginBottom: '0.5rem', color: '#0369a1', fontSize: '16px' }}>Market Opportunities:</h4>
              <ul style={{ color: '#0369a1', paddingLeft: '1.5rem' }}>
                {marketAnalysis.opportunities.map((opp: string, idx: number) => (
                  <li key={idx} style={{ marginBottom: '0.25rem' }}>{opp}</li>
                ))}
              </ul>
            </div>
          )}
          
          {marketAnalysis.threats && (
            <div style={{ marginBottom: '1rem' }}>
              <h4 style={{ marginBottom: '0.5rem', color: '#0369a1', fontSize: '16px' }}>Market Threats:</h4>
              <ul style={{ color: '#0369a1', paddingLeft: '1.5rem' }}>
                {marketAnalysis.threats.map((threat: string, idx: number) => (
                  <li key={idx} style={{ marginBottom: '0.25rem' }}>{threat}</li>
                ))}
              </ul>
            </div>
          )}
          
          {marketAnalysis.recommendations && (
            <div>
              <h4 style={{ marginBottom: '0.5rem', color: '#0369a1', fontSize: '16px' }}>Recommendations:</h4>
              <p style={{ color: '#0369a1', lineHeight: 1.6 }}>{marketAnalysis.recommendations}</p>
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
          <h3 style={{ marginBottom: '1rem', color: '#0369a1' }}>Market Validation Summary</h3>
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