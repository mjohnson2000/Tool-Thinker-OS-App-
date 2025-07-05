import React from 'react';
import styled from 'styled-components';



const Container = styled.div`
  max-width: 700px;
  margin: 4rem auto;
  padding: 2.5rem 2rem;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.08);
  text-align: center;
`;

const Title = styled.h1`
  font-size: 2.3rem;
  font-weight: 700;
  color: #181a1b;
  margin-bottom: 1.5rem;
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  color: #444;
  margin-bottom: 2.5rem;
`;

const CTAButton = styled.button`
  background: #181a1b;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 1rem 2.5rem;
  font-size: 1.15rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  transition: background 0.2s;
  margin-top: 2rem;
  &:hover {
    background: #000;
  }
`;



export function LaunchPreparationPage() {
  return (
    <Container>
      <Title>Ready to Launch Your Business?</Title>
      <Subtitle>
        Congratulations! You now have a validated business model. <br />
        The journey ahead is all about execution, learning, and growth.<br /><br />
        On the next steps, you'll get guidance on:
        <ul style={{ textAlign: 'left', margin: '1.5rem auto', maxWidth: 480 }}>
          <li>Setting up your business operations</li>
          <li>Building your first product or service</li>
          <li>Acquiring your first customers</li>
          <li>Tracking your progress and iterating</li>
        </ul>
        Stay focused, be persistent, and remember: every great business started with a single step.
      </Subtitle>
      <CTAButton>Get Started</CTAButton>
    </Container>
  );
} 