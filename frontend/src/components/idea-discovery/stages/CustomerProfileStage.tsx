import React, { useState, useEffect } from 'react';
import { usePersonas } from '../hooks/usePersonas';
import { useValidationScore } from '../hooks/useValidationScore';

export interface CustomerProfileStageProps {
  businessIdea: string;
  customerDescription: string;
  planData: any;
  businessPlanId: string;
  onStageComplete: (data: any) => void;
  onStageUpdate: (data: any) => void;
}

export function CustomerProfileStage({
  businessIdea,
  customerDescription,
  planData,
  businessPlanId,
  onStageComplete,
  onStageUpdate,
}: CustomerProfileStageProps) {
  const { personas, setPersonas, collectiveSummary, setCollectiveSummary } = usePersonas();
  const { validationScore, setValidationScore } = useValidationScore();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [customerProfiles, setCustomerProfiles] = useState<any[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  const [hasFetchedValidation, setHasFetchedValidation] = useState(false);

  // Fetch existing data on mount
  useEffect(() => {
    fetchCustomerProfiles();
    // Only fetch validation data if we don't already have it and haven't fetched it yet
    if (!validationScore && !hasFetchedValidation) {
      fetchValidationData();
    }
  }, [validationScore, hasFetchedValidation]);

  const fetchCustomerProfiles = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.VITE_API_URL || 'http://localhost:5001/api'}/automated-discovery/customer-profiles`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setCustomerProfiles(data.profiles || []);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch customer profiles');
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

  const handleGenerateCustomerProfiles = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.VITE_API_URL || 'http://localhost:5001/api'}/automated-discovery/customer-profiles`, {
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
          stage: 'Customer Profile',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        setCustomerProfiles(data.profiles || []);
        setCollectiveSummary(data.summary);
        setValidationScore(data.validationScore);
        setHasFetchedValidation(true); // Mark as fetched since we got new validation data
        
        // Save customer profile data to the business plan
        await saveCustomerProfileData(data);
        
        onStageComplete({
          customerProfiles: data.profiles,
          summary: data.summary,
          validationScore: data.validationScore,
        });
      } else {
        throw new Error('Failed to generate customer profiles');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to generate customer profiles');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSelect = (profile: any) => {
    setSelectedProfile(profile);
    onStageUpdate({ selectedProfile: profile });
  };

  // Function to save customer profile data to the business plan
  const saveCustomerProfileData = async (data: any) => {
    try {
      const token = localStorage.getItem('token');
      if (!businessPlanId) {
        console.warn('No business plan ID found, skipping save');
        return;
      }

      // Prepare customer profile sections to save
      const customerProfileSections = {
        customerProfiles: JSON.stringify(data.profiles || []),
        customerProfileAnalysis: data.analysis?.summary || '',
        customerSegments: data.profiles?.[0]?.segments ? JSON.stringify(data.profiles[0].segments) : '',
        customerPainPoints: data.profiles?.[0]?.painPoints ? JSON.stringify(data.profiles[0].painPoints) : '',
        customerMotivations: data.profiles?.[0]?.motivations ? JSON.stringify(data.profiles[0].motivations) : '',
        customerAccessibility: data.profiles?.[0]?.accessibility || '',
        customerValue: data.profiles?.[0]?.value || '',
        customerObjections: data.profiles?.[0]?.objections ? JSON.stringify(data.profiles[0].objections) : ''
      };

      const saveResponse = await fetch(`${process.env.VITE_API_URL || 'http://localhost:5001/api'}/business-plan/${businessPlanId}`, {
        method: 'PUT',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sections: customerProfileSections
        }),
      });

      if (saveResponse.ok) {
        console.log('Customer profile data saved successfully');
      } else {
        console.error('Failed to save customer profile data');
      }
    } catch (error) {
      console.error('Error saving customer profile data:', error);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '2rem', color: '#1f2937' }}>
        Customer Profile Stage
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
        <h3 style={{ marginBottom: '1rem', color: '#374151' }}>Initial Customer Description</h3>
        <p style={{ color: '#6b7280', lineHeight: 1.6 }}>{customerDescription}</p>
      </div>

      {/* Generate Customer Profiles Button */}
      <button
        onClick={handleGenerateCustomerProfiles}
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
        {loading ? 'Generating Customer Profiles...' : 'Generate Customer Profiles'}
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
          <h3 style={{ marginBottom: '1rem', color: '#166534' }}>Customer Profile Validation</h3>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#166534' }}>
            {validationScore.score}/10
          </div>
          <p style={{ color: '#166534', marginTop: '0.5rem' }}>
            Confidence: {validationScore.confidence}
          </p>
        </div>
      )}

      {/* Customer Profiles Grid */}
      {customerProfiles.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1rem', color: '#374151' }}>Customer Profiles</h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: '1rem' 
          }}>
            {customerProfiles.map((profile, index) => (
              <div 
                key={index}
                onClick={() => handleProfileSelect(profile)}
                style={{ 
                  background: '#fff', 
                  border: selectedProfile === profile ? '2px solid #10b981' : '1px solid #e5e7eb', 
                  borderRadius: '8px', 
                  padding: '1.5rem', 
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <h4 style={{ marginBottom: '0.5rem', color: '#374151' }}>{profile.name}</h4>
                <p style={{ color: '#6b7280', marginBottom: '1rem', fontSize: '14px' }}>
                  {profile.description}
                </p>
                
                {profile.demographics && (
                  <div style={{ marginBottom: '1rem' }}>
                    <h5 style={{ marginBottom: '0.5rem', color: '#374151', fontSize: '14px' }}>Demographics:</h5>
                                         <ul style={{ color: '#6b7280', fontSize: '12px', paddingLeft: '1rem' }}>
                       {Object.entries(profile.demographics).map(([key, value]) => (
                         <li key={key}>{key}: {String(value)}</li>
                       ))}
                     </ul>
                  </div>
                )}
                
                {profile.painPoints && profile.painPoints.length > 0 && (
                  <div style={{ marginBottom: '1rem' }}>
                    <h5 style={{ marginBottom: '0.5rem', color: '#374151', fontSize: '14px' }}>Pain Points:</h5>
                    <ul style={{ color: '#6b7280', fontSize: '12px', paddingLeft: '1rem' }}>
                      {profile.painPoints.map((point: string, idx: number) => (
                        <li key={idx}>{point}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {profile.goals && profile.goals.length > 0 && (
                  <div>
                    <h5 style={{ marginBottom: '0.5rem', color: '#374151', fontSize: '14px' }}>Goals:</h5>
                    <ul style={{ color: '#6b7280', fontSize: '12px', paddingLeft: '1rem' }}>
                      {profile.goals.map((goal: string, idx: number) => (
                        <li key={idx}>{goal}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
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
          <h3 style={{ marginBottom: '1rem', color: '#92400e' }}>Customer Profile Summary</h3>
          <p style={{ color: '#92400e', lineHeight: 1.6 }}>{collectiveSummary}</p>
        </div>
      )}

      {/* Selected Profile Details */}
      {selectedProfile && (
        <div style={{ 
          background: '#f0f9ff', 
          border: '1px solid #bae6fd', 
          padding: '1.5rem', 
          borderRadius: '8px', 
          marginBottom: '2rem' 
        }}>
          <h3 style={{ marginBottom: '1rem', color: '#0369a1' }}>Selected Profile: {selectedProfile.name}</h3>
          <div style={{ color: '#0369a1', lineHeight: 1.6 }}>
            <p><strong>Description:</strong> {selectedProfile.description}</p>
            {selectedProfile.demographics && (
              <p><strong>Demographics:</strong> {Object.entries(selectedProfile.demographics).map(([k, v]) => `${k}: ${v}`).join(', ')}</p>
            )}
            {selectedProfile.painPoints && (
              <p><strong>Pain Points:</strong> {selectedProfile.painPoints.join(', ')}</p>
            )}
            {selectedProfile.goals && (
              <p><strong>Goals:</strong> {selectedProfile.goals.join(', ')}</p>
            )}
          </div>
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