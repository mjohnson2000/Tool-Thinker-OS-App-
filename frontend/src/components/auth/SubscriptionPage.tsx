import React, { useState } from 'react';
import styled from 'styled-components';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const PageContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #f7f7f9;
  padding: 2rem 1rem;
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
`;

const BenefitsList = styled.ul`
  text-align: left;
  margin: 1.2rem 0 2rem 0;
  padding-left: 1.2rem;
  color: #444;
  font-size: 1.08rem;
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

  async function handleSubscribe() {
    if (!user || !user.email) {
      setError('User email not found.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || 'Failed to create checkout session');
      window.location.href = data.url;
    } catch (err: any) {
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
      const res = await fetch('/api/stripe/create-customer-portal-session', {
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

  return (
    <PageContainer>
      <Card>
        {user && user.isSubscribed && (
          <PremiumBadge title="Premium Subscriber">
            <span role="img" aria-label="Crown">👑</span> Premium Subscriber
          </PremiumBadge>
        )}
        <Title>{user && user.isSubscribed ? 'Manage Your Subscription' : 'Upgrade to Premium'}</Title>
        <BenefitsList>
          <li>Access Market Validation and Validation Score features</li>
          <li>Unlock AI-powered business insights</li>
          <li>Priority support and early access to new features</li>
        </BenefitsList>
        {user && user.isSubscribed ? (
          <ClearGreyButton type="button" onClick={handleManage} disabled={isLoading}>
            {isLoading ? 'Loading...' : 'Manage Subscription'}
          </ClearGreyButton>
        ) : (
          <Button type="button" onClick={handleSubscribe} disabled={isLoading}>
            {isLoading ? 'Redirecting to Stripe...' : 'Subscribe to Premium'}
          </Button>
        )}
        {error && <div style={{ color: 'red', margin: '0.7rem 0' }}>{error}</div>}
        <GoBackButton type="button" onClick={() => navigate(-1)}>
          Go Back
        </GoBackButton>
      </Card>
    </PageContainer>
  );
}

export default SubscriptionPage; 