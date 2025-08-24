import React, { useState } from 'react';
import styled from 'styled-components';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaCheckCircle } from 'react-icons/fa';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const PageContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #f7f7f9;
  padding: 2rem 1rem;
  
  @media (max-width: 768px) {
    padding: 1.5rem 0.5rem;
  }
  
  @media (max-width: 480px) {
    padding: 1rem 0.5rem;
  }
`;

const Card = styled.div`
  background: #fff;
  border-radius: 24px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.12);
  padding: 2.5rem 2rem 2rem 2rem;
  max-width: 420px;
  width: 100%;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  
  @media (max-width: 768px) {
    padding: 2rem 1.5rem 1.5rem 1.5rem;
    border-radius: 20px;
    max-width: 95%;
  }
  
  @media (max-width: 480px) {
    padding: 1.5rem 1rem 1rem 1rem;
    border-radius: 16px;
  }
`;

const PremiumBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(90deg, #ffe066 0%, #ffd700 100%);
  color: #7c5c00;
  font-weight: 700;
  font-size: 1rem;
  border-radius: 999px;
  padding: 0.3rem 1rem 0.3rem 0.8rem;
  margin-bottom: 1.2rem;
  box-shadow: 0 2px 8px rgba(255, 215, 0, 0.12);
  border: 1.5px solid #ffe066;
`;

const Title = styled.h2`
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.7rem;
  color: #222;
  
  @media (max-width: 768px) {
    font-size: 1.8rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1.6rem;
  }
`;

const BenefitsList = styled.ul`
  text-align: left;
  margin: 1.2rem 0 2rem 0;
  padding-left: 1.2rem;
  color: #444;
  font-size: 1.08rem;
  
  @media (max-width: 768px) {
    font-size: 1rem;
    margin: 1rem 0 1.5rem 0;
  }
  
  @media (max-width: 480px) {
    font-size: 0.95rem;
    margin: 0.8rem 0 1.2rem 0;
  }
`;

const Button = styled.button`
  background: #000;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.8rem 1.7rem;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  margin-bottom: 1.1rem;
  width: 100%;
  transition: background 0.2s, box-shadow 0.2s;
  outline: none;
  &:hover, &:focus {
    background: #222;
    box-shadow: 0 2px 8px rgba(0,0,0,0.10);
  }
  
  @media (max-width: 768px) {
    padding: 0.9rem 1.5rem;
    font-size: 1rem;
    margin-bottom: 1rem;
  }
  
  @media (max-width: 480px) {
    padding: 1rem 1.3rem;
    font-size: 0.95rem;
    margin-bottom: 0.9rem;
  }
`;

const ClearGreyButton = styled(Button)`
  background: #fff;
  color: #666;
  border: 2px solid #ccc;
  font-weight: 600;
  box-shadow: none;
  &:hover, &:focus {
    background: #f7f7f7;
    color: #222;
    border-color: #888;
  }
`;

const GoBackButton = styled.button`
  background: #f5f5f7;
  color: #222;
  border: 1.5px solid #e5e5e5;
  border-radius: 8px;
  padding: 0.7rem 1.5rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  margin-top: 1.2rem;
  transition: background 0.2s, color 0.2s;
  &:hover, &:focus {
    background: #e6e6e6;
    color: #222;
  }
`;

const tiers = [
  {
    name: 'Free',
    key: 'free',
    price: '$0',
    priceId: '',
    features: [
      'Access to basic features',
      'Limited business plans',
      'Community support',
    ],
    accent: false,
  },
  {
    name: 'Basic',
    key: 'basic',
    price: '$9.99',
    priceId: 'price_1RfAkSEJVpgloXFqQ8RSblDc',
    features: [
      'Resource Library',
      'Market Validation',
      'Progress Tracker',
    ],
    accent: false,
  },
  {
    name: 'Pro',
    key: 'pro',
    price: '$19.00',
    priceId: 'price_1RerbQEJVpgloXFqB2Fqx3mn',
    features: [
      'Everything in Basic',
      'Course Library',
      'Advanced Analytics',
    ],
    accent: false,
  },
  {
    name: 'Elite',
    key: 'elite',
    price: '$29.00',
    priceId: 'price_1RfAmhEJVpgloXFqk80ZwKEz',
    features: [
      'Everything in Pro',
      '1:1 Coaching',
      'Priority Support',
    ],
    accent: true,
  },
];

const TierGrid = styled.div`
  display: flex;
  gap: 2rem;
  justify-content: center;
  margin: 2rem 0 1.5rem 0;
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    gap: 1.5rem;
    margin: 1.5rem 0 1rem 0;
  }
  
  @media (max-width: 480px) {
    gap: 1rem;
    margin: 1rem 0 0.8rem 0;
    flex-direction: column;
    align-items: center;
  }
`;

const TierCard = styled.div<{ accent?: boolean; current?: boolean }>`
  background: ${({ accent }) => (accent ? '#f8f9fa' : '#fff')};
  border: 2px solid ${({ current, accent }) =>
    current ? '#181a1b' : accent ? '#e5e5e5' : '#e5e5e5'};
  border-radius: 20px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.07);
  padding: 2rem 1.5rem 1.5rem 1.5rem;
  min-width: 260px;
  max-width: 320px;
  flex: 1 1 260px;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  outline: ${({ current }) => (current ? '2px solid #181a1b' : 'none')};
  
  @media (max-width: 768px) {
    padding: 1.5rem 1.2rem 1.2rem 1.2rem;
    min-width: 240px;
    max-width: 300px;
    border-radius: 16px;
  }
  
  @media (max-width: 480px) {
    padding: 1.2rem 1rem 1rem 1rem;
    min-width: 220px;
    max-width: 280px;
    border-radius: 12px;
    width: 100%;
  }
`;

const TierName = styled.h3`
  font-size: 1.3rem;
  font-weight: 700;
  color: #181a1b;
  margin-bottom: 0.5rem;
  
  @media (max-width: 768px) {
    font-size: 1.2rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1.1rem;
  }
`;

const TierPrice = styled.div`
  font-size: 1.7rem;
  font-weight: 700;
  color: #181a1b;
  margin-bottom: 1.2rem;
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
    margin-bottom: 1rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1.4rem;
    margin-bottom: 0.8rem;
  }
`;

const FeatureList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0 0 1.2rem 0;
  width: 100%;
`;

const FeatureItem = styled.li`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 1rem;
  color: #222;
  margin-bottom: 0.5rem;
`;

const TierButton = styled.button<{ current?: boolean }>`
  background: ${({ current }) => (current ? '#181a1b' : '#fff')};
  color: ${({ current }) => (current ? '#fff' : '#181a1b')};
  border: 2px solid #181a1b;
  border-radius: 8px;
  padding: 0.7rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: ${({ current }) => (current ? 'default' : 'pointer')};
  margin-top: 1rem;
  width: 100%;
  transition: background 0.2s, color 0.2s;
  &:hover, &:focus {
    background: ${({ current }) => (current ? '#181a1b' : '#f8f9fa')};
    color: #181a1b;
  }
`;

const AccentBadge = styled.div`
  position: absolute;
  top: -18px;
  right: 18px;
  background: #181a1b;
  color: #fff;
  font-size: 0.85rem;
  font-weight: 700;
  border-radius: 999px;
  padding: 0.3rem 1.1rem;
  letter-spacing: 0.03em;
  box-shadow: 0 2px 8px rgba(24,26,27,0.08);
`;

const PLAN_DISPLAY_NAMES: Record<string, string> = {
  free: 'Free',
  basic: 'Basic',
  pro: 'Pro',
  elite: 'Elite',
};

export function SubscriptionPage() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const businessPlan = location.state?.businessPlan;

  React.useEffect(() => {
    refreshUser();
    // eslint-disable-next-line
  }, []);

  React.useEffect(() => {
    if (user?.isSubscribed && businessPlan) {
      navigate('/market-validation', { state: { businessPlan } });
    }
  }, [user?.isSubscribed, businessPlan, navigate]);

  async function handleSubscribe(priceId: string) {
    if (!user || !user.email) {
      setError('User email not found.');
      return;
    }
    setIsLoading(true);
    setError(null);
    
    console.log('Starting subscription with:', { email: user.email, priceId });
    
    try {
      const res = await fetch(`${API_URL}/stripe/create-checkout-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, priceId }),
      });
      
      console.log('Response status:', res.status);
      const data = await res.json();
      console.log('Response data:', data);
      
      if (!res.ok || !data.url) throw new Error(data.error || 'Failed to create checkout session');
      window.location.href = data.url;
    } catch (err: any) {
      console.error('Subscription error:', err);
      setError(err.message || 'Failed to start subscription');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleManage() {
    if (!user || !user.email) {
      setError('User email not found.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/stripe/create-customer-portal-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || 'Failed to open customer portal');
      window.location.href = data.url;
    } catch (err: any) {
      setError(err.message || 'Failed to open customer portal');
    } finally {
      setIsLoading(false);
    }
  }

  const currentTier = !user?.isSubscribed ? 'free' : user?.subscriptionTier || 'basic';

  return (
    <PageContainer>
      <Title style={{ marginBottom: 0 }}>Choose Your Plan</Title>
      <TierGrid>
        {tiers.map(tier => (
          <TierCard
            key={tier.key}
            accent={tier.accent}
            current={currentTier === tier.key}
          >
            {tier.accent && <AccentBadge>Most Value</AccentBadge>}
            <TierName>{tier.name}</TierName>
            <TierPrice>{tier.price} <span style={{ fontSize: '1rem', fontWeight: 400 }}>/mo</span></TierPrice>
            <FeatureList>
              {tier.features.map((feature, i) => (
                <FeatureItem key={i}><FaCheckCircle style={{ color: '#181a1b', fontSize: '1em' }} /> {feature}</FeatureItem>
              ))}
            </FeatureList>
            {tier.key !== 'free' && (
              currentTier === tier.key && user?.isSubscribed ? (
                <TierButton current disabled>Current Plan</TierButton>
              ) : (
                <TierButton onClick={() => handleSubscribe(tier.priceId)} disabled={isLoading}>
                  {isLoading ? 'Loading...' : tier.key === 'basic' ? 'Start 7-Day Free Trial' : `Upgrade to ${tier.name}`}
                </TierButton>
              )
            )}
          </TierCard>
        ))}
      </TierGrid>
      <GoBackButton type="button" onClick={() => navigate(-1)}>
        Go Back
      </GoBackButton>
      {error && <div style={{ color: 'red', margin: '0.7rem 0' }}>{error}</div>}
    </PageContainer>
  );
}

export default SubscriptionPage; 