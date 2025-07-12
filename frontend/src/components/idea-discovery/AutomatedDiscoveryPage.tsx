import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Lottie from 'lottie-react';
import robotLottie from '../../assets/robot-lottie.json';

interface Persona {
  id: string;
  name: string;
  avatarUrl?: string;
  summary: string;
  feedback: string[];
}

const STAGES = [
  'Problem Validation',
  'Customer Persona',
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

  // Fetch business plan on mount
  React.useEffect(() => {
    async function fetchBusinessPlan() {
      setLoading(true);
      setError(null);
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
      } catch (err: any) {
        setError(err.message || 'Unknown error');
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
      } catch (err: any) {
        setError(err.message || 'Unknown error');
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
      } catch (err: any) {
        setError(err.message || 'Unknown error');
      } finally {
        setLoading(false);
      }
    }
    fetchFeedback();
  }, [currentStage, personas.length, businessIdea, customerDescription]);

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#f7f8fa' }}>
      {/* Progress Sidebar */}
      <aside style={{ width: 120, background: '#fff', borderRight: '1px solid #eee', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 32 }}>
        {STAGES.map((stage, idx) => (
          <div key={stage} style={{ marginBottom: 32, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              background: idx < currentStage ? '#232323' : idx === currentStage ? '#bdbdbd' : '#e5e5e5',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: 16,
              marginBottom: 4,
            }}>{idx < currentStage ? '✓' : idx + 1}</div>
            <span style={{ fontSize: 12, color: idx === currentStage ? '#181a1b' : '#888', textAlign: 'center', maxWidth: 80 }}>{stage}</span>
          </div>
        ))}
      </aside>

      {/* Center Visualization */}
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 0 }}>
        <div style={{ width: 420, height: 340, background: '#fafbfc', borderRadius: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 16px rgba(0,0,0,0.06)', flexDirection: 'column', border: '2px solid #181a1b' }}>
          <Lottie
            animationData={robotLottie}
            loop={true}
            autoplay={true}
            style={{ width: 240, height: 240, marginBottom: 16 }}
            aria-label="AI robot animation"
          />
          <span style={{ color: '#181a1b', fontWeight: 600, fontSize: 18 }}>
            {loading ? 'Loading AI personas and feedback...' : 'Automated Engine Running...'}
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
      </main>

      {/* Right AI Feedback/Personas */}
      <aside style={{ width: 340, background: '#fff', borderLeft: '1px solid #eee', padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>{STAGES[currentStage]}</div>
          <div style={{ color: '#444', fontSize: 15, marginBottom: 8 }}>{collectiveSummary}</div>
        </div>
        {personas.map((persona) => (
          <div key={persona.id} style={{ marginBottom: 18, borderBottom: '1px solid #f0f0f0', paddingBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#e5eefa', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 16, marginRight: 10 }}>{persona.name[0]}</div>
              <span style={{ fontWeight: 600 }}>{persona.name}</span>
              <span style={{ color: '#888', fontSize: 13, marginLeft: 8 }}>{persona.summary}</span>
            </div>
            <ul style={{ margin: 0, paddingLeft: 20, color: '#333', fontSize: 14 }}>
              {persona.feedback.map((fb, i) => (
                <li key={i}>{fb}</li>
              ))}
            </ul>
          </div>
        ))}
        <button
          style={{ marginTop: 'auto', background: '#181a1b', color: '#fff', border: 'none', borderRadius: 8, padding: '0.8rem 1.5rem', fontSize: '1rem', fontWeight: 600, cursor: 'pointer' }}
          onClick={() => setCurrentStage((s) => Math.min(s + 1, STAGES.length - 1))}
        >
          Continue
        </button>
        <button
          style={{ background: '#fff', color: '#181a1b', border: '1.5px solid #181a1b', borderRadius: 8, padding: '0.8rem 1.5rem', fontSize: '1rem', fontWeight: 600, cursor: 'pointer', marginTop: 12 }}
          onClick={() => navigate(-1)}
        >
          Back to Dashboard
        </button>
      </aside>
    </div>
  );
}

export default AutomatedDiscoveryPage; 