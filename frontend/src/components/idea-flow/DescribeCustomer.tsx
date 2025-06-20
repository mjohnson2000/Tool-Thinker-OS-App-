import React, { useState } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 700px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
`;

const Title = styled.h2`
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 2rem;
`;

const Options = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const OptionButton = styled.button<{ isSelected: boolean }>`
  padding: 1rem 2rem;
  font-size: 1.1rem;
  border: 2px solid ${props => props.isSelected ? '#007AFF' : '#E5E5E5'};
  border-radius: 12px;
  background: ${props => props.isSelected ? '#e6f0ff' : 'var(--card-background)'};
  box-shadow: var(--shadow);
  color: var(--text-primary);
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
  &:hover {
    border-color: #007AFF;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  height: 150px;
  padding: 1rem;
  border: 2px solid #E5E5E5;
  border-radius: 12px;
  font-size: 1rem;
  margin-bottom: 1.5rem;
  resize: none;
  &:focus {
    outline: none;
    border-color: #007AFF;
  }
`;

const ContinueButton = styled.button`
  background: #007AFF;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
  &:hover {
    background: #0056b3;
  }
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

interface DescribeCustomerProps {
  onSubmit: (customerDescription: string | null) => void;
}

export function DescribeCustomer({ onSubmit }: DescribeCustomerProps) {
  const [knowsCustomer, setKnowsCustomer] = useState<boolean | null>(null);
  const [description, setDescription] = useState('');

  const handleSelect = (knows: boolean) => {
    setKnowsCustomer(knows);
  };

  const handleSubmit = () => {
    if (knowsCustomer === null) return;
    onSubmit(knowsCustomer ? description : null);
  };

  return (
    <Container>
      <Title>Do you know who your customer is?</Title>
      <Options>
        <OptionButton isSelected={knowsCustomer === true} onClick={() => handleSelect(true)}>
          Yes
        </OptionButton>
        <OptionButton isSelected={knowsCustomer === false} onClick={() => handleSelect(false)}>
          No
        </OptionButton>
      </Options>

      {knowsCustomer === true && (
        <TextArea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe your customer. What are their characteristics?"
        />
      )}

      {knowsCustomer !== null && (
        <ContinueButton onClick={handleSubmit} disabled={knowsCustomer === true && !description.trim()}>
          Continue
        </ContinueButton>
      )}
    </Container>
  );
} 