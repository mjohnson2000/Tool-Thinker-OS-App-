import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaEdit, FaEye, FaTrash, FaShare, FaHistory, FaUsers, FaChartLine, FaLightbulb, FaCheckCircle, FaClock, FaStar } from 'react-icons/fa';
import logo from '../../assets/logo.png';
import { initialAppState } from '../../App';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const Logo = styled.img`
  position: fixed;
  top: 24px;
  left: 24px;
  height: 80px;
  width: 80px;
  margin-right: 1rem;
  cursor: pointer;
  user-select: none;
  z-index: 1101;
`;

const TopBar = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  width: 100vw;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 2.7rem 2rem 0 0;
  z-index: 1000;
`;

const AvatarButton = styled.button`
  background: none;
  border: none;
  padding: 0;
  margin-left: 1rem;
  cursor: pointer;
  border-radius: 50%;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: box-shadow 0.2s;
  &:hover {
    box-shadow: 0 2px 8px rgba(0,0,0,0.12);
  }
`;

const TopBarAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #007aff22;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  color: #007aff;
  font-weight: 700;
`;

const TopBarAvatarImg = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  background: #e5e5e5;
`;

const PlanBadge = styled.div`
  margin-top: -0.2rem;
  background: #f3f4f6;
  color: #181a1b;
  font-size: 0.82rem;
  font-weight: 600;
  border-radius: 999px;
  border: 1.5px solid #181a1b;
  padding: 0.18rem 1.1rem 0.22rem 1.1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 48px;
  min-height: 22px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  letter-spacing: 0.01em;
  user-select: none;
`;

const PLAN_DISPLAY_NAMES: Record<string, string> = {
  free: 'Free',
  basic: 'Basic',
  pro: 'Pro',
  elite: 'Elite',
};

const defaultAvatar = 'https://ui-avatars.com/api/?name=User&background=007AFF&color=fff&size=128';

const Container = styled.div`
  max-width: 1200px;
  margin: 7.5rem auto 2rem auto;
  padding: 2rem 1rem;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: #181a1b;
  margin: 0;
`;

const CreateButton = styled.button<{ disabled?: boolean }>`
  background: ${({ disabled }) => disabled ? '#ccc' : '#181a1b'};
  color: ${({ disabled }) => disabled ? '#666' : '#fff'};
  border: none;
  border-radius: 12px;
  padding: 0.8rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
  
  &:hover {
    background: ${({ disabled }) => disabled ? '#ccc' : '#000'};
    transform: ${({ disabled }) => disabled ? 'none' : 'translateY(-1px)'};
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: #fff;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  border: 1px solid #e5e5e5;
`;

const StatTitle = styled.div`
  font-size: 0.9rem;
  color: #666;
  font-weight: 500;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: #181a1b;
`;

const StatSubtitle = styled.div`
  font-size: 0.85rem;
  color: #888;
  margin-top: 0.3rem;
`;

const Filters = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
`;

const FilterButton = styled.button<{ active?: boolean }>`
  background: ${({ active }) => active ? '#181a1b' : '#fff'};
  color: ${({ active }) => active ? '#fff' : '#181a1b'};
  border: 2px solid #181a1b;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: ${({ active }) => active ? '#000' : '#f8f9fa'};
  }
`;

const PlansGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
`;

const PlanCard = styled.div`
  background: #fff;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  border: 1px solid #e5e5e5;
  transition: all 0.2s;
  cursor: pointer;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 30px rgba(0,0,0,0.12);
  }
`;

const PlanHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

const PlanTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  color: #181a1b;
  margin: 0;
  line-height: 1.3;
`;

const PlanStatus = styled.div<{ status: string }>`
  background: ${({ status }) => {
    switch (status) {
      case 'active': return '#e8f5e8';
      case 'draft': return '#fff3cd';
      case 'archived': return '#f8d7da';
      case 'validated': return '#d1ecf1';
      default: return '#e9ecef';
    }
  }};
  color: ${({ status }) => {
    switch (status) {
      case 'active': return '#155724';
      case 'draft': return '#856404';
      case 'archived': return '#721c24';
      case 'validated': return '#0c5460';
      default: return '#6c757d';
    }
  }};
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: capitalize;
`;

const PlanSummary = styled.p`
  color: #666;
  font-size: 0.95rem;
  line-height: 1.5;
  margin-bottom: 1rem;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const PlanMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  font-size: 0.85rem;
  color: #888;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 6px;
  background: #e5e5e5;
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 1rem;
`;

const ProgressFill = styled.div<{ percent: number }>`
  height: 100%;
  background: linear-gradient(90deg, #181a1b 0%, #444 100%);
  width: ${({ percent }) => percent}%;
  transition: width 0.3s ease;
`;

const PlanActions = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const ActionButton = styled.button<{ variant?: 'primary' | 'secondary' | 'danger' }>`
  background: ${({ variant }) => {
    switch (variant) {
      case 'primary': return '#181a1b';
      case 'secondary': return '#fff';
      case 'danger': return '#dc3545';
      default: return '#f8f9fa';
    }
  }};
  color: ${({ variant }) => {
    switch (variant) {
      case 'primary': return '#fff';
      case 'secondary': return '#181a1b';
      case 'danger': return '#fff';
      default: return '#666';
    }
  }};
  border: 1px solid ${({ variant }) => {
    switch (variant) {
      case 'primary': return '#181a1b';
      case 'secondary': return '#181a1b';
      case 'danger': return '#dc3545';
      default: return '#e5e5e5';
    }
  }};
  border-radius: 6px;
  padding: 0.4rem 0.8rem;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  transition: all 0.2s;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: #666;
`;

const EmptyIcon = styled.div`
  font-size: 4rem;
  color: #ccc;
  margin-bottom: 1rem;
`;

const EmptyTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 600;
  color: #181a1b;
  margin-bottom: 0.5rem;
`;

const EmptyText = styled.p`
  font-size: 1rem;
  color: #666;
  margin-bottom: 2rem;
`;

interface StartupPlan {
  _id: string;
  title: string;
  summary: string;
  status: 'draft' | 'active' | 'archived' | 'validated';
  version: number;
  category: string;
  tags: string[];
  progress: {
    ideaDiscovery: boolean;
    customerResearch: boolean;
    problemDefinition: boolean;
    solutionDesign: boolean;
    marketEvaluation: boolean;
    startupPlan: boolean;
    nextSteps: boolean;
  };
  views: number;
  createdAt: string;
  updatedAt: string;
  marketEvaluation?: {
    score: number;
  };
}

interface StartupPlanDashboardProps {
  onSelectPlan?: (plan: StartupPlan) => void;
  setAppState?: (fn: (prev: any) => any) => void;
}

const MINIMUM_SCORE = 60;

export default function StartupPlanDashboard({ onSelectPlan, setAppState }: StartupPlanDashboardProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [plans, setPlans] = useState<StartupPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    draft: 0,
    validated: 0,
    averageProgress: 0
  });
  const [showScorePrompt, setShowScorePrompt] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<StartupPlan | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showDiscoveryModeModal, setShowDiscoveryModeModal] = useState(false);
  const [nextStepPlan, setNextStepPlan] = useState<StartupPlan | null>(null);

  useEffect(() => {
    fetchPlans(1);
  }, []);

  const fetchPlans = async (pageNum = 1) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/startup-plan?page=${pageNum}&limit=10`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.status === 401) {
        // Redirect to login if not authenticated
        window.location.href = '/login';
        return;
      }
      if (!response.ok) throw new Error('Failed to fetch plans');
      
      const data = await response.json();
      setPlans(data.startupPlans);
      setTotalPages(data.pagination.pages || 1);
      setPage(data.pagination.page || 1);
      
      // Use pagination.total for the true total
      const total = data.pagination.total || data.startupPlans.length;
      const active = data.startupPlans.filter((p: StartupPlan) => p.status === 'active').length;
      const draft = data.startupPlans.filter((p: StartupPlan) => p.status === 'draft').length;
      const validated = data.startupPlans.filter((p: StartupPlan) => p.status === 'validated').length;
      
      const totalProgress = data.startupPlans.reduce((sum: number, plan: StartupPlan) => {
        const progressFields = Object.values(plan.progress);
        const completed = progressFields.filter(Boolean).length;
        return sum + (completed / progressFields.length) * 100;
      }, 0);
      
      setStats({
        total,
        active,
        draft,
        validated,
        averageProgress: total > 0 ? Math.round(totalProgress / total) : 0
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlan = () => {
    window.localStorage.removeItem('appState');
    navigate('/app');
    window.location.reload();
  };

  const handleViewPlan = (plan: StartupPlan) => {
    if (onSelectPlan) {
      onSelectPlan(plan);
    } else {
      navigate(`/startup-plan/${plan._id}`);
    }
  };

  const handleEditPlan = (plan: StartupPlan) => {
    navigate(`/startup-plan/${plan._id}/edit`);
  };

  const handleDeletePlan = async (planId: string) => {
            if (!confirm('Are you sure you want to delete this business plan?')) return;
    
    try {
      const response = await fetch(`${API_URL}/startup-plan/${planId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to delete plan');
      
      const updatedPlans = plans.filter(p => p._id !== planId);
      setPlans(updatedPlans);
      // Recalculate stats immediately
      const total = updatedPlans.length;
      const active = updatedPlans.filter((p) => p.status === 'active').length;
      const draft = updatedPlans.filter((p) => p.status === 'draft').length;
      const validated = updatedPlans.filter((p) => p.status === 'validated').length;
      const totalProgress = updatedPlans.reduce((sum, plan) => {
        const progressFields = Object.values(plan.progress);
        const completed = progressFields.filter(Boolean).length;
        return sum + (completed / progressFields.length) * 100;
      }, 0);
      setStats({
        total,
        active,
        draft,
        validated,
        averageProgress: total > 0 ? Math.round(totalProgress / total) : 0
      });
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleNextSteps = (plan: StartupPlan) => {
    const score = plan.marketEvaluation && typeof plan.marketEvaluation.score === 'number' ? plan.marketEvaluation.score : 0;
    if (score < MINIMUM_SCORE) {
      setSelectedPlan(plan);
      setShowScorePrompt(true);
      return;
    }
    setNextStepPlan(plan);
    setShowDiscoveryModeModal(true);
  };

  const filteredPlans = plans.filter(plan => 
    statusFilter === 'all' || plan.status === statusFilter
  );

  const getProgressPercentage = (plan: StartupPlan) => {
    const progressFields = Object.values(plan.progress);
    const completed = progressFields.filter(Boolean).length;
    return Math.round((completed / progressFields.length) * 100);
  };

  if (loading) {
    return (
      <Container>
        <div style={{ textAlign: 'center', padding: '4rem' }}>
                      <div>Loading your business plans...</div>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <div style={{ textAlign: 'center', padding: '4rem', color: '#dc3545' }}>
          <div>Error: {error}</div>
        </div>
      </Container>
    );
  }

  return (
    <>
      <Logo src={logo} alt="ToolThinker Logo" onClick={() => navigate('/app')} />
      <TopBar>
        {user && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
            {user.profilePic ? (
              <TopBarAvatarImg src={user.profilePic} alt="Profile" onClick={() => setAppState && setAppState(prev => ({ ...prev, stepBeforeAuth: 'dashboard', currentStep: 'profile' }))} />
            ) : user.email ? (
              <TopBarAvatar onClick={() => setAppState && setAppState(prev => ({ ...prev, stepBeforeAuth: 'dashboard', currentStep: 'profile' }))} >
                {user.email.split('@')[0].split(/[._-]/).map(part => part[0]?.toUpperCase()).join('').slice(0, 2) || 'U'}
              </TopBarAvatar>
            ) : null}
            <PlanBadge>
              {!user?.isSubscribed
                ? PLAN_DISPLAY_NAMES['free']
                : PLAN_DISPLAY_NAMES[user?.subscriptionTier || 'basic']}
            </PlanBadge>
          </div>
        )}
      </TopBar>
      <Container>
        <Header>
          <Title>Business Ideas</Title>
          <CreateButton onClick={handleCreatePlan} disabled={stats.total >= 10}>
            <FaPlus /> Create New Idea
          </CreateButton>
        </Header>
        {stats.total >= 10 && (
          <div style={{ color: '#dc3545', textAlign: 'center', marginBottom: '1rem', fontWeight: 500 }}>
            You have reached the maximum of 10 business ideas. Please delete an idea to create a new one.
          </div>
        )}

        <StatsGrid>
          <StatCard>
            <StatTitle>
              <FaChartLine /> Total Ideas
            </StatTitle>
            <StatValue>{stats.total}</StatValue>
            <StatSubtitle>All business ideas</StatSubtitle>
          </StatCard>
          <StatCard>
            <StatTitle>
              <FaCheckCircle /> Active Ideas
            </StatTitle>
            <StatValue>{stats.active}</StatValue>
            <StatSubtitle>Currently active</StatSubtitle>
          </StatCard>
          <StatCard>
            <StatTitle>
              <FaClock /> Draft Ideas
            </StatTitle>
            <StatValue>{stats.draft}</StatValue>
            <StatSubtitle>In progress</StatSubtitle>
          </StatCard>
          <StatCard>
            <StatTitle>
              <FaStar /> Validated Ideas
            </StatTitle>
            <StatValue>{stats.validated}</StatValue>
            <StatSubtitle>Market validated</StatSubtitle>
          </StatCard>
        </StatsGrid>

        <Filters>
          <FilterButton 
            active={statusFilter === 'all'} 
            onClick={() => setStatusFilter('all')}
          >
            All Ideas
          </FilterButton>
          <FilterButton 
            active={statusFilter === 'active'} 
            onClick={() => setStatusFilter('active')}
          >
            Active
          </FilterButton>
          <FilterButton 
            active={statusFilter === 'draft'} 
            onClick={() => setStatusFilter('draft')}
          >
            Draft
          </FilterButton>
          <FilterButton 
            active={statusFilter === 'validated'} 
            onClick={() => setStatusFilter('validated')}
          >
            Validated
          </FilterButton>
        </Filters>

        {plans.length === 0 ? (
          <EmptyState>
            <EmptyIcon>📋</EmptyIcon>
            <EmptyTitle>No business ideas yet</EmptyTitle>
            <EmptyText>Create your first business idea to get started</EmptyText>
            <CreateButton onClick={handleCreatePlan}>
              <FaPlus /> Create Your First Idea
            </CreateButton>
          </EmptyState>
        ) : (
          <>
            <PlansGrid>
              {filteredPlans.map((plan) => (
                <PlanCard key={plan._id} onClick={() => handleViewPlan(plan)}>
                  <PlanHeader>
                    <PlanTitle>{plan.title}</PlanTitle>
                    <PlanStatus status={plan.status}>{plan.status}</PlanStatus>
                  </PlanHeader>
                  
                  <PlanSummary>{plan.summary}</PlanSummary>
                  <div style={{
                    fontWeight: 600,
                    color: plan.marketEvaluation && typeof plan.marketEvaluation.score === 'number'
                      ? (plan.marketEvaluation.score >= 80 ? '#28a745' : plan.marketEvaluation.score >= 60 ? '#ffc107' : '#dc3545')
                      : '#888',
                    marginBottom: '0.5rem',
                    fontSize: '1.1rem',
                  }}>
                    Evaluation Score: {plan.marketEvaluation && typeof plan.marketEvaluation.score === 'number' ? plan.marketEvaluation.score : 0}/100
                  </div>
                  <ProgressBar>
                    <ProgressFill percent={getProgressPercentage(plan)} />
                  </ProgressBar>
                  
                  <PlanMeta>
                    <span>v{plan.version}</span>
                    <span>{new Date(plan.updatedAt).toLocaleDateString()}</span>
                  </PlanMeta>
                  
                  <PlanActions onClick={(e) => e.stopPropagation()}>
                    <ActionButton variant="primary" onClick={() => handleViewPlan(plan)}>
                      <FaEye /> View
                    </ActionButton>
                    <ActionButton variant="danger" onClick={() => handleDeletePlan(plan._id)}>
                      <FaTrash /> Delete
                    </ActionButton>
                    <ActionButton variant="secondary" onClick={() => handleNextSteps(plan)}>
                      <FaCheckCircle /> Continue to Next Steps
                    </ActionButton>
                  </PlanActions>
                </PlanCard>
              ))}
            </PlansGrid>
            <div style={{ display: 'flex', justifyContent: 'center', margin: '2rem 0' }}>
              <button onClick={() => fetchPlans(page - 1)} disabled={page <= 1} style={{ marginRight: '1rem' }}>Previous</button>
              <span>Page {page} of {totalPages}</span>
              <button onClick={() => fetchPlans(page + 1)} disabled={page >= totalPages} style={{ marginLeft: '1rem' }}>Next</button>
            </div>
          </>
        )}
      </Container>
      {showScorePrompt && selectedPlan && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.45)',
          zIndex: 2000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={{
            background: '#fff',
            borderRadius: 16,
            padding: '2.5rem 2rem',
            maxWidth: 420,
            boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
            textAlign: 'center',
            position: 'relative',
          }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#dc3545' }}>Score Too Low</h2>
            <p style={{ fontSize: '1.1rem', marginBottom: '1.5rem', color: '#444' }}>
              Your business idea needs a minimum evaluation score of <b>{MINIMUM_SCORE}</b> to continue to the Next Steps Hub.<br /><br />
              Your current score is <b>{selectedPlan.marketEvaluation?.score ?? 0}</b>.<br /><br />
              To improve your score, click <b>View</b> on your idea and edit your responses.<br />
              <span style={{ fontWeight: 500 }}>
                After editing, be sure to click the <b>Evaluate Idea</b> button on the View page to update your evaluation score.
              </span>
            </p>
            <button
              style={{
                background: '#181a1b',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                padding: '0.7rem 1.5rem',
                fontSize: '1rem',
                fontWeight: 600,
                marginRight: 12,
                cursor: 'pointer',
              }}
              onClick={() => {
                setShowScorePrompt(false);
                navigate(`/startup-plan/${selectedPlan._id}`);
              }}
            >
              View & Edit Idea
            </button>
            <button
              style={{
                background: '#fff',
                color: '#181a1b',
                border: '1.5px solid #e5e5e5',
                borderRadius: 8,
                padding: '0.7rem 1.5rem',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
              onClick={() => setShowScorePrompt(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
      {showDiscoveryModeModal && nextStepPlan && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.45)',
          zIndex: 3000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={{
            background: '#fff',
            borderRadius: 16,
            padding: '2.5rem 2rem',
            maxWidth: 420,
            boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
            textAlign: 'center',
            position: 'relative',
          }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#181a1b' }}>Choose Discovery Mode</h2>
            <p style={{ fontSize: '1.1rem', marginBottom: '2rem', color: '#444' }}>
              How would you like to proceed with Business Discovery for <b>{nextStepPlan.title}</b>?
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <button
                style={{
                  background: '#181a1b',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  padding: '0.9rem 1.5rem',
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
                onClick={() => {
                  setShowDiscoveryModeModal(false);
                  navigate(`/next-steps-hub/${nextStepPlan._id}`);
                }}
              >
                Manual (Step-by-step Roadmap)
              </button>
              <button
                style={{
                  background: '#fff',
                  color: '#181a1b',
                  border: '1.5px solid #181a1b',
                  borderRadius: 8,
                  padding: '0.9rem 1.5rem',
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
                onClick={() => {
                  setShowDiscoveryModeModal(false);
                  navigate(`/automated-discovery/${nextStepPlan._id}`);
                }}
              >
                Automated (AI-Powered Discovery)
              </button>
            </div>
            <button
              style={{
                background: 'transparent',
                color: '#888',
                border: 'none',
                marginTop: 24,
                fontSize: '1rem',
                cursor: 'pointer',
              }}
              onClick={() => setShowDiscoveryModeModal(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
} 