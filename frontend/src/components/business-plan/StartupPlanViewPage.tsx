import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaEdit, FaSave, FaCheckCircle, FaSpinner, FaTimes } from 'react-icons/fa';
import logo from '../../assets/logo.png';
import { evaluateStartupPlan } from '../../utils/evaluationRubric';
import type { StartupPlanForEvaluation, EvaluationResult } from '../../utils/evaluationRubric';
import { debugScore18 } from '../../utils/evaluationRubric';
import { FeedbackBar } from '../common/FeedbackBar';

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
  font-family: 'Audiowide', 'Courier New', monospace;
  font-size: 2rem;
  font-weight: 400;
  color: #181a1b;
  margin-bottom: 1.2rem;
  font-display: swap;
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
  font-family: 'Audiowide', 'Courier New', monospace;
  font-size: 1.1rem;
  font-weight: 400;
  color: #181a1b;
  margin-bottom: 0.5rem;
  font-display: swap;
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

const IndentedList = styled.ul`
  padding-left: 1.5rem;
  margin: 0;
`;

// Add a styled component for sub-bullets:
const SubBulletList = styled.ul`
  padding-left: 1.5rem;
  margin: 0;
  list-style-type: none;
  color: #888;
`;

// Add a styled component for custom bullets:
const BulletList = styled.ul`
  padding-left: 1.5rem;
  margin: 0;
  list-style: none;
  li {
    position: relative;
    padding-left: 1.2em;
    margin-bottom: 0.5em;
    color: #888;
  }
  li::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0.6em;
    width: 0.15em;
    height: 0.15em;
    border: 2px solid #bbb;
    background: transparent;
    border-radius: 50%;
    display: inline-block;
    transform: translateY(-50%);
  }
`;

interface StartupPlan {
  _id: string;
  businessIdeaSummary: string;
  customerProfile: { description: string };
  customerStruggle: string[];
  valueProposition: string;
  marketInformation: {
    marketSize: string;
    competitors: string[];
    trends: string[];
    validation: string;
  };
  financialSummary: string;
  status: string;
  version: number;
  createdAt: string;
  updatedAt: string;
  marketEvaluation?: { score: number };
}

function mapPlanToView(plan: any): StartupPlan {
  return {
    _id: plan._id,
    businessIdeaSummary: plan.businessIdeaSummary || plan.summary || '',
    customerProfile: plan.customerProfile || { description: plan.sections?.['Customer Profile'] || plan.sections?.['Customer Persona'] || '' },
    customerStruggle: plan.customerStruggle || (plan.sections?.['Customer Struggles'] ? plan.sections['Customer Struggles'].split('\n').filter(Boolean) : []),
    valueProposition: plan.valueProposition || plan.sections?.['Value Proposition'] || '',
    marketInformation: {
      marketSize: plan.marketInformation?.marketSize || plan.sections?.['Market Size'] || '',
      competitors: plan.marketInformation?.competitors || (plan.sections?.['Competitors'] ? plan.sections['Competitors'].split('\n').filter(Boolean) : []),
      trends: plan.marketInformation?.trends || (plan.sections?.['Market Trends'] ? plan.sections['Market Trends'].split('\n').filter(Boolean) : []),
      validation: plan.marketInformation?.validation || plan.sections?.['Market Validation'] || '',
    },
    financialSummary: plan.financialSummary || plan.sections?.['Financial Summary'] || '',
    status: plan.status || 'draft',
    version: plan.version || 1,
    createdAt: plan.createdAt,
    updatedAt: plan.updatedAt,
    marketEvaluation: plan.marketEvaluation,
  };
}

export default function StartupPlanViewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [plan, setPlan] = useState<StartupPlan | null>(null);
  const [rawPlan, setRawPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editPlan, setEditPlan] = useState<StartupPlan>({
    _id: '',
    businessIdeaSummary: '',
    customerProfile: { description: '' },
    customerStruggle: [],
    valueProposition: '',
    marketInformation: {
      marketSize: '',
      competitors: [],
      trends: [],
      validation: '',
    },
    financialSummary: '',
    status: '',
    version: 0,
    createdAt: '',
    updatedAt: '',
  });
  const [saving, setSaving] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<EvaluationResult | null>(null);

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
        setRawPlan(data);
        setPlan(mapPlanToView(data));
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
      setEditPlan({
        _id: plan._id,
        businessIdeaSummary: plan.businessIdeaSummary,
        customerProfile: { description: plan.customerProfile.description },
        customerStruggle: plan.customerStruggle,
        valueProposition: plan.valueProposition,
        marketInformation: {
          marketSize: plan.marketInformation.marketSize,
          competitors: plan.marketInformation.competitors,
          trends: plan.marketInformation.trends,
          validation: plan.marketInformation.validation,
        },
        financialSummary: plan.financialSummary,
        status: plan.status,
        version: plan.version,
        createdAt: plan.createdAt,
        updatedAt: plan.updatedAt,
      });
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
      // Compose a complete payload with all required fields
      const payload = {
        ...editPlan,
        idea: rawPlan?.idea || {
          title: 'Untitled Idea',
          description: ''
        },
        customer: rawPlan?.customer || {
          title: 'Customer',
          description: ''
        },
        job: rawPlan?.job || {
          title: 'Customer Job',
          description: ''
        },
        problem: rawPlan?.problem || {
          description: editPlan.customerStruggle[0] || 'No problem description provided.',
          impact: 'High',
          urgency: 'medium'
        },
        solution: rawPlan?.solution || {
          description: editPlan.valueProposition || 'No solution description provided.',
          keyFeatures: [editPlan.valueProposition || 'Key feature'],
          uniqueValue: editPlan.valueProposition || 'Unique value'
        }
      };
      const res = await fetch(`${API_URL}/startup-plan/${plan._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Failed to save changes');
      const updated = await res.json();
      setPlan(mapPlanToView(updated));
      setRawPlan(updated);
      setEditMode(false);
    } catch (err) {
              // TODO: Replace with custom error notification
        console.error('Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  const handleEvaluate = async () => {
    if (!plan) return;
    setEvaluating(true);
    setShowDetails(false);
    try {
      debugScore18(); // Debug what gives us 18/100
      console.log('Original plan data:', plan);
      // Use rubric-based evaluation
      const planForEval: StartupPlanForEvaluation = {
        businessIdeaSummary: plan.businessIdeaSummary,
        customerProfile: plan.customerProfile,
        customerStruggle: plan.customerStruggle,
        valueProposition: plan.valueProposition,
        marketInformation: {
          marketSize: plan.marketInformation.marketSize,
          competitors: plan.marketInformation.competitors,
          trends: plan.marketInformation.trends,
        }
      };
      console.log('Plan data for evaluation:', planForEval);
      const result = evaluateStartupPlan(planForEval);
      console.log('Evaluation result:', result);
      // Save evaluation score to backend
      const res = await fetch(`${API_URL}/startup-plan/${plan._id}/evaluation-score`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ score: result.totalScore })
      });
      if (!res.ok) throw new Error('Failed to save evaluation score');
      setPlan(prev => prev ? { ...prev, marketEvaluation: { ...prev.marketEvaluation, score: result.totalScore } } : prev);
      setEvaluationResult(result);
    } catch (err) {
              // TODO: Replace with custom error notification
        console.error('Failed to evaluate plan.');
    } finally {
      setEvaluating(false);
    }
  };

        if (loading) return <Container>Loading business plan...</Container>;
  if (error) return <Container style={{ color: '#dc3545' }}>{error}</Container>;
  if (!plan) return null;

  return (
    <Container>
      <Logo src={logo} alt="ToolThinker Logo" onClick={() => navigate('/')} />
      <TopActions>
        <PrimaryButton onClick={() => navigate('/plans')}><FaArrowLeft /> Back to Ideas</PrimaryButton>
        {!editMode && <SecondaryButton onClick={handleEdit}><FaEdit /> Edit</SecondaryButton>}
        {!editMode && <SecondaryButton onClick={handleEvaluate} disabled={evaluating}>
          {evaluating ? <FaSpinner className="fa-spin" /> : <FaCheckCircle />} Evaluate Idea
        </SecondaryButton>}
        {editMode && <PrimaryButton onClick={handleSave} disabled={saving}><FaSave /> {saving ? 'Saving...' : 'Save'}</PrimaryButton>}
        {editMode && <SecondaryButton onClick={handleCancelEdit}>Cancel</SecondaryButton>}
      </TopActions>
      <div style={{ margin: '0 0 16px 0' }}>
        <FeedbackBar context="plan_view_actions" />
      </div>
      {editMode ? (
        <>
          <Section>
            <SectionLabel>Business Idea Summary</SectionLabel>
            <textarea value={editPlan.businessIdeaSummary} onChange={e => setEditPlan(prev => ({ ...prev, businessIdeaSummary: e.target.value }))} style={{ width: '100%', minHeight: 40 }} />
          </Section>
          <Section>
            <SectionLabel>Customer Profile</SectionLabel>
            <textarea value={editPlan.customerProfile.description} onChange={e => setEditPlan(prev => ({ ...prev, customerProfile: { ...prev.customerProfile, description: e.target.value } }))} style={{ width: '100%', minHeight: 40 }} />
          </Section>
          <Section>
            <SectionLabel>Customer Struggle</SectionLabel>
            <textarea value={editPlan.customerStruggle.join('\n')} onChange={e => setEditPlan(prev => ({ ...prev, customerStruggle: e.target.value.split('\n') }))} style={{ width: '100%', minHeight: 40 }} placeholder="One struggle per line" />
          </Section>
          <Section>
            <SectionLabel>Value Proposition</SectionLabel>
            <textarea value={editPlan.valueProposition} onChange={e => setEditPlan(prev => ({ ...prev, valueProposition: e.target.value }))} style={{ width: '100%', minHeight: 40 }} />
          </Section>
          <Section>
            <SectionLabel>Market Information</SectionLabel>
            <div style={{ marginBottom: 8 }}>
              <strong>Market Size</strong>
              <input value={editPlan.marketInformation.marketSize} onChange={e => setEditPlan(prev => ({ ...prev, marketInformation: { ...prev.marketInformation, marketSize: e.target.value } }))} style={{ width: '100%', marginBottom: 8 }} />
            </div>
            <div style={{ marginBottom: 8 }}>
              <strong>Competitors</strong>
              <textarea value={editPlan.marketInformation.competitors.join('\n')} onChange={e => setEditPlan(prev => ({ ...prev, marketInformation: { ...prev.marketInformation, competitors: e.target.value.split('\n') } }))} style={{ width: '100%', minHeight: 32, marginBottom: 8 }} placeholder="One competitor per line" />
            </div>
            <div style={{ marginBottom: 8 }}>
              <strong>Trends</strong>
              <textarea value={editPlan.marketInformation.trends.join('\n')} onChange={e => setEditPlan(prev => ({ ...prev, marketInformation: { ...prev.marketInformation, trends: e.target.value.split('\n') } }))} style={{ width: '100%', minHeight: 32, marginBottom: 8 }} placeholder="One trend per line" />
            </div>
          </Section>
          <Section>
            <SectionLabel>Financial Summary</SectionLabel>
            <textarea value={editPlan.financialSummary} onChange={e => setEditPlan(prev => ({ ...prev, financialSummary: e.target.value }))} style={{ width: '100%', minHeight: 40 }} />
          </Section>
        </>
      ) : (
        <>
          <Title title={plan.businessIdeaSummary}>
            {plan.businessIdeaSummary.length > 80
              ? plan.businessIdeaSummary.slice(0, 80) + '…'
              : plan.businessIdeaSummary}
          </Title>
          <Meta>
            v{plan.version} &nbsp;|&nbsp; {new Date(plan.updatedAt).toLocaleDateString()} &nbsp;|&nbsp; Status: {plan.status}
          </Meta>
          <Score color={scoreColor} style={{ cursor: 'pointer' }} onClick={() => setShowDetails(true)}>
            Evaluation Score: {score}/100
          </Score>
          {showDetails && (
            <OverlayBackdrop onClick={() => setShowDetails(false)}>
              <OverlayCard onClick={e => e.stopPropagation()}>
                <OverlayClose onClick={() => setShowDetails(false)} aria-label="Close"><FaTimes /></OverlayClose>
                <div style={{ fontWeight: 700, fontSize: '1.2rem', marginBottom: 16 }}>Evaluation Insights</div>
                {evaluationResult ? (
                  <>
                    <div style={{ fontWeight: 600, marginBottom: 8 }}>Score: {evaluationResult.totalScore}/100</div>
                    <div style={{ fontWeight: 600, marginBottom: 8 }}>Detailed Feedback:</div>
                    <ul style={{ marginBottom: 16 }}>
                      {evaluationResult.criteria.map((c, i) => (
                        <li key={i} style={{ marginBottom: 4 }}>
                          <strong>{c.key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}:</strong> {c.score}/5 – {c.feedback}
                        </li>
                      ))}
                    </ul>
                    <div style={{ fontWeight: 600, marginBottom: 8 }}>Strengths:</div>
                    <ul>{evaluationResult.strengths.length > 0 ? evaluationResult.strengths.map((s, i) => <li key={i}>{s}</li>) : <li>No major strengths yet.</li>}</ul>
                    <div style={{ fontWeight: 600, margin: '16px 0 8px 0' }}>Recommendations:</div>
                    <ul>{evaluationResult.recommendations.length > 0 ? evaluationResult.recommendations.map((rec, i) => <li key={i}>{rec}</li>) : <li>No recommendations at this time.</li>}</ul>
                    <div style={{ color: '#888', fontSize: '1rem', marginTop: 16 }}>{evaluationResult.summary}</div>
                  </>
                ) : (
                  <div style={{ color: '#888', fontSize: '1rem', marginTop: 16 }}>
                    No evaluation details available. Please run an evaluation to see insights.
                  </div>
                )}
              </OverlayCard>
            </OverlayBackdrop>
          )}
          <Section>
            <SectionLabel>Business Idea Summary</SectionLabel>
            <SectionContent>{plan.businessIdeaSummary}</SectionContent>
          </Section>
          <Section>
            <SectionLabel>Customer Profile</SectionLabel>
            <SectionContent>{plan.customerProfile.description}</SectionContent>
          </Section>
          <Section>
            <SectionLabel>Customer Struggle</SectionLabel>
            <SectionContent>
              <ul>{plan.customerStruggle.map((struggle, i) => <li key={i}>{struggle.replace(/^[-–—]\s*/, '')}</li>)}</ul>
            </SectionContent>
          </Section>
          <Section>
            <SectionLabel>Value Proposition</SectionLabel>
            <SectionContent>{plan.valueProposition}</SectionContent>
          </Section>
          <Section>
            <SectionLabel>Market Information</SectionLabel>
            <SectionContent>
              <div><strong>Market Size:</strong> {plan.marketInformation.marketSize}</div>
            </SectionContent>
            <SectionContent>
              <div><strong>Competitors:</strong></div>
              <BulletList>
                {plan.marketInformation.competitors.map((c, i) => <li key={i}>{c.replace(/^[-–—]\s*/, '')}</li>)}
              </BulletList>
            </SectionContent>
            <SectionContent>
              <div><strong>Trends:</strong></div>
              <BulletList>
                {plan.marketInformation.trends.map((t, i) => <li key={i}>{t.replace(/^[-–—]\s*/, '')}</li>)}
              </BulletList>
            </SectionContent>
          </Section>
          <Section>
            <SectionLabel>Financial Summary</SectionLabel>
            <SectionContent>{plan.financialSummary}</SectionContent>
          </Section>
          <div style={{ marginTop: '12px' }}>
            <FeedbackBar context="plan_view_sections" />
          </div>
        </>
      )}
    </Container>
  );
} 