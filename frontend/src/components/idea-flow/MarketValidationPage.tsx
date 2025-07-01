import React from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import MarketValidation from './MarketValidation';
import styled from 'styled-components';

const PLAN_DISPLAY_NAMES: Record<string, string> = {
  free: 'Free',
  basic: 'Basic',
  pro: 'Pro',
  elite: 'Elite',
};

const PlanBadge = styled.div`
  margin-top: -0.2rem;
  background: #f3f4f6;
  color: #181a1b;
  font-size: 0.82rem;
  font-weight: 600;
  border-radius: 999px;
  border: 1.5px solid #181a1b;
  padding: 0.18rem 1.1rem 0.22rem 1.1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 48px;
  min-height: 22px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  letter-spacing: 0.01em;
  user-select: none;
`;

const TopBar = styled.div`
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 2rem 1rem 1.5rem 1rem;
  background: transparent;
`;

export function MarketValidationPage({ setAppState, currentStep }: { setAppState: any, currentStep: string }) {
  const { user } = useAuth();
  const location = useLocation();
  const startupPlan = location.state?.startupPlan;

  if (!user?.isSubscribed) {
    return <Navigate to='/' replace />;
  }
  if (!startupPlan) {
    return <Navigate to='/' replace />;
  }
  return (
    <>
      <TopBar>
        {user && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
            {/* You can add avatar/initials here if desired */}
            <PlanBadge>
              {!user?.isSubscribed
                ? PLAN_DISPLAY_NAMES['free']
                : PLAN_DISPLAY_NAMES[user?.subscriptionTier || 'basic']}
            </PlanBadge>
          </div>
        )}
      </TopBar>
      <MarketValidation startupPlan={startupPlan} setAppState={setAppState} currentStep={currentStep} />
    </>
  );
}

export default MarketValidationPage; 