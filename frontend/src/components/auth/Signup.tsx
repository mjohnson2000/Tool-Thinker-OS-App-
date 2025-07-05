import React, { useState } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  max-width: 400px;
  margin: 2rem auto;
  padding: 2rem;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  text-align: center;
`;

const Title = styled.h1`
  font-size: 1.8rem;
  color: #333;
  margin-bottom: 2rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.8rem;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  margin-bottom: 1rem;
`;

const Button = styled.button`
  width: 100%;
  padding: 0.9rem;
  font-size: 1rem;
  font-weight: 500;
  color: #fff;
  background-color: #007aff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #0056b3;
  }
  &:disabled {
    background: #b3d4fc;
    cursor: not-allowed;
  }
`;

const Subtext = styled.p`
  margin-top: 1.5rem;
  font-size: 0.9rem;
  color: #666;
`;

const Link = styled.a`
  color: #007aff;
  cursor: pointer;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

const ErrorMessage = styled.div`
  color: #dc3545;
  font-size: 0.95rem;
  margin-bottom: 1rem;
`;

interface SignupProps {
  onSignup: (email: string, password: string) => Promise<void>;
  onLogin: () => void;
}

export function Signup({ onSignup, onLogin }: SignupProps) {
  // Render nothing so the /app page is just a blank entry point for unauthenticated users
  return null;
} 