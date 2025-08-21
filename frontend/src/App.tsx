import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams, useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from './contexts/AuthContext';
import { trackPageView } from './utils/analytics';
import logo from './assets/logo.png';
import defaultAvatar from './assets/money-woman.jpg';
import './index.css';
import { AuthProvider } from './contexts/AuthContext';
import { FaUserCircle, FaArrowLeft } from 'react-icons/fa';
import { ErrorNotification } from './components/common/ErrorNotification';
import { FeedbackWidget } from './components/common/FeedbackWidget';
import { trackEvent } from './utils/analytics';
import AdminLogsPage from './components/business-plan/AdminLogsPage';
import { AutomatedDiscoveryPage } from './components/idea-discovery/AutomatedDiscoveryPage';

// Landing and Auth Components
import WebLandingPage from './components/WebLandingPage';
import { Login } from './components/auth/Login';
import { Signup } from './components/auth/Signup';
import { Profile } from './components/auth/Profile';
import { ResetPassword } from './components/auth/ResetPassword';
import { SubscriptionPage } from './components/auth/SubscriptionPage';

// Business Plan Components
import StartupPlanDashboard from './components/business-plan/StartupPlanDashboard';
import StartupPlanViewPage from './components/business-plan/StartupPlanViewPage';
import StartupPlanEditPage from './components/business-plan/StartupPlanEditPage';
import { StartupPlanPageDiscovery } from './components/idea-discovery/StartupPlanPageDiscovery';
import { AutomatedValidationPage } from './components/business-plan/AutomatedValidationPage';

// Idea Flow Components
import { Landing } from './components/idea-flow/Landing';
import { IdeaTypeSelection } from './components/idea-flow/IdeaTypeSelection';
import { LocationSelection } from './components/idea-flow/LocationSelection';
import { SkillAssessment } from './components/idea-flow/SkillAssessment';
import { ScheduleGoalsSelection } from './components/idea-flow/ScheduleGoalsSelection';
import { IdeaSelection } from './components/idea-flow/IdeaSelection';
import { CustomerSelection } from './components/idea-flow/CustomerSelection';
import { JobSelection } from './components/idea-flow/JobSelection';
import { SolutionSelectionPage } from './components/idea-flow/SolutionSelectionPage';
import { Summary } from './components/idea-flow/Summary';
import { ExistingIdea } from './components/idea-flow/ExistingIdea';
import { DescribeCustomer } from './components/idea-flow/DescribeCustomer';
import { DescribeProblem } from './components/idea-flow/DescribeProblem';
import { DescribeSolution } from './components/idea-flow/DescribeSolution';
import { DescribeCompetition } from './components/idea-flow/DescribeCompetition';
import { PrematureIdeaTypeSelection } from './components/idea-flow/PrematureIdeaTypeSelection';
import { PrematureLocationSelection } from './components/idea-flow/PrematureLocationSelection';
import { PrematureScheduleGoalsSelection } from './components/idea-flow/PrematureScheduleGoalsSelection';
import { PrematureSkillAssessment } from './components/idea-flow/PrematureSkillAssessment';
import { PrematureJobDiscovery } from './components/idea-flow/PrematureJobDiscovery';
import { PrematureJobSelection } from './components/idea-flow/PrematureJobSelection';

// Learning Components
import { CourseLibrary } from './components/learning/CourseLibrary';
import { CoachMarketplace } from './components/learning/CoachMarketplace';

// Progress Tracker
import { ProgressTracker, MobileTracker } from './components/idea-flow/ProgressTracker';

// Type imports
import type { BusinessArea } from './components/idea-flow/IdeaSelection';
import type { CustomerOption } from './components/idea-flow/CustomerSelection';
import type { JobOption } from './components/idea-flow/JobSelection';
import type { SolutionOption } from './components/idea-flow/SolutionSelectionPage';
import type { SkillAssessmentResult } from './components/idea-flow/SkillAssessment';

const AppContainer = styled.div`
  min-height: 100vh;
  background: #f5f5f7;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2.5rem 1.5rem 2.5rem 1.5rem;
`;

const Footer = styled.footer`
  background: #181a1b;
  color: #ffffff;
  padding: 3rem 2rem 2rem 2rem;
  width: 100%;
`;

const AppFooterContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
`;

const AppFooterSection = styled.div`
  h3 {
    font-family: 'Audiowide', 'Courier New', monospace;
    font-weight: 400;
    margin-bottom: 1rem;
    font-display: swap;
  }
  a {
    color: #9ca3af; /* gray[400] */
    text-decoration: none;
    display: block;
    margin-bottom: 0.5rem;
    transition: color 0.2s ease;
  }
  a:hover { color: #ffffff; }
`;

const AppFooterBottom = styled.div`
  border-top: 1px solid #1f2937; /* gray[800] */
  margin-top: 2rem;
  padding-top: 2rem;
  text-align: center;
  color: #9ca3af; /* gray[400] */
  
  p {
    font-family: 'Audiowide', 'Courier New', monospace;
    font-weight: 400;
    font-display: swap;
  }
`;

const FooterMoneyImage = styled.img`
  width: 150px;
  height: auto;
  border-radius: 6px;
  margin: 0 auto 0.8rem auto;
  opacity: 0.3;
  transition: opacity 0.3s ease;
  filter: grayscale(30%) brightness(1.2) contrast(1.3);
  display: block;
  
  &:hover {
    opacity: 0.5;
  }
`;

const NavBar = styled.div`
  width: 100%;
  max-width: 480px;
  display: flex;
  justify-content: flex-start;
  margin-bottom: 2rem;
`;

const Logo = styled.div`
  display: flex; 
  align-items: center; 
  gap: .75rem;
  cursor: pointer;
  user-select: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
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
    gap: 0.5rem;
    
    span {
      font-size: 1.1rem;
    }
  }
  
  @media (max-width: 480px) {
    gap: 0.4rem;
    
    span {
      font-size: 1rem;
    }
  }
  
  @media (max-width: 360px) {
    gap: 0.3rem;
    
    span {
      font-size: 0.9rem;
    }
  }
`;

const LogoSVG = styled.svg`
  width: 48px;
  height: 48px;
  border-radius: 10px;
  background: linear-gradient(135deg, #181a1b 0%, #2d2d2d 100%);
  padding: 6px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  
  @media (max-width: 768px) {
    width: 40px;
    height: 40px;
    padding: 5px;
  }
  
  @media (max-width: 480px) {
    width: 36px;
    height: 36px;
    padding: 4px;
  }
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

const NavButton = styled.button`
  background: linear-gradient(135deg, #181a1b 0%, #2d2d2d 100%);
  color: #ffffff;
  border: none;
  font-family: 'Source Sans Pro', sans-serif;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0.7rem 1.4rem;
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(24, 26, 27, 0.2);
  letter-spacing: 0.02em;
  
  &:hover {
    background: linear-gradient(135deg, #2d2d2d 0%, #181a1b 100%);
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(24, 26, 27, 0.3);
  }
  
  &:active {
    transform: translateY(0px);
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(24, 26, 27, 0.2);
  }
  
  @media (max-width: 768px) {
    padding: 0.6rem 1.2rem;
    font-size: 0.9rem;
  }
`;

const TopBar = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  width: 100vw;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  z-index: 1000;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 249, 250, 0.95) 100%);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  @media (max-width: 768px) {
    padding: 0.75rem 1rem;
    justify-content: space-between;
  }
`;

const TopBarRight = styled.div`
  display: flex;
  align-items: center;
  gap: 1.2rem;
  padding: 0.5rem;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:hover {
    background: rgba(255, 255, 255, 0.4);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  }
  
  @media (max-width: 768px) {
    gap: 0.6rem;
    padding: 0.3rem;
    background: transparent;
    border: none;
    box-shadow: none;
  }
`;

const TopBarLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  
  @media (max-width: 768px) {
    gap: 0.5rem;
  }
`;

const MobileMenuButton = styled.button`
  display: none;
  background: none;
  border: none;
  padding: 0.5rem;
  border-radius: 8px;
  cursor: pointer;
  color: #181a1b;
  transition: all 0.2s ease;
  
  @media (max-width: 768px) {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    background: rgba(255, 255, 255, 0.8);
    border: 1px solid rgba(0, 0, 0, 0.1);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  
  &:hover {
    background: rgba(255, 255, 255, 1);
    transform: scale(1.05);
  }
`;

const MobileNavButton = styled.button`
  display: none;
  background: linear-gradient(135deg, #181a1b 0%, #2d2d2d 100%);
  color: #ffffff;
  border: none;
  font-family: 'Source Sans Pro', sans-serif;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(24, 26, 27, 0.2);
  letter-spacing: 0.02em;
  
  @media (max-width: 768px) {
    display: block;
  }
  
  &:hover {
    background: linear-gradient(135deg, #2d2d2d 0%, #181a1b 100%);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(24, 26, 27, 0.3);
  }
`;

const DesktopNavButton = styled(NavButton)`
  @media (max-width: 768px) {
    display: none;
  }
`;

const AvatarButton = styled.button`
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border: 2px solid rgba(255, 255, 255, 0.3);
  padding: 0;
  margin-left: 0;
  cursor: pointer;
  border-radius: 50%;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  position: relative;
  overflow: visible;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
    transition: left 0.5s;
  }
  
  &:hover {
    transform: scale(1.05);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
    border-color: rgba(255, 255, 255, 0.5);
    
    &::before {
      left: 100%;
    }
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(24, 26, 27, 0.1);
  }
  
  @media (max-width: 768px) {
    width: 40px;
    height: 40px;
    border-width: 1px;
  }
`;

const AvatarImg = styled.img`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  background: #e5e5e5;
  margin-top: 0.3rem;
`;

const LoginButton = styled.button`
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  color: #181a1b;
  border: 2px solid rgba(24, 26, 27, 0.15);
  border-radius: 12px;
  padding: 0.7rem 1.4rem;
  font-family: 'Source Sans Pro', sans-serif;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  margin-left: 0;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  letter-spacing: 0.02em;
  
  &:hover {
    background: linear-gradient(135deg, #f8f9fa 0%, #f1f3f4 100%);
    border-color: rgba(24, 26, 27, 0.25);
    color: #181a1b;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(24, 26, 27, 0.1);
  }
  
  @media (max-width: 768px) {
    padding: 0.6rem 1.2rem;
    font-size: 0.9rem;
  }
`;

const SignupFreeButton = styled.button`
  background: linear-gradient(135deg, #181a1b 0%, #2d2d2d 100%);
  color: #ffffff;
  border: none;
  border-radius: 12px;
  padding: 0.7rem 1.4rem;
  font-family: 'Source Sans Pro', sans-serif;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  margin-left: 1rem;
  box-shadow: 0 4px 12px rgba(24, 26, 27, 0.2);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  letter-spacing: 0.02em;
  
  &:hover {
    background: linear-gradient(135deg, #2d2d2d 0%, #181a1b 100%);
    color: #ffffff;
    transform: translateY(-1px);
    box-shadow: 0 6px 16px rgba(24, 26, 27, 0.3);
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(24, 26, 27, 0.2);
  }
  
  @media (max-width: 768px) {
    padding: 0.6rem 1.2rem;
    font-size: 0.9rem;
  }
`;

const SidebarToggle = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  color: #181a1b;
  border: 2px solid #e9ecef;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  z-index: 10;
  
  &:hover {
    background: linear-gradient(135deg, #f8f9fa 0%, #f1f3f4 100%);
    border-color: #d1d5db;
    transform: scale(1.1);
    box-shadow: 0 4px 12px rgba(0,0,0,0.12);
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(24, 26, 27, 0.1);
  }
  
  @media (max-width: 1024px) {
    position: fixed;
    top: 1rem;
    right: 1rem;
    z-index: 1001;
  }
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const FloatingToggle = styled.button`
  position: fixed;
  top: 300px;
  left: 1rem;
  background: linear-gradient(135deg, #181a1b 0%, #2d2d2d 100%);
  color: #ffffff;
  border: 2px solid #181a1b;
  border-radius: 50%;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 16px rgba(24, 26, 27, 0.25);
  z-index: 1000;
  font-size: 1.2rem;
  font-weight: 600;
  
  &:hover {
    background: linear-gradient(135deg, #2d2d2d 0%, #181a1b 100%);
    transform: scale(1.1);
    box-shadow: 0 6px 20px rgba(24, 26, 27, 0.35);
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(24, 26, 27, 0.2);
  }
  
  @media (max-width: 1024px) {
    top: 280px;
    left: 1rem;
    z-index: 1002;
  }
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const MobileOverlay = styled.div<{ $isVisible: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  opacity: ${({ $isVisible }) => $isVisible ? '1' : '0'};
  visibility: ${({ $isVisible }) => $isVisible ? 'visible' : 'hidden'};
  transition: all 0.3s ease;
  
  @media (min-width: 1025px) {
    display: none;
  }
  
  @media (max-width: 1024px) and (min-width: 769px) {
    display: block;
  }
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const TopBarAvatar = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: linear-gradient(135deg, #181a1b 0%, #2d2d2d 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  color: #ffffff;
  font-weight: 700;
  box-shadow: 0 2px 8px rgba(24, 26, 27, 0.2);
`;

const TopBarAvatarImg = styled.img`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  object-fit: cover;
  background: #e5e5e5;
  border: 2px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const PlanBadge = styled.div`
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  color: #181a1b;
  font-size: 0.8rem;
  font-weight: 700;
  border-radius: 12px;
  border: 2px solid rgba(24, 26, 27, 0.2);
  padding: 0.3rem 0.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 52px;
  min-height: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  letter-spacing: 0.02em;
  user-select: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:hover {
    background: linear-gradient(135deg, #f8f9fa 0%, #f1f3f4 100%);
    border-color: rgba(24, 26, 27, 0.3);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  }
  
  @media (max-width: 768px) {
    font-size: 0.7rem;
    padding: 0.2rem 0.6rem;
    min-width: 44px;
    min-height: 20px;
    border-width: 1px;
  }
`;

type Step = 'landing' | 'idea' | 'ideaType' | 'location' | 'skillAssessment' | 'scheduleGoals' | 'customer' | 'job' | 'summary' | 'app' | 'login' | 'signup' | 'profile' | 'existingIdea' | 'describeCustomer' | 'describeProblem' | 'describeSolution' | 'describeCompetition' | 'businessPlan' | 'prematureJobDiscovery' | 'marketEvaluation' | 'evaluationScore' | 'startupPlan' | 'launch' | 'solution' | 'prematureIdeaType' | 'prematureLocation' | 'prematureScheduleGoals' | 'prematureSkillAssessment';

type EntryPoint = 'idea' | 'customer';

const PageLayout = styled.div`
  display: flex;
  width: 100%;
  max-width: 1400px;
  margin: calc(var(--topbar-height, 96px) + 1rem) auto 2rem auto;
  padding: 0 2rem 100px 2rem;
  gap: 3rem;
  position: relative;
  overflow-x: hidden;
  
  @media (max-width: 768px) {
    margin: calc(var(--topbar-height, 72px) + 6rem) auto 1.5rem auto;
    padding: 0 1rem 0 1rem;
    gap: 0;
  }
  
  &::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: 
      radial-gradient(circle at 20% 80%, rgba(24, 26, 27, 0.03) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(24, 26, 27, 0.02) 0%, transparent 50%),
      radial-gradient(circle at 40% 40%, rgba(24, 26, 27, 0.01) 0%, transparent 50%);
    pointer-events: none;
    z-index: -1;
    animation: parallax 20s ease-in-out infinite;
  }
  
  @keyframes parallax {
    0%, 100% { transform: translateY(0px) translateX(0px); }
    25% { transform: translateY(-10px) translateX(5px); }
    50% { transform: translateY(-5px) translateX(-5px); }
    75% { transform: translateY(10px) translateX(3px); }
  }
`;

const MainContent = styled.main<{ isExpanded: boolean }>`
  flex: ${({ isExpanded }) => (isExpanded ? '1' : '3')};
  transition: flex 0.3s ease-in-out;
  
  @media (max-width: 768px) {
    flex: 1;
    width: 100%;
  }
`;

const Sidebar = styled.aside<{ $isCollapsed: boolean }>`
  flex: ${({ $isCollapsed }) => $isCollapsed ? '0' : '1'};
  position: sticky;
  top: calc(var(--topbar-height, 96px) + 36px);
  height: fit-content;
  margin-right: ${({ $isCollapsed }) => $isCollapsed ? '0' : '2rem'};
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  min-width: ${({ $isCollapsed }) => $isCollapsed ? '0' : '250px'};
  max-width: ${({ $isCollapsed }) => $isCollapsed ? '0' : '300px'};
  
  @media (max-width: 1024px) {
    position: fixed;
    left: ${({ $isCollapsed }) => $isCollapsed ? '-100%' : '0'};
      top: calc(var(--topbar-height, 72px) + 12px);
  height: calc(100vh - var(--topbar-height, 72px) - 12px);
    z-index: 1000;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    margin-right: 0;
    min-width: 200px;
    max-width: 220px;
  }
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const steps = [
  { key: 'ideaType', label: 'Type' },
  { key: 'location', label: 'Location' },
  { key: 'idea', label: 'Interest' },
  { key: 'scheduleGoals', label: 'Scope' },
  { key: 'customer', label: 'Customer' },
  { key: 'job', label: 'Problem' },
  { key: 'solution', label: 'Solution' },
  { key: 'skillAssessment', label: 'Skills' },
  { key: 'businessPlan', label: 'Side Hustle Plan', isPremium: true },
  { key: 'nextStepsHub', label: 'Discovery', isPremium: true },
  { key: 'launch', label: 'Launch', isPremium: true },
];

const prematureIdeaFlowSteps = [
  { key: 'prematureIdeaType', label: '1. Business Type' },
  { key: 'prematureLocation', label: '2. Location' },
  { key: 'prematureScheduleGoals', label: '3. Scope' },
  { key: 'existingIdea', label: '4. Your Idea' },
  { key: 'describeCustomer', label: '5. Customer' },
  { key: 'describeProblem', label: '6. Problem' },
  { key: 'describeSolution', label: '7. Solution' },
  { key: 'prematureSkillAssessment', label: '8. Skills' },
  { key: 'businessPlan', label: '9. New Idea', isPremium: true },
  { key: 'marketEvaluation', label: '10. Market Evaluation', isPremium: true },
  { key: 'evaluationScore', label: '11. Validation Score', isPremium: true },
  { key: 'nextStepsHub', label: '12. Discovery', isPremium: true },
  { key: 'launch', label: '13. Launch', isPremium: true },
];

const flowStepKeys = [...steps.map(s => s.key), ...prematureIdeaFlowSteps.map(s => s.key)];

interface AppState {
  currentStep: Step;
  entryPoint: EntryPoint;
  idea: {
    interests: string;
    area: BusinessArea | null;
    existingIdeaText?: string;
  };
  ideaType: { id: string; title: string; description: string; icon: string; examples: string[] } | null;
  location: { city: string; region: string; country: string } | null;
  skillAssessment: SkillAssessmentResult | null;
  scheduleGoals: { hoursPerWeek: number; incomeTarget: number } | null;
  customer: CustomerOption | null;
  job: JobOption | null;
  problemDescription: string | null;
  solutionDescription: string | null;
  solution: SolutionOption | null;
  competitionDescription: string | null;
  isTrackerCollapsed: boolean;
  stepBeforeAuth: Step | null;
  // Premature path specific state
  prematureIdeaType: { id: string; title: string; description: string; icon: string; examples: string[] } | null;
  prematureLocation: { city: string; region: string; country: string; operatingModel: string } | null;
  prematureScheduleGoals: { hoursPerWeek: number; incomeTarget: number } | null;
  prematureSkillAssessment: {
    selectedSkills: string[];
    missingSkills: string[];
    recommendations: string[];
    learningPath: string[];
  } | null;
  prematureJob: {
    id: string;
    title: string;
    description: string;
    icon: string;
    problemStatement: string;
  } | null;
}

const initialAppState: AppState = {
  currentStep: 'landing',
  entryPoint: 'idea',
  idea: {
    interests: '',
    area: null,
    existingIdeaText: '',
  },
  ideaType: null,
  location: null,
  skillAssessment: null,
  scheduleGoals: null,
  customer: null,
  job: null,
  problemDescription: null,
  solutionDescription: null,
  solution: null,
  competitionDescription: null,
  isTrackerCollapsed: false,
  stepBeforeAuth: null,
  // Premature path specific state
  prematureIdeaType: null,
  prematureLocation: null,
  prematureScheduleGoals: null,
  prematureSkillAssessment: null,
  prematureJob: null,
};

function ResetPasswordRoute() {
  const { token } = useParams<{ token: string }>();
  const { resetPassword } = useAuth();
  if (!token) return <Navigate to="/login" />;
  return <ResetPassword token={token} onResetPassword={resetPassword} />;
}

function StartupPlanRedirect() {
  const { id } = useParams();
  return <Navigate to={`/hustle/${id}`} replace />;
}

function StartupPlanEditRedirect() {
  const { id } = useParams();
  return <Navigate to={`/hustle/${id}/edit`} replace />;
}

function AppContent() {
  // All hooks must be at the top, before any conditional returns
  const { isLoading, isAuthenticated, signup, login, user, requestPasswordReset, mockUpgradeToPremium } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [appState, setAppState] = useState<AppState>(() => {
    try {
      const storedState = window.localStorage.getItem('appState');
      console.log('Loaded appState from localStorage:', storedState);
      const parsedState = storedState ? JSON.parse(storedState) : initialAppState;
      
      // Check for pre-filled idea data from trending ideas
      const prefilledIdea = localStorage.getItem('prefilledIdea');
      if (prefilledIdea) {
        try {
          const ideaData = JSON.parse(prefilledIdea);
          console.log('Found pre-filled idea data:', ideaData);
          
          // Pre-fill the idea data with supported fields
          parsedState.idea = {
            ...parsedState.idea,
            existingIdeaText: ideaData.aiSummary || ideaData.title,
            interests: ideaData.description || '',
            area: { 
              id: 'trending-idea', 
              title: ideaData.title, 
              description: ideaData.description, 
              icon: '🔥' 
            }
          };
          
          console.log('Found pre-filled idea data:', ideaData);
          
                // Clear the pre-filled data from localStorage
      localStorage.removeItem('prefilledIdea');
    } catch (error) {
      console.error('Error parsing pre-filled idea data:', error);
      localStorage.removeItem('prefilledIdea');
    }
  }
  
  // Check if we should show login after navigation (from trending ideas)
  // This must happen BEFORE any other currentStep modifications
  const showLoginAfterNavigation = localStorage.getItem('showLoginAfterNavigation');
  console.log('showLoginAfterNavigation:', showLoginAfterNavigation);
  if (showLoginAfterNavigation === 'true') {
    localStorage.removeItem('showLoginAfterNavigation');
    parsedState.currentStep = 'login';
    console.log('Setting currentStep to login from showLoginAfterNavigation');
  } else if (prefilledIdea) {
    // Only set to existingIdea if we're not showing login
    parsedState.currentStep = 'existingIdea';
    parsedState.entryPoint = 'premature'; // Set entryPoint to premature for trending ideas
    console.log('Setting currentStep to existingIdea and entryPoint to premature from prefilledIdea');
    
    // Force immediate state update to ensure progress tracker renders correctly
    setTimeout(() => {
      console.log('Forcing state update for progress tracker');
    }, 0);
  }
  
  // Ensure the idea object is properly structured
      if (!parsedState.idea || typeof parsedState.idea !== 'object') {
        parsedState.idea = { interests: '', area: null, existingIdeaText: '' };
      }
      if (parsedState.idea.existingIdeaText === undefined) {
        parsedState.idea.existingIdeaText = '';
      }
      
      return parsedState;
    } catch (error) {
      console.error("Could not load state from localStorage", error);
      return initialAppState;
    }
  });

  // Error notification state
  const [errorNotification, setErrorNotification] = useState<{
    isVisible: boolean;
    message: string;
    type: 'error' | 'warning' | 'info';
  }>({
    isVisible: false,
    message: '',
    type: 'error'
  });

  const showError = (message: string, type: 'error' | 'warning' | 'info' = 'error') => {
    setErrorNotification({
      isVisible: true,
      message,
      type
    });
  };

  const handleLoginSuccess = () => {
    // Check for pending local request from trending ideas
    const pendingRequest = localStorage.getItem('pendingLocalRequest');
    console.log('Login success, pending request:', pendingRequest);
    if (pendingRequest === 'true') {
      localStorage.removeItem('pendingLocalRequest');
      // Navigate back to the landing page to handle the local request
      console.log('Navigating to landing page for pending local request');
      navigate('/');
    } else {
      setAppState(prev => ({ ...prev, currentStep: stepBeforeAuth || 'landing' }));
    }
  };

  const hideError = () => {
    setErrorNotification(prev => ({ ...prev, isVisible: false }));
  };

  useEffect(() => {
    console.log('Saving appState to localStorage:', appState);
    try {
      window.localStorage.setItem('appState', JSON.stringify(appState));
    } catch (error) {
      console.error("Could not save state to localStorage", error);
    }
  }, [appState]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('profile') === '1') {
      setAppState(prev => ({ ...prev, currentStep: 'profile', stepBeforeAuth: prev.currentStep }));
      // Remove ?profile=1 from the URL after opening
      params.delete('profile');
      navigate({ pathname: location.pathname, search: params.toString() }, { replace: true });
    } else if (params.get('login') === 'true') {
      setAppState(prev => ({ ...prev, currentStep: 'login' }));
      // Remove ?login=true from the URL after opening
      params.delete('login');
      navigate({ pathname: location.pathname, search: params.toString() }, { replace: true });
    }
  }, [location.search]);

  // Track topbar height for layout offsets
  const topBarRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    function setTopbarHeightVar() {
      const h = topBarRef.current?.offsetHeight || 96;
      document.documentElement.style.setProperty('--topbar-height', `${h}px`);
    }
    setTopbarHeightVar();
    window.addEventListener('resize', setTopbarHeightVar);
    return () => window.removeEventListener('resize', setTopbarHeightVar);
  }, []);

  useEffect(() => {
    console.log('useEffect: isAuthenticated', isAuthenticated, 'currentStep', appState.currentStep);
    if (isAuthenticated && appState.currentStep === 'summary') {
      setAppState(prev => ({ ...prev, currentStep: 'businessPlan' }));
    }
    
    // Handle pending local request after login
    if (isAuthenticated) {
      const pendingRequest = localStorage.getItem('pendingLocalRequest');
      console.log('Auth change - checking pending request:', pendingRequest);
      if (pendingRequest === 'true') {
        console.log('Handling pending local request - navigating to landing');
        navigate('/');
        // Don't remove the flag here - let the TrendingIdeasCarousel handle it
      }
    }
  }, [isAuthenticated, appState.currentStep, navigate]);



  // Track page views when currentStep changes
  useEffect(() => {
    const flowStepKeys: Step[] = ['landing', 'idea', 'ideaType', 'location', 'skillAssessment', 'scheduleGoals', 'customer', 'job', 'summary', 'app', 'existingIdea', 'describeCustomer', 'describeProblem', 'describeSolution', 'describeCompetition', 'businessPlan', 'prematureJobDiscovery', 'marketEvaluation', 'evaluationScore', 'startupPlan', 'launch', 'solution', 'prematureIdeaType', 'prematureLocation', 'prematureScheduleGoals', 'prematureSkillAssessment'];
    const pageTitles: Record<Step, string> = {
      landing: 'Landing Page',
      idea: 'Idea Selection',
      ideaType: 'Idea Type Selection',
      location: 'Location Selection',
      skillAssessment: 'Skill Assessment',
      scheduleGoals: 'Scope',
      customer: 'Customer Selection',
      job: 'Job Selection',
      summary: 'Summary',
      app: 'App Dashboard',
      login: 'Login',
      signup: 'Sign Up',
      profile: 'Profile',
      existingIdea: 'Existing Idea',
      describeCustomer: 'Describe Customer',
      describeProblem: 'Describe Problem',
      describeSolution: 'Describe Solution',
      describeCompetition: 'Describe Competition',
      businessPlan: 'Side Hustle Plan',
      prematureJobDiscovery: 'Premature Job Discovery',
      marketEvaluation: 'Market Evaluation',
      evaluationScore: 'Validation Score',
      startupPlan: 'Alpha Hustle Plan',
      launch: 'Launch Preparation',
      solution: 'Solution Selection',
      prematureIdeaType: 'Business Type Selection',
      prematureLocation: 'Location Selection',
      prematureScheduleGoals: 'Scope',
      prematureSkillAssessment: 'Skill Assessment'
    };

    const pageTitle = pageTitles[appState.currentStep] || 'Unknown Page';
    trackPageView(pageTitle, `/${appState.currentStep}`);
  }, [appState.currentStep]);

  // Now safe to do conditional returns
  if (isLoading) {
    return <div>Loading...</div>;
  }

  const { 
    currentStep, entryPoint, idea, ideaType, location: userLocation, skillAssessment, scheduleGoals, customer, job, problemDescription, 
    solutionDescription, solution, competitionDescription, isTrackerCollapsed, stepBeforeAuth 
  } = appState;

  console.log('AppContent state:', {
    currentStep,
    entryPoint,
    idea,
    customer,
    job,
    isAuthenticated
  });

  const isFlowStep = flowStepKeys.includes(currentStep) && currentStep !== 'login' && currentStep !== 'signup';
  const activeFlowSteps = entryPoint === 'idea' ? steps : prematureIdeaFlowSteps;

  const stepsToHidePremature = ['marketEvaluation', 'evaluationScore'];

  function handleStepClick(step: string) {
    if (activeFlowSteps.some(s => s.key === step)) {
      setAppState(prev => ({ ...prev, currentStep: step as Step }));
    }
  }

  function handleLandingSelect(step: EntryPoint) {
    setAppState(prev => ({ 
      ...prev, 
      entryPoint: step, 
      currentStep: step === 'customer' ? 'prematureIdeaType' : 'ideaType'
    }));
  }

  function handleIdeaTypeSelect(ideaType: { id: string; title: string; description: string; icon: string; examples: string[] }) {
    setAppState(prev => ({ ...prev, ideaType, currentStep: 'location' }));
  }

  function handleIdeaSelect(selectedIdea: { interests: string; area: BusinessArea }) {
    setAppState(prev => ({ ...prev, idea: selectedIdea, currentStep: 'scheduleGoals' }));
  }

  function handleLocationSelect(location: { city: string; region: string; country: string }) {
    setAppState(prev => ({ ...prev, location, currentStep: 'idea' }));
  }

  function handleSkillAssessmentComplete(assessment: SkillAssessmentResult) {
    console.log('Skill assessment completed:', assessment);
    setAppState(prev => ({ ...prev, skillAssessment: assessment, currentStep: 'businessPlan' }));
  }

  function handleScheduleGoalsSelect(scheduleGoals: { hoursPerWeek: number; incomeTarget: number }) {
    setAppState(prev => ({ ...prev, scheduleGoals, currentStep: 'customer' }));
  }

  function handleCustomerSelect(selectedCustomer: CustomerOption) {
    console.log('Customer selected:', selectedCustomer);
    setAppState(prev => ({ ...prev, customer: selectedCustomer, currentStep: 'job' }));
  }

  function handleJobSelect(selectedJob: JobOption) {
    console.log('Job selected:', selectedJob);
    setAppState(prev => {
      const newState = { ...prev, job: selectedJob, currentStep: 'solution' as Step };
      console.log('Setting appState to:', newState);
      return newState;
    });
  }

  function handleExistingIdeaSubmit(ideaText: string) {
    setAppState(prev => ({ 
      ...prev, 
      idea: { ...prev.idea, existingIdeaText: ideaText, area: { id: 'custom', title: 'Custom Idea', description: ideaText, icon: '💡' } },
      currentStep: 'describeCustomer' 
    }));
  }

  function handleDescribeCustomerSubmit(description: string | null) {
    if (description) {
      setAppState(prev => ({ 
        ...prev, 
        customer: { id: 'custom', title: 'Custom Customer', description: description, icon: '👤' },
        currentStep: 'describeProblem'
      }));
    } else {
      setAppState(prev => ({ ...prev, currentStep: 'customerGuidance' }));
    }
  }

  function handleDescribeProblemSubmit(description: string | null) {
    setAppState(prev => ({
      ...prev,
      problemDescription: description,
      job: description
        ? { id: 'custom', title: description, description, icon: '💡' }
        : null,
      currentStep: description === null ? 'problemGuidance' : 'describeSolution'
    }));
  }

  function handleDescribeSolutionSubmit(description: string) {
    setAppState(prev => ({ 
      ...prev, 
      solutionDescription: description, 
      currentStep: entryPoint === 'idea' ? 'solution' : 'prematureSkillAssessment' 
    }));
  }

  function handleDescribeCompetitionSubmit(description: string | null) {
    setAppState(prev => ({ ...prev, competitionDescription: description, currentStep: 'businessPlan' }));
  }

  function handleRestart() {
    setAppState(prev => ({
      ...initialAppState,
      isTrackerCollapsed: prev.isTrackerCollapsed
    }));
  }

  function handleBack() {
    const stepMap: Partial<Record<Step, Step>> = {
      idea: 'landing',
      location: 'ideaType',
      skillAssessment: 'solution',
      scheduleGoals: 'idea',
      customer: entryPoint === 'idea' ? 'scheduleGoals' : 'landing',
      job: 'customer',
      summary: 'job',
      login: stepBeforeAuth || 'summary',
      profile: stepBeforeAuth || 'summary',
      existingIdea: 'landing',
      describeCustomer: 'existingIdea',
      describeProblem: 'describeCustomer',
      describeSolution: 'describeProblem',
      describeCompetition: 'describeSolution',
      customerGuidance: 'describeCustomer',
      businessPlan: 'skillAssessment',
    };

    if (currentStep === 'customer' && idea.existingIdeaText) {
      setAppState(prev => ({ ...prev, currentStep: 'describeCustomer' }));
      return;
    }
    if (currentStep === 'job' && customer?.title === 'Custom Customer') {
      setAppState(prev => ({ ...prev, currentStep: 'describeCustomer' }));
      return;
    }
    
    const prevStep = stepMap[currentStep];
    if (prevStep) {
      setAppState(prev => ({ ...prev, currentStep: prevStep }));
    }
  }

  function handleClearStep() {
    const stepToClear = appState.currentStep;
    console.log('handleClearStep called for step:', stepToClear);
    console.log('Current appState before clear:', appState);
    console.log('handleClearStep function is being executed');
    
    const newState = { ...appState };

    switch (stepToClear) {
      case 'existingIdea':
        // Ensure the idea object exists and is properly structured
        if (!newState.idea || typeof newState.idea !== 'object') {
          newState.idea = { interests: '', area: null, existingIdeaText: '' };
        }
        newState.idea.existingIdeaText = '';
        console.log('Clearing existingIdeaText, new idea object:', newState.idea);
        break;
      case 'describeCustomer':
        newState.customer = null;
        break;
      case 'describeProblem':
        newState.problemDescription = null;
        break;
      case 'describeSolution':
        newState.solutionDescription = null;
        break;
      case 'describeCompetition':
        newState.competitionDescription = null;
        break;
      case 'prematureIdeaType':
        newState.prematureIdeaType = null;
        break;
      case 'prematureLocation':
        newState.prematureLocation = null;
        break;
      case 'prematureScheduleGoals':
        newState.prematureScheduleGoals = null;
        break;
      case 'prematureSkillAssessment':
        newState.prematureSkillAssessment = null;
        break;
      default:
        console.log('No case found for step:', stepToClear);
        return; 
    }
    
    console.log('New appState after clear:', newState);
    setAppState(newState);
  }

  function handleClearExistingIdea() {
    // Don't clear if we have pre-filled data from trending ideas
    const prefilledIdea = localStorage.getItem('prefilledIdea');
    if (!prefilledIdea) {
      handleClearStep();
    }
  }

  function handleProblemGuidanceContinue() {
    setAppState(prev => ({ ...prev, currentStep: 'prematureJobDiscovery' }));
  }

  function handleSolutionSelect(selectedSolution: SolutionOption) {
    setAppState(prev => ({ ...prev, solution: selectedSolution, solutionDescription: selectedSolution.description, currentStep: 'skillAssessment' }));
  }

  // Premature path handlers
  function handlePrematureIdeaTypeSelect(ideaType: { id: string; title: string; description: string; icon: string; examples: string[] }) {
    setAppState(prev => ({ ...prev, prematureIdeaType: ideaType, currentStep: 'prematureLocation' }));
  }

  function handlePrematureLocationSelect(location: { city: string; region: string; country: string; operatingModel: string }) {
    setAppState(prev => ({ ...prev, prematureLocation: location, currentStep: 'prematureScheduleGoals' }));
  }

  function handlePrematureScheduleGoalsSelect(scheduleGoals: { hoursPerWeek: number; incomeTarget: number }) {
    setAppState(prev => ({ ...prev, prematureScheduleGoals: scheduleGoals, currentStep: 'existingIdea' }));
  }

  function handlePrematureSkillAssessmentComplete(assessment: {
    selectedSkills: string[];
    missingSkills: string[];
    recommendations: string[];
    learningPath: string[];
  }) {
    setAppState(prev => ({ ...prev, prematureSkillAssessment: assessment, currentStep: 'businessPlan' }));
  }

  const PLAN_DISPLAY_NAMES: Record<string, string> = {
    free: 'Free',
    basic: 'Basic',
    pro: 'Pro',
    elite: 'Elite',
  };

  // Debug: log appState before rendering
  console.log('AppContent about to render, appState:', appState);
  console.log('Current step:', currentStep, 'isFlowStep:', isFlowStep);
  if (currentStep === 'summary') {
    console.log('Summary render check:', { idea, customer, job });
  }

  if (currentStep === 'customer') {
    console.log('Rendering CustomerSelection with idea.area:', idea.area);
  }

  // Reusable logo click handler to landing
  function handleLogoToLanding() {
    setAppState(prev => ({ ...initialAppState, isTrackerCollapsed: prev.isTrackerCollapsed }));
    navigate('/');
  }
  function handleLogoKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleLogoToLanding();
    }
  }

  return (
    <>
      {/* Always render the Profile modal/page when currentStep === 'profile' */}
      {currentStep === 'profile' && (
        <Profile 
          setAppState={setAppState} 
          isTrackerCollapsed={appState.isTrackerCollapsed}
          onClose={() => setAppState(prev => ({ ...prev, currentStep: prev.stepBeforeAuth || 'landing' }))}
        />
      )}
      <Routes>
        <Route path="/" element={<WebLandingPage />} />
        <Route path="/app" element={
          <AppContainer>

            <TopBar ref={topBarRef}>
              <TopBarLeft>
                <Logo 
                  onClick={handleLogoToLanding}
                  onKeyDown={handleLogoKeyDown}
                  role="link"
                  aria-label="Go to landing page"
                  tabIndex={0}
                >
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
              </TopBarLeft>
              
              {!isAuthenticated ? (
                <TopBarRight>
                  <LoginButton onClick={() => setAppState(prev => ({...prev, currentStep: 'login'}))} aria-label="Log In">
                    Log in
                  </LoginButton>
                  <SignupFreeButton onClick={() => setAppState(prev => ({...prev, currentStep: 'signup'}))} aria-label="Sign up for free">
                    Sign up for free
                  </SignupFreeButton>
                </TopBarRight>
              ) : (
                <TopBarRight>
                  <DesktopNavButton 
                    onClick={() => window.location.href = '/plans'} 
                    style={{
                      background: '#000',
                      color: '#fff',
                      border: 'none',
                      fontWeight: 600
                    }}>
                    My Side Hustles
                  </DesktopNavButton>
                  <MobileNavButton 
                    onClick={() => window.location.href = '/plans'}>
                    Hustles
                  </MobileNavButton>
                  <AvatarButton onClick={() => {
                    setAppState(prev => ({ ...prev, stepBeforeAuth: currentStep, currentStep: 'profile' }));
                    }} aria-label="Profile">
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
                      <AvatarImg src={defaultAvatar} alt="Avatar" />
                    )}
                  </AvatarButton>
                  {user && location.pathname !== '/' && (
                    <PlanBadge>
                      {!user?.isSubscribed
                        ? PLAN_DISPLAY_NAMES['free']
                        : PLAN_DISPLAY_NAMES[user?.subscriptionTier || 'basic']}
                    </PlanBadge>
                  )}
                </TopBarRight>
              )}
            </TopBar>
            {/* Always render login/signup forms when currentStep is 'login' or 'signup' */}
            {currentStep === 'login' && (
              <React.Suspense fallback={<div style={{textAlign: 'center', marginTop: '2rem'}}>Loading login form...</div>}>
                <Login
                  onLogin={async (email, password) => {
                    try {
                      await login(email, password);
                      setAppState(prev => ({ ...prev, currentStep: stepBeforeAuth || 'landing' }));
                    } catch (err: any) {
                      showError(err.message || 'Failed to log in. Please try again.');
                    }
                  }}
                  onSignup={() => setAppState(prev => ({ ...prev, currentStep: 'signup' }))}
                  onRequestPasswordReset={requestPasswordReset}
                />
              </React.Suspense>
            )}
            {currentStep === 'signup' && (
              <React.Suspense fallback={<div style={{textAlign: 'center', marginTop: '2rem'}}>Loading signup form...</div>}>
                <Signup
                  onSignup={async (email, password) => {
                    try {
                      await signup(email, password);
                      setAppState(prev => ({ ...prev, currentStep: stepBeforeAuth || 'landing' }));
                    } catch (err: any) {
                      showError(err.message || 'Failed to sign up. Please try again.');
                    }
                  }}
                  onLogin={() => setAppState(prev => ({ ...prev, currentStep: 'login' }))}
                />
              </React.Suspense>
            )}
            {/* Render flow steps or landing only if not in auth steps */}
            {!['login', 'signup'].includes(currentStep) && (
              isFlowStep ? (
                <PageLayout>
                  {/* Mobile Tracker - Always visible on mobile */}
                  <MobileTracker 
                    steps={
                      entryPoint === 'idea'
                        ? steps
                        : prematureIdeaFlowSteps.filter(s => !stepsToHidePremature.includes(s.key))
                    }
                    currentStepKey={currentStep}
                    onStepClick={handleStepClick}
                  />
                  
                  <Sidebar $isCollapsed={isTrackerCollapsed}>
                        <ProgressTracker 
                          steps={
                            entryPoint === 'idea'
                              ? steps
                              : prematureIdeaFlowSteps.filter(s => !stepsToHidePremature.includes(s.key))
                          }
                          currentStepKey={currentStep}
                          onStepClick={handleStepClick}
                          isSubscribed={user?.isSubscribed}
                          isPremature={entryPoint === 'customer'}
                        />
                    <SidebarToggle 
                      onClick={() => setAppState(prev => ({...prev, isTrackerCollapsed: !prev.isTrackerCollapsed}))}
                      aria-label={isTrackerCollapsed ? "Show tracker" : "Hide tracker"}
                    >
                      {isTrackerCollapsed ? '→' : '←'}
                    </SidebarToggle>
                    </Sidebar>
                  <MobileOverlay 
                    $isVisible={!isTrackerCollapsed} 
                    onClick={() => setAppState(prev => ({...prev, isTrackerCollapsed: true}))}
                  />
                  {isTrackerCollapsed && (
                    <FloatingToggle
                      onClick={() => setAppState(prev => ({...prev, isTrackerCollapsed: false}))}
                      aria-label="Show tracker"
                    >
                      →
                    </FloatingToggle>
                  )}
                  <MainContent isExpanded={isTrackerCollapsed}>
                    <>
                      {currentStep === 'ideaType' && <IdeaTypeSelection onSelect={handleIdeaTypeSelect} />}
                      {currentStep === 'location' && <LocationSelection onSelect={handleLocationSelect} ideaType={ideaType} />}
                      {currentStep === 'skillAssessment' && idea.area && (
                        <SkillAssessment 
                          businessArea={idea.area}
                          interests={idea.interests}
                          ideaType={ideaType}
                          solution={solution}
                          onComplete={handleSkillAssessmentComplete}
                        />
                      )}
                      {currentStep === 'idea' && <IdeaSelection onSelect={handleIdeaSelect} ideaType={ideaType} />}
                      {currentStep === 'scheduleGoals' && <ScheduleGoalsSelection onSelect={handleScheduleGoalsSelect} interests={idea.interests} businessArea={idea.area} location={userLocation} />}
                      {currentStep === 'customer' && <CustomerSelection onSelect={handleCustomerSelect} businessArea={idea.area} interests={entryPoint === 'idea' ? idea.interests : undefined} ideaType={ideaType} location={userLocation} skillAssessment={skillAssessment} scheduleGoals={scheduleGoals} />}
                      {currentStep === 'job' && <JobSelection onSelect={handleJobSelect} customer={customer} interests={entryPoint === 'idea' ? idea.interests : undefined} businessArea={idea.area} ideaType={ideaType} location={userLocation} skillAssessment={skillAssessment} scheduleGoals={scheduleGoals} />}
                      {currentStep === 'summary' && idea.area && customer && job && ( <Summary 
                          idea={{
                            ...idea,
                            area: idea.area,
                            problemDescription,
                            solutionDescription,
                            competitionDescription
                          }}
                          customer={customer} 
                          job={job} 
                          location={userLocation}
                          scheduleGoals={scheduleGoals}
                          onRestart={handleRestart} 
                          onSignup={() => {
                            setAppState(prev => ({
                              ...prev,
                              currentStep: 'signup',
                              stepBeforeAuth: 'summary',
                            }));
                          }} 
                          onLogin={() => {
                            setAppState(prev => ({ ...prev, stepBeforeAuth: 'summary', currentStep: 'login' }));
                          }} 
                        /> )}
                      {currentStep === 'summary' && (!idea.area || !customer || !job) && (
                        <div style={{ color: 'red', textAlign: 'center', marginTop: '2rem' }}>
                          Please complete all required steps before viewing your summary.
                        </div>
                      )}
                      {currentStep === 'businessPlan' && job && (
                        <StartupPlanPageDiscovery
                          context={{
                            idea,
                            customer,
                            job,
                            problemDescription,
                            solutionDescription,
                            competitionDescription,
                            location: userLocation,
                            scheduleGoals,
                            skillAssessment,
                          }}
                          onSignup={() => {
                            setAppState(prev => ({
                              ...prev,
                              currentStep: 'signup',
                              stepBeforeAuth: 'businessPlan',
                            }));
                          }}
                          onLogin={() => {
                            setAppState(prev => ({ ...prev, stepBeforeAuth: 'businessPlan', currentStep: 'login' }));
                          }}
                          isAuthenticated={isAuthenticated}
                          isSubscribed={user?.isSubscribed}
                        />
                      )}
                      {currentStep === 'businessPlan' && (!idea || !customer || !job) && (
                        <Navigate to="/" replace />
                      )}
                      {currentStep === 'existingIdea' && (
                        <ExistingIdea 
                          key={`existingIdea-${idea?.existingIdeaText || 'empty'}`}
                          onSubmit={handleExistingIdeaSubmit} 
                          initialValue={idea?.existingIdeaText || ''} 
                          onClear={handleClearExistingIdea}
                          ideaType={entryPoint === 'customer' ? appState.prematureIdeaType : ideaType}
                          location={entryPoint === 'customer' ? appState.prematureLocation : (appState.location ? { city: appState.location.city, region: appState.location.region, country: appState.location.country } : null)}
                          scheduleGoals={entryPoint === 'customer' ? appState.prematureScheduleGoals : scheduleGoals}
                        />
                      )}
                      {currentStep === 'describeCustomer' && (
                        <DescribeCustomer 
                          onSubmit={handleDescribeCustomerSubmit} 
                          initialValue={customer?.description} 
                          onClear={handleClearStep}
                          businessContext={{
                            idea: idea.existingIdeaText,
                            businessArea: idea.area?.title,
                            interests: idea.interests
                          }}
                        />
                      )}
                      {currentStep === 'describeProblem' && (
                        <DescribeProblem
                          onSubmit={handleDescribeProblemSubmit}
                          customer={customer}
                          initialValue={problemDescription}
                          onClear={handleClearStep}

                          businessContext={{
                            idea: idea.existingIdeaText,
                            businessArea: idea.area?.title,
                            interests: idea.interests,
                            ideaType: entryPoint === 'customer' ? appState.prematureIdeaType?.title : ideaType?.title,
                            location: entryPoint === 'customer' ? appState.prematureLocation : (appState.location ? { city: appState.location.city, region: appState.location.region, country: appState.location.country } : null),
                            scheduleGoals: entryPoint === 'customer' ? appState.prematureScheduleGoals : scheduleGoals
                          }}
                        />
                      )}
                      {currentStep === 'describeSolution' && (
                        <DescribeSolution 
                          onSubmit={handleDescribeSolutionSubmit} 
                          problemDescription={problemDescription} 
                          initialValue={solutionDescription} 
                          onClear={handleClearStep}
                          selectedJob={entryPoint === 'customer' ? appState.prematureJob : null}
                          businessContext={{
                            idea: idea.existingIdeaText,
                            businessArea: idea.area?.title,
                            interests: idea.interests,
                            ideaType: entryPoint === 'customer' ? appState.prematureIdeaType?.title : ideaType?.title,
                            location: entryPoint === 'customer' ? appState.prematureLocation : (appState.location ? { city: appState.location.city, region: appState.location.region, country: appState.location.country } : null),
                            scheduleGoals: entryPoint === 'customer' ? appState.prematureScheduleGoals : scheduleGoals
                          }}
                        />
                      )}
                      {currentStep === 'describeCompetition' && <DescribeCompetition onSubmit={handleDescribeCompetitionSubmit} solutionDescription={solutionDescription} initialValue={competitionDescription} onClear={handleClearStep} />}
                      {currentStep === 'prematureJobDiscovery' && (
                        <div style={{ color: 'red', textAlign: 'center', marginTop: '2rem' }}>
                          This step is not available in the current version.
                        </div>
                      )}
                      {currentStep === 'solution' && (
                        <SolutionSelectionPage
                          job={job}
                          onSelect={handleSolutionSelect}
                          interests={idea.interests}
                          businessArea={idea.area}
                          customer={customer}
                          location={userLocation}
                          scheduleGoals={scheduleGoals}
                        />
                      )}
                      {currentStep === 'prematureIdeaType' && (
                        <PrematureIdeaTypeSelection onSelect={handlePrematureIdeaTypeSelect} onClear={handleClearStep} />
                      )}
                      {currentStep === 'prematureLocation' && (
                        <PrematureLocationSelection 
                          onSelect={handlePrematureLocationSelect} 
                          ideaType={appState.prematureIdeaType}
                          onClear={handleClearStep}
                        />
                      )}
                      {currentStep === 'prematureScheduleGoals' && (
                        <PrematureScheduleGoalsSelection 
                          onSelect={handlePrematureScheduleGoalsSelect}
                          interests={idea.interests}
                          businessArea={idea.area}
                          location={appState.prematureLocation}
                          onClear={handleClearStep}
                        />
                      )}
                      {currentStep === 'prematureSkillAssessment' && (
                        <PrematureSkillAssessment 
                          onComplete={handlePrematureSkillAssessmentComplete}
                          businessArea={idea.area}
                          interests={idea.interests}
                          ideaType={appState.prematureIdeaType}
                          solution={solution}
                          onClear={handleClearStep}
                        />
                      )}
                    </>
                  </MainContent>
                </PageLayout>
              ) : (
                <>
                  {currentStep === 'landing' && <Landing onSelect={handleLandingSelect} />}
                  {currentStep === 'customerGuidance' && ( <Guidance message="That's perfectly fine! A great business is built on a deep understanding of its customers. Let's explore some potential customer types to get you started." buttonText="Let's find my customer" onContinue={() => setAppState(prev => ({ ...prev, currentStep: 'customer' }))} /> )}
                  {currentStep === 'problemGuidance' && (
                    <Guidance 
                      message="No problem at all! The best businesses solve a clear, painful problem. Let's figure out what job your customers need done." 
                      buttonText="Let's find the problem" 
                      onContinue={handleProblemGuidanceContinue} 
                    />
                  )}
                </>
              )
            )}
          </AppContainer>
        } />
        <Route path="/reset-password/:token" element={<ResetPasswordRoute />} />

        <Route path="/subscribe" element={<SubscriptionPage />} />
        <Route path="/coaches" element={
          <AppContainer>
            <Logo
              onClick={handleLogoToLanding}
              onKeyDown={handleLogoKeyDown}
              role="link"
              aria-label="Go to landing page"
              tabIndex={0}
            >
              <LogoSVG viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
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
            <TopBar ref={topBarRef}>
              {!isAuthenticated ? (
                <>
                  <LoginButton onClick={() => setAppState(prev => ({...prev, currentStep: 'login'}))} aria-label="Log In">
                    Log in
                  </LoginButton>
                  <SignupFreeButton onClick={() => setAppState(prev => ({...prev, currentStep: 'signup'}))} aria-label="Sign up for free">
                    Sign up for free
                  </SignupFreeButton>
                </>
              ) : (
                <TopBarRight>
                  <NavButton 
                    onClick={() => window.location.href = '/plans'} 
                    style={{
                      background: '#000',
                      color: '#fff',
                      border: 'none',
                      fontWeight: 600
                    }}>
                    My Side Hustle Ideas
                  </NavButton>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                     <AvatarButton onClick={() => {
                       setAppState(prev => ({ ...prev, stepBeforeAuth: 'landing' as Step, currentStep: 'profile' }));
                     }} aria-label="Profile">
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
                        <AvatarImg src={defaultAvatar} alt="Avatar" />
                      )}
                    </AvatarButton>
                    {user && (
                      <PlanBadge>
                        {!user?.isSubscribed
                          ? PLAN_DISPLAY_NAMES['free']
                          : PLAN_DISPLAY_NAMES[user?.subscriptionTier || 'basic']}
                      </PlanBadge>
                    )}
                  </div>
                </TopBarRight>
              )}
            </TopBar>
            <CoachMarketplace />
          </AppContainer>
        } />
        <Route path="/courses" element={
          <AppContainer>
            <Logo
              onClick={handleLogoToLanding}
              onKeyDown={handleLogoKeyDown}
              role="link"
              aria-label="Go to landing page"
              tabIndex={0}
            >
              <LogoSVG viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
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
            <TopBar ref={topBarRef}>
              {!isAuthenticated ? (
                <>
                  <LoginButton onClick={() => setAppState(prev => ({...prev, currentStep: 'login'}))} aria-label="Log In">
                    Log in
                  </LoginButton>
                  <SignupFreeButton onClick={() => setAppState(prev => ({...prev, currentStep: 'signup'}))} aria-label="Sign up for free">
                    Sign up for free
                  </SignupFreeButton>
                </>
              ) : (
                <TopBarRight>
                  <NavButton 
                    onClick={() => window.location.href = '/plans'} 
                    style={{
                      background: '#000',
                      color: '#fff',
                      border: 'none',
                      fontWeight: 600
                    }}>
                    My Side Hustle Ideas
                  </NavButton>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                     <AvatarButton onClick={() => {
                       setAppState(prev => ({ ...prev, stepBeforeAuth: 'landing' as Step, currentStep: 'profile' }));
                     }} aria-label="Profile">
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
                        <AvatarImg src={defaultAvatar} alt="Avatar" />
                      )}
                    </AvatarButton>
                    {user && (
                      <PlanBadge>
                        {!user?.isSubscribed
                          ? PLAN_DISPLAY_NAMES['free']
                          : PLAN_DISPLAY_NAMES[user?.subscriptionTier || 'basic']}
                      </PlanBadge>
                    )}
                  </div>
                </TopBarRight>
              )}
            </TopBar>
            <CourseLibrary />
          </AppContainer>
        } />
        <Route path="/hustles" element={
          <AppContainer>
            <TopBar ref={topBarRef}>
              <TopBarLeft>
                <Logo 
                  onClick={handleLogoToLanding}
                  onKeyDown={handleLogoKeyDown}
                  role="link"
                  aria-label="Go to landing page"
                  tabIndex={0}
                >
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
              </TopBarLeft>
              {!isAuthenticated ? (
                <TopBarRight>
                  <LoginButton onClick={() => setAppState(prev => ({...prev, currentStep: 'login'}))} aria-label="Log In">
                    Log in
                  </LoginButton>
                  <SignupFreeButton onClick={() => setAppState(prev => ({...prev, currentStep: 'signup'}))} aria-label="Sign up for free">
                    Sign up for free
                  </SignupFreeButton>
                </TopBarRight>
              ) : (
                <TopBarRight>
                  <DesktopNavButton onClick={() => window.location.href = '/app'}>
                    <FaArrowLeft /> Back to App
                  </DesktopNavButton>
                  <MobileNavButton onClick={() => window.location.href = '/app'}>
                    <FaArrowLeft /> Back
                  </MobileNavButton>
                  <AvatarButton onClick={() => {
                    setAppState(prev => ({ ...prev, stepBeforeAuth: 'landing' as Step, currentStep: 'profile' }));
                  }} aria-label="Profile">
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
                      <TopBarAvatar>U</TopBarAvatar>
                    )}
                  </AvatarButton>
                  {user && (
                    <PlanBadge>
                      {!user?.isSubscribed
                        ? PLAN_DISPLAY_NAMES['free']
                        : PLAN_DISPLAY_NAMES[user?.subscriptionTier || 'basic']}
                    </PlanBadge>
                  )}
                </TopBarRight>
              )}
            </TopBar>
            <StartupPlanDashboard setAppState={setAppState} />
          </AppContainer>
        } />
        <Route path="/hustle/:id/edit" element={
          <AppContainer>
            <Logo
              src={logo}
              alt="ToolThinker Logo"
              onClick={handleLogoToLanding}
              onKeyDown={handleLogoKeyDown}
              role="link"
              aria-label="Go to landing page"
              tabIndex={0}
            />
            <TopBar ref={topBarRef}>
              {!isAuthenticated ? (
                <>
                  <LoginButton onClick={() => setAppState(prev => ({...prev, currentStep: 'login'}))} aria-label="Log In">
                    Log in
                  </LoginButton>
                  <SignupFreeButton onClick={() => setAppState(prev => ({...prev, currentStep: 'signup'}))} aria-label="Sign up for free">
                    Sign up for free
                  </SignupFreeButton>
                </>
              ) : (
                <TopBarRight>
                  <NavButton 
                    onClick={() => window.location.href = '/plans'} 
                    style={{
                      background: '#000',
                      color: '#fff',
                      border: 'none',
                      fontWeight: 600
                    }}>
                    My Side Hustle Ideas
                  </NavButton>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                     <AvatarButton onClick={() => {
                       setAppState(prev => ({ ...prev, stepBeforeAuth: 'landing' as Step, currentStep: 'profile' }));
                     }} aria-label="Profile">
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
                        <AvatarImg src={defaultAvatar} alt="Avatar" />
                      )}
                    </AvatarButton>
                    {user && (
                      <PlanBadge>
                        {!user?.isSubscribed
                          ? PLAN_DISPLAY_NAMES['free']
                          : PLAN_DISPLAY_NAMES[user?.subscriptionTier || 'basic']}
                      </PlanBadge>
                    )}
                  </div>
                </TopBarRight>
              )}
            </TopBar>
            <StartupPlanEditPage setAppState={setAppState} />
          </AppContainer>
        } />
        <Route path="/hustle/:id" element={<StartupPlanViewPage />} />
        <Route path="/plans" element={<Navigate to="/hustles" replace />} />
        <Route path="/startup-plan/:id" element={<StartupPlanRedirect />} />
        <Route path="/startup-plan/:id/edit" element={<StartupPlanEditRedirect />} />
        <Route path="/validate/:planId" element={<AutomatedValidationPage />} />


        <Route path="/admin/logs" element={<AdminLogsPage />} />
        <Route path="/automated-discovery/:id" element={<AutomatedDiscoveryPage />} />
        <Route path="*" element={
          <AppContainer>
            <Logo
              src={logo}
              alt="ToolThinker Logo"
              onClick={handleLogoToLanding}
              onKeyDown={handleLogoKeyDown}
              role="link"
              aria-label="Go to landing page"
              tabIndex={0}
            />
            <TopBar ref={topBarRef}>
              {!isAuthenticated ? (
                <>
                  <LoginButton onClick={() => setAppState(prev => ({...prev, currentStep: 'login'}))} aria-label="Log In">
                    Log in
                  </LoginButton>
                  <SignupFreeButton onClick={() => setAppState(prev => ({...prev, currentStep: 'signup'}))} aria-label="Sign up for free">
                    Sign up for free
                  </SignupFreeButton>
                </>
              ) : (
                <TopBarRight>
                  <NavButton 
                    onClick={() => window.location.href = '/hustles'} 
                    style={{
                      background: '#000',
                      color: '#fff',
                      border: 'none',
                      fontWeight: 600
                    }}>
                    My Side Hustles
                  </NavButton>
                  <AvatarButton onClick={() => {
                    setAppState(prev => ({ ...prev, stepBeforeAuth: currentStep, currentStep: 'profile' }));
                  }} aria-label="Profile" style={{ background: '#fff', border: '1px solid #e5e5e5', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
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
                        <AvatarImg src={defaultAvatar} alt="Avatar" />
                      )}
                      {/* Only show PlanBadge if not on the landing page */}
                      {user && location.pathname !== '/' && (
                        <PlanBadge>
                          {!user?.isSubscribed
                            ? PLAN_DISPLAY_NAMES['free']
                            : PLAN_DISPLAY_NAMES[user?.subscriptionTier || 'basic']}
                        </PlanBadge>
                      )}
                    </div>
                  </AvatarButton>
                </TopBarRight>
              )}
            </TopBar>
            {/* Always render login/signup forms when currentStep is 'login' or 'signup' */}
            {currentStep === 'login' && (
              <React.Suspense fallback={<div style={{textAlign: 'center', marginTop: '2rem'}}>Loading login form...</div>}>
                <Login
                  onLogin={async (email, password) => {
                    try {
                      await login(email, password);
                      setAppState(prev => ({ ...prev, currentStep: stepBeforeAuth || 'landing' }));
                    } catch (err: any) {
                      showError(err.message || 'Failed to log in. Please try again.');
                    }
                  }}
                  onSignup={() => setAppState(prev => ({ ...prev, currentStep: 'signup' }))}
                  onRequestPasswordReset={requestPasswordReset}
                />
              </React.Suspense>
            )}
            {currentStep === 'signup' && (
              <React.Suspense fallback={<div style={{textAlign: 'center', marginTop: '2rem'}}>Loading signup form...</div>}>
                <Signup
                  onSignup={async (email, password) => {
                    try {
                      await signup(email, password);
                      setAppState(prev => ({ ...prev, currentStep: stepBeforeAuth || 'landing' }));
                    } catch (err: any) {
                      showError(err.message || 'Failed to sign up. Please try again.');
                    }
                  }}
                  onLogin={() => setAppState(prev => ({ ...prev, currentStep: 'login' }))}
                />
              </React.Suspense>
            )}
            {/* Render flow steps or landing only if not in auth steps */}
            {!['login', 'signup'].includes(currentStep) && (
              isFlowStep ? (
                <PageLayout>
                  {/* Mobile Tracker - Always visible on mobile */}
                  <MobileTracker 
                    steps={
                      entryPoint === 'idea'
                        ? steps
                        : prematureIdeaFlowSteps.filter(s => !stepsToHidePremature.includes(s.key))
                    }
                    currentStepKey={currentStep}
                    onStepClick={handleStepClick}
                  />
                  
                  <Sidebar $isCollapsed={isTrackerCollapsed}>
                        <ProgressTracker 
                          steps={
                            entryPoint === 'idea'
                              ? steps
                              : prematureIdeaFlowSteps.filter(s => !stepsToHidePremature.includes(s.key))
                          }
                          currentStepKey={currentStep}
                          onStepClick={handleStepClick}
                          isSubscribed={user?.isSubscribed}
                          isPremature={entryPoint === 'customer'}
                        />
                    <SidebarToggle 
                      onClick={() => setAppState(prev => ({...prev, isTrackerCollapsed: !prev.isTrackerCollapsed}))}
                      aria-label={isTrackerCollapsed ? "Show tracker" : "Hide tracker"}
                    >
                      {isTrackerCollapsed ? '→' : '←'}
                    </SidebarToggle>
                    </Sidebar>
                  <MobileOverlay 
                    $isVisible={!isTrackerCollapsed} 
                    onClick={() => setAppState(prev => ({...prev, isTrackerCollapsed: true}))}
                  />
                  {isTrackerCollapsed && (
                    <FloatingToggle
                      onClick={() => setAppState(prev => ({...prev, isTrackerCollapsed: false}))}
                      aria-label="Show tracker"
                    >
                      →
                    </FloatingToggle>
                  )}
                  <MainContent isExpanded={isTrackerCollapsed}>
                    <>
                      {currentStep === 'idea' && <IdeaSelection onSelect={handleIdeaSelect} />}
                      {currentStep === 'customer' && <CustomerSelection onSelect={handleCustomerSelect} businessArea={idea.area} interests={entryPoint === 'idea' ? idea.interests : undefined} />}
                      {currentStep === 'job' && <JobSelection onSelect={handleJobSelect} customer={customer} interests={entryPoint === 'idea' ? idea.interests : undefined} businessArea={idea.area} />}
                      {currentStep === 'summary' && idea.area && customer && job && ( <Summary 
                          idea={{
                            ...idea,
                            area: idea.area,
                            problemDescription,
                            solutionDescription,
                            competitionDescription
                          }}
                          customer={customer} 
                          job={job} 
                          location={userLocation}
                          scheduleGoals={scheduleGoals}
                          onRestart={handleRestart} 
                          onSignup={() => {
                            setAppState(prev => ({
                              ...prev,
                              currentStep: 'signup',
                              stepBeforeAuth: 'summary',
                            }));
                          }} 
                          onLogin={() => {
                            setAppState(prev => ({ ...prev, stepBeforeAuth: 'summary', currentStep: 'login' }));
                          }} 
                        /> )}
                      {currentStep === 'summary' && (!idea.area || !customer || !job) && (
                        <div style={{ color: 'red', textAlign: 'center', marginTop: '2rem' }}>
                          Please complete all required steps before viewing your summary.
                        </div>
                      )}
                      {currentStep === 'businessPlan' && job && (
                        <StartupPlanPageDiscovery
                          context={{
                            idea,
                            customer,
                            job: entryPoint === 'customer' ? appState.prematureJob : job,
                            problemDescription,
                            solutionDescription,
                            competitionDescription,
                            location: entryPoint === 'customer' ? appState.prematureLocation : userLocation,
                            scheduleGoals: entryPoint === 'customer' ? appState.prematureScheduleGoals : scheduleGoals,
                            skillAssessment: entryPoint === 'customer' ? 
                              (appState.prematureSkillAssessment ? {
                                skills: [],
                                selectedSkills: appState.prematureSkillAssessment.selectedSkills,
                                recommendations: appState.prematureSkillAssessment.recommendations,
                                learningPath: appState.prematureSkillAssessment.learningPath
                              } : null) : skillAssessment,
                          }}
                          onSignup={() => {
                            setAppState(prev => ({
                              ...prev,
                              currentStep: 'signup',
                              stepBeforeAuth: 'businessPlan',
                            }));
                          }}
                          onLogin={() => {
                            setAppState(prev => ({ ...prev, stepBeforeAuth: 'businessPlan', currentStep: 'login' }));
                          }}
                          isAuthenticated={isAuthenticated}
                          isSubscribed={user?.isSubscribed}
                        />
                      )}
                      {currentStep === 'businessPlan' && (!idea || !customer || !job) && (
                        <Navigate to="/" replace />
                      )}
                      {currentStep === 'existingIdea' && <ExistingIdea onSubmit={handleExistingIdeaSubmit} initialValue={idea.existingIdeaText} onClear={handleClearStep} />}
                      {currentStep === 'describeCustomer' && <DescribeCustomer onSubmit={handleDescribeCustomerSubmit} initialValue={customer?.description} onClear={handleClearStep} />}
                      {currentStep === 'describeProblem' && (
                        <DescribeProblem
                          onSubmit={handleDescribeProblemSubmit}
                          customer={customer}
                          initialValue={problemDescription}
                          onClear={handleClearStep}
                        />
                      )}
                      {currentStep === 'describeSolution' && <DescribeSolution key={`solution-${solutionDescription || 'empty'}`} onSubmit={handleDescribeSolutionSubmit} problemDescription={problemDescription} initialValue={solutionDescription} onClear={handleClearStep} />}
                      {currentStep === 'describeCompetition' && <DescribeCompetition onSubmit={handleDescribeCompetitionSubmit} solutionDescription={solutionDescription} initialValue={competitionDescription} onClear={handleClearStep} />}
                      {currentStep === 'prematureJobDiscovery' && (
                        <div style={{ color: 'red', textAlign: 'center', marginTop: '2rem' }}>
                          This step is not available in the current version.
                        </div>
                      )}
                      {currentStep === 'solution' && (
                        <SolutionSelectionPage
                          job={job}
                          onSelect={handleSolutionSelect}
                          interests={idea.interests}
                          businessArea={idea.area}
                          customer={customer}
                          location={userLocation}
                          scheduleGoals={scheduleGoals}
                        />
                      )}
                    </>
                  </MainContent>
                </PageLayout>
              ) : (
                <>
                  {currentStep === 'landing' && <Landing onSelect={handleLandingSelect} />}
                  {currentStep === 'customerGuidance' && ( <Guidance message="That's perfectly fine! A great business is built on a deep understanding of its customers. Let's explore some potential customer types to get you started." buttonText="Let's find my customer" onContinue={() => setAppState(prev => ({ ...prev, currentStep: 'customer' }))} /> )}
                  {currentStep === 'problemGuidance' && (
                    <Guidance 
                      message="No problem at all! The best businesses solve a clear, painful problem. Let's figure out what job your customers need done." 
                      buttonText="Let's find the problem" 
                      onContinue={handleProblemGuidanceContinue} 
                    />
                  )}
                </>
              )
            )}
          </AppContainer>
        } />
      </Routes>
      <FeedbackWidget route={location.pathname} />
      
      {/* Custom Error Notification */}
      <ErrorNotification
        message={errorNotification.message}
        isVisible={errorNotification.isVisible}
        onClose={hideError}
        type={errorNotification.type}
      />
      
      <Footer>
        <AppFooterContainer>
          <AppFooterSection>
                            <h3>Alpha Hustler</h3>
            <p>AI-powered side hustle discovery platform helping people find their perfect opportunity.</p>
          </AppFooterSection>
          <AppFooterSection>
            <h3>Product</h3>
            <a href="#features">Features</a>
            <a href="#demo">Demo</a>
            <a href="#testimonials">Testimonials</a>
          </AppFooterSection>
          <AppFooterSection>
            <h3>Support</h3>
            <a href="#">Help Center</a>
            <a href="#">Contact Us</a>
            <a href="#">Privacy Policy</a>
          </AppFooterSection>
          <AppFooterSection>
            <h3>Company</h3>
            <a href="#">About Us</a>
            <a href="#">Blog</a>
            <a href="#">Careers</a>
          </AppFooterSection>
        </AppFooterContainer>
        <AppFooterBottom>
                        <p>&copy; {new Date().getFullYear()} Alpha Hustler. All rights reserved.</p>
        </AppFooterBottom>
      </Footer>
    </>
  );
}

export default AppContent;