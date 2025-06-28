import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { fetchChatGPT } from '../../utils/chatgpt';
import { useNavigate } from 'react-router-dom';

interface BusinessPlan {
  summary: string;
  sections: { [key: string]: string };
}

interface MarketValidationProps {
  businessPlan: BusinessPlan;
  onComplete?: (result: any) => void;
}

const Container = styled.div`
  max-width: 700px;
  margin: 2rem auto;
  padding: 2rem;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.08);
`;

const Title = styled.h2`
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: #222;
`;

const Section = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  font-weight: 500;
  display: block;
  margin-bottom: 0.5rem;
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 1.5px solid #e5e5e5;
  border-radius: 8px;
  font-size: 1rem;
  min-height: 80px;
  margin-bottom: 1rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.7rem;
  border: 1.5px solid #e5e5e5;
  border-radius: 8px;
  font-size: 1rem;
  margin-bottom: 1rem;
`;

const Button = styled.button`
  background: #007aff;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.8rem 2rem;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  margin-top: 1rem;
  transition: background 0.2s;
  &:hover {
    background: #0056b3;
  }
`;

const ResultBox = styled.div`
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1.5rem;
  margin-top: 2rem;
`;

export function MarketValidation({ businessPlan, onComplete }: MarketValidationProps) {
  const [competitors, setCompetitors] = useState('');
  const [marketSize, setMarketSize] = useState('');
  const [customerResearch, setCustomerResearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function generateSuggestions() {
      setIsGenerating(true);
      setError(null);
      try {
        const prompt = `Given the following business plan summary and sections, suggest 3 main competitors, a market size estimate, and 3 customer research questions. Return as JSON with keys: competitors (array), marketSize (string), customerResearch (array).\nSummary: ${businessPlan.summary}\nSections: ${Object.entries(businessPlan.sections).map(([k,v]) => `${k}: ${v}`).join(' | ')}`;
        const response = await fetchChatGPT(prompt);
        const data = typeof response === 'string' ? JSON.parse(response) : response;
        setCompetitors((data.competitors || []).join('\n'));
        setMarketSize(data.marketSize || '');
        setCustomerResearch((data.customerResearch || []).join('\n'));
      } catch (e) {
        setError('Could not generate suggestions.');
      } finally {
        setIsGenerating(false);
      }
    }
    generateSuggestions();
  }, [businessPlan]);

  function handleValidate() {
    setIsLoading(true);
    setError(null);
    setTimeout(() => {
      const mockResult = {
        validationScore: 75,
        recommendations: [
          'Interview at least 10 potential customers.',
          'Research 3 more competitors.',
          'Refine your market size estimate.'
        ],
        risks: [
          'Market size may be overestimated.',
          'Competition is strong.'
        ],
        nextSteps: [
          'Build a landing page.',
          'Collect emails from interested users.'
        ]
      };
      setResult(mockResult);
      setIsLoading(false);
      if (onComplete) onComplete(mockResult);
      navigate('/validation-score', { state: { result: mockResult } });
    }, 1200);
  }

  return (
    <Container>
      <Title>Market Validation</Title>
      <Section>
        <Label>Business Plan Summary</Label>
        <div style={{ background: '#f5f7fa', borderRadius: 8, padding: '1rem', marginBottom: 8 }}>{businessPlan.summary}</div>
      </Section>
      <Section>
        <Label>Key Sections</Label>
        <ul>
          {Object.entries(businessPlan.sections).map(([section, content]) => (
            <li key={section}><strong>{section}:</strong> {content}</li>
          ))}
        </ul>
      </Section>
      {isGenerating ? (
        <div style={{ color: '#007aff', margin: '2rem 0' }}>Generating suggestions...</div>
      ) : (
        <>
          <Section>
            <Label htmlFor="competitors">Main Competitors</Label>
            <TextArea
              id="competitors"
              value={competitors}
              onChange={e => setCompetitors(e.target.value)}
              placeholder="List your main competitors (one per line)"
            />
          </Section>
          <Section>
            <Label htmlFor="marketSize">Market Size Estimate</Label>
            <Input
              id="marketSize"
              value={marketSize}
              onChange={e => setMarketSize(e.target.value)}
              placeholder="e.g., $1B, 10,000 customers, etc."
            />
          </Section>
          <Section>
            <Label htmlFor="customerResearch">Customer Research Questions</Label>
            <TextArea
              id="customerResearch"
              value={customerResearch}
              onChange={e => setCustomerResearch(e.target.value)}
              placeholder="What do you want to learn from customers?"
            />
          </Section>
          {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}
          <Button onClick={handleValidate} disabled={isLoading || !competitors || !marketSize || !customerResearch}>
            {isLoading ? 'Validating...' : 'Validate Market'}
          </Button>
        </>
      )}
    </Container>
  );
}

export default MarketValidation; 