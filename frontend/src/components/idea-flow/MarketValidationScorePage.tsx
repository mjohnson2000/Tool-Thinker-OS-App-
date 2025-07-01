import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useLocation, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import logo from '../../assets/logo.png';

const PageBackground = styled.div`
  min-height: 100vh;
  background: #f6f7f9;
  display: flex;
  flex-direction: column;
`;

const TopBar = styled.div`
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 2rem 1rem 1.5rem 1rem;
  background: transparent;
  
  @media (max-width: 768px) {
    padding: 1.5rem 1rem 1rem 1rem;
  }
`;

const Card = styled.div`
  max-width: 800px;
  margin: 0 auto;
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.08);
  padding: 2.5rem 2rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  
  @media (max-width: 768px) {
    margin: 0 1rem;
    padding: 2rem 1.5rem;
    border-radius: 16px;
  }
  
  @media (max-width: 480px) {
    margin: 0 0.5rem;
    padding: 1.5rem 1rem;
  }
`;

const Title = styled.h1`
  font-size: 2.2rem;
  font-weight: 700;
  color: #222;
  margin-bottom: 0.5rem;
  text-align: center;
  
  @media (max-width: 768px) {
    font-size: 1.8rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1.6rem;
  }
`;

const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #f0f1f3;
  &:last-child { border-bottom: none; }
`;

const Score = styled.div<{ color: string }>`
  font-size: 2.5rem;
  font-weight: 800;
  color: ${props => props.color};
  margin-bottom: 1rem;
  text-align: center;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1.8rem;
  }
`;

const SectionTitle = styled.strong`
  font-size: 1.1rem;
  color: #181a1b;
  margin-bottom: 0.5rem;
  display: block;
  
  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const SectionList = styled.ul`
  margin: 0;
  padding-left: 18px;
  
  li {
    margin-bottom: 0.5rem;
    line-height: 1.4;
    color: #333;
    
    &.risk {
      color: #dc3545;
    }
  }
  
  @media (max-width: 768px) {
    padding-left: 16px;
    
    li {
      font-size: 0.95rem;
    }
  }
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  flex-wrap: wrap;
  justify-content: center;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0.8rem;
  }
`;

const Button = styled.button`
  background: linear-gradient(90deg, #181a1b 60%, #000 100%);
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.8rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(24,26,27,0.08);
  transition: background 0.2s, box-shadow 0.2s;
  min-width: 160px;
  
  &:hover { 
    background: #000; 
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  }
  
  @media (max-width: 768px) {
    padding: 0.7rem 1.2rem;
    font-size: 0.95rem;
    min-width: auto;
    width: 100%;
  }
`;

const OutlinedButton = styled(Button)`
  background: #f6f7f9;
  color: #181a1b;
  border: 2px solid #e5e7eb;
  box-shadow: none;
  
  &:hover { 
    background: #e5e7eb; 
    color: #000; 
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }
`;

const Avatar = styled.img`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  object-fit: cover;
  background: #e5e5e5;
  cursor: pointer;
  
  @media (max-width: 768px) {
    width: 40px;
    height: 40px;
  }
`;

const Initials = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: #181a1b22;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: #181a1b;
  font-weight: 700;
  cursor: pointer;
  
  @media (max-width: 768px) {
    width: 40px;
    height: 40px;
    font-size: 18px;
  }
`;

const Logo = styled.img`
  height: 90px;
  width: 90px;
  border-radius: 50px;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  
  @media (max-width: 768px) {
    height: 40px;
    width: 40px;
    border-radius: 10px;
  }
`;

const MyPlansButton = styled.button`
  background: #fff;
  color: #181a1b;
  border: 1.5px solid #181a1b;
  border-radius: 8px;
  padding: 0.6rem 1.2rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  margin-left: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  transition: background 0.2s, color 0.2s, border 0.2s;
  &:hover {
    background: #181a1b;
    color: #fff;
    border-color: #181a1b;
  }
`;

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

export function MarketValidationScorePage({ setAppState, currentStep }: { setAppState: any, currentStep: string }) {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [result, setResult] = useState<any>(location.state?.result || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchScore() {
      if (!result && location.state?.businessPlanId) {
        setLoading(true);
        setError(null);
        try {
          const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
          const res = await fetch(`${API_URL}/business-plan/${location.state.businessPlanId}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
          });
          if (!res.ok) throw new Error('Failed to fetch business plan');
          const data = await res.json();
          if (data.businessPlan?.validationScore) {
            setResult({
              validationScore: data.businessPlan.validationScore.score,
              recommendations: [],
              risks: [],
              nextSteps: []
            });
          } else {
            setError('No validation score found for this plan.');
          }
        } catch (err: any) {
          setError(err.message || 'Failed to fetch validation score.');
        } finally {
          setLoading(false);
        }
      }
    }
    fetchScore();
  }, [location.state, result]);

  if (!user?.isSubscribed) {
    return <Navigate to='/' replace />;
  }
  if (loading) {
    return <PageBackground><div style={{ textAlign: 'center', marginTop: '4rem' }}>Loading validation score…</div></PageBackground>;
  }
  if (error) {
    return <PageBackground><div style={{ color: 'red', textAlign: 'center', marginTop: '4rem' }}>{error}</div></PageBackground>;
  }
  if (!result) {
    return <Navigate to='/' replace />;
  }

  let scoreColor = '#dc3545';
  if (result.validationScore >= 80) scoreColor = '#28a745';
  else if (result.validationScore >= 60) scoreColor = '#28a745';

  return (
    <PageBackground>
      <TopBar>
        <img src={logo} alt="ToolThinker Logo" style={{ height: 90, width: 90, borderRadius: 50, cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }} onClick={() => navigate('/')} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <MyPlansButton onClick={() => navigate('/plans')}>My Startup Plans</MyPlansButton>
          {user && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
              {user.profilePic ? (
                <Avatar src={user.profilePic} alt="Profile" onClick={() => setAppState((prev: any) => ({ ...prev, stepBeforeAuth: currentStep, currentStep: 'profile' }))} />
              ) : user.email ? (
                <Initials onClick={() => setAppState((prev: any) => ({ ...prev, stepBeforeAuth: currentStep, currentStep: 'profile' }))}>
                  {user.email.split('@')[0].split(/[._-]/).map(part => part[0]?.toUpperCase()).join('').slice(0, 2) || 'U'}
                </Initials>
              ) : null}
              <PlanBadge>
                {!user?.isSubscribed
                  ? PLAN_DISPLAY_NAMES['free']
                  : PLAN_DISPLAY_NAMES[user?.subscriptionTier || 'basic']}
              </PlanBadge>
            </div>
          )}
        </div>
      </TopBar>
      <Card>
        <Title>Validation Score</Title>
        <Section>
          <Score color={scoreColor}>{result.validationScore}/100</Score>
        </Section>
        <Section>
          <SectionTitle>Recommendations:</SectionTitle>
          <SectionList>
            {result.recommendations?.map((rec: string, i: number) => <li key={i}>{rec}</li>)}
          </SectionList>
        </Section>
        <Section>
          <SectionTitle>Risks:</SectionTitle>
          <SectionList>
            {result.risks?.map((risk: string, i: number) => <li key={i} className="risk">{risk}</li>)}
          </SectionList>
        </Section>
        <Section>
          <SectionTitle>Next Steps:</SectionTitle>
          <SectionList>
            {result.nextSteps?.map((step: string, i: number) => <li key={i}>{step}</li>)}
          </SectionList>
        </Section>
        <ButtonRow>
          <OutlinedButton onClick={() => navigate(-1)}>Back to Market Validation</OutlinedButton>
          <Button onClick={() => navigate('/next-steps-hub', { state: { result, businessPlan: location.state?.businessPlan } })}>Continue to Next Steps</Button>
        </ButtonRow>
      </Card>
    </PageBackground>
  );
}

export default MarketValidationScorePage; 