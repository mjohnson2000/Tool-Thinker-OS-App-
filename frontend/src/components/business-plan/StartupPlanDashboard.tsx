import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaEdit, FaEye, FaTrash, FaShare, FaHistory, FaUsers, FaChartLine, FaLightbulb, FaCheckCircle, FaClock, FaStar, FaInfoCircle } from 'react-icons/fa';


const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const Logo = styled.div`
  position: fixed;
  top: 54px;
  left: 24px;
  display: flex; align-items: center; gap: .75rem;
  cursor: pointer;
  user-select: none;
  z-index: 1101;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  margin-left: 0.75rem;
  
  span { 
    font-family: 'Audiowide', 'Courier New', monospace; 
    font-size: 1.4rem; 
    color: #181a1b; 
    font-weight: 400;
    font-display: swap;
  }
  
  &:hover {
    transform: scale(1.05);
  }
  
  @media (max-width: 768px) {
    top: 50px;
    left: 20px;
    margin-left: 0.5rem;
  }
`;

const LogoSVG = styled.svg`
  width: 48px;
  height: 48px;
  border-radius: 10px;
  background: linear-gradient(135deg, #181a1b 0%, #2d2d2d 100%);
  padding: 6px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
`;

const AlphaSymbol = styled.text`
  font-family: 'Audiowide', 'Courier New', monospace;
  font-size: 14px;
  font-weight: 700;
  fill: #fff;
  text-anchor: middle;
  dominant-baseline: middle;
`;

const LetterA = styled.text`
  font-family: 'Audiowide', 'Courier New', monospace;
  font-size: 48px;
  font-weight: 700;
  fill: #181a1b;
  text-anchor: middle;
  dominant-baseline: middle;
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
  font-size: 2.4rem;
  font-weight: 800;
  color: var(--text-primary);
  margin: 0;
  letter-spacing: -0.03em;
  background: linear-gradient(135deg, #181a1b 0%, #4a4a4a 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -8px;
    left: 0;
    width: 60px;
    height: 3px;
    background: linear-gradient(90deg, #181a1b, #4a4a4a);
    border-radius: 2px;
  }
`;

const CreateButton = styled.button<{ disabled?: boolean }>`
  background: ${({ disabled }) => disabled ? '#ccc' : 'linear-gradient(135deg, #181a1b 0%, #2d2d2d 100%)'};
  color: ${({ disabled }) => disabled ? '#666' : '#fff'};
  border: none;
  border-radius: 16px;
  padding: 1.2rem 2rem;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
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
    background: ${({ disabled }) => disabled ? '#ccc' : 'linear-gradient(135deg, #000 0%, #181a1b 100%)'};
    transform: ${({ disabled }) => disabled ? 'none' : 'translateY(-3px)'};
    box-shadow: ${({ disabled }) => disabled ? '0 4px 12px rgba(0,0,0,0.15)' : '0 12px 32px rgba(0,0,0,0.25)'};
    
    &::before {
      left: 100%;
    }
  }
  
  &:active {
    transform: ${({ disabled }) => disabled ? 'none' : 'translateY(-1px)'};
    box-shadow: ${({ disabled }) => disabled ? '0 4px 12px rgba(0,0,0,0.15)' : '0 6px 16px rgba(0,0,0,0.2)'};
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: linear-gradient(135deg, #ffffff 0%, #fafbfc 100%);
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 
    0 4px 20px rgba(0,0,0,0.08),
    0 1px 3px rgba(0,0,0,0.1);
  border: 1px solid rgba(255,255,255,0.8);
  position: relative;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, #181a1b, #4a4a4a, #181a1b);
    border-radius: 20px 20px 0 0;
  }
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.12);
    background: linear-gradient(135deg, #f8f9fa 0%, #f1f3f4 100%);
  }
`;

const StatTitle = styled.div`
  font-size: 1rem;
  color: var(--text-secondary);
  font-weight: 600;
  margin-bottom: 0.8rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const StatValue = styled.div`
  font-size: 2.2rem;
  font-weight: 800;
  color: #181a1b;
  letter-spacing: -0.02em;
`;

const StatSubtitle = styled.div`
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin-top: 0.5rem;
  opacity: 0.8;
`;

const Filters = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
`;

const FilterButton = styled.button<{ active?: boolean }>`
  background: ${({ active }) => active ? 'linear-gradient(135deg, #181a1b 0%, #2d2d2d 100%)' : 'linear-gradient(135deg, #ffffff 0%, #fafbfc 100%)'};
  color: ${({ active }) => active ? '#fff' : '#181a1b'};
  border: 2px solid ${({ active }) => active ? '#181a1b' : '#e5e5e5'};
  border-radius: 12px;
  padding: 0.8rem 1.2rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  
  &:hover {
    background: ${({ active }) => active ? 'linear-gradient(135deg, #000 0%, #181a1b 100%)' : 'linear-gradient(135deg, #f8f9fa 0%, #f1f3f4 100%)'};
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.12);
  }
`;

const PlansGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
`;

const PlanCard = styled.div`
  background: linear-gradient(135deg, #ffffff 0%, #fafbfc 100%);
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 
    0 4px 20px rgba(0,0,0,0.08),
    0 1px 3px rgba(0,0,0,0.1);
  border: 1px solid rgba(255,255,255,0.8);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, #181a1b, #4a4a4a, #181a1b);
    border-radius: 20px 20px 0 0;
  }
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 32px rgba(0,0,0,0.15);
    background: linear-gradient(135deg, #f8f9fa 0%, #f1f3f4 100%);
  }
`;

const PlanHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.2rem;
`;

const PlanTitle = styled.h3`
  font-family: 'Audiowide', 'Courier New', monospace;
  font-size: 1.3rem;
  font-weight: 400;
  color: #181a1b;
  margin: 0;
  line-height: 1.3;
  letter-spacing: -0.02em;
  font-display: swap;
`;

const PlanStatus = styled.div<{ status: string }>`
  background: ${({ status }) => {
    switch (status) {
      case 'active': return 'linear-gradient(135deg, #e8f5e8 0%, #d4edda 100%)';
      case 'draft': return 'linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%)';
      case 'archived': return 'linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%)';
      case 'validated': return 'linear-gradient(135deg, #d1ecf1 0%, #bee5eb 100%)';
      default: return 'linear-gradient(135deg, #e9ecef 0%, #dee2e6 100%)';
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
  padding: 0.4rem 1rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 700;
  text-transform: capitalize;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
`;

const PlanSummary = styled.p`
  color: var(--text-secondary);
  font-size: 1rem;
  line-height: 1.6;
  margin-bottom: 1.2rem;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const PlanMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.2rem;
  font-size: 0.9rem;
  color: var(--text-secondary);
  opacity: 0.8;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: linear-gradient(135deg, #f0f0f0 0%, #e5e5e5 100%);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 1.2rem;
  box-shadow: inset 0 1px 3px rgba(0,0,0,0.1);
`;

const ProgressFill = styled.div<{ percent: number }>`
  height: 100%;
  background: linear-gradient(90deg, #181a1b 0%, #4a4a4a 100%);
  width: ${({ percent }) => percent}%;
  transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 4px;
`;

const PlanActions = styled.div`
  display: flex;
  gap: 0.8rem;
  flex-wrap: wrap;
  margin-top: 1.5rem;
`;

const ActionButton = styled.button<{ variant?: 'primary' | 'secondary' | 'danger' }>`
  background: ${({ variant }) => {
    switch (variant) {
      case 'primary': return 'linear-gradient(135deg, #181a1b 0%, #2d2d2d 100%)';
      case 'secondary': return 'linear-gradient(135deg, #ffffff 0%, #fafbfc 100%)';
      case 'danger': return 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)';
      default: return 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)';
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
  border: 2px solid ${({ variant }) => {
    switch (variant) {
      case 'primary': return '#181a1b';
      case 'secondary': return '#e5e5e5';
      case 'danger': return '#dc3545';
      default: return '#e5e5e5';
    }
  }};
  border-radius: 12px;
  padding: 0.6rem 1rem;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
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
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0,0,0,0.15);
    
    &::before {
      left: 100%;
    }
  }
  
  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: var(--text-secondary);
  background: linear-gradient(135deg, #ffffff 0%, #fafbfc 100%);
  border-radius: 20px;
  border: 1px solid rgba(255,255,255,0.8);
  box-shadow: 
    0 4px 20px rgba(0,0,0,0.08),
    0 1px 3px rgba(0,0,0,0.1);
`;

const EmptyIcon = styled.div`
  font-size: 4rem;
  color: #e5e5e5;
  margin-bottom: 1.5rem;
  opacity: 0.6;
`;

const EmptyTitle = styled.h3`
  font-size: 1.8rem;
  font-weight: 700;
  color: #181a1b;
  margin-bottom: 0.8rem;
  letter-spacing: -0.02em;
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

const ModalBackdrop = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.32);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
`;
const ModalCard = styled.div`
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.18);
  padding: 2.5rem 2rem 2rem 2rem;
  max-width: 420px;
  width: 100%;
  text-align: center;
  position: relative;
`;
const ModalActions = styled.div`
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  margin-top: 2rem;
`;

const DangerButton = styled(ActionButton)`
  background: #fff;
  color: #181a1b;
  border: 1.5px solid #181a1b;
  font-weight: 500;
  &:hover {
    background: #fff0f0;
    color: #181a1b;
    border-color: #181a1b;
  }
`;

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

  const [deleteModalPlanId, setDeleteModalPlanId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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
    setDeleteModalPlanId(planId);
  };

  const confirmDeletePlan = async () => {
    if (!deleteModalPlanId) return;
    setIsDeleting(true);
    try {
      const response = await fetch(`${API_URL}/startup-plan/${deleteModalPlanId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to delete plan');
      const updatedPlans = plans.filter(p => p._id !== deleteModalPlanId);
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
      setDeleteModalPlanId(null);
    } catch (err: any) {
      setError(err.message);
      setDeleteModalPlanId(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleNextSteps = (plan: StartupPlan) => {
    const score = plan.marketEvaluation && typeof plan.marketEvaluation.score === 'number' ? plan.marketEvaluation.score : 0;
    if (score < MINIMUM_SCORE) {
      setSelectedPlan(plan);
      setShowScorePrompt(true);
      return;
    }
    navigate(`/validate/${plan._id}`);
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
      <Logo onClick={() => navigate('/')}>
        <LogoSVG viewBox="0 0 56 56" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{stopColor: '#fff', stopOpacity: 1}} />
              <stop offset="100%" style={{stopColor: '#f0f0f0', stopOpacity: 1}} />
            </linearGradient>
          </defs>
          <rect width="48" height="48" rx="10" fill="url(#logoGradient)" />
          <AlphaSymbol x="24" y="10">α</AlphaSymbol>
          <LetterA x="24" y="30">A</LetterA>
        </LogoSVG>
        <span className="font-audiowide">Alpha Hustler</span>
      </Logo>
      <Container>
        <Header>
                      <Title>Side Hustles</Title>
          <CreateButton onClick={handleCreatePlan} disabled={stats.total >= 10}>
                          <FaPlus /> Create New Side Hustle
          </CreateButton>
        </Header>
        {stats.total >= 10 && (
          <div style={{ color: '#dc3545', textAlign: 'center', marginBottom: '1rem', fontWeight: 500 }}>
                          You have reached the maximum of 10 side hustles. Please delete an idea to create a new one.
          </div>
        )}

        <StatsGrid>
          <StatCard>
            <StatTitle>
              <FaChartLine /> Total Ideas
            </StatTitle>
            <StatValue>{stats.total}</StatValue>
                          <StatSubtitle>All side hustles</StatSubtitle>
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
            <StatSubtitle>Market validated via automated discovery</StatSubtitle>
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
            <EmptyTitle>No side hustles yet</EmptyTitle>
                          <EmptyText>Create your first side hustle to get started</EmptyText>
            <CreateButton onClick={handleCreatePlan}>
                              <FaPlus /> Create Your First Side Hustle
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
                  
                  {/* In Progress Indicator */}
                  {plan.status === 'active' && plan.progress && (
                    <div 
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        marginBottom: '0.5rem',
                        fontSize: '0.9rem',
                        color: '#ff9500',
                        fontWeight: 600,
                        cursor: 'help',
                      }}
                      title="This idea is currently being validated through our automated discovery process."
                    >
                      <FaClock style={{ fontSize: '0.8rem' }} />
                      Automated Discovery in Progress
                      <FaInfoCircle style={{ fontSize: '0.7rem', opacity: 0.7 }} />
                    </div>
                  )}
                  
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
                    <DangerButton onClick={() => handleDeletePlan(plan._id)}>
                      <FaTrash style={{ color: '#181a1b' }} /> Delete
                    </DangerButton>
                    {plan.status === 'validated' ? (
                      <ActionButton variant="secondary" onClick={() => navigate(`/validate/${plan._id}`)}>
                        <FaHistory /> View Validation Results
                      </ActionButton>
                    ) : (
                      <ActionButton variant="secondary" onClick={() => handleNextSteps(plan)}>
                        <FaCheckCircle /> Validate
                      </ActionButton>
                    )}
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
      {deleteModalPlanId && (
        <ModalBackdrop>
          <ModalCard>
            <h2 style={{ fontSize: '1.3rem', marginBottom: '1.2rem', color: '#dc3545' }}>Delete Business Idea?</h2>
            <p style={{ fontSize: '1.05rem', color: '#444', marginBottom: '1.5rem' }}>
              Are you sure you want to delete this business idea? This action cannot be undone.
            </p>
            <ModalActions>
              <DangerButton onClick={confirmDeletePlan} disabled={isDeleting}>
                {isDeleting ? 'Deleting...' : 'Delete'}
              </DangerButton>
              <ActionButton variant="secondary" onClick={() => setDeleteModalPlanId(null)} disabled={isDeleting}>
                Cancel
              </ActionButton>
            </ModalActions>
          </ModalCard>
        </ModalBackdrop>
      )}
    </>
  );
} 