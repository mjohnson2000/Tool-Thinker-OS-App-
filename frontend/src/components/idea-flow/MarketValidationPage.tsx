import React from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import MarketValidation from './MarketValidation';

export function MarketValidationPage({ setAppState, currentStep }: { setAppState: any, currentStep: string }) {
  const { user } = useAuth();
  const location = useLocation();
  const businessPlan = location.state?.businessPlan;

  if (!user?.isSubscribed) {
    return <Navigate to='/' replace />;
  }
  if (!businessPlan) {
    return <Navigate to='/' replace />;
  }
  return <MarketValidation businessPlan={businessPlan} setAppState={setAppState} currentStep={currentStep} />;
}

export default MarketValidationPage; 