import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaEdit, FaSave, FaCheckCircle, FaSpinner, FaTimes } from 'react-icons/fa';
import logo from '../../assets/logo.png';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const Container = styled.div`
  max-width: 700px;
  margin: 7.5rem auto 2rem auto;
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.08);
  padding: 2.5rem 2rem;
`;

const TopActions = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const PrimaryButton = styled.button`
  background: #181a1b;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.7rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: background 0.2s;
  &:hover { background: #000; }
`;

const SecondaryButton = styled.button`
  background: #fff;
  color: #181a1b;
  border: 2px solid #181a1b;
  border-radius: 8px;
  padding: 0.7rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
  &:hover { background: #f7f7f7; color: #181a1b; }
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #181a1b;
  margin-bottom: 1.2rem;
`;

const Summary = styled.p`
  font-size: 1.1rem;
  color: #444;
  margin-bottom: 1.5rem;
`;

const Section = styled.div`
  margin-bottom: 1.5rem;
`;

const SectionLabel = styled.h2`
  font-size: 1.1rem;
  font-weight: 600;
  color: #181a1b;
  margin-bottom: 0.5rem;
`;

const SectionContent = styled.div`
  font-size: 1rem;
  color: #222;
  background: #f8f9fa;
  border-radius: 8px;
  padding: 0.8rem;
`;

const Meta = styled.div`
  font-size: 0.95rem;
  color: #888;
  margin-bottom: 1.2rem;
`;

const Score = styled.div<{ color: string }>`
  font-weight: 700;
  font-size: 1.1rem;
  margin-bottom: 1.2rem;
  color: ${({ color }) => color};
  cursor: pointer;
`;

const Logo = styled.img`
  height: 60px;
  width: 60px;
  border-radius: 16px;
  cursor: pointer;
  margin-bottom: 2rem;
`;

const OverlayBackdrop = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.32);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const OverlayCard = styled.div`
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.18);
  padding: 2.5rem 2rem 2rem 2rem;
  max-width: 420px;
  width: 100%;
  position: relative;
`;

const OverlayClose = styled.button`
  position: absolute;
  top: 1.2rem;
  right: 1.2rem;
  background: none;
  border: none;
  color: #181a1b;
  font-size: 1.5rem;
  cursor: pointer;
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
  marketEvaluation?: { score: number };
}

export default function StartupPlanViewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [plan, setPlan] = useState<StartupPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editSummary, setEditSummary] = useState('');
  const [editSections, setEditSections] = useState<{ [key: string]: string }>({});
  const [saving, setSaving] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [evaluationDetails, setEvaluationDetails] = useState<{ recommendations?: string[]; risks?: string[]; nextSteps?: string[] } | null>(null);

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
        if (!res.ok) throw new Error('Failed to fetch startup plan');
        const data = await res.json();
        setPlan(data);
      } catch (err: any) {
        setError(err.message || 'Unknown error');
      } finally {
        setLoading(false);
      }
    }
    fetchPlan();
  }, [id]);

  useEffect(() => {
    if (plan && editMode) {
      setEditTitle(plan.title);
      setEditSummary(plan.summary);
      setEditSections(plan.sections || {});
    }
  }, [plan, editMode]);

  let scoreColor = '#888';
  const score = plan?.marketEvaluation && typeof plan.marketEvaluation.score === 'number' ? plan.marketEvaluation.score : 0;
  if (score >= 80) scoreColor = '#28a745';
  else if (score >= 60) scoreColor = '#ffc107';
  else if (score > 0) scoreColor = '#dc3545';

  const handleEdit = () => setEditMode(true);
  const handleCancelEdit = () => setEditMode(false);
  const handleSave = async () => {
    if (!plan) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/startup-plan/${plan._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ title: editTitle, summary: editSummary, sections: editSections })
      });
      if (!res.ok) throw new Error('Failed to save changes');
      const updated = await res.json();
      setPlan(updated);
      setEditMode(false);
    } catch (err) {
      alert('Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  const handleEvaluate = async () => {
    if (!plan) return;
    setEvaluating(true);
    setShowDetails(false);
    try {
      // Simulate evaluation (replace with real API call as needed)
      const mockResult = {
        evaluationScore: Math.floor(Math.random() * 100) + 1,
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
      // Save evaluation score to backend
      const res = await fetch(`${API_URL}/startup-plan/${plan._id}/evaluation-score`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ score: mockResult.evaluationScore })
      });
      if (!res.ok) throw new Error('Failed to save evaluation score');
      setPlan(prev => prev ? { ...prev, marketEvaluation: { ...prev.marketEvaluation, score: mockResult.evaluationScore } } : prev);
      setEvaluationDetails({
        recommendations: mockResult.recommendations,
        risks: mockResult.risks,
        nextSteps: mockResult.nextSteps
      });
    } catch (err) {
      alert('Failed to evaluate plan.');
    } finally {
      setEvaluating(false);
    }
  };

  if (loading) return <Container>Loading startup plan...</Container>;
  if (error) return <Container style={{ color: '#dc3545' }}>{error}</Container>;
  if (!plan) return null;

  return (
    <Container>
      <Logo src={logo} alt="ToolThinker Logo" onClick={() => navigate('/')} />
      <TopActions>
        <PrimaryButton onClick={() => navigate('/plans')}><FaArrowLeft /> Back to Plans</PrimaryButton>
        {!editMode && <SecondaryButton onClick={handleEdit}><FaEdit /> Edit</SecondaryButton>}
        {!editMode && <SecondaryButton onClick={handleEvaluate} disabled={evaluating}>
          {evaluating ? <FaSpinner className="fa-spin" /> : <FaCheckCircle />} Evaluate Plan
        </SecondaryButton>}
        {editMode && <PrimaryButton onClick={handleSave} disabled={saving}><FaSave /> {saving ? 'Saving...' : 'Save'}</PrimaryButton>}
        {editMode && <SecondaryButton onClick={handleCancelEdit}>Cancel</SecondaryButton>}
      </TopActions>
      {editMode ? (
        <>
          <input value={editTitle} onChange={e => setEditTitle(e.target.value)} style={{ fontSize: '1.5rem', fontWeight: 700, width: '100%', marginBottom: 12 }} />
          <textarea value={editSummary} onChange={e => setEditSummary(e.target.value)} style={{ width: '100%', minHeight: 60, marginBottom: 16 }} />
          {Object.entries(editSections).map(([key, value]) => (
            <Section key={key}>
              <SectionLabel>{key}</SectionLabel>
              <textarea value={value} onChange={e => setEditSections(prev => ({ ...prev, [key]: e.target.value }))} style={{ width: '100%', minHeight: 40 }} />
            </Section>
          ))}
        </>
      ) : (
        <>
          <Title>{plan.title}</Title>
          <Meta>
            v{plan.version} &nbsp;|&nbsp; {new Date(plan.updatedAt).toLocaleDateString()} &nbsp;|&nbsp; Status: {plan.status}
          </Meta>
          <Score color={scoreColor} style={{ cursor: 'pointer' }} onClick={() => setShowDetails(true)}>
            Evaluation Score: {score}/100
          </Score>
          {showDetails && evaluationDetails && (
            <OverlayBackdrop onClick={() => setShowDetails(false)}>
              <OverlayCard onClick={e => e.stopPropagation()}>
                <OverlayClose onClick={() => setShowDetails(false)} aria-label="Close"><FaTimes /></OverlayClose>
                <div style={{ fontWeight: 700, fontSize: '1.2rem', marginBottom: 16 }}>Evaluation Insights</div>
                <div style={{ fontWeight: 600, marginBottom: 8 }}>Recommendations:</div>
                <ul>{evaluationDetails.recommendations?.map((rec, i) => <li key={i}>{rec}</li>)}</ul>
                <div style={{ fontWeight: 600, margin: '16px 0 8px 0' }}>Risks:</div>
                <ul>{evaluationDetails.risks?.map((risk, i) => <li key={i}>{risk}</li>)}</ul>
                <div style={{ fontWeight: 600, margin: '16px 0 8px 0' }}>Next Steps:</div>
                <ul>{evaluationDetails.nextSteps?.map((step, i) => <li key={i}>{step}</li>)}</ul>
              </OverlayCard>
            </OverlayBackdrop>
          )}
          <Summary>{plan.summary}</Summary>
          {Object.entries(plan.sections || {}).map(([key, value]) => (
            <Section key={key}>
              <SectionLabel>{key}</SectionLabel>
              <SectionContent>{value}</SectionContent>
            </Section>
          ))}
        </>
      )}
    </Container>
  );
} 