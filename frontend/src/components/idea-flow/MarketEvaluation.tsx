import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { fetchChatGPT } from '../../utils/chatgpt';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/logo.png';
import { useAuth } from '../../contexts/AuthContext';

interface StartupPlan {
  summary: string;
  sections: { [key: string]: string };
  _id: string;
}

interface MarketEvaluationProps {
  startupPlan: StartupPlan;
  onComplete?: (result: any) => void;
  setAppState: React.Dispatch<React.SetStateAction<any>>;
  currentStep: string;
}

const PageBackground = styled.div`
  min-height: 100vh;
  background: #f6f7f9;
  display: flex;
  flex-direction: column;
`;

const TopBar = styled.div`
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 2rem 1rem 1.5rem 1rem;
  background: transparent;
  
  @media (max-width: 768px) {
    padding: 1.5rem 1rem 1rem 1rem;
  }
`;

const Card = styled.div`
  max-width: 800px;
  margin: 0 auto;
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.08);
  padding: 2.5rem 2rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  
  @media (max-width: 768px) {
    margin: 0 1rem;
    padding: 2rem 1.5rem;
    border-radius: 16px;
  }
  
  @media (max-width: 480px) {
    margin: 0 0.5rem;
    padding: 1.5rem 1rem;
  }
`;

const Title = styled.h1`
  font-size: 2.2rem;
  font-weight: 700;
  color: #222;
  margin-bottom: 0.5rem;
  text-align: center;
  
  @media (max-width: 768px) {
    font-size: 1.8rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1.6rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1.15rem;
  color: #444;
  margin-bottom: 1.5rem;
  text-align: center;
  line-height: 1.5;
  
  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #f0f1f3;
  &:last-child { border-bottom: none; }
`;

const Label = styled.label`
  font-weight: 600;
  color: #181a1b;
  margin-bottom: 0.2rem;
  font-size: 1.1rem;
  
  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const Helper = styled.span`
  font-size: 0.95rem;
  color: #6c757d;
  margin-bottom: 0.3rem;
  
  @media (max-width: 768px) {
    font-size: 0.9rem;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 1rem;
  border: 1.5px solid #e5e7eb;
  border-radius: 12px;
  font-size: 1rem;
  background: #f9fafb;
  margin-bottom: 0.2rem;
  transition: border 0.2s;
  resize: vertical;
  min-height: 100px;
  
  &:focus { 
    border-color: #181a1b; 
    outline: none; 
    box-shadow: 0 0 0 3px rgba(24,26,27,0.1);
  }
  
  @media (max-width: 768px) {
    padding: 0.8rem;
    font-size: 0.95rem;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 1rem;
  border: 1.5px solid #e5e7eb;
  border-radius: 12px;
  font-size: 1rem;
  background: #f9fafb;
  margin-bottom: 0.2rem;
  transition: border 0.2s;
  
  &:focus { 
    border-color: #181a1b; 
    outline: none; 
    box-shadow: 0 0 0 3px rgba(24,26,27,0.1);
  }
  
  @media (max-width: 768px) {
    padding: 0.8rem;
    font-size: 0.95rem;
  }
`;

const Button = styled.button`
  background: #181a1b;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.8rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  margin-top: 0.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  transition: background 0.2s, box-shadow 0.2s;
  width: 100%;
  max-width: 300px;
  margin-left: auto;
  margin-right: auto;
  display: block;
  
  &:hover { 
    background: #000; 
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  }
  
  &:disabled {
    background: #6c757d;
    cursor: not-allowed;
  }
  
  @media (max-width: 768px) {
    padding: 0.7rem 1.2rem;
    font-size: 0.95rem;
  }
`;

const ResultBox = styled.div`
  background: #f8f9fa;
  border-radius: 12px;
  padding: 1.5rem;
  margin-top: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  border: 1px solid #e9ecef;
  
  @media (max-width: 768px) {
    padding: 1.2rem;
  }
`;

const StartupPlanSummary = styled.div`
  background: #f5f7fa;
  border-radius: 10px;
  padding: 1rem;
  color: #222;
  font-size: 1.05rem;
  margin-bottom: 4px;
  line-height: 1.5;
  
  @media (max-width: 768px) {
    font-size: 1rem;
    padding: 0.8rem;
  }
`;

const SectionList = styled.ul`
  margin: 0;
  padding-left: 18px;
  
  li {
    margin-bottom: 0.5rem;
    line-height: 1.4;
    
    strong {
      color: #181a1b;
    }
  }
  
  @media (max-width: 768px) {
    padding-left: 16px;
    
    li {
      font-size: 0.95rem;
    }
  }
`;

const LoadingMessage = styled.div`
  color: #181a1b;
  margin: 2rem 0;
  text-align: center;
  font-weight: 500;
  font-size: 1.1rem;
  
  @media (max-width: 768px) {
    font-size: 1rem;
    margin: 1.5rem 0;
  }
`;

const ErrorMessage = styled.div`
  color: #dc3545;
  margin: 1rem 0;
  text-align: center;
  font-size: 0.95rem;
`;

const Avatar = styled.img`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  object-fit: cover;
  background: #e5e5e5;
  cursor: pointer;
  
  @media (max-width: 768px) {
    width: 40px;
    height: 40px;
  }
`;


const Initials = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: #181a1b22;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: #181a1b;
  font-weight: 700;
  cursor: pointer;
  
  @media (max-width: 768px) {
    width: 40px;
    height: 40px;
    font-size: 18px;
  }
`;

const MyPlansButton = styled.button`
  background: #fff;
  color: #181a1b;
  border: 1.5px solid #181a1b;
  border-radius: 8px;
  padding: 0.6rem 1.2rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  margin-left: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  transition: background 0.2s, color 0.2s, border 0.2s;
  &:hover {
    background: #181a1b;
    color: #fff;
    border-color: #181a1b;
  }
`;

export function MarketEvaluation({ startupPlan, onComplete, setAppState, currentStep }: MarketEvaluationProps) {
  const { user } = useAuth();
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
        const prompt = `Given the following startup plan summary and sections, suggest 3 main competitors, a market size estimate, and 3 customer research questions. Return as JSON with keys: competitors (array), marketSize (string), customerResearch (array).\nSummary: ${startupPlan.summary}\nSections: ${Object.entries(startupPlan.sections).map(([k,v]) => `${k}: ${v}`).join(' | ')}`;
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
  }, [startupPlan]);

  async function handleValidate() {
    setIsLoading(true);
    setError(null);
    try {
      // Simulate validation result (replace with real logic as needed)
      const mockResult = {
        evaluationScore: 75,
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
      // Save evaluation score to backend
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
      await fetch(`${API_URL}/startup-plan/${startupPlan._id}/evaluation-score`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ score: mockResult.evaluationScore })
      });
      setIsLoading(false);
      if (onComplete) onComplete(mockResult);
      navigate('/evaluation-score', { state: { result: mockResult, startupPlanId: startupPlan._id } });
    } catch (err) {
      setError('Failed to validate and save score.');
      setIsLoading(false);
    }
  }

  return (
    <PageBackground>
      <TopBar>
        <img src={logo} alt="ToolThinker Logo" style={{ height: 90, width: 90, borderRadius: 50, cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }} onClick={() => {
          if (typeof setAppState === 'function') {
            setAppState((prev: any) => ({ ...prev, currentStep: 'landing', idea: { interests: '', area: null, existingIdeaText: '' }, customer: null, job: null, problemDescription: null, solutionDescription: null, competitionDescription: null }));
          }
          navigate('/');
        }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <MyPlansButton onClick={() => navigate('/plans')}>My Business Plans</MyPlansButton>
          {user && (
            user.profilePic ? (
              <Avatar src={user.profilePic} alt="Profile" onClick={() => setAppState((prev: any) => ({ ...prev, stepBeforeAuth: currentStep, currentStep: 'profile' }))} />
            ) : user.email ? (
              <Initials onClick={() => setAppState((prev: any) => ({ ...prev, stepBeforeAuth: currentStep, currentStep: 'profile' }))}>
                {user.email.split('@')[0].split(/[._-]/).map(part => part[0]?.toUpperCase()).join('').slice(0, 2) || 'U'}
              </Initials>
            ) : null
          )}
        </div>
      </TopBar>
      <Card>
        <div>
          <Title>Market Evaluation</Title>
          <Subtitle>Validate your business idea with AI-powered insights. Review competitors, estimate your market, and craft customer research questions—all in one place.</Subtitle>
        </div>
        <Section>
          <Label>Startup Plan Summary</Label>
          <Helper>A quick overview of your business idea.</Helper>
          <StartupPlanSummary>{startupPlan.summary}</StartupPlanSummary>
        </Section>
        <Section>
          <Label>Key Sections</Label>
          <Helper>Core details from your startup plan.</Helper>
          <SectionList>
            {Object.entries(startupPlan.sections).map(([section, content]) => (
              <li key={section}><strong>{section}:</strong> {content}</li>
            ))}
          </SectionList>
        </Section>
        {isGenerating ? (
          <LoadingMessage>Generating suggestions…</LoadingMessage>
        ) : (
          <>
            <Section>
              <Label htmlFor="competitors">Main Competitors</Label>
              <Helper>Who else is solving this problem?</Helper>
              <TextArea
                id="competitors"
                value={competitors}
                onChange={e => setCompetitors(e.target.value)}
                placeholder="List your main competitors (one per line)"
              />
            </Section>
            <Section>
              <Label htmlFor="marketSize">Market Size Estimate</Label>
              <Helper>How big is your target market?</Helper>
              <Input
                id="marketSize"
                value={marketSize}
                onChange={e => setMarketSize(e.target.value)}
                placeholder="e.g., $1B, 10,000 customers, etc."
              />
            </Section>
            <Section>
              <Label htmlFor="customerResearch">Customer Research Questions</Label>
              <Helper>What do you need to learn from potential customers?</Helper>
              <TextArea
                id="customerResearch"
                value={customerResearch}
                onChange={e => setCustomerResearch(e.target.value)}
                placeholder="List your research questions (one per line)"
              />
            </Section>
            {error && <ErrorMessage>{error}</ErrorMessage>}
            <Button onClick={handleValidate} disabled={isLoading}>
              {isLoading ? 'Evaluating…' : 'Evaluate My Plan'}
            </Button>
          </>
        )}
        {result && (
          <ResultBox>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 8 }}>Evaluation Results</h3>
            <div style={{ marginBottom: 8 }}><strong>Score:</strong> {result.evaluationScore}/100</div>
            <div style={{ marginBottom: 8 }}><strong>Recommendations:</strong>
              <ul style={{ margin: 0, paddingLeft: 18 }}>{result.recommendations.map((rec: string, i: number) => <li key={i}>{rec}</li>)}</ul>
            </div>
            <div style={{ marginBottom: 8 }}><strong>Risks:</strong>
              <ul style={{ margin: 0, paddingLeft: 18 }}>{result.risks.map((risk: string, i: number) => <li key={i} className="risk">{risk}</li>)}</ul>
            </div>
            <div><strong>Next Steps:</strong>
              <ul style={{ margin: 0, paddingLeft: 18 }}>{result.nextSteps.map((step: string, i: number) => <li key={i}>{step}</li>)}</ul>
            </div>
          </ResultBox>
        )}
      </Card>
    </PageBackground>
  );
}

export default MarketEvaluation; 