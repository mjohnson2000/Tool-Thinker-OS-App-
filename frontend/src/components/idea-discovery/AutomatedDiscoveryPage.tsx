import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Lottie from 'lottie-react';
import robotLottie from '../../assets/robot-lottie.json';
import { RobotFace } from './RobotFace';

interface Persona {
  id: string;
  name: string;
  avatarUrl?: string;
  summary: string;
  feedback: string[];
}

const STAGES = [
  'Problem Validation',
  'Customer Profile',
  'Customer Struggle',
  'Solution Fit',
  'Business Model',
  'Market Validation',
  'Launch',
];

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

export function AutomatedDiscoveryPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [currentStage, setCurrentStage] = React.useState(0);
  const [personas, setPersonas] = React.useState<Persona[]>([]);
  const [collectiveSummary, setCollectiveSummary] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [businessIdea, setBusinessIdea] = React.useState<string>('');
  const [customerDescription, setCustomerDescription] = React.useState<string>('');
  const [logs, setLogs] = React.useState<string[]>([]);
  const logRef = React.useRef<HTMLDivElement>(null);

  // Add state to control how many feedback bubbles are visible per persona
  const [visibleFeedbackCounts, setVisibleFeedbackCounts] = React.useState<number[]>([]);
  // Add state to track expanded/collapsed personas
  const [expandedPersonas, setExpandedPersonas] = React.useState<{ [id: string]: boolean }>({});
  // Add state for collapsible summary and feedback sections
  const [showSummary, setShowSummary] = React.useState(true);
  const [showFeedback, setShowFeedback] = React.useState(true);
  const PITCH_DECK_SLIDES = [
    { key: 'title', label: 'Title Slide', defaultTitle: 'Title', defaultContent: '' },
    { key: 'problem', label: 'Problem', defaultTitle: 'Problem', defaultContent: '' },
    { key: 'solution', label: 'Solution', defaultTitle: 'Solution', defaultContent: '' },
    { key: 'market', label: 'Market Opportunity', defaultTitle: 'Market Opportunity', defaultContent: '' },
    { key: 'product', label: 'Product', defaultTitle: 'Product', defaultContent: '' },
    { key: 'businessModel', label: 'Business Model', defaultTitle: 'Business Model', defaultContent: '' },
    { key: 'goToMarket', label: 'Go-to-Market', defaultTitle: 'Go-to-Market', defaultContent: '' },
    { key: 'competition', label: 'Competition', defaultTitle: 'Competition', defaultContent: '' },
    { key: 'traction', label: 'Traction', defaultTitle: 'Traction', defaultContent: '' },
    { key: 'team', label: 'Team', defaultTitle: 'Team', defaultContent: '' },
    { key: 'financials', label: 'Financials', defaultTitle: 'Financials', defaultContent: '' },
    { key: 'ask', label: 'Ask', defaultTitle: 'Ask', defaultContent: '' },
  ];
  const [showPitchDeckEditor, setShowPitchDeckEditor] = useState(false);
  const [currentSlideIdx, setCurrentSlideIdx] = useState(0);
  const [pitchDeckSlides, setPitchDeckSlides] = useState(
    PITCH_DECK_SLIDES.map(slide => ({
      key: slide.key,
      title: slide.defaultTitle,
      content: '',
    }))
  );
  const [planData, setPlanData] = useState<any>(null);

  // Helper to toggle expand/collapse
  function togglePersonaExpand(id: string) {
    setExpandedPersonas(prev => ({ ...prev, [id]: !prev[id] }));
  }

  // When personas or their feedback changes, reset and start sequential reveal
  React.useEffect(() => {
    if (personas.length === 0 || !personas.some(p => p.feedback && p.feedback.length > 0)) return;
    setVisibleFeedbackCounts(Array(personas.length).fill(0));
    let personaIdx = 0;
    let feedbackIdx = 0;
    let isCancelled = false;

    function revealNext() {
      if (isCancelled) return;
      if (personaIdx >= personas.length) return;
      setVisibleFeedbackCounts((prev) => {
        const updated = [...prev];
        updated[personaIdx] = feedbackIdx + 1;
        return updated;
      });
      if (feedbackIdx + 1 < (personas[personaIdx].feedback?.length || 0)) {
        feedbackIdx++;
      } else {
        personaIdx++;
        feedbackIdx = 0;
      }
      if (personaIdx < personas.length) {
        setTimeout(revealNext, 400);
      }
    }
    setTimeout(revealNext, 400);
    return () => { isCancelled = true; };
  }, [currentStage, personas.map(p => p.feedback?.length).join(',')]);

  // Auto-scroll log area to bottom
  React.useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [logs]);

  // Fetch business plan on mount
  React.useEffect(() => {
    async function fetchBusinessPlan() {
      setLoading(true);
      setError(null);
      setLogs((prev) => [...prev, 'Fetching business plan...']);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/business-plan/${id}`, {
          credentials: 'include',
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json'
          }
        });
        if (!res.ok) throw new Error('Failed to fetch business plan');
        const data = await res.json();
        setBusinessIdea(data.idea?.existingIdeaText || data.summary || '');
        setCustomerDescription(data.customer?.description || '');
        setPlanData(data);
        setLogs((prev) => [...prev, 'Business plan loaded.']);
      } catch (err: any) {
        setError(err.message || 'Unknown error');
        setLogs((prev) => [...prev, 'Error loading business plan.']);
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchBusinessPlan();
  }, [id]);

  // Fetch personas when businessIdea and customerDescription are loaded
  React.useEffect(() => {
    if (!businessIdea || !customerDescription) return;
    async function fetchPersonas() {
      setLoading(true);
      setError(null);
      setLogs((prev) => [...prev, 'Generating AI personas...']);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/automated-discovery/personas`, {
          method: 'POST',
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ businessIdea, customerDescription, numPersonas: 3 }),
          credentials: 'include'
        });
        if (!res.ok) throw new Error('Failed to fetch personas');
        const data = await res.json();
        setPersonas(data.personas.map((p: any) => ({ ...p, feedback: [] })));
        setLogs((prev) => [...prev, 'AI personas generated.']);
      } catch (err: any) {
        setError(err.message || 'Unknown error');
        setLogs((prev) => [...prev, 'Error generating personas.']);
      } finally {
        setLoading(false);
      }
    }
    fetchPersonas();
  }, [businessIdea, customerDescription]);

  // Fetch feedback for current stage
  React.useEffect(() => {
    if (personas.length === 0 || !businessIdea || !customerDescription) return;
    async function fetchFeedback() {
      setLoading(true);
      setError(null);
      setLogs((prev) => [...prev, `Getting feedback for stage: ${STAGES[currentStage]}...`]);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/automated-discovery/feedback`, {
          method: 'POST',
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            personas: personas.map(({ id, name, summary }) => ({
              id: typeof id === 'string' ? id : String(id),
              name,
              summary
            })),
            stage: STAGES[currentStage],
            businessIdea,
            customerDescription,
          }),
          credentials: 'include'
        });
        if (!res.ok) throw new Error('Failed to fetch feedback');
        const data = await res.json();
        setPersonas((prev) => prev.map((p) => ({ ...p, feedback: (data.feedback.find((f: any) => f.personaId === p.id)?.feedback || []) })));
        setCollectiveSummary(data.summary);
        setLogs((prev) => [...prev, `Feedback for stage "${STAGES[currentStage]}" loaded.`]);
      } catch (err: any) {
        setError(err.message || 'Unknown error');
        setLogs((prev) => [...prev, 'Error fetching feedback.']);
      } finally {
        setLoading(false);
      }
    }
    fetchFeedback();
  }, [currentStage, personas.length, businessIdea, customerDescription]);

  // Persist discovery data after each stage
  React.useEffect(() => {
    if (!businessIdea || !customerDescription || personas.length === 0) return;
    async function persistDiscoveryData() {
      try {
        const token = localStorage.getItem('token');
        await fetch(`${API_URL}/business-plan/${id}/discovery-data`, {
          method: 'PATCH',
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            stage: STAGES[currentStage],
            personas,
            summary: collectiveSummary,
            businessIdea,
            customerDescription,
            logs,
          }),
          credentials: 'include'
        });
      } catch (err) {
        // Optionally handle error
        console.error('Failed to persist discovery data', err);
      }
    }
    persistDiscoveryData();
  }, [currentStage, personas, collectiveSummary, businessIdea, customerDescription, logs, id]);

  // Handlers for Launch stage buttons
  function handleGenerate(type: 'summary' | 'plan' | 'pitch' | 'financial' | 'businessModel') {
    // TODO: Replace with actual generation logic or API call
    alert(`Generate: ${type}`);
  }

  function openPitchDeckEditor() {
    setPitchDeckSlides(PITCH_DECK_SLIDES.map(slide => {
      let content = '';
      switch (slide.key) {
        case 'title':
          content = planData?.title || businessIdea || '';
          break;
        case 'problem':
          content = planData?.problem?.description || '';
          break;
        case 'solution':
          content = planData?.solution?.description || '';
          break;
        case 'market':
          content = planData?.marketEvaluation?.marketSize || '';
          break;
        case 'product':
          content = (planData?.solution?.keyFeatures || []).join('\n') || '';
          break;
        case 'businessModel':
          content = planData?.sections?.['Business Model'] || '';
          break;
        case 'goToMarket':
          content = planData?.sections?.['Go-to-Market'] || '';
          break;
        case 'competition':
          content = (planData?.marketEvaluation?.competitors || []).join('\n') || '';
          break;
        case 'traction':
          content = planData?.sections?.['Traction'] || '';
          break;
        case 'team':
          content = planData?.sections?.['Team'] || '';
          break;
        case 'financials':
          content = planData?.sections?.['Financials'] || '';
          break;
        case 'ask':
          content = planData?.sections?.['Ask'] || '';
          break;
        default:
          content = '';
      }
      return {
        key: slide.key,
        title: slide.defaultTitle,
        content,
      };
    }));
    setCurrentSlideIdx(0);
    setShowPitchDeckEditor(true);
  }
  function handleSlideFieldChange(idx: number, field: 'title' | 'content', value: string) {
    setPitchDeckSlides(prev => prev.map((slide, i) => i === idx ? { ...slide, [field]: value } : slide));
  }
  function downloadCustomPitchDeck() {
    if (!id) return;
    const slidesObj: Record<string, string> = {};
    pitchDeckSlides.forEach(slide => {
      if (slide.key === 'title') return; // title handled separately
      slidesObj[slide.key] = slide.content;
    });
    fetch(`${API_URL}/business-plan/${id}/pitch-deck`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : ''
      },
      body: JSON.stringify({
        title: pitchDeckSlides[0].content || pitchDeckSlides[0].title,
        slides: slidesObj
      })
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to generate pitch deck');
        return res.blob();
      })
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'pitch-deck.pptx';
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        setShowPitchDeckEditor(false);
      })
      .catch(err => {
        alert('Failed to download pitch deck.');
        console.error(err);
      });
  }

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#f7f8fa', position: 'relative' }}>
      {/* Back to Dashboard button in upper right */}
      {/* This button is now moved to the main section */}

      {/* Progress Sidebar */}
      <aside style={{ width: 120, background: '#fff', borderRight: '1px solid #eee', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 32 }}>
        {STAGES.map((stage, idx) => (
          <div key={stage} style={{ marginBottom: 32, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              background: idx < currentStage
                ? '#232323'
                : idx === currentStage
                  ? 'linear-gradient(135deg, #5ad6ff 0%, #5a6ee6 100%)'
                  : '#e5e5e5',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: 16,
              marginBottom: 4,
              boxShadow: idx === currentStage ? '0 2px 8px #5ad6ff44' : undefined,
            }}>{idx < currentStage ? '✓' : idx + 1}</div>
            <span style={{ fontSize: 12, color: idx === currentStage ? '#181a1b' : '#888', textAlign: 'center', maxWidth: 80 }}>{stage}</span>
          </div>
        ))}
      </aside>

      {/* Center Visualization */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 0 }}>
        {/* Congratulations animation at Launch stage */}
        {currentStage === STAGES.length - 1 && (
          <div style={{
            marginBottom: 24,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            animation: 'congratsPop 1.2s cubic-bezier(.23,1,.32,1) 0s 1',
          }}>
            <span style={{
              fontSize: 36,
              fontWeight: 800,
              color: '#28a745',
              textAlign: 'center',
              marginBottom: 4,
              letterSpacing: 1,
              textShadow: '0 2px 12px #b6eabf',
            }}>
              🎉 Congratulations!
            </span>
            <span style={{
              fontSize: 18,
              color: '#181a1b',
              fontWeight: 500,
              textAlign: 'center',
              marginTop: 2,
              marginBottom: 2,
              maxWidth: 340,
            }}>
              You’ve completed the Automated Discovery journey. Your business idea is refined and ready for launch!
            </span>
          </div>
        )}
        {/* Back to Dashboard button aligned right above robot */}
        <div style={{ width: 420, display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
          <button
            style={{
              background: '#fff',
              color: '#181a1b',
              border: '1.5px solid #181a1b',
              borderRadius: 8,
              padding: '0.8rem 1.5rem',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
            onClick={() => navigate(-1)}
          >
            Back to Dashboard
          </button>
        </div>
        <div style={{ width: 420, height: 340, background: '#fafbfc', borderRadius: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 16px rgba(0,0,0,0.06)', flexDirection: 'column', border: '2px solid #181a1b', position: 'relative', overflow: 'hidden' }}>
          {/* Animated glow/shadow under robot */}
          <div style={{
            position: 'absolute',
            bottom: 56,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 140,
            height: 32,
            background: 'radial-gradient(ellipse at center, #181a1b33 0%, transparent 80%)',
            filter: 'blur(10px)',
            zIndex: 0,
            animation: 'glowPulse 2.2s infinite alternate',
            pointerEvents: 'none',
          }} />
          {/* Robot animation */}
          <Lottie
            animationData={robotLottie}
            loop={true}
            autoplay={true}
            style={{ width: 240, height: 240, marginBottom: 8, zIndex: 1 }}
            aria-label="AI robot animation"
          />
          {/* Minimalist AI is Thinking animation (three animated dots) */}
          {loading && (
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 24, marginBottom: 8, zIndex: 2 }}>
              <span style={{
                display: 'inline-block',
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: '#181a1b',
                margin: '0 4px',
                opacity: 0.5,
                animation: 'dotPulse 1.2s infinite',
                animationDelay: '0s',
              }} />
              <span style={{
                display: 'inline-block',
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: '#181a1b',
                margin: '0 4px',
                opacity: 0.5,
                animation: 'dotPulse 1.2s infinite',
                animationDelay: '0.2s',
              }} />
              <span style={{
                display: 'inline-block',
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: '#181a1b',
                margin: '0 4px',
                opacity: 0.5,
                animation: 'dotPulse 1.2s infinite',
                animationDelay: '0.4s',
              }} />
            </div>
          )}
          {/* Error message UI */}
          {error && (
            <div style={{ color: '#c00', background: '#fff0f0', border: '1px solid #c00', borderRadius: 8, padding: '1rem', margin: '1rem 0', fontWeight: 600, fontSize: 16, textAlign: 'center', zIndex: 10 }}>
              {error}
            </div>
          )}
          <span style={{ color: '#181a1b', fontWeight: 600, fontSize: 18 }}>
            {STAGES[currentStage]}
          </span>
          {loading && (
            <div style={{ width: 240, height: 6, background: '#e0e0e0', borderRadius: 3, overflow: 'hidden', marginTop: 18 }}>
              <div style={{
                width: '40%',
                height: '100%',
                background: '#181a1b',
                borderRadius: 3,
                animation: 'progressBarIndeterminate 1.2s infinite linear'
              }} />
              <style>{`
                @keyframes progressBarIndeterminate {
                  0% { margin-left: -40%; }
                  100% { margin-left: 100%; }
                }
              `}</style>
            </div>
          )}
        </div>
        {/* Continue button (hide at Launch stage) */}
        {currentStage < STAGES.length - 1 && (
          <button
            style={{ marginTop: 32, background: '#181a1b', color: '#fff', border: 'none', borderRadius: 8, padding: '0.8rem 1.5rem', fontSize: '1rem', fontWeight: 600, cursor: 'pointer' }}
            onClick={() => setCurrentStage((s) => Math.min(s + 1, STAGES.length - 1))}
          >
            Continue
          </button>
        )}
      </main>

      {/* Right AI Feedback/Personas */}
      <aside style={{ width: 340, minWidth: 0, background: '#fff', borderLeft: '1px solid #eee', padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', gap: 24, overflow: 'auto' }}>
        {currentStage === STAGES.length - 1 ? (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 24, alignItems: 'center', marginTop: 32 }}>
            <button
              style={{
                width: 220,
                padding: '1rem 0',
                borderRadius: 10,
                border: '2px solid #007AFF',
                background: 'linear-gradient(90deg, #e5eefa 0%, #f0f2f8 100%)',
                color: '#007AFF',
                fontWeight: 700,
                fontSize: 18,
                cursor: 'pointer',
                marginBottom: 8,
                boxShadow: '0 2px 12px rgba(0,122,255,0.08)',
                letterSpacing: 0.5,
                transition: 'background 0.2s, color 0.2s',
              }}
              onClick={() => alert('Download Certificate of Completion (stub)')}
            >
              🏆 Download Certificate
            </button>
            <button style={{ width: 200, padding: '0.9rem 0', borderRadius: 8, border: '1.5px solid #181a1b', background: '#fff', color: '#181a1b', fontWeight: 600, fontSize: 17, cursor: 'pointer' }} onClick={() => handleGenerate('summary')}>
              Business Summary
            </button>
            <button style={{ width: 200, padding: '0.9rem 0', borderRadius: 8, border: '1.5px solid #181a1b', background: '#fff', color: '#181a1b', fontWeight: 600, fontSize: 17, cursor: 'pointer' }} onClick={openPitchDeckEditor}>
              Pitch Deck
            </button>
            <button style={{ width: 200, padding: '0.9rem 0', borderRadius: 8, border: '1.5px solid #181a1b', background: '#fff', color: '#181a1b', fontWeight: 600, fontSize: 17, cursor: 'pointer' }} onClick={() => handleGenerate('plan')}>
              Business Plan
            </button>
            <button style={{ width: 200, padding: '0.9rem 0', borderRadius: 8, border: '1.5px solid #181a1b', background: '#fff', color: '#181a1b', fontWeight: 600, fontSize: 17, cursor: 'pointer' }} onClick={() => handleGenerate('financial')}>
              Financial Plan
            </button>
            <button style={{ width: 200, padding: '0.9rem 0', borderRadius: 8, border: '1.5px solid #181a1b', background: '#fff', color: '#181a1b', fontWeight: 600, fontSize: 17, cursor: 'pointer' }} onClick={() => handleGenerate('businessModel')}>
              Business Model
            </button>
          </div>
        ) : (
          <>
            {/* Collapsible Summary section */}
            <div
              style={{
                fontWeight: 600,
                fontSize: 15,
                marginBottom: 4,
                color: showSummary ? '#222' : '#444', // improved contrast
                background: showSummary ? '#f0f0f0' : '#f0f2f8',
                padding: '4px 12px',
                borderRadius: 8,
                marginRight: 0,
                marginLeft: 0,
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
                userSelect: 'none',
                transition: 'background 0.25s cubic-bezier(.4,0,.2,1)',
              }}
              onClick={() => setShowSummary(s => !s)}
              tabIndex={0}
              role="button"
              aria-expanded={showSummary}
              onMouseEnter={e => (e.currentTarget.style.background = '#f0f0f0')}
              onMouseLeave={e => (e.currentTarget.style.background = showSummary ? '#f0f0f0' : '#f0f2f8')}
            >
              <span style={{ marginRight: 8, display: 'inline-block', transition: 'transform 0.25s cubic-bezier(.4,0,.2,1)', transform: showSummary ? 'rotate(90deg)' : 'rotate(0deg)' }}>
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 8L10 12L14 8" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </span>
              Summary
            </div>
            {showSummary && (
              <div className="fade-slide-in" style={{ color: '#444', fontSize: 15, marginBottom: 8 }}>{collectiveSummary}</div>
            )}
            {/* Divider between summary and feedback sections */}
            <div style={{
              width: '100%',
              height: 0,
              border: 'none',
              borderTop: '1.5px solid #e5e7eb',
              boxShadow: '0 2px 8px 0 rgba(90,110,230,0.04)',
              margin: '18px 0 -50px 0',
            }} />
            {/* Customer Feedback label above persona chat section */}
            <div
              style={{
                fontWeight: 600,
                fontSize: 15,
                margin: '16px 0 8px 0',
                color: showFeedback ? '#222' : '#444', // improved contrast
                background: showFeedback ? '#f0f0f0' : '#f0f2f8',
                padding: '4px 12px',
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
                userSelect: 'none',
                transition: 'background 0.25s cubic-bezier(.4,0,.2,1)',
              }}
              onClick={() => setShowFeedback(f => !f)}
              tabIndex={0}
              role="button"
              aria-expanded={showFeedback}
              onMouseEnter={e => (e.currentTarget.style.background = '#f0f0f0')}
              onMouseLeave={e => (e.currentTarget.style.background = showFeedback ? '#f0f0f0' : '#f0f2f8')}
            >
              <span style={{ marginRight: 8, display: 'inline-block', transition: 'transform 0.25s cubic-bezier(.4,0,.2,1)', transform: showFeedback ? 'rotate(90deg)' : 'rotate(0deg)' }}>
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 8L10 12L14 8" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </span>
              Customer Feedback
            </div>
            {showFeedback && (
              <div className="fade-slide-in">
                {personas.map((persona, personaIdx) => {
                  // Strong defensive: ensure feedback is always an array of strings
                  console.log('Persona feedback:', persona.feedback);
                  let feedbackArr: string[] = [];
                  if (Array.isArray(persona.feedback)) {
                    feedbackArr = persona.feedback.flatMap((item: any) =>
                      typeof item === 'string'
                        ? [item]
                        : Array.isArray(item?.feedback)
                          ? item.feedback.filter((f: any) => typeof f === 'string')
                          : []
                    );
                  } else if (
                    persona.feedback &&
                    typeof persona.feedback === 'object' &&
                    Array.isArray((persona.feedback as any).feedback)
                  ) {
                    feedbackArr = (persona.feedback as any).feedback.filter((f: any) => typeof f === 'string');
                  }
                  const feedbackCount = visibleFeedbackCounts[personaIdx] || 0;
                  const isThinking = feedbackCount < (feedbackArr.length || 0);
                  const isExpanded = expandedPersonas[persona.id] !== false; // default to expanded
                  return (
                    <div
                      key={persona.id}
                      style={{
                        marginBottom: 18,
                        borderBottom: '1px solid #f0f0f0',
                        paddingBottom: 12,
                        cursor: 'pointer',
                        transition: 'box-shadow 0.2s, transform 0.2s',
                        boxShadow: isExpanded ? '0 4px 16px rgba(90,110,230,0.08)' : 'none',
                        transform: isExpanded ? 'scale(1.02)' : 'scale(1)',
                        background: isExpanded ? '#f7f7fa' : '#fff',
                        borderRadius: 12,
                      }}
                      onClick={() => togglePersonaExpand(persona.id)}
                      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') togglePersonaExpand(persona.id); }}
                      tabIndex={0}
                      aria-expanded={isExpanded}
                      role="button"
                    >
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
                        <div style={{
                          marginRight: 10,
                          animation: isThinking ? 'pulseAvatar 1s infinite' : undefined,
                        }}>
                          <RobotFace size={32} />
                        </div>
                        <span style={{ fontWeight: 600, color: '#181a1b' }}>{persona.name}</span>
                        <span style={{ color: '#444', fontSize: 13, marginLeft: 8 }}>{persona.summary}</span>
                      </div>
                      {/* Expand/collapse feedback section */}
                      {isExpanded && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 180, overflowY: 'auto', width: '100%', maxWidth: '100%', minWidth: 0 }}>
                          {feedbackArr.slice(0, feedbackCount).map((fb: string, i: number) => (
                            <div
                              key={i}
                              style={{
                                position: 'relative',
                                background: 'linear-gradient(135deg, #f0f0f0 0%, #e8e8e8 100%)', // lighter grey gradient
                                borderRadius: 16,
                                padding: '10px 16px',
                                color: '#181a1b', // improved contrast
                                fontSize: 15,
                                boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                                width: '100%',
                                maxWidth: '100%',
                                minWidth: 0,
                                wordBreak: 'break-word',
                                overflowWrap: 'break-word',
                                boxSizing: 'border-box',
                                opacity: 0,
                                animation: `bubbleIn 0.5s cubic-bezier(.68,-0.55,.27,1.55) forwards`,
                              }}
                            >
                              {fb}
                              {/* Bubble tail */}
                              <span style={{
                                position: 'absolute',
                                left: 18,
                                bottom: -8,
                                width: 0,
                                height: 0,
                                borderLeft: '8px solid transparent',
                                borderRight: '8px solid transparent',
                                borderTop: '8px solid #f0f0f0',
                                filter: 'blur(0.5px)',
                                zIndex: 1,
                              }} />
                            </div>
                          ))}
                          {/* Typing indicator if more feedback is coming */}
                          {isThinking && (
                            <div style={{
                              background: '#f7f7fa',
                              borderRadius: 16,
                              padding: '10px 16px',
                              color: '#888',
                              fontSize: 15,
                              width: 'fit-content',
                              marginTop: 2,
                              marginBottom: 2,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 2,
                            }}>
                              <span style={{ letterSpacing: 2 }}>Typing</span>
                              <span style={{ display: 'inline-block', width: 18 }}>
                                <span className="dot" style={{
                                  display: 'inline-block',
                                  width: 4,
                                  height: 4,
                                  borderRadius: '50%',
                                  background: '#888',
                                  marginRight: 2,
                                  animation: 'typingDot 1s infinite',
                                  animationDelay: '0s',
                                }} />
                                <span className="dot" style={{
                                  display: 'inline-block',
                                  width: 4,
                                  height: 4,
                                  borderRadius: '50%',
                                  background: '#888',
                                  marginRight: 2,
                                  animation: 'typingDot 1s infinite',
                                  animationDelay: '0.2s',
                                }} />
                                <span className="dot" style={{
                                  display: 'inline-block',
                                  width: 4,
                                  height: 4,
                                  borderRadius: '50%',
                                  background: '#888',
                                  animation: 'typingDot 1s infinite',
                                  animationDelay: '0.4s',
                                }} />
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
        <style>{`
          @keyframes bubbleIn {
            0% { opacity: 0; transform: scale(0.85) translateY(16px); }
            60% { opacity: 1; transform: scale(1.05) translateY(-2px); }
            100% { opacity: 1; transform: scale(1) translateY(0); }
          }
          @keyframes pulseAvatar {
            0% { box-shadow: 0 0 0 0 rgba(90,110,230,0.3); }
            70% { box-shadow: 0 0 0 8px rgba(90,110,230,0); }
            100% { box-shadow: 0 0 0 0 rgba(90,110,230,0); }
          }
          @keyframes typingDot {
            0%, 80%, 100% { opacity: 0.2; }
            40% { opacity: 1; }
          }
          @keyframes dotPulse {
            0%, 100% { opacity: 0.5; transform: scale(1); }
            30% { opacity: 1; transform: scale(1.18); }
            60% { opacity: 0.5; transform: scale(1); }
          }
          @keyframes congratsPop {
            0% { opacity: 0; transform: scale(0.7); }
            40% { opacity: 1; transform: scale(1.12); }
            70% { opacity: 1; transform: scale(0.98); }
            100% { opacity: 1; transform: scale(1); }
          }
          .fade-slide-in {
            animation: fadeSlideIn 0.45s cubic-bezier(.4,0,.2,1);
          }
          @keyframes fadeSlideIn {
            0% { opacity: 0; transform: translateY(16px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          @keyframes glowPulse {
            0% { opacity: 0.7; transform: translateX(-50%) scaleX(1) scaleY(1); }
            100% { opacity: 1; transform: translateX(-50%) scaleX(1.12) scaleY(1.18); }
          }
          /* Accessibility: Focus styles for all interactive elements */
          [tabindex]:focus, [role="button"]:focus, button:focus {
            outline: 3px solid #181a1b !important;
            outline-offset: 2px !important;
            box-shadow: 0 0 0 3px #f0f0f0 !important;
            z-index: 2;
          }
        `}</style>
      </aside>
      {/* Pitch Deck Modal Editor */}
      {showPitchDeckEditor && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.18)',
          zIndex: 2000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={{
            background: '#fff',
            borderRadius: 16,
            boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
            width: 1100,
            minHeight: 600,
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'row',
            overflow: 'hidden',
            position: 'relative',
          }}>
            {/* Right sidebar: all slides */}
            <div style={{ width: 220, background: '#f7f8fa', borderLeft: '1.5px solid #eee', padding: '1.5rem 0.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {pitchDeckSlides.map((slide, idx) => (
                <div
                  key={slide.key}
                  onClick={() => setCurrentSlideIdx(idx)}
                  style={{
                    background: idx === currentSlideIdx ? 'linear-gradient(90deg, #5ad6ff22 0%, #5a6ee622 100%)' : '#fff',
                    border: idx === currentSlideIdx ? '2px solid #5ad6ff' : '1.5px solid #eee',
                    borderRadius: 10,
                    padding: '10px 12px',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: 15,
                    marginBottom: 2,
                    boxShadow: idx === currentSlideIdx ? '0 2px 8px #5ad6ff22' : undefined,
                    transition: 'all 0.18s cubic-bezier(.4,0,.2,1)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {PITCH_DECK_SLIDES[idx].label}
                </div>
              ))}
            </div>
            {/* Center: current slide editor */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f4f7fa' }}>
              <div style={{
                width: 600,
                minHeight: 340,
                background: '#fff',
                borderRadius: 12,
                boxShadow: '0 4px 24px rgba(90,110,230,0.10)',
                padding: '2.5rem 2.5rem 2rem 2.5rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'stretch',
                position: 'relative',
              }}>
                <input
                  style={{ fontSize: 26, fontWeight: 700, border: 'none', borderBottom: '2px solid #e5e5e5', marginBottom: 18, outline: 'none', background: 'transparent', padding: 2 }}
                  value={pitchDeckSlides[currentSlideIdx].title}
                  onChange={e => handleSlideFieldChange(currentSlideIdx, 'title', e.target.value)}
                  placeholder={PITCH_DECK_SLIDES[currentSlideIdx].defaultTitle}
                />
                <textarea
                  style={{ minHeight: 180, fontSize: 17, padding: 12, borderRadius: 8, border: '1.5px solid #e5e5e5', resize: 'vertical', background: '#fafbfc', fontWeight: 500 }}
                  value={pitchDeckSlides[currentSlideIdx].content}
                  onChange={e => handleSlideFieldChange(currentSlideIdx, 'content', e.target.value)}
                  placeholder={`Enter content for ${PITCH_DECK_SLIDES[currentSlideIdx].label}...`}
                />
                {/* Navigation buttons */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
                  <button
                    style={{ background: '#e5e5e5', color: '#222', border: 'none', borderRadius: 8, padding: '0.7rem 1.5rem', fontSize: '1rem', fontWeight: 600, cursor: currentSlideIdx === 0 ? 'not-allowed' : 'pointer', opacity: currentSlideIdx === 0 ? 0.5 : 1 }}
                    onClick={() => setCurrentSlideIdx(idx => Math.max(0, idx - 1))}
                    disabled={currentSlideIdx === 0}
                  >
                    Back
                  </button>
                  <button
                    style={{ background: '#181a1b', color: '#fff', border: 'none', borderRadius: 8, padding: '0.7rem 1.5rem', fontSize: '1rem', fontWeight: 600, cursor: currentSlideIdx === pitchDeckSlides.length - 1 ? 'not-allowed' : 'pointer', opacity: currentSlideIdx === pitchDeckSlides.length - 1 ? 0.5 : 1 }}
                    onClick={() => setCurrentSlideIdx(idx => Math.min(pitchDeckSlides.length - 1, idx + 1))}
                    disabled={currentSlideIdx === pitchDeckSlides.length - 1}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
            {/* Modal close and download controls */}
            <button onClick={() => setShowPitchDeckEditor(false)} style={{ position: 'absolute', top: 18, right: 24, fontSize: 28, background: 'none', border: 'none', cursor: 'pointer', color: '#888' }}>&times;</button>
            <button
              style={{ position: 'absolute', bottom: 28, right: 38, background: '#181a1b', color: '#fff', border: 'none', borderRadius: 8, padding: '0.9rem 1.5rem', fontSize: '1rem', fontWeight: 600, cursor: 'pointer', boxShadow: '0 2px 8px #181a1b22' }}
              onClick={downloadCustomPitchDeck}
            >
              Download Pitch Deck
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AutomatedDiscoveryPage; 