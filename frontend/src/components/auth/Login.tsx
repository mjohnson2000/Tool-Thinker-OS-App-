import React, { useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const API_URL = import.meta.env.VITE_API_URL;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 400px;
  margin: 2rem auto;
  padding: 2rem;
`;

const Title = styled.h2`
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  text-align: center;
`;

const Form = styled.form`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #E5E5E5;
  border-radius: 8px;
  font-size: 1rem;
  background: #fafbfc;
  &:focus {
    outline: none;
    border-color: #ededed;
    background: #fafbfc;
  }
`;

const Button = styled.button`
  background: #181a1b;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.75rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
  &:hover {
    background: #000;
  }
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const LinkButton = styled.button`
  background: none;
  color: #181a1b;
  border: none;
  box-shadow: none;
  font-weight: 500;
  padding: 0;
  font-size: 1rem;
  cursor: pointer;
  text-decoration: none;
  transition: color 0.2s;
  &:hover {
    color: #000;
    text-decoration: underline;
  }
`;

const ErrorMessage = styled.div`
  color: #dc3545;
  font-size: 0.9rem;
  margin-top: 0.5rem;
`;

const SwitchText = styled.p`
  margin-top: 1rem;
  font-size: 1rem;
  color: #555;
  text-align: center;
`;

interface LoginProps {
  onLogin: (email: string, password: string) => Promise<void>;
  onSignup: () => void;
  onRequestPasswordReset?: (email: string) => Promise<void>;
}

export function Login({ onLogin, onSignup, onRequestPasswordReset }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetMessage, setResetMessage] = useState<string | null>(null);
  const [resetError, setResetError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    setIsLoading(true);
    try {
      await onLogin(email, password);
    } catch (err: any) {
      setError(err.message || 'Failed to log in');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetMessage(null);
    setResetError(null);
    if (!resetEmail) {
      setResetError('Please enter your email');
      return;
    }
    try {
      if (onRequestPasswordReset) {
        await onRequestPasswordReset(resetEmail);
        setResetMessage('Password reset email sent! Check your inbox.');
      } else {
        setResetError('Password reset not available.');
      }
    } catch (err: any) {
      setResetError(err.message || 'Failed to send reset email');
    }
  };

  return (
    <Container>
      <Title>Log In to Your Account</Title>
      {!showReset ? (
        <>
          <Form onSubmit={handleSubmit}>
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {error && <ErrorMessage>{error}</ErrorMessage>}
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Logging in...' : 'Log In'}
            </Button>
          </Form>
          <SwitchText>
            <LinkButton type="button" onClick={onSignup}>
              Sign Up
            </LinkButton>
          </SwitchText>
          <SwitchText>
            <LinkButton type="button" onClick={() => setShowReset(true)}>
              Forgot password?
            </LinkButton>
          </SwitchText>
        </>
      ) : (
        <>
          <Form onSubmit={handleReset}>
            <Input
              type="email"
              placeholder="Enter your email"
              value={resetEmail}
              onChange={e => setResetEmail(e.target.value)}
              required
            />
            {resetError && <ErrorMessage>{resetError}</ErrorMessage>}
            {resetMessage && <div style={{ color: '#007AFF', marginBottom: 8 }}>{resetMessage}</div>}
            <Button type="submit">Send Reset Email</Button>
          </Form>
          <SwitchText>
            <LinkButton type="button" onClick={() => setShowReset(false)}>
              Back to login
            </LinkButton>
          </SwitchText>
        </>
      )}
    </Container>
  );
} 