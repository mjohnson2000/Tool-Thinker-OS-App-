import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useLocation, Navigate, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import logo from '../../assets/logo.png';
import { FiTarget, FiCheckCircle, FiBook, FiAward, FiTrendingUp, FiUsers, FiDollarSign, FiCalendar, FiArrowRight, FiRefreshCw, FiChevronDown, FiChevronUp, FiPlay, FiStar, FiSearch, FiCode, FiClock, FiSkipForward, FiCircle } from 'react-icons/fi';
import { FaInfoCircle, FaArrowLeft } from 'react-icons/fa';
import axios from 'axios';
import { ProgressTracker } from './ProgressTracker';

interface ValidationResult {
  validationScore: number;
  recommendations: string[];
  risks: string[];
  nextSteps: string[];
}

interface StartupPlan {
  summary: string;
  sections: { [key: string]: string };
  marketEvaluation?: {
    score: number;
    competitors?: any[];
    customerResearch?: any[];
    insights?: any[];
  };
  mvp?: {
    problem?: string;
    solution?: string;
    assumptions?: string;
    test?: string;
    lastUpdated?: Date;
    isComplete?: boolean;
    userProgress?: {
      [stepKey: string]: {
        status: 'pending' | 'completed' | 'skipped';
        progress: { [key: string]: boolean };
        feedback: string;
        completedAt?: Date;
      };
    };
  };
  progress?: {
    ideaDiscovery?: boolean;
    customerResearch?: boolean;
    problemDefinition?: boolean;
    solutionDesign?: boolean;
    marketEvaluation?: boolean;
    businessPlan?: boolean;
    nextSteps?: boolean;
    mvp?: boolean;
  };
}

interface NextStepsHubProps {
  setAppState: React.Dispatch<React.SetStateAction<any>>;
  currentStep: string;
}

interface ActionItem {
  id: number;
  title: string;
  description: string;
  estimatedTime: string;
  priority: string;
  completed: boolean;
  category: string;
  progress?: number; // 0-100 percentage
  status?: 'not_started' | 'in_progress' | 'completed' | 'skipped';
  subtasks?: {
    id: string;
    title: string;
    completed: boolean;
  }[];
}

interface Course {
  _id: string;
  title: string;
  description: string;
  duration: number;
  rating: number;
  price: number;
  instructor: {
    name: string;
  };
}

interface Coach {
  _id: string;
  name: string;
  bio: string;
  expertise: string[];
  hourlyRate: number;
  rating: number;
  totalReviews: number;
}

const PageBackground = styled.div`
  min-height: 100vh;
  background: #f6f7f9;
  display: flex;
  flex-direction: column;
`;



const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  
  @media (max-width: 768px) {
    padding: 0 0.5rem;
  }
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 3rem;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: #222;
  margin-bottom: 0.5rem;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  color: #666;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const DashboardGrid = styled.div`
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 2rem;
  margin-bottom: 3rem;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
`;

const MainSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const SideSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const Card = styled.div`
  background: #fff;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 24px rgba(0,0,0,0.08);
  border: 1px solid #e9ecef;
  
  @media (max-width: 768px) {
    padding: 1.5rem;
    border-radius: 12px;
  }
`;

const CardTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: #181a1b;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  @media (max-width: 768px) {
    font-size: 1.3rem;
  }
`;

const ProgressSection = styled.div`
  margin-bottom: 2rem;
`;

const GoalDisplay = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 12px;
  border: 1px solid #e9ecef;
`;

const GoalInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const GoalIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #28a745, #20c997);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
`;

const GoalText = styled.div`
  h3 {
    font-size: 1.1rem;
    font-weight: 600;
    color: #181a1b;
    margin-bottom: 0.2rem;
  }
  p {
    color: #6c757d;
    font-size: 0.9rem;
  }
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 6px;
  background: #e9ecef;
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 0.5rem;
`;

const ProgressFill = styled.div<{ percent: number; status?: string }>`
  height: 100%;
  background: ${props => {
    if (props.status === 'completed') return '#28a745';
    if (props.status === 'in_progress') return '#fd7e14';
    if (props.status === 'skipped') return '#6c757d';
    return '#181a1b';
  }};
  width: ${props => Math.min(props.percent, 100)}%;
  transition: width 0.5s ease;
  border-radius: 3px;
`;

const ProgressText = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  color: #6c757d;
`;

const ActionItem = styled.div<{ completed?: boolean; status?: string }>`
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.5rem;
  border-radius: 12px;
  background: ${props => {
    if (props.completed) return '#f8fff9';
    if (props.status === 'in_progress') return '#fff8f0';
    if (props.status === 'skipped') return '#f8f9fa';
    return '#fff';
  }};
  border: 1px solid ${props => {
    if (props.completed) return '#d4edda';
    if (props.status === 'in_progress') return '#ffeaa7';
    if (props.status === 'skipped') return '#e9ecef';
    return '#e9ecef';
  }};
  margin-bottom: 1rem;
  transition: all 0.2s;
  cursor: pointer;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }
`;

const ActionIcon = styled.div<{ completed?: boolean }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${props => props.completed ? '#28a745' : '#f8f9fa'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.completed ? 'white' : '#6c757d'};
  font-size: 1.2rem;
  flex-shrink: 0;
`;

const ActionContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const ActionTitle = styled.h4<{ completed?: boolean }>`
  font-size: 1rem;
  font-weight: 600;
  color: ${props => props.completed ? '#28a745' : '#181a1b'};
  margin-bottom: 0.3rem;
  text-decoration: ${props => props.completed ? 'line-through' : 'none'};
  line-height: 1.3;
`;

const ActionDescription = styled.p`
  font-size: 0.9rem;
  color: #6c757d;
  margin-bottom: 0.8rem;
  line-height: 1.4;
`;

const ActionMeta = styled.div`
  display: flex;
  gap: 0.8rem;
  align-items: center;
  flex-wrap: wrap;
`;

const ActionMetaLeft = styled.div`
  display: flex;
  gap: 0.8rem;
  align-items: center;
  flex-wrap: wrap;
`;

const GetHelpButton = styled.button<{ isOpen?: boolean }>`
  background: ${props => props.isOpen ? '#6c757d' : '#f8f9fa'};
  color: ${props => props.isOpen ? 'white' : '#181a1b'};
  border: 1px solid ${props => props.isOpen ? '#6c757d' : '#e5e5e5'};
  border-radius: 6px;
  padding: 0.5rem 1rem;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  
  &:hover {
    background: #6c757d;
    color: white;
    border-color: #6c757d;
  }
`;

const HelpDropdown = styled.div`
  background: white;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  margin-top: 1rem;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
`;

const HelpSection = styled.div`
  padding: 1rem;
  border-bottom: 1px solid #f8f9fa;
  
  &:last-child {
    border-bottom: none;
  }
`;

const HelpSectionTitle = styled.h5`
  font-size: 0.9rem;
  font-weight: 600;
  color: #181a1b;
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const HelpItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem;
  border-radius: 6px;
  background: #f8f9fa;
  margin-bottom: 0.5rem;
  cursor: pointer;
  transition: background 0.2s;
  
  &:hover {
    background: #e9ecef;
  }
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const HelpItemInfo = styled.div`
  flex: 1;
`;

const HelpItemTitle = styled.div`
  font-size: 0.9rem;
  font-weight: 600;
  color: #181a1b;
  margin-bottom: 0.25rem;
`;

const HelpItemMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.8rem;
  color: #6c757d;
`;

const HelpItemAction = styled.button`
  background: #181a1b;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.4rem 0.8rem;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  
  &:hover {
    background: #222;
  }
`;

const ResourceGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
`;

const ResourceCard = styled.div`
  padding: 1.5rem;
  border-radius: 12px;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #e9ecef;
    transform: translateY(-2px);
  }
`;

const ResourceIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #181a1b;
  font-size: 1.2rem;
  margin-bottom: 1rem;
`;

const ResourceTitle = styled.h4`
  font-size: 1rem;
  font-weight: 600;
  color: #181a1b;
  margin-bottom: 0.5rem;
`;

const ResourceDescription = styled.p`
  font-size: 0.9rem;
  color: #6c757d;
`;

const MilestoneCard = styled.div`
  text-align: center;
  padding: 2rem 1rem;
  border-radius: 12px;
  background: linear-gradient(135deg, #ffd700, #ffed4e);
  border: 1px solid #ffc107;
  margin-bottom: 1rem;
`;

const MilestoneIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
`;

const MilestoneTitle = styled.h3`
  font-size: 1.3rem;
  font-weight: 700;
  color: #856404;
  margin-bottom: 0.5rem;
`;

const MilestoneDescription = styled.p`
  color: #856404;
  font-size: 0.9rem;
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
  transition: background 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    background: #000;
  }
  
  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
  }
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

const PLAN_DISPLAY_NAMES: Record<string, string> = {
  free: 'Free',
  basic: 'Basic',
  pro: 'Pro',
  elite: 'Elite',
};

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

// Mock data - in real app, this would come from backend
const mockProgress = {
  currentRevenue: 0,
  targetRevenue: 500,
  currentSales: 0,
  targetSales: 5,
  progressPercent: 0
};

// Mock courses and coaches data
const mockCourses: Course[] = [
  {
    _id: '1',
    title: 'Landing Page Mastery',
    description: 'Learn to create high-converting landing pages',
    duration: 3,
    rating: 4.8,
    price: 49,
    instructor: { name: 'Sarah Johnson' }
  },
  {
    _id: '2',
    title: 'Customer Interview Techniques',
    description: 'Master the art of customer discovery',
    duration: 2,
    rating: 4.9,
    price: 39,
    instructor: { name: 'Mike Chen' }
  },
  {
    _id: '3',
    title: 'Digital Marketing Fundamentals',
    description: 'Essential marketing strategies for startups',
    duration: 4,
    rating: 4.7,
    price: 59,
    instructor: { name: 'Lisa Rodriguez' }
  }
];

const mockCoaches: Coach[] = [
  {
    _id: '1',
    name: 'Sarah Johnson',
    bio: 'Web design expert with 10+ years experience',
    expertise: ['Web Design', 'Conversion Optimization'],
    hourlyRate: 150,
    rating: 4.9,
    totalReviews: 127
  },
  {
    _id: '2',
    name: 'Mike Chen',
    bio: 'Customer research specialist helping startups validate ideas',
    expertise: ['Customer Research', 'UX Design'],
    hourlyRate: 120,
    rating: 4.8,
    totalReviews: 89
  },
  {
    _id: '3',
    name: 'Lisa Rodriguez',
    bio: 'Growth marketing expert for SaaS companies',
    expertise: ['Digital Marketing', 'Growth Hacking'],
    hourlyRate: 180,
    rating: 4.9,
    totalReviews: 156
  }
];

const ActionProgress = styled.div`
  margin-top: 0.8rem;
  padding-top: 0.8rem;
  border-top: 1px solid #e9ecef;
`;

const StatusBadge = styled.span<{ status: string }>`
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 500;
  text-transform: uppercase;
  background: ${props => {
    switch (props.status) {
      case 'completed': return '#d4edda';
      case 'in_progress': return '#fff3cd';
      case 'skipped': return '#f8d7da';
      default: return '#e9ecef';
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'completed': return '#155724';
      case 'in_progress': return '#856404';
      case 'skipped': return '#721c24';
      default: return '#6c757d';
    }
  }};
`;

function calculateMvpProgress(mvpData: any): { progress: number; status: 'not_started' | 'in_progress' | 'completed' | 'skipped'; subtasks: any[] } {
  console.log('calculateMvpProgress called with:', mvpData);
  
  if (!mvpData || !mvpData.userProgress) {
    console.log('No MVP data or userProgress found, returning not_started');
    return { progress: 0, status: 'not_started', subtasks: [] };
  }

  const steps = ['validate', 'define', 'build', 'launch'];
  let completedSteps = 0;
  let skippedSteps = 0;
  let totalSubtasks = 0;
  let completedSubtasks = 0;
  const subtasks: any[] = [];

  steps.forEach(stepKey => {
    const stepProgress = mvpData.userProgress[stepKey];
    console.log(`Step ${stepKey}:`, stepProgress);
    if (stepProgress) {
      if (stepProgress.status === 'completed') {
        completedSteps++;
        // Count subtasks for completed steps
        Object.values(stepProgress.progress || {}).forEach((completed: any) => {
          totalSubtasks++;
          if (completed) completedSubtasks++;
        });
      } else if (stepProgress.status === 'skipped') {
        skippedSteps++;
      }
    }
  });

  const progress = steps.length > 0 ? (completedSteps / steps.length) * 100 : 0;
  
  let status: 'not_started' | 'in_progress' | 'completed' | 'skipped' = 'not_started';
  if (completedSteps === steps.length) status = 'completed';
  else if (completedSteps > 0 || skippedSteps > 0) status = 'in_progress';

  console.log(`MVP Progress calculation: completedSteps=${completedSteps}, skippedSteps=${skippedSteps}, progress=${progress}%, status=${status}`);
  
  return { progress, status, subtasks };
}

const getActionItems = (validationScore: number, startupPlan: StartupPlan): ActionItem[] => {
  // Calculate progress for validation, MVP, and explore separately
  const mvpProgress = calculateMvpProgress(startupPlan.mvp);
  const isMvpComplete = startupPlan.mvp?.isComplete || mvpProgress.status === 'completed';

  // Validation progress
  const validationStep = startupPlan.mvp?.userProgress?.validate;
  const isValidationComplete = validationStep?.status === 'completed';
  const validationProgress = validationStep ? 100 : 0;

  // Explore for opportunities progress
  const exploreStep = startupPlan.mvp?.userProgress?.explore;
  const isExploreComplete = exploreStep?.status === 'completed';
  const exploreProgress = exploreStep ? 100 : 0;

  // Customer validation progress
  const customerValidationStep = startupPlan.mvp?.userProgress?.customer_validation;
  const isCustomerValidationComplete = customerValidationStep?.status === 'completed';
  const customerValidationProgress = customerValidationStep ? 100 : 0;

  const iterateStep = startupPlan.mvp?.userProgress?.iterate;
  const isIterateComplete = iterateStep?.status === 'completed';
  const iterateProgress = iterateStep ? 100 : 0;

  const baseItems: ActionItem[] = [
    {
      id: 1,
      title: 'Validate Assumptions',
      description: 'Test your core business assumptions with real customers before building your MVP.',
      estimatedTime: '2-4 days',
      priority: 'High',
      completed: isValidationComplete,
      category: 'Validation',
      progress: validationProgress,
      status: isValidationComplete ? 'completed' : 'not_started',
      subtasks: []
    },
    {
      id: 3,
      title: "Create a simple MVP",
      description: "Build a minimal version of your product or service",
      estimatedTime: "1-2 weeks",
      priority: "Medium",
      completed: isMvpComplete,
      category: "Development",
      progress: mvpProgress.progress,
      status: mvpProgress.status,
      subtasks: [
        { id: 'define', title: 'Define MVP scope', completed: startupPlan.mvp?.userProgress?.define?.status === 'completed' },
        { id: 'build', title: 'Build MVP', completed: startupPlan.mvp?.userProgress?.build?.status === 'completed' },
        { id: 'launch', title: 'Launch and test', completed: startupPlan.mvp?.userProgress?.launch?.status === 'completed' }
      ]
    },
    {
      id: 4,
      title: 'Explore for opportunities',
      description: 'Analyze your MVP results and market feedback to identify new growth or pivot opportunities.',
      estimatedTime: '2-3 days',
      priority: 'Medium',
      completed: isExploreComplete,
      category: 'Strategy',
      progress: exploreProgress,
      status: isExploreComplete ? 'completed' : 'not_started',
      subtasks: []
    },
    {
      id: 5,
      title: "Customer Validation",
      description: "Validate your solution and business model with real customers through interviews, surveys, and feedback.",
      estimatedTime: "1-2 hours",
      priority: "High",
      completed: isCustomerValidationComplete,
      category: "Research",
      progress: customerValidationProgress,
      status: isCustomerValidationComplete ? 'completed' : 'not_started',
      subtasks: []
    },
    {
      id: 6,
      title: "Iterate or Launch",
      description: "Based on customer validation, either iterate on your MVP or prepare to launch to a wider audience.",
      estimatedTime: "2-5 days",
      priority: "High",
      completed: isIterateComplete,
      category: "Strategy",
      progress: iterateProgress,
      status: isIterateComplete ? 'completed' : 'not_started',
      subtasks: []
    }
  ];
  // Only keep actions up to and including 'Customer Validation'
  return baseItems.filter(item =>
    item.title === 'Validate Assumptions' ||
    item.title === 'Create a simple MVP' ||
    item.title === 'Explore for opportunities' ||
    item.title === 'Customer Validation' ||
    item.title === 'Iterate or Launch'
  );
};

const getRelevantCourses = (category: string): Course[] => {
  // In a real app, this would query the backend based on category
  return mockCourses.filter(course => 
    course.title.toLowerCase().includes(category.toLowerCase()) ||
    course.description.toLowerCase().includes(category.toLowerCase())
  ).slice(0, 2);
};

const getRelevantCoaches = (category: string): Coach[] => {
  // In a real app, this would query the backend based on category
  return mockCoaches.filter(coach => 
    coach.expertise.some(exp => 
      exp.toLowerCase().includes(category.toLowerCase())
    )
  ).slice(0, 2);
};

const resources = [
  {
    id: 1,
    title: "Landing Page Template",
    description: "Professional template to quickly build your landing page",
    icon: <FiTarget />
  },
  {
    id: 2,
    title: "Customer Interview Guide",
    description: "Questions and techniques for effective customer research",
    icon: <FiUsers />
  },
  {
    id: 3,
    title: "Pricing Strategy Guide",
    description: "How to price your product for maximum revenue",
    icon: <FiDollarSign />
  },
  {
    id: 4,
    title: "Marketing Checklist",
    description: "Step-by-step marketing launch checklist",
    icon: <FiTrendingUp />
  }
];

const milestones = [
  {
    id: 1,
    title: "First Customer",
    description: "Get your first paying customer",
    achieved: false
  },
  {
    id: 2,
    title: "$100 Revenue",
    description: "Reach your first $100 in revenue",
    achieved: false
  },
  {
    id: 3,
    title: "5 Sales",
    description: "Make 5 sales to validate demand",
    achieved: false
  },
  {
    id: 4,
    title: "$500 Revenue",
    description: "Reach your $500 revenue goal",
    achieved: false
  }
];

const ActionRoadmapContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ActionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
`;

const PriorityBadge = styled.span<{ priority: string }>`
  background: ${props => {
    switch (props.priority) {
      case "High":
        return "#dc3545";
      case "Medium":
        return "#fd7e14";
      default:
        return "#6c757d";
    }
  }};
  color: white;
  padding: 0.3rem 0.6rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const CategoryTag = styled.span`
  background: #e9ecef;
  padding: 0.3rem 0.6rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  color: #495057;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const CategoryIcon = styled.span`
  display: flex;
  align-items: center;
  margin-left: 6px;
  color: #495057;
  font-size: 1em;
`;

const TimeEstimate = styled.span`
  font-size: 0.8rem;
  color: #6c757d;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.3rem;
`;

const StrategySummary = styled.div<{ score: number }>`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  border-radius: 12px;
  background: ${props => {
    if (props.score >= 80) return '#f8fff9';
    if (props.score >= 60) return '#fff8e1';
    return '#fff3f3';
  }};
  border: 1px solid ${props => {
    if (props.score >= 80) return '#d4edda';
    if (props.score >= 60) return '#ffeaa7';
    return '#f8d7da';
  }};
  margin-bottom: 1.5rem;
`;

const StrategyIcon = styled.div<{ score: number }>`
  font-size: 2rem;
  color: ${props => {
    if (props.score >= 80) return '#28a745';
    if (props.score >= 60) return '#ffc107';
    return '#dc3545';
  }};
`;

const StrategyContent = styled.div`
  flex: 1;
`;

const StrategyTitle = styled.h3`
  font-size: 1.3rem;
  font-weight: 700;
  color: #181a1b;
  margin-bottom: 0.5rem;
`;

const StrategyDescription = styled.p`
  font-size: 0.9rem;
  color: #6c757d;
`;

const QuickActionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const QuickActionButton = styled.button`
  background: #fff;
  border: none;
  border-radius: 8px;
  padding: 1rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    background: #e9ecef;
  }
`;

const Tooltip = styled.div`
  display: none;
  position: absolute;
  left: 110%;
  top: 50%;
  transform: translateY(-50%);
  background: #222;
  color: #fff;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.9rem;
  z-index: 9999;
  white-space: nowrap;
  box-shadow: 0 2px 8px rgba(0,0,0,0.12);
`;

const PriorityBadgeWrapper = styled.button`
  position: relative;
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  background: none;
  border: none;
  border-radius: 999px;
  padding: 0;
  margin-left: 0;
  outline: none;
  &:hover ${Tooltip}, &:focus ${Tooltip} {
    display: block;
  }
  &:focus {
    outline: 2px solid #222;
  }
`;

const InfoIcon = styled(FaInfoCircle)`
  color: #adb5bd;
  opacity: 1;
  font-size: 1.1em;
`;

const CategoryInfoIcon = styled(FaInfoCircle)`
  color: #adb5bd;
  font-size: 1em;
  margin-left: 6px;
  cursor: pointer;
`;

const CategoryTooltip = styled.div`
  display: none;
  position: absolute;
  left: 110%;
  top: 50%;
  transform: translateY(-50%);
  background: #f8f9fa;
  color: #222;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.8rem;
  z-index: 9999;
  max-width: 500px;
  white-space: normal;
  box-shadow: 0 2px 8px rgba(0,0,0,0.12);
  text-transform: none;
`;

const CategoryTagWrapper = styled.span`
  position: relative;
  display: inline-flex;
  align-items: center;
  min-width: 100px;
  padding-right: 1.5rem;
  &:hover ${CategoryTooltip}, &:focus-within ${CategoryTooltip} {
    display: block;
  }
`;

const MyPlansButton = styled.button`
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

const ProceedButton = styled.button`
  display: block;
  margin: 2.5rem auto 0 auto;
  background: #181a1b;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 1rem 2.5rem;
  font-size: 1.15rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  transition: background 0.2s;
  &:hover {
    background: #000;
  }
`;

const RefreshButton = styled.button`
  background: #f8f9fa;
  color: #181a1b;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  &:hover {
    background: #e9ecef;
    border-color: #adb5bd;
  }
`;

const steps = [
  { key: 'idea', label: 'Your Interests' },
  { key: 'customer', label: 'Customer Profile' },
  { key: 'job', label: 'Customer Struggle' },
  { key: 'businessPlan', label: 'Manage Ideas', isPremium: true },
  { key: 'nextStepsHub', label: 'Business Discovery', isPremium: true },
  { key: 'launch', label: 'Launch', isPremium: true },
];

export function NextStepsHub({ setAppState, currentStep }: NextStepsHubProps) {
  const { user } = useAuth();
  const { planId } = useParams();
  const navigate = useNavigate();
  console.log('NextStepsHub mounted, planId:', planId);
  const [startupPlan, setStartupPlan] = useState<StartupPlan | null>(null);
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(mockProgress);
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [showMilestone, setShowMilestone] = useState(false);
  const [openHelpItem, setOpenHelpItem] = useState<number | null>(null);

  useEffect(() => {
    async function fetchPlan() {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get<StartupPlan>(`/api/business-plan/${planId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        const plan: StartupPlan = res.data;
        setStartupPlan(plan);
        if (plan.marketEvaluation && typeof plan.marketEvaluation.score === 'number') {
          setResult({
            validationScore: plan.marketEvaluation.score,
            recommendations: [],
            risks: [],
            nextSteps: []
          });
          setActionItems(getActionItems(plan.marketEvaluation.score, plan));
        } else {
          setResult(null);
          setActionItems(getActionItems(0, plan));
        }
      } catch (err) {
        setError('Failed to load business plan.');
      } finally {
        setLoading(false);
      }
    }
    if (planId) fetchPlan();
  }, [planId]);

  // Add a refresh function that can be called when returning from MVP Builder
  const refreshPlan = async () => {
    if (!planId) return;
    
    try {
      const res = await axios.get<StartupPlan>(`/api/business-plan/${planId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      const plan: StartupPlan = res.data;
      console.log('Refreshed plan:', plan);
      setStartupPlan(plan);
      
      if (plan.marketEvaluation && typeof plan.marketEvaluation.score === 'number') {
        const validationResult = {
          validationScore: plan.marketEvaluation.score,
          recommendations: [],
          risks: [],
          nextSteps: []
        };
        setResult(validationResult);
        const items = getActionItems(plan.marketEvaluation.score, plan);
        setActionItems(items);
      } else {
        setResult(null);
        const items = getActionItems(0, plan);
        setActionItems(items);
      }
    } catch (err) {
      console.error('Error refreshing plan:', err);
    }
  };

  // Refresh data when component mounts or when returning from other pages
  useEffect(() => {
    const handleFocus = () => {
      refreshPlan();
    };
    
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [planId]);

  if (loading) return <div style={{textAlign:'center',marginTop:'2rem'}}>Loading...</div>;
  if (error) return <div style={{color:'red',textAlign:'center',marginTop:'2rem'}}>{error}</div>;
  if (!startupPlan || !result) return <div style={{color:'red',textAlign:'center',marginTop:'2rem'}}>Business plan or evaluation result not found.</div>;

  const handleActionComplete = (actionId: number) => {
    setActionItems(prev => prev.map(item => 
      item.id === actionId ? { ...item, completed: !item.completed } : item
    ));
  };

  const handleResourceClick = (resourceId: number) => {
    // In real app, this would open the resource
    console.log(`Opening resource ${resourceId}`);
  };

  const handleGetHelpClick = (actionId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenHelpItem(openHelpItem === actionId ? null : actionId);
  };

  const handleCourseClick = (courseId: string) => {
    // In real app, this would navigate to the course page
    console.log(`Opening course ${courseId}`);
  };

  const handleCoachClick = (coachId: string) => {
    // In real app, this would navigate to the coach page
    console.log(`Opening coach ${coachId}`);
  };

  const completedActions = actionItems.filter(item => item.completed).length;
  const totalActions = actionItems.length;
  const overallProgress = totalActions > 0 ? (completedActions / totalActions) * 100 : 0;

  return (
    <PageBackground>
      <Container>
        <Header>
          <Title>Business Discovery Roadmap</Title>
          <Subtitle>
            Let's get you to your first {progress.targetSales} sales or ${progress.targetRevenue} in revenue
          </Subtitle>
          <RefreshButton onClick={refreshPlan} style={{ marginTop: '1rem' }}>
            🔄 Refresh Progress
          </RefreshButton>
        </Header>

        <DashboardGrid style={{ gridTemplateColumns: '320px 1fr' }}>
          <div>
            <ProgressTracker steps={steps} currentStepKey={'nextStepsHub'} onStepClick={() => {}} />
          </div>
          <MainSection>
            {/* Overall Progress */}
            <Card style={{ marginBottom: '2rem' }}>
              <CardTitle>
                <FiTrendingUp />
                Overall Progress
              </CardTitle>
              <ProgressBar>
                <ProgressFill percent={overallProgress} />
              </ProgressBar>
              <ProgressText>
                <span>{completedActions} of {totalActions} actions completed</span>
                <span>{Math.round(overallProgress)}%</span>
              </ProgressText>
            </Card>

            {/* Action Roadmap */}
            <Card>
              <CardTitle>
                <FiCheckCircle />
                Roadmap Actions ({completedActions}/{totalActions} Complete)
              </CardTitle>
              <StrategySummary score={result.validationScore}>
                <StrategyIcon score={result.validationScore}>
                  {result.validationScore >= 80 ? <FiTrendingUp /> : 
                   result.validationScore >= 60 ? <FiTarget /> : <FiRefreshCw />}
                </StrategyIcon>
                <StrategyContent>
                  <StrategyTitle>
                    {result.validationScore >= 80 ? "Scaling Strategy" : 
                     result.validationScore >= 60 ? "Refinement Strategy" : "Pivot Strategy"}
                  </StrategyTitle>
                  <StrategyDescription>
                    {result.validationScore >= 80 ? 
                      "Your idea shows strong validation! Focus on marketing and scaling to reach more customers." :
                     result.validationScore >= 60 ? 
                      "Good potential with room for improvement. Refine your value proposition and targeting." :
                      "Consider pivoting based on validation results. Explore new markets or customer segments."}
                  </StrategyDescription>
                </StrategyContent>
              </StrategySummary>
              <ActionRoadmapContainer>
                {actionItems.map(item => (
                  <div key={item.id}>
                    <ActionItem 
                      completed={item.completed}
                      status={item.status}
                      onClick={() => {
                        if (item.title === 'Validate Assumptions') {
                          navigate(`/validate-assumptions/${planId}`);
                        } else if (item.title === 'Create a simple MVP') {
                          navigate(`/mvp/${planId}`);
                        } else if (item.title === 'Explore for opportunities') {
                          navigate(`/explore-opportunities/${planId}`);
                        } else if (item.title === 'Customer Validation') {
                          navigate(`/customer-validation/${planId}`);
                        } else if (item.title === 'Iterate or Launch') {
                          navigate(`/iterate-or-launch/${planId}`);
                        } else {
                          handleActionComplete(item.id);
                        }
                      }}
                    >
                      <ActionIcon completed={item.completed}>
                        {item.completed ? <FiCheckCircle /> : 
                         item.status === 'in_progress' ? <FiClock /> :
                         item.status === 'skipped' ? <FiSkipForward /> : <FiArrowRight />}
                      </ActionIcon>
                      <ActionContent>
                        <ActionHeader>
                          <ActionTitle completed={item.completed}>{item.title}</ActionTitle>
                          <StatusBadge status={item.status || 'not_started'}>
                            {item.status || 'not_started'}
                          </StatusBadge>
                        </ActionHeader>
                        <ActionDescription>{item.description}</ActionDescription>
                        
                        {/* Progress Bar for each action */}
                        {item.progress !== undefined && (
                          <ActionProgress>
                            <ProgressBar>
                              <ProgressFill 
                                percent={item.progress} 
                                status={item.status}
                              />
                            </ProgressBar>
                            <ProgressText>
                              <span>{Math.round(item.progress)}% complete</span>
                              <span>{item.estimatedTime}</span>
                            </ProgressText>
                            
                            {/* Subtasks for MVP */}
                            {item.subtasks && item.subtasks.length > 0 && (
                              <div style={{ marginTop: '0.5rem' }}>
                                {item.subtasks.map(subtask => (
                                  <div key={subtask.id} style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '0.5rem',
                                    fontSize: '0.8rem',
                                    color: '#666',
                                    marginBottom: '0.2rem'
                                  }}>
                                    {subtask.completed ? <FiCheckCircle size={12} /> : <FiCircle size={12} />}
                                    {subtask.title}
                                  </div>
                                ))}
                              </div>
                            )}
                          </ActionProgress>
                        )}
                        
                        <ActionMeta>
                          <ActionMetaLeft>
                            <TimeEstimate>
                              <FiCalendar />
                              {item.estimatedTime}
                            </TimeEstimate>
                          </ActionMetaLeft>
                          <GetHelpButton 
                            isOpen={openHelpItem === item.id}
                            onClick={(e) => handleGetHelpClick(item.id, e)}
                          >
                            Get Help
                            {openHelpItem === item.id ? <FiChevronUp /> : <FiChevronDown />}
                          </GetHelpButton>
                        </ActionMeta>
                      </ActionContent>
                    </ActionItem>
                    
                    {openHelpItem === item.id && (
                      <HelpDropdown>
                        <HelpSection>
                          <HelpSectionTitle>
                            <FiBook />
                            Recommended Courses
                          </HelpSectionTitle>
                          {getRelevantCourses(item.category).map(course => (
                            <HelpItem key={course._id} onClick={() => handleCourseClick(course._id)}>
                              <HelpItemInfo>
                                <HelpItemTitle>{course.title}</HelpItemTitle>
                                <HelpItemMeta>
                                  <span>by {course.instructor.name}</span>
                                  <span>• {course.duration}h</span>
                                  <span>• ⭐ {course.rating}</span>
                                  <span>• ${course.price}</span>
                                </HelpItemMeta>
                              </HelpItemInfo>
                              <HelpItemAction>Enroll</HelpItemAction>
                            </HelpItem>
                          ))}
                        </HelpSection>
                        
                        <HelpSection>
                          <HelpSectionTitle>
                            <FiUsers />
                            Expert Coaches
                          </HelpSectionTitle>
                          {getRelevantCoaches(item.category).map(coach => (
                            <HelpItem key={coach._id} onClick={() => handleCoachClick(coach._id)}>
                              <HelpItemInfo>
                                <HelpItemTitle>{coach.name}</HelpItemTitle>
                                <HelpItemMeta>
                                  <span>{coach.expertise.join(', ')}</span>
                                  <span>• ⭐ {coach.rating} ({coach.totalReviews})</span>
                                  <span>• ${coach.hourlyRate}/hr</span>
                                </HelpItemMeta>
                              </HelpItemInfo>
                              <HelpItemAction>Book</HelpItemAction>
                            </HelpItem>
                          ))}
                        </HelpSection>
                      </HelpDropdown>
                    )}
                  </div>
                ))}
              </ActionRoadmapContainer>
              <ProceedButton onClick={() => navigate('/launch')}>Proceed To Launch</ProceedButton>
            </Card>
          </MainSection>

          <SideSection>
            {/* Remove Milestone Celebrations and Quick Actions cards */}
          </SideSection>
        </DashboardGrid>
      </Container>
    </PageBackground>
  );
} 