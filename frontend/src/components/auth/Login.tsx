import React, { useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { trackUserLogin } from '../../utils/analytics';

const API_URL = import.meta.env.VITE_API_URL;

const GlassCard = styled.div`
  max-width: 480px;
  margin: 4rem auto 2rem auto;
  padding: 3rem 2.5rem 2.5rem 2.5rem;
  background: linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,249,250,0.95) 100%);
  border-radius: 24px;
  box-shadow: 
    0 20px 60px rgba(24,26,27,0.12),
    0 8px 24px rgba(24,26,27,0.08);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255,255,255,0.8);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #181a1b, #4a4a4a, #181a1b);
    border-radius: 24px 24px 0 0;
  }
  
  @media (max-width: 768px) {
    margin: 2rem auto 1rem auto;
    padding: 2rem 1.5rem 1.5rem 1.5rem;
    border-radius: 20px;
  }
`;

const Title = styled.h1`
  font-size: 2.4rem;
  font-weight: 800;
  color: #181a1b;
  margin-bottom: 2.5rem;
  text-align: center;
  letter-spacing: -0.03em;
  background: linear-gradient(135deg, #181a1b 0%, #4a4a4a 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -12px;
    left: 50%;
    transform: translateX(-50%);
    width: 60px;
    height: 3px;
    background: linear-gradient(90deg, #181a1b, #4a4a4a);
    border-radius: 2px;
  }
  
  @media (max-width: 768px) {
    font-size: 2rem;
    margin-bottom: 2rem;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 1.2rem 1.2rem;
  font-size: 1.1rem;
  border: 2px solid rgba(24, 26, 27, 0.1);
  border-radius: 16px;
  margin-bottom: 1.5rem;
  background: linear-gradient(135deg, #ffffff 0%, #fafbfc 100%);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  
  &::placeholder {
    color: #9ca3af;
    font-weight: 400;
  }
  
  &:focus {
    outline: none;
    border-color: #181a1b;
    box-shadow: 0 4px 16px rgba(24,26,27,0.12);
    background: #ffffff;
    transform: translateY(-1px);
  }
  
  @media (max-width: 768px) {
    padding: 1rem 1rem;
    font-size: 1rem;
  }
`;

const Button = styled.button`
  width: 100%;
  padding: 1.2rem;
  font-size: 1.1rem;
  font-weight: 700;
  color: #fff;
  background: linear-gradient(135deg, #181a1b 0%, #2d2d2d 100%);
  border: none;
  border-radius: 16px;
  cursor: pointer;
  margin-top: 0.5rem;
  box-shadow: 0 4px 12px rgba(24,26,27,0.15);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  letter-spacing: 0.02em;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
    transition: left 0.6s ease;
  }
  
  &:hover {
    background: linear-gradient(135deg, #000 0%, #181a1b 100%);
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(24,26,27,0.25);
    
    &::before {
      left: 100%;
    }
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(24, 26, 27, 0.1);
  }
  
  &:disabled {
    background: linear-gradient(135deg, #e5e5e5 0%, #d1d5db 100%);
    color: #9ca3af;
    cursor: not-allowed;
    transform: none;
    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  }
  
  @media (max-width: 768px) {
    padding: 1rem;
    font-size: 1rem;
  }
`;

const ErrorMessage = styled.div`
  color: #dc3545;
  font-size: 1rem;
  margin-bottom: 1.5rem;
  text-align: center;
  padding: 0.8rem 1rem;
  background: linear-gradient(135deg, rgba(220, 53, 69, 0.1) 0%, rgba(220, 53, 69, 0.05) 100%);
  border-radius: 12px;
  border: 1px solid rgba(220, 53, 69, 0.2);
  font-weight: 500;
`;

const Subtext = styled.p`
  margin-top: 2rem;
  font-size: 1rem;
  color: var(--text-secondary);
  text-align: center;
  line-height: 1.5;
`;

const Link = styled.a`
  color: #181a1b;
  cursor: pointer;
  text-decoration: none;
  font-weight: 700;
  transition: all 0.2s ease;
  padding: 0.2rem 0.4rem;
  border-radius: 6px;
  
  &:hover {
    background: rgba(24, 26, 27, 0.05);
    text-decoration: none;
  }
`;

interface LoginProps {
  onLogin: (email: string, password: string) => Promise<void>;
  onSignup: () => void;
  onRequestPasswordReset?: (email: string) => Promise<void>;
}

export function Login({ onLogin, onSignup, onRequestPasswordReset }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await onLogin(email, password);
      // Track successful login
      trackUserLogin('email');
    } catch (err: any) {
      setError(err.message || 'Failed to log in');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <GlassCard>
      <Title>Log In</Title>
      <form onSubmit={handleSubmit} autoComplete="off">
        {error && <ErrorMessage>{error}</ErrorMessage>}
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          autoFocus
        />
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Logging in...' : 'Log In'}
        </Button>
      </form>
      <Subtext>
        Don&apos;t have an account?{' '}
        <Link as="button" onClick={onSignup}>Sign up</Link>
      </Subtext>
      {onRequestPasswordReset && (
        <Subtext>
          <Link as="button" onClick={() => onRequestPasswordReset(email)}>
            Forgot password?
          </Link>
        </Subtext>
      )}
    </GlassCard>
  );
} 