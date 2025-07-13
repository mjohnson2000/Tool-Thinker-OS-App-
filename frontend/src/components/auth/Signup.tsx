import React, { useState } from 'react';
import styled from 'styled-components';

const GlassCard = styled.div`
  max-width: 420px;
  margin: 3.5rem auto 2rem auto;
  padding: 2.5rem 2rem 2rem 2rem;
  background: rgba(255,255,255,0.85);
  border-radius: 18px;
  box-shadow: 0 8px 32px 0 rgba(24,26,27,0.10);
  backdrop-filter: blur(12px);
  border: 1.5px solid #e5e5e5;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 800;
  color: #181a1b;
  margin-bottom: 2.2rem;
  text-align: center;
`;

const Input = styled.input`
  width: 100%;
  padding: 1.1rem 1rem;
  font-size: 1.08rem;
  border: 2px solid #e5e5e5;
  border-radius: 12px;
  margin-bottom: 1.2rem;
  background: #fafbfc;
  transition: border-color 0.2s, box-shadow 0.2s;
  &:focus {
    outline: none;
    border-color: #181a1b;
    box-shadow: 0 2px 8px rgba(24,26,27,0.08);
    background: #fff;
  }
`;

const Button = styled.button`
  width: 100%;
  padding: 1.1rem;
  font-size: 1.08rem;
  font-weight: 700;
  color: #fff;
  background: #181a1b;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  margin-top: 0.2rem;
  box-shadow: 0 2px 8px rgba(24,26,27,0.08);
  transition: background 0.2s, color 0.2s, box-shadow 0.2s;
  &:hover, &:focus {
    background: #000;
    color: #fff;
    box-shadow: 0 4px 16px rgba(24,26,27,0.12);
  }
  &:disabled {
    background: #e5e5e5;
    color: #aaa;
    cursor: not-allowed;
  }
`;

const Subtext = styled.p`
  margin-top: 1.5rem;
  font-size: 1rem;
  color: #666;
  text-align: center;
`;

const Link = styled.a`
  color: #181a1b;
  cursor: pointer;
  text-decoration: none;
  font-weight: 700;
  &:hover {
    text-decoration: underline;
  }
`;

const ErrorMessage = styled.div`
  color: #dc3545;
  font-size: 1rem;
  margin-bottom: 1.2rem;
  text-align: center;
`;

interface SignupProps {
  onSignup: (email: string, password: string) => Promise<void>;
  onLogin: () => void;
}

export function Signup({ onSignup, onLogin }: SignupProps) {
  console.log('Signup component rendered');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);
    try {
      await onSignup(email, password);
    } catch (err: any) {
      setError(err.message || 'Failed to sign up');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <GlassCard>
      <Title>Create Your Account</Title>
      <form onSubmit={handleSubmit} autoComplete="off">
        {error && <ErrorMessage>{error}</ErrorMessage>}
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoFocus
        />
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Creating Account...' : 'Sign Up'}
        </Button>
      </form>
      <Subtext>
        Already have an account? <Link onClick={onLogin}>Log in</Link>
      </Subtext>
    </GlassCard>
  );
} 