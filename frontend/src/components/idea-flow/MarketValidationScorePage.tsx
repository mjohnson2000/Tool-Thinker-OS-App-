import React from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export function MarketValidationScorePage() {
  const { user } = useAuth();
  const location = useLocation();
  const result = location.state?.result;

  if (!user?.isSubscribed) {
    return <Navigate to='/' replace />;
  }
  if (!result) {
    return <Navigate to='/' replace />;
  }

  return (
    <div style={{ maxWidth: 700, margin: '2rem auto', padding: '2rem', background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
      <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1rem', color: '#222' }}>Validation Score</h2>
      <div style={{ fontSize: '2.5rem', fontWeight: 800, color: result.validationScore >= 80 ? '#28a745' : result.validationScore >= 60 ? '#ffc107' : '#dc3545', marginBottom: 16 }}>
        {result.validationScore}/100
      </div>
      <div style={{ marginBottom: 24 }}>
        <strong>Recommendations:</strong>
        <ul>
          {result.recommendations?.map((rec: string, i: number) => <li key={i}>{rec}</li>)}
        </ul>
      </div>
      <div style={{ marginBottom: 24 }}>
        <strong>Risks:</strong>
        <ul>
          {result.risks?.map((risk: string, i: number) => <li key={i} style={{ color: '#dc3545' }}>{risk}</li>)}
        </ul>
      </div>
      <div>
        <strong>Next Steps:</strong>
        <ul>
          {result.nextSteps?.map((step: string, i: number) => <li key={i}>{step}</li>)}
        </ul>
      </div>
    </div>
  );
}

export default MarketValidationScorePage; 