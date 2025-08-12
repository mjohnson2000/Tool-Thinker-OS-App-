import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useParams, useNavigate } from 'react-router-dom';
import { FaMagic, FaSave, FaTimes, FaSpinner, FaCheckCircle } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  
  @media (max-width: 768px) {
    padding: 1rem 0.5rem;
  }
`;

const FormCard = styled.div`
  background: linear-gradient(135deg, #ffffff 0%, #fafbfc 100%);
  border-radius: 20px;
  padding: 2.5rem;
  box-shadow: 
    0 4px 20px rgba(0,0,0,0.08),
    0 1px 3px rgba(0,0,0,0.1);
  border: 1px solid rgba(255,255,255,0.8);
  width: 100%;
  margin-top: 1.5rem;
  position: relative;
  overflow: hidden;
  
  @media (max-width: 768px) {
    padding: 1.5rem 1rem;
    margin-top: 1rem;
    border-radius: 16px;
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, #181a1b, #4a4a4a, #181a1b);
    border-radius: 20px 20px 0 0;
    
    @media (max-width: 768px) {
      border-radius: 16px 16px 0 0;
    }
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 100%);
    pointer-events: none;
  }
`;

const Title = styled.h1`
  font-family: 'Audiowide', 'Courier New', monospace;
  font-size: 2.4rem;
  font-weight: 400;
  margin-bottom: 1.2rem;
  text-align: center;
  color: #181a1b;
  letter-spacing: -0.03em;
  position: relative;
  font-display: swap;
  
  @media (max-width: 768px) {
    font-size: 2rem;
    margin-bottom: 1rem;
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: -8px;
    left: 50%;
    transform: translateX(-50%);
    width: 60px;
    height: 3px;
    background: linear-gradient(90deg, #181a1b, #4a4a4a);
    border-radius: 2px;
  }
`;

const Section = styled.div`
  margin-bottom: 2rem;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  position: relative;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  @media (max-width: 768px) {
    padding: 1.2rem;
    margin-bottom: 1.5rem;
  }
  

  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.12);
    background: linear-gradient(135deg, #f8f9fa 0%, #f1f3f4 100%);
  }
`;

const SectionLabel = styled.h2`
  font-family: 'Audiowide', 'Courier New', monospace;
  font-size: 1.3rem;
  font-weight: 400;
  color: #181a1b;
  margin-bottom: 1rem;
  font-display: swap;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -4px;
    left: 0;
    width: 40px;
    height: 2px;
    background: linear-gradient(90deg, #181a1b, #4a4a4a);
    border-radius: 1px;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 120px;
  border-radius: 12px;
  border: 2px solid #e9ecef;
  padding: 1rem 1.2rem;
  font-size: 1rem;
  line-height: 1.6;
  color: #333;
  background: #ffffff;
  margin-bottom: 1rem;
  resize: vertical;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: inset 0 1px 3px rgba(0,0,0,0.05);
  
  &:focus {
    outline: none;
    border-color: #181a1b;
    box-shadow: 0 0 0 3px rgba(24, 26, 27, 0.1), inset 0 1px 3px rgba(0,0,0,0.05);
    background: #ffffff;
  }
  
  &:hover {
    border-color: #adb5bd;
    box-shadow: inset 0 1px 3px rgba(0,0,0,0.08);
  }
  
  &::placeholder {
    color: #666;
    font-style: italic;
  }
  
  &:disabled {
    background: #f8f9fa;
    color: #666;
    cursor: not-allowed;
    opacity: 0.7;
  }
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  justify-content: flex-end;
`;

const ImproveButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 0.5rem;
`;

const CharacterCounter = styled.div`
  font-size: 0.85rem;
  color: #6c757d;
  text-align: right;
  margin-bottom: 0.5rem;
  font-style: italic;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const PrimaryButton = styled.button`
  background: linear-gradient(135deg, #181a1b 0%, #2d2d2d 100%);
  color: #fff;
  border: none;
  border-radius: 12px;
  padding: 0.8rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  position: relative;
  overflow: hidden;
  
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
    box-shadow: 0 6px 20px rgba(0,0,0,0.2);
  }
  
  &:hover::before {
    left: 100%;
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const SecondaryButton = styled.button`
  background: #fff;
  color: #181a1b;
  border: 2px solid #181a1b;
  border-radius: 12px;
  padding: 0.8rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  
  &:hover {
    background: #f8f9fa;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.12);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const ImproveButton = styled.button`
  background: #fff;
  color: #181a1b;
  border: 2px solid #181a1b;
  border-radius: 12px;
  padding: 0.8rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  
  &:hover {
    background: #f8f9fa;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.12);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const ErrorMsg = styled.div`
  color: #dc3545;
  margin-bottom: 1rem;
`;

const LoadingMsg = styled.div`
  color: #181a1b;
  margin-bottom: 1rem;
  text-align: center;
  font-size: 1.1rem;
  padding: 2rem;
`;

const SaveStatus = styled.div<{ type: 'saving' | 'saved' | 'error' }>`
  padding: 0.75rem 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  .fa-spin {
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  
  ${({ type }) => {
    switch (type) {
      case 'saving':
        return `
          background: #fff3cd;
          color: #856404;
          border: 1px solid #ffeaa7;
        `;
      case 'saved':
        return `
          background: #d4edda;
          color: #155724;
          border: 1px solid #c3e6cb;
        `;
      case 'error':
        return `
          background: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
        `;
    }
  }}
`;

interface StartupPlan {
  _id: string;
  title: string;
  summary: string;
  sections: { [key: string]: string };
  status: string;
  version: number;
  category: string;
  tags: string[];
  progress: any;
  views: number;
  createdAt: string;
  updatedAt: string;
}

interface StartupPlanEditPageProps {
  setAppState?: (fn: (prev: any) => any) => void;
}

export default function StartupPlanEditPage({ setAppState }: StartupPlanEditPageProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [plan, setPlan] = useState<StartupPlan | null>(null);
  const [sections, setSections] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [improving, setImproving] = useState<{ [key: string]: boolean }>({});
  const [saveStatus, setSaveStatus] = useState<'saving' | 'saved' | 'error' | null>(null);

  useEffect(() => {
    async function fetchPlan() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_URL}/startup-plan/${id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (!res.ok) throw new Error('Failed to fetch business plan');
        const data = await res.json();
        setPlan(data);
        setSections(data.sections || {});
      } catch (err: any) {
        setError(err.message || 'Unknown error');
      } finally {
        setLoading(false);
      }
    }
    fetchPlan();
  }, [id]);

  const handleSectionChange = (key: string, value: string) => {
    setSections(prev => ({ ...prev, [key]: value }));
  };

  const handleImproveSection = async (key: string) => {
    setImproving(prev => ({ ...prev, [key]: true }));
    try {
      // Call AI improvement endpoint
      const res = await fetch(`${API_URL}/business-plan/improve-section`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          planId: id,
          sectionKey: key,
          currentText: sections[key]
        })
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to improve section');
      }
      
      const data = await res.json();
      
      // Format the improved text for better readability
      const improvedText = data.improvedText || '';
      
      // Clean up any extra formatting and ensure proper line breaks
      let formattedText = improvedText
        .replace(/^#{1,6}\s+(.*?)$/gm, '$1') // Remove markdown headers (# ## ### etc)
        .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold markdown
        .replace(/\*(.*?)\*/g, '$1') // Remove italic markdown
        .replace(/^\d+\.\s+/gm, '- ') // Convert numbered lists to bullet points
        .replace(/\n\s*\n\s*\n/g, '\n\n') // Remove excessive line breaks
        .replace(/^\s+|\s+$/g, '') // Trim whitespace
        .replace(/\n{3,}/g, '\n\n') // Limit consecutive line breaks to 2
        .replace(/^- (.+)$/gm, '\n- $1') // Ensure bullet points start on new lines
        .replace(/\n- (.+)\n- /g, '\n- $1\n\n- ') // Add proper spacing between bullet points
        .replace(/\n- (.+)$/gm, '\n- $1') // Ensure last bullet point is properly formatted
        .replace(/^\n+/, '') // Remove leading empty lines
        .replace(/\n+$/, '\n') // Ensure single trailing newline
        .replace(/^(Business Idea Summary|Customer Profile|Customer Persona|Customer Struggles|Value Proposition|Market Information|Market Trends|Competitors|Financial Summary|Professional Business Plan|Financial Plan|Target Market|Marketing Strategy|Operations Plan|Risk Analysis|Business Model|Competitor Analysis|Market Analysis):\s*/i, '') // Remove repeated section titles
        .replace(/^(Our primary|The primary|Our target|The target|Our main|The main)/i, 'Our primary'); // Standardize opening phrases
      
      // Ensure professional 100-word summary with proper sentence completion
      const words = formattedText.split(/\s+/);
      if (words.length > 100) {
        // Take first 70 words to leave room for proper conclusion
        let firstPart = words.slice(0, 70).join(' ');
        
        // Ensure we don't cut off mid-sentence by finding the last complete sentence
        const sentences = firstPart.split(/[.!?]/);
        if (sentences.length > 1) {
          // Remove the last incomplete sentence
          sentences.pop();
          firstPart = sentences.join('.') + '.';
        }
        
        // Add a concise, professional conclusion
        const conclusion = 'Our strategic approach focuses on personalized solutions and competitive differentiation.';
        formattedText = firstPart + ' ' + conclusion;
      }
      
      setSections(prev => ({ ...prev, [key]: formattedText }));
    } catch (err: any) {
      console.error('Improve section error:', err);
      // Show error to user
      setError(err.message || 'Failed to improve section');
    } finally {
      setImproving(prev => ({ ...prev, [key]: false }));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSaveStatus('saving');
    try {
      const res = await fetch(`${API_URL}/startup-plan/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ sections })
      });
      if (!res.ok) throw new Error('Failed to save business plan');
      setSaveStatus('saved');
      setTimeout(() => {
        navigate(`/plans/${id}/view`);
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Unknown error');
      setSaveStatus('error');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/plans');
  };

        if (loading) return <Container><LoadingMsg>Loading business plan...</LoadingMsg></Container>;
  if (error) return <Container><ErrorMsg>{error}</ErrorMsg></Container>;
  if (!plan) return null;

  return (
    <>
      <Container>
        <Title>Edit Business Plan</Title>
        <FormCard>
          {saveStatus && (
            <SaveStatus type={saveStatus}>
              {saveStatus === 'saving' && <FaSpinner className="fa-spin" />}
              {saveStatus === 'saved' && <FaCheckCircle />}
              {saveStatus === 'error' && <FaTimes />}
              {saveStatus === 'saving' && 'Saving your changes...'}
              {saveStatus === 'saved' && 'Changes saved successfully! Redirecting...'}
              {saveStatus === 'error' && 'Failed to save changes. Please try again.'}
            </SaveStatus>
          )}
          {Object.entries(sections).map(([key, value]) => (
            <Section key={key}>
              <SectionHeader>
                <SectionLabel>{key}</SectionLabel>
                <CharacterCounter>
                  {value.length} characters
                </CharacterCounter>
              </SectionHeader>
              <TextArea
                value={value}
                onChange={e => handleSectionChange(key, e.target.value)}
                disabled={saving}
                placeholder={`Enter your ${key.toLowerCase()} content here...`}
              />
              <ImproveButtonContainer>
                <ImproveButton
                  type="button"
                  onClick={() => handleImproveSection(key)}
                  disabled={improving[key] || saving}
                >
                  <FaMagic /> {improving[key] ? 'Improving...' : 'Improve with AI'}
                </ImproveButton>
              </ImproveButtonContainer>
            </Section>
          ))}
          <ButtonRow>
            <PrimaryButton type="button" onClick={handleSave} disabled={saving}>
              <FaSave /> {saving ? 'Saving...' : 'Save'}
            </PrimaryButton>
            <SecondaryButton type="button" onClick={handleCancel} disabled={saving}>
              <FaTimes /> Cancel
            </SecondaryButton>
          </ButtonRow>
        </FormCard>
      </Container>
    </>
  );
} 