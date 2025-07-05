import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useLocation, Navigate, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import logo from '../../assets/logo.png';
import { FiTarget, FiCheckCircle, FiBook, FiAward, FiTrendingUp, FiUsers, FiDollarSign, FiCalendar, FiArrowRight, FiRefreshCw, FiChevronDown, FiChevronUp, FiPlay, FiStar, FiSearch, FiCode } from 'react-icons/fi';
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

const TopBar = styled.div`
  width: 100%;
  max-width: 1200px;
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
  height: 12px;
  background: #e9ecef;
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 1rem;
`;

const ProgressFill = styled.div<{ percent: number }>`
  height: 100%;
  background: linear-gradient(90deg, #28a745, #20c997);
  width: ${props => Math.min(props.percent, 100)}%;
  transition: width 0.5s ease;
  border-radius: 6px;
`;

const ProgressText = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  color: #6c757d;
`;

const ActionItem = styled.div<{ completed?: boolean }>`
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.5rem;
  border-radius: 12px;
  background: ${props => props.completed ? '#f8fff9' : '#fff'};
  border: 1px solid ${props => props.completed ? '#d4edda' : '#e9ecef'};
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
  background: #007AFF;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.4rem 0.8rem;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  
  &:hover {
    background: #0056b3;
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

const getActionItems = (validationScore: number, startupPlan: StartupPlan): ActionItem[] => {
  const baseItems: ActionItem[] = [
    {
      id: 3,
      title: "Create a simple MVP",
      description: "Build a minimal version of your product or service",
      estimatedTime: "1-2 weeks",
      priority: "Medium",
      completed: false,
      category: "Development"
    },
    {
      id: 2,
      title: "Set up customer interviews",
      description: "Schedule 5-10 customer interviews to validate your solution",
      estimatedTime: "1-2 hours",
      priority: "High",
      completed: false,
      category: "Research"
    }
  ];

  // High Score (80+): Focus on marketing and scaling
  if (validationScore >= 80) {
    baseItems.push(
      {
        id: 4,
        title: "Launch marketing campaign",
        description: "Start promoting your validated solution across multiple channels",
        estimatedTime: "3-5 hours",
        priority: "High",
        completed: false,
        category: "Marketing"
      },
      {
        id: 5,
        title: "Set up analytics tracking",
        description: "Implement conversion tracking to measure campaign performance",
        estimatedTime: "1-2 hours",
        priority: "Medium",
        completed: false,
        category: "Analytics"
      },
      {
        id: 6,
        title: "Create customer onboarding process",
        description: "Design a smooth experience for new customers",
        estimatedTime: "4-6 hours",
        priority: "Medium",
        completed: false,
        category: "Operations"
      },
      {
        id: 7,
        title: "Plan scaling strategy",
        description: "Outline how to grow from 5 to 50 customers",
        estimatedTime: "2-3 hours",
        priority: "Medium",
        completed: false,
        category: "Strategy"
      }
    );
  } 
  // Medium Score (60-79): Refine value proposition
  else if (validationScore >= 60) {
    baseItems.push(
      {
        id: 4,
        title: "Refine your value proposition",
        description: "Based on validation feedback, improve your messaging and positioning",
        estimatedTime: "2-3 hours",
        priority: "High",
        completed: false,
        category: "Strategy"
      },
      {
        id: 5,
        title: "Conduct competitor analysis",
        description: "Deep dive into what competitors are doing well and poorly",
        estimatedTime: "3-4 hours",
        priority: "Medium",
        completed: false,
        category: "Research"
      },
      {
        id: 6,
        title: "Test different pricing models",
        description: "Experiment with pricing to find the sweet spot",
        estimatedTime: "2-3 hours",
        priority: "Medium",
        completed: false,
        category: "Strategy"
      },
      {
        id: 7,
        title: "Improve customer targeting",
        description: "Refine your ideal customer profile based on feedback",
        estimatedTime: "1-2 hours",
        priority: "Medium",
        completed: false,
        category: "Research"
      }
    );
  } 
  // Low Score (<60): Re-evaluate market and pivot
  else {
    baseItems.splice(2, 0, {
      id: 6,
      title: "Explore pivot opportunities",
      description: "Identify potential new directions for your business idea",
      estimatedTime: "3-4 hours",
      priority: "Medium",
      completed: false,
      category: "Strategy"
    });
    baseItems.splice(3, 0, {
      id: 7,
      title: "Validate new assumptions",
      description: "Test new hypotheses about market and customer needs",
      estimatedTime: "2-3 hours",
      priority: "Medium",
      completed: false,
      category: "Validation"
    });
    baseItems.splice(4, 0, {
      id: 8,
      title: "Iterate or exit",
      description: "Decide whether to pivot, iterate, or exit based on your new findings and validation results.",
      estimatedTime: "1-2 hours",
      priority: "High",
      completed: false,
      category: "Strategy"
    });
  }

  return baseItems;
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

const steps = [
  { key: 'idea', label: 'Your Interests' },
  { key: 'customer', label: 'Customer Persona' },
  { key: 'job', label: 'Customer Job' },
  { key: 'businessPlan', label: 'Business Idea' },
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
  const [actionItems, setActionItems] = useState(getActionItems(result?.validationScore || 0, startupPlan || { summary: '', sections: {} }));
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
        console.log('Fetched plan:', plan);
        setStartupPlan(plan);
        if (plan.marketEvaluation && typeof plan.marketEvaluation.score === 'number') {
          setResult({
            validationScore: plan.marketEvaluation.score,
            recommendations: [],
            risks: [],
            nextSteps: []
          });
        } else {
          setResult(null);
        }
      } catch (err) {
        console.error('Error fetching plan:', err);
        setError('Failed to load business plan.');
      } finally {
        setLoading(false);
      }
    }
    if (planId) fetchPlan();
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

  return (
    <PageBackground>
      <TopBar>
        <img 
          src={logo} 
          alt="ToolThinker Logo" 
          style={{ 
            height: 90, 
            width: 90, 
            borderRadius: 50, 
            cursor: 'pointer', 
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)' 
          }} 
          onClick={() => navigate('/app')} 
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', marginLeft: 'auto' }}>
          <MyPlansButton onClick={() => navigate('/plans')}><FaArrowLeft /> My Business Ideas</MyPlansButton>
          {user && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
              {user.profilePic ? (
                <Avatar 
                  src={user.profilePic} 
                  alt="Profile" 
                  onClick={() => setAppState((prev: any) => ({ ...prev, stepBeforeAuth: currentStep, currentStep: 'profile' }))} 
                />
              ) : user.email ? (
                <Initials 
                  onClick={() => setAppState((prev: any) => ({ ...prev, stepBeforeAuth: currentStep, currentStep: 'profile' }))}
                >
                  {user.email.split('@')[0].split(/[._-]/).map(part => part[0]?.toUpperCase()).join('').slice(0, 2) || 'U'}
                </Initials>
              ) : null}
              <PlanBadge>
                {!user?.isSubscribed
                  ? PLAN_DISPLAY_NAMES['free']
                  : PLAN_DISPLAY_NAMES[user?.subscriptionTier || 'basic']}
              </PlanBadge>
            </div>
          )}
        </div>
      </TopBar>

      <Container>
        <Header>
          <Title>Business Discovery Roadmap</Title>
          <Subtitle>
            Let's get you to your first {progress.targetSales} sales or ${progress.targetRevenue} in revenue
          </Subtitle>
        </Header>

        <DashboardGrid style={{ gridTemplateColumns: '320px 1fr' }}>
          <div>
            <ProgressTracker steps={steps} currentStepKey={'nextStepsHub'} onStepClick={() => {}} />
          </div>
          <MainSection>
            {/* Progress Tracker */}
            {/* Removed horizontal Progress Tracker section */}

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
                      onClick={() => handleActionComplete(item.id)}
                    >
                      <ActionIcon completed={item.completed}>
                        {item.completed ? <FiCheckCircle /> : <FiArrowRight />}
                      </ActionIcon>
                      <ActionContent>
                        <ActionHeader>
                          <ActionTitle completed={item.completed}>{item.title}</ActionTitle>
                        </ActionHeader>
                        <ActionDescription>{item.description}</ActionDescription>
                        <ActionMeta>
                          <ActionMetaLeft>
                            <CategoryTagWrapper tabIndex={0}>
                              <CategoryTag>
                                {item.category}
                                <CategoryInfoIcon tabIndex={0} aria-label={`Info about ${item.category}`} />
                                <CategoryTooltip>
                                  {item.category === 'Research' && 'Activities to gather information about your market or customers.'}
                                  {item.category === 'Strategy' && 'Planning and decision-making to guide your business direction.'}
                                  {item.category === 'Validation' && 'Tasks to test and confirm your business assumptions.'}
                                  {item.category === 'Development' && 'Building and improving your product or service.'}
                                </CategoryTooltip>
                              </CategoryTag>
                            </CategoryTagWrapper>
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