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

const CreateButton = styled.button`
  background: #181a1b;
  color: #fff;
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
    background: #000;
    transform: translateY(-1px);
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
    marketValidation: boolean;
    startupPlan: boolean;
    nextSteps: boolean;
  };
  views: number;
  createdAt: string;
  updatedAt: string;
}

interface StartupPlanDashboardProps {
  onSelectPlan?: (plan: StartupPlan) => void;
  setAppState?: (fn: (prev: any) => any) => void;
}

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

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/startup-plan`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch plans');
      
      const data = await response.json();
      setPlans(data.startupPlans);
      
      // Calculate stats
      const total = data.startupPlans.length;
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
    if (setAppState) {
      setAppState(prev => ({ ...prev, ...initialAppState, isTrackerVisible: prev.isTrackerVisible }));
      navigate('/');
    } else {
      localStorage.removeItem('appState');
      navigate('/');
    }
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
    if (!confirm('Are you sure you want to delete this startup plan?')) return;
    
    try {
      const response = await fetch(`${API_URL}/startup-plan/${planId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to delete plan');
      
      setPlans(plans.filter(p => p._id !== planId));
    } catch (err: any) {
      setError(err.message);
    }
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
          <div>Loading your startup plans...</div>
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
      <Logo src={logo} alt="ToolThinker Logo" onClick={() => navigate('/')} />
      <TopBar>
        <AvatarButton onClick={() => setAppState && setAppState(prev => ({ ...prev, stepBeforeAuth: 'dashboard', currentStep: 'profile' }))} aria-label="Profile">
          {user && user.profilePic ? (
            <TopBarAvatarImg src={user.profilePic} alt="Profile" />
          ) : user && user.email ? (
            <TopBarAvatar>
              {user.email
                .split('@')[0]
                .split(/[._-]/)
                .map(part => part[0]?.toUpperCase())
                .join('')
                .slice(0, 2) || 'U'}
            </TopBarAvatar>
          ) : (
            <TopBarAvatarImg src={defaultAvatar} alt="Avatar" />
          )}
        </AvatarButton>
      </TopBar>
      <Container>
        <Header>
          <Title>Startup Plans</Title>
          <CreateButton onClick={handleCreatePlan}>
            <FaPlus /> Create New Plan
          </CreateButton>
        </Header>

        <StatsGrid>
          <StatCard>
            <StatTitle>
              <FaChartLine /> Total Plans
            </StatTitle>
            <StatValue>{stats.total}</StatValue>
            <StatSubtitle>All startup plans</StatSubtitle>
          </StatCard>
          <StatCard>
            <StatTitle>
              <FaCheckCircle /> Active Plans
            </StatTitle>
            <StatValue>{stats.active}</StatValue>
            <StatSubtitle>Currently active</StatSubtitle>
          </StatCard>
          <StatCard>
            <StatTitle>
              <FaClock /> Draft Plans
            </StatTitle>
            <StatValue>{stats.draft}</StatValue>
            <StatSubtitle>In progress</StatSubtitle>
          </StatCard>
          <StatCard>
            <StatTitle>
              <FaStar /> Validated Plans
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
            All Plans
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
            <EmptyTitle>No startup plans yet</EmptyTitle>
            <EmptyText>Create your first startup plan to get started</EmptyText>
            <CreateButton onClick={handleCreatePlan}>
              <FaPlus /> Create Your First Plan
            </CreateButton>
          </EmptyState>
        ) : (
          <PlansGrid>
            {filteredPlans.map((plan) => (
              <PlanCard key={plan._id} onClick={() => handleViewPlan(plan)}>
                <PlanHeader>
                  <PlanTitle>{plan.title}</PlanTitle>
                  <PlanStatus status={plan.status}>{plan.status}</PlanStatus>
                </PlanHeader>
                
                <PlanSummary>{plan.summary}</PlanSummary>
                
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
                  <ActionButton variant="secondary" onClick={() => handleEditPlan(plan)}>
                    <FaEdit /> Edit
                  </ActionButton>
                  <ActionButton variant="danger" onClick={() => handleDeletePlan(plan._id)}>
                    <FaTrash /> Delete
                  </ActionButton>
                </PlanActions>
              </PlanCard>
            ))}
          </PlansGrid>
        )}
      </Container>
    </>
  );
} 