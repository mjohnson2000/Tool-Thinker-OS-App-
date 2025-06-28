import React from 'react';
import { useLocation, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import logo from '../../assets/logo.png';

export function MarketValidationScorePage({ setAppState, currentStep }: { setAppState: any, currentStep: string }) {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const result = location.state?.result;

  if (!user?.isSubscribed) {
    return <Navigate to='/' replace />;
  }
  if (!result) {
    return <Navigate to='/' replace />;
  }

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', maxWidth: 700, margin: '0 auto 2rem auto' }}>
        <img src={logo} alt="ToolThinker Logo" style={{ height: 60, width: 60, borderRadius: 16, cursor: 'pointer' }} onClick={() => navigate('/')} />
        {user && (
          user.profilePic ? (
            <img src={user.profilePic} alt="Profile" style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', background: '#e5e5e5', cursor: 'pointer' }} onClick={() => setAppState((prev: any) => ({ ...prev, stepBeforeAuth: currentStep, currentStep: 'profile' }))} />
          ) : user.email ? (
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#007aff22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: '#007aff', fontWeight: 700, cursor: 'pointer' }} onClick={() => setAppState((prev: any) => ({ ...prev, stepBeforeAuth: currentStep, currentStep: 'profile' }))}>
              {user.email.split('@')[0].split(/[._-]/).map(part => part[0]?.toUpperCase()).join('').slice(0, 2) || 'U'}
            </div>
          ) : null
        )}
      </div>
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
    </>
  );
}

export default MarketValidationScorePage; 