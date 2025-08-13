import React, { useEffect, useState, useRef } from 'react';
import styled from 'styled-components';
import { FiCopy } from 'react-icons/fi';
import Confetti from 'react-confetti';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  
  @media (max-width: 768px) {
    padding: 1rem 0.5rem;
  }
`;

const FormCard = styled.div`
  background: linear-gradient(135deg, #ffffff 0%, #fafbfc 100%);
  border-radius: 20px;
  padding: 2.5rem;
  box-shadow: 
    0 4px 20px rgba(0,0,0,0.08),
    0 1px 3px rgba(0,0,0,0.1);
  border: 1px solid rgba(255,255,255,0.8);
  width: 100%;
  margin-top: 1.5rem;
  position: relative;
  overflow: hidden;
  
  @media (max-width: 768px) {
    padding: 1.5rem 1rem;
    margin-top: 1rem;
    border-radius: 16px;
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, #181a1b, #4a4a4a, #181a1b);
    border-radius: 20px 20px 0 0;
    
    @media (max-width: 768px) {
      border-radius: 16px 16px 0 0;
    }
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 100%);
    pointer-events: none;
  }
`;

const Title = styled.h1`
  font-family: 'Audiowide', 'Courier New', monospace;
  font-size: 2.4rem;
  font-weight: 400;
  margin-bottom: 1.2rem;
  text-align: center;
  color: var(--text-primary);
  letter-spacing: -0.03em;
  background: linear-gradient(135deg, #181a1b 0%, #4a4a4a 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  position: relative;
  font-display: swap;
  
  @media (max-width: 768px) {
    font-size: 2rem;
    margin-bottom: 1rem;
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: -8px;
    left: 50%;
    transform: translateX(-50%);
    width: 60px;
    height: 3px;
    background: linear-gradient(90deg, #181a1b, #4a4a4a);
    border-radius: 2px;
  }
`;

const Summary = styled.p`
  font-size: 1.15rem;
  color: var(--text-secondary);
  margin-bottom: 2rem;
  background: linear-gradient(135deg, #f8f9fa 0%, #f1f3f4 100%);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid rgba(24, 26, 27, 0.1);
  line-height: 1.6;
  text-align: center;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  
  @media (max-width: 768px) {
    font-size: 1rem;
    padding: 1.2rem;
    margin-bottom: 1.5rem;
  }
`;

const SectionCard = styled.div`
  background: linear-gradient(135deg, #ffffff 0%, #fafbfc 100%);
  border-radius: 16px;
  padding: 1.8rem 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  border: 1px solid rgba(24, 26, 27, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  @media (max-width: 768px) {
    padding: 1.5rem 1rem;
    margin-bottom: 1rem;
    border-radius: 12px;
  }
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.12);
    background: linear-gradient(135deg, #f8f9fa 0%, #f1f3f4 100%);
  }
`;

const SectionTitle = styled.h2`
  font-family: 'Audiowide', 'Courier New', monospace;
  font-size: 1.3rem;
  font-weight: 400;
  color: #181a1b;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  letter-spacing: -0.02em;
  font-display: swap;
  
  @media (max-width: 768px) {
    font-size: 1.2rem;
    margin-bottom: 0.8rem;
  }
`;

const SectionContent = styled.p`
  color: var(--text-secondary);
  font-size: 1.2rem;
  margin: 0;
  line-height: 1.6;
  
  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const ListContent = styled.ul`
  color: var(--text-secondary);
  font-size: 1.2rem;
  margin: 0;
  padding-left: 1.5rem;
  line-height: 1.6;
  
  @media (max-width: 768px) {
    font-size: 1rem;
    padding-left: 1.2rem;
  }
`;

const ListItem = styled.li`
  margin-bottom: 0.8rem;
  
  @media (max-width: 768px) {
    margin-bottom: 0.6rem;
  }
`;

const Actions = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 2.5rem;
  flex-wrap: wrap;
  justify-content: center;
  
  @media (max-width: 768px) {
    gap: 0.8rem;
    margin-top: 2rem;
    flex-direction: column;
    align-items: center;
  }
`;

const ActionButton = styled.button`
  background: linear-gradient(135deg, #181a1b 0%, #2d2d2d 100%);
  color: white;
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
  
  @media (max-width: 768px) {
    padding: 1rem 1.5rem;
    font-size: 1rem;
    width: 100%;
    max-width: 300px;
    justify-content: center;
  }
  
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
    background: linear-gradient(135deg, #000 0%, #181a1b 100%);
    transform: translateY(-3px);
    box-shadow: 0 12px 32px rgba(0,0,0,0.25);
    
    &::before {
      left: 100%;
    }
  }
  
  &:active {
    transform: translateY(-1px);
    box-shadow: 0 6px 16px rgba(0,0,0,0.2);
  }
  
  &.centered {
    display: block;
    margin: 0 auto;
    justify-content: center;
  }
`;

const SignupPrompt = styled.div`
  background: #f8f9fa;
  border-radius: 12px;
  padding: 2rem;
  margin: 2rem 0;
  text-align: center;
  border: 2px solid #e9ecef;
  
  @media (max-width: 768px) {
    padding: 1.5rem 1rem;
    margin: 1.5rem 0;
  }
`;

const SignupTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #212529;
  
  @media (max-width: 768px) {
    font-size: 1.3rem;
    margin-bottom: 0.8rem;
  }
`;

const SignupText = styled.p`
  color: #6c757d;
  margin-bottom: 1.5rem;
  font-size: 1.1rem;
  
  @media (max-width: 768px) {
    font-size: 1rem;
    margin-bottom: 1.2rem;
  }
`;

const ProgressBarContainer = styled.div`
  width: 100%;
  max-width: 400px;
  height: 8px;
  background: #e5e5e5;
  border-radius: 4px;
  margin: 2rem auto 1.5rem auto;
  overflow: hidden;
  
  @media (max-width: 768px) {
    margin: 1.5rem auto 1rem auto;
  }
`;

const ProgressBarFill = styled.div<{ percent: number }>`
  height: 100%;
  background: linear-gradient(90deg, #181a1b 0%, #444 100%);
  width: ${({ percent }) => percent}%;
  transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
`;

const CongratsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
  
  @media (max-width: 768px) {
    margin-bottom: 1rem;
  }
`;

const Congrats = styled.div`
  font-size: 2.2rem;
  font-weight: 800;
  background: linear-gradient(180deg, #5ad6ff 0%, #5a6ee6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-fill-color: transparent;
  text-align: center;
  margin-bottom: 0.5rem;
  animation: pulsePop 1s cubic-bezier(0.23, 1, 0.32, 1) 0s 3;
  
  @media (max-width: 768px) {
    font-size: 1.8rem;
  }
  
  @keyframes pulsePop {
    0% { opacity: 0; transform: scale(0.7); }
    20% { opacity: 1; transform: scale(1.1); }
    50% { opacity: 1; transform: scale(1); }
    70% { opacity: 1; transform: scale(1.1); }
    100% { opacity: 1; transform: scale(1); }
  }
`;

const CenteredText = styled.p`
  text-align: center;
  width: 100%;
  margin-top: 1rem;
  
  @media (max-width: 768px) {
    font-size: 1rem;
    margin-top: 0.8rem;
  }
`;

const SkillGapSection = styled.div`
  background: #f8f9fa;
  border-radius: 12px;
  padding: 1.5rem;
  margin-top: 1.5rem;
  border-left: 4px solid #ccc;
  border-right: 4px solid #ccc;
  
  @media (max-width: 768px) {
    padding: 1.2rem 1rem;
    margin-top: 1rem;
  }
`;

const SkillGapTitle = styled.div`
  font-family: 'Audiowide', 'Courier New', monospace;
  font-weight: 400;
  color: #181a1b;
  margin-bottom: 1rem;
  font-size: 1.4rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-display: swap;
  
  @media (max-width: 768px) {
    font-size: 1.2rem;
    margin-bottom: 0.8rem;
  }
`;

const SkillGapList = styled.ul`
  margin: 0;
  padding-left: 0;
  color: #333;
  font-size: 1.2rem;
  list-style: none;
  
  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const SkillGapListItem = styled.li`
  background: #fff;
  border-radius: 8px;
  padding: 0.75rem 1rem;
  margin-bottom: 0.5rem;
  border: 1px solid #e9ecef;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
  
  @media (max-width: 768px) {
    padding: 0.6rem 0.8rem;
    margin-bottom: 0.4rem;
  }
  
  &:hover {
    background: #f8f9fa;
    transform: translateX(4px);
  }
`;

const LearningPathSection = styled.div`
  background: #f5f7fa;
  border-radius: 12px;
  padding: 1.5rem;
  margin-top: 1rem;
  border-left: 4px solid #ccc;
  border-right: 4px solid #ccc;
  
  @media (max-width: 768px) {
    padding: 1.2rem 1rem;
    margin-top: 0.8rem;
  }
`;

const LearningPathTitle = styled.div`
  font-family: 'Audiowide', 'Courier New', monospace;
  font-weight: 400;
  color: #181a1b;
  margin-bottom: 1rem;
  font-size: 1.4rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-display: swap;
  
  @media (max-width: 768px) {
    font-size: 1.2rem;
    margin-bottom: 0.8rem;
  }
`;

const LearningPathList = styled.ul`
  margin: 0;
  padding-left: 0;
  color: #333;
  font-size: 1.2rem;
  list-style: none;
  
  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const LearningPathListItem = styled.li`
  background: #fff;
  border-radius: 8px;
  padding: 0.75rem 1rem;
  margin-bottom: 0.5rem;
  border: 1px solid #e9ecef;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
  
  @media (max-width: 768px) {
    padding: 0.6rem 0.8rem;
    margin-bottom: 0.4rem;
  }
  
  &:hover {
    background: #f8f9fa;
    transform: translateX(4px);
  }
`;

const SkillsYouHaveSection = styled.div`
  background: #f0f0f0;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  border-left: 4px solid #ccc;
  border-right: 4px solid #ccc;
  
  @media (max-width: 768px) {
    padding: 1.2rem 1rem;
    margin-bottom: 1rem;
  }
`;

const SkillsYouHaveTitle = styled.div`
  font-family: 'Audiowide', 'Courier New', monospace;
  font-weight: 400;
  color: #181a1b;
  margin-bottom: 1rem;
  font-size: 1.4rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-display: swap;
  
  @media (max-width: 768px) {
    font-size: 1.2rem;
    margin-bottom: 0.8rem;
  }
`;

const SkillsYouHaveList = styled.ul`
  margin: 0;
  padding-left: 0;
  color: #333;
  font-size: 1.2rem;
  list-style: none;
  
  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const SkillsYouHaveListItem = styled.li`
  background: #fff;
  border-radius: 8px;
  padding: 0.75rem 1rem;
  margin-bottom: 0.5rem;
  border: 1px solid #e9ecef;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
  
  @media (max-width: 768px) {
    padding: 0.6rem 0.8rem;
    margin-bottom: 0.4rem;
  }
  
  &:hover {
    background: #f8f9fa;
    transform: translateX(4px);
  }
`;

// New styled components for comprehensive gap analysis
const GapAnalysisSection = styled.div`
  background: #f8f9fa;
  border-radius: 12px;
  padding: 1.5rem;
  margin-top: 1.5rem;
  border-left: 4px solid #ccc;
  border-right: 4px solid #ccc;
  
  @media (max-width: 768px) {
    padding: 1.2rem 1rem;
    margin-top: 1rem;
  }
`;

const GapAnalysisSubsection = styled.div`
  margin-bottom: 1.5rem;
  
  &:last-child {
    margin-bottom: 0;
  }
  
  @media (max-width: 768px) {
    margin-bottom: 1rem;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
`;

const GapAnalysisSubtitle = styled.h4`
  font-family: 'Audiowide', 'Courier New', monospace;
  font-weight: 400;
  font-size: 1rem;
  color: #181a1b;
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  user-select: none;
  transition: all 0.2s ease;
  font-display: swap;
  
  @media (max-width: 768px) {
    font-size: 0.9rem;
    margin-bottom: 0.6rem;
  }
`;

const CollapsibleHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  padding: 0.75rem 1rem;
  background: #fff;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  margin-bottom: 1rem;
  transition: all 0.2s ease;
  
  @media (max-width: 768px) {
    padding: 0.6rem 0.8rem;
    margin-bottom: 0.8rem;
  }
  
  &:hover {
    background: #f8f9fa;
  }
`;

const CollapsibleTitle = styled.h4`
  font-family: 'Audiowide', 'Courier New', monospace;
  font-weight: 400;
  font-size: 1rem;
  color: #181a1b;
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  user-select: none;
  transition: all 0.2s ease;
  font-display: swap;
  
  @media (max-width: 768px) {
    font-size: 0.9rem;
    margin-bottom: 0.6rem;
  }
`;

const CollapsibleIcon = styled.div<{ isOpen: boolean }>`
  font-size: 1.2rem;
  color: #666;
  transition: transform 0.2s ease;
  transform: rotate(${props => props.isOpen ? '180deg' : '0deg'});
  
  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const CollapsibleContent = styled.div<{ isOpen: boolean }>`
  max-height: ${props => props.isOpen ? '1000px' : '0'};
  overflow: hidden;
  transition: max-height 0.3s ease;
  opacity: ${props => props.isOpen ? '1' : '0'};
  transform: translateY(${props => props.isOpen ? '0' : '-10px'});
  transition: all 0.3s ease;
  
  @media (max-width: 768px) {
    padding: 0 0.5rem;
  }
`;

const GapAnalysisList = styled.ul`
  padding-left: 0;
  list-style: none;
  
  @media (max-width: 768px) {
    margin: 0;
  }
`;

const GapAnalysisListItem = styled.li`
  background: #fff;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 0.75rem 1rem;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
  
  @media (max-width: 768px) {
    padding: 0.6rem 0.8rem;
    margin-bottom: 0.4rem;
    font-size: 0.9rem;
  }
  
  &:hover {
    background: #f8f9fa;
    transform: translateX(4px);
  }
`;

const SkillGapWrapper = styled.div`
  padding: 1.5rem;
  margin-top: 1rem;
  background: #fafbfc;
  
  @media (max-width: 768px) {
    padding: 1.2rem 1rem;
    margin-top: 0.8rem;
  }
`;

const MarketResearchSection = styled.div`
  background: #f8f9fa;
  border-radius: 12px;
  padding: 1.5rem;
  margin-top: 1rem;
  border-left: 4px solid #f0f0f0;
  border-right: 4px solid #f0f0f0;
  
  @media (max-width: 768px) {
    padding: 1.2rem 1rem;
    margin-top: 0.8rem;
  }
`;

const MarketResearchSubsection = styled.div`
  background: #fff;
  border-radius: 8px;
  padding: 1.2rem;
  margin-bottom: 1rem;
  
  @media (max-width: 768px) {
    padding: 1rem 0.8rem;
    margin-bottom: 0.8rem;
  }
`;

const MarketResearchTitle = styled.h4`
  font-family: 'Audiowide', 'Courier New', monospace;
  font-weight: 400;
  font-size: 1rem;
  color: #181a1b;
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  user-select: none;
  transition: all 0.2s ease;
  font-display: swap;
  
  @media (max-width: 768px) {
    font-size: 0.9rem;
    margin-bottom: 0.6rem;
  }
`;

const MarketResearchContent = styled.div`
  color: #333;
  font-size: 1rem;
  line-height: 1.5;
  
  @media (max-width: 768px) {
    font-size: 0.9rem;
    line-height: 1.4;
  }
`;

const MarketResearchList = styled.ul`
  margin: 0;
  padding-left: 0;
  color: #333;
  font-size: 1rem;
  list-style: none;
  
  @media (max-width: 768px) {
    font-size: 0.9rem;
  }
`;

const MarketResearchListItem = styled.li`
  background: #f8f9fa;
  border-radius: 6px;
  padding: 0.6rem 0.8rem;
  margin-bottom: 0.4rem;
  border: 1px solid #e9ecef;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
  
  @media (max-width: 768px) {
    padding: 0.5rem 0.6rem;
    margin-bottom: 0.3rem;
    font-size: 0.9rem;
  }
  
  &:hover {
    background: #f0f0f0;
    transform: translateX(2px);
  }
`;

const TextSection = styled.div`
  background: #f8f9fa;
  border-radius: 12px;
  padding: 1.5rem;
  margin-top: 1rem;
  border-left: 4px solid #f0f0f0;
  border-right: 4px solid #f0f0f0;
  
  @media (max-width: 768px) {
    padding: 1.2rem 1rem;
    margin-top: 0.8rem;
  }
`;

const TextContent = styled.div`
  color: #333;
  font-size: 1.2rem;
  line-height: 1.6;
  text-align: justify;
  
  @media (max-width: 768px) {
    font-size: 1rem;
    line-height: 1.5;
    text-align: left;
  }
`;

const ListSection = styled.div`
  background: #f8f9fa;
  border-radius: 12px;
  padding: 1.5rem;
  margin-top: 1rem;
  border-left: 4px solid #f0f0f0;
  border-right: 4px solid #f0f0f0;
  
  @media (max-width: 768px) {
    padding: 1.2rem 1rem;
    margin-top: 0.8rem;
  }
`;

const ListSectionTitle = styled.h4`
  font-family: 'Audiowide', 'Courier New', monospace;
  font-weight: 400;
  font-size: 1rem;
  color: #181a1b;
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  user-select: none;
  transition: all 0.2s ease;
  font-display: swap;
  
  @media (max-width: 768px) {
    font-size: 0.9rem;
    margin-bottom: 0.6rem;
  }
`;

const ListSectionList = styled.ul`
  margin: 0;
  padding-left: 0;
  color: #333;
  font-size: 1rem;
  list-style: none;
  
  @media (max-width: 768px) {
    font-size: 0.9rem;
  }
`;

const ListSectionItem = styled.li`
  background: #fff;
  border-radius: 6px;
  padding: 0.6rem 0.8rem;
  margin-bottom: 0.4rem;
  border: 1px solid #e9ecef;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
  
  @media (max-width: 768px) {
    padding: 0.5rem 0.6rem;
    margin-bottom: 0.3rem;
    font-size: 0.9rem;
  }
  
  &:hover {
    background: #f8f9fa;
    transform: translateX(2px);
  }
`;

export interface StartupPlanPageDiscoveryProps {
  context: {
    idea: any;
    customer: any;
    job: any;
    problemDescription?: string | null;
    solutionDescription?: string | null;
    competitionDescription?: string | null;
    skillAssessment?: { skills: any[]; selectedSkills: string[]; recommendations: string[]; learningPath: string[] } | null;
    [key: string]: any;
  };
  onSignup?: () => void;
  onLogin?: () => void;
  isAuthenticated?: boolean;
  isSubscribed?: boolean;
  onContinueToValidation?: () => void;
}

interface StartupPlan {
  summary: string;
  sections: { [key: string]: string };
}

interface NewStartupPlan {
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
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

export function StartupPlanPageDiscovery({ context, onSignup, onLogin, isAuthenticated, isSubscribed }: StartupPlanPageDiscoveryProps) {
  console.log('StartupPlanPageDiscovery mounted');
  console.log('Props:', context);
  const { idea, customer, job, ...rest } = context;
  if (!idea || !customer || !job) {
    return (
      <Container>
        <Title>Your Business Idea</Title>
        <CenteredText style={{ color: '#c00', marginTop: 40 }}>
          Missing required information to generate a business idea.<br />
          Please complete all previous steps.
        </CenteredText>
      </Container>
    );
  }
  const { user, mockUpgradeToPremium } = useAuth();
  const [plan, setPlan] = useState<StartupPlan | null>(null);
  const [newPlan, setNewPlan] = useState<NewStartupPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showMarketEvaluation, setShowMarketEvaluation] = useState(false);
  const prevPlanRef = useRef<StartupPlan | null>(null);
  
  // State for collapsible gap analysis sections
  const [collapsedSections, setCollapsedSections] = useState({
    skills: true,
    resources: true,
    operations: true
  });
  const navigate = useNavigate();
  const progressInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasSaved = useRef(false);

  // Helper to gather all context for plan generation
  function getFullContext() {
    return {
      idea: context.idea,
      customer: context.customer,
      job: context.job,
      problemDescription: context.problemDescription,
      solutionDescription: context.solutionDescription,
      competitionDescription: context.competitionDescription,
      // Add more fields as needed
    };
  }

  useEffect(() => {
    let cancelled = false;
    // Reset the save flag when props change
    hasSaved.current = false;
    
    async function safeFetchPlan() {
      if (!cancelled) {
        await fetchPlan();
      }
    }
    safeFetchPlan();
    return () => { 
      cancelled = true;
      if (progressInterval.current) clearInterval(progressInterval.current);
    };
  }, [context.idea, context.customer, context.job]);

  async function fetchPlan() {
    console.log('fetchPlan called');
    if (isLoading) return; // Prevent duplicate triggers
    
    // Add a flag to prevent duplicate saves
    if (plan) return; // Don't regenerate if we already have a plan
    
    setIsLoading(true);
    setProgress(0);
    setError(null);
    // Animate progress bar to 90% while loading
    progressInterval.current = setInterval(() => {
      setProgress(prev => {
        const next = prev < 90 ? prev + 5 : 90;
        console.log('Progress:', next);
        return next;
      });
    }, 200);
    console.log('Progress interval started');
    try {
      // Build a detailed prompt for the AI using all user input
      const aiPrompt = `
You are a startup strategist AI. Given the following user input:
- Interests: ${context.idea?.interests || ''}
- Customer Persona: ${context.customer?.title || ''} (${context.customer?.description || ''})
- Customer Job: ${context.job?.title || ''} (${context.job?.description || ''})
${context.location ? `- Location: ${context.location.city}, ${context.location.region}, ${context.location.country}` : ''}
${context.scheduleGoals ? `- Availability: ${context.scheduleGoals.hoursPerWeek} hours/week, Income Target: $${context.scheduleGoals.incomeTarget}/month` : ''}

      Generate a comprehensive Business Plan with the following sections. CRITICAL: Each section must contain actual, specific content, not placeholder text.

- Business Idea Summary: 2-3 sentences summarizing the business idea based on the user's interests, customer persona, and job. ${context.location ? `Make it specific to ${context.location.city}, ${context.location.region}.` : ''}
- Customer Profile: 1-2 sentences describing the target customer.
- Customer Struggles: 2-3 bullet points listing the main struggles or pain points of the customer related to the job.
- Value Proposition: 1-2 sentences proposing a solution to the customer struggles above, describing the unique value the business provides to the customer.
- Market Size: 1-2 sentences estimating the size or opportunity of the target market.
- Competitors: 2-3 bullet points listing main competitors or alternatives. MUST include actual competitor names or types.
- Market Trends: 2-3 bullet points describing relevant trends in the market. MUST include actual industry trends, not generic statements.
- Market Validation: 1-2 sentences on how the business idea can be validated or has been validated.
- Financial Summary: 2-3 sentences summarizing the expected revenue model, main costs, and financial opportunity for this business idea.

Return as JSON:
{
  summary: string,
  sections: {
    Customer: string,
    Struggles: string, // bullet points separated by newlines
    Value: string,
    MarketSize: string,
    Competitors: string, // bullet points separated by newlines
    Trends: string, // bullet points separated by newlines
    Validation: string,
    Financial: string
  }
}
No extra text, just valid JSON.`;

      console.log('About to POST to /api/business-plan/discovery', { idea, customer, job, prompt: aiPrompt });
      const res = await fetch(`${API_URL}/business-plan/discovery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea, customer, job, prompt: aiPrompt })
      });
      if (!res.ok) throw new Error('Failed to generate business plan');
      const data = await res.json();
      console.log('API response', data);
      console.log('API response sections:', data.sections);
      console.log('Trends section:', data.sections?.Trends);
      console.log('Competitors section:', data.sections?.Competitors);
      setPlan(data);
      setProgress(100);

      // Map to new format for display and saving
      const mappedPlan: NewStartupPlan = {
        businessIdeaSummary: data.summary || `${context.idea?.interests ? `Business idea based on your interests: ${context.idea.interests}. ` : ''}${context.customer?.description ? `Targeting customer: ${context.customer.description}. ` : ''}${context.job?.description ? `Solving job: ${context.job.description}.` : ''}`,
        customerProfile: { description: data.sections?.Customer || context.customer?.description || '' },
        customerStruggle: (data.sections?.Struggles && data.sections.Struggles.split('\n').filter(Boolean))
          || (context.job && context.job.description ? [context.job.description] : [])
          || (context.customer?.painPoints ? context.customer.painPoints : []),
        valueProposition: data.sections?.Value || context.idea?.valueProposition || '',
        marketInformation: {
          marketSize: data.sections?.MarketSize || data.sections?.['Market Size'] || context.idea?.marketSize || '',
          competitors: (data.sections?.Competitors && data.sections.Competitors.split('\n').filter(Boolean))
            || (data.sections?.['Competitor Analysis'] && data.sections['Competitor Analysis'].split('\n').filter(Boolean))
            || (context.idea && context.idea.competitors ? context.idea.competitors.split('\n').filter(Boolean) : [])
            || (context.customer?.competitors ? context.customer.competitors : [])
            || generateDefaultCompetitors(context.idea?.interests || '', context.customer?.description || ''),
          trends: (data.sections?.Trends && data.sections.Trends.split('\n').filter(Boolean))
            || (data.sections?.['Market Trends'] && data.sections['Market Trends'].split('\n').filter(Boolean))
            || (context.idea?.trends ? context.idea.trends.split('\n').filter(Boolean) : [])
            || generateDefaultTrends(context.idea?.interests || '', context.customer?.description || ''),
          validation: data.sections?.Validation || data.sections?.['Market Validation'] || context.idea?.validation || '',
        },
        financialSummary: data.sections?.Financial || '',
      };
      setNewPlan(mappedPlan);

                // Save plan to backend if authenticated
          if (user && user.email && !hasSaved.current) {
            hasSaved.current = true; // Prevent duplicate saves
            try {
              // Generate gap analysis for saving
              const gapAnalysis = context.skillAssessment ? generateGapAnalysis(context.skillAssessment, mappedPlan) : null;
              
              // Generate a more engaging title from the business idea summary
              function generateShortTitle(summary: string): string {
                if (!summary) return 'Untitled Business Plan';
                
                // Remove common repetitive prefixes
                let cleanSummary = summary
                  .replace(/^(the\s+business\s+(idea\s+)?|our\s+business\s+(idea\s+)?|this\s+business\s+(idea\s+)?)/i, '')
                  .replace(/^(we\s+are\s+developing\s+an?\s+|we\s+are\s+creating\s+an?\s+|we\s+are\s+building\s+an?\s+)/i, '')
                  .replace(/^(our\s+platform\s+provides\s+|our\s+service\s+offers\s+|our\s+solution\s+delivers\s+)/i, '')
                  .trim();
                
                // If the summary is too short after cleaning, use the original
                if (cleanSummary.length < 20) {
                  cleanSummary = summary;
                }
                
                            // Extract key concepts and create a professional business title
            const words = cleanSummary.split(/\s+/).filter(Boolean);
            
            // Look for key business terms to create a professional title
            const keyTerms = ['virtual', 'online', 'digital', 'mobile', 'app', 'platform', 'service', 'coaching', 'fitness', 'health', 'education', 'technology', 'software', 'marketplace', 'community', 'network', 'solution', 'tool', 'system', 'hub', 'studio', 'academy', 'center'];
            
            // Find the most relevant key terms in the summary
            const foundKeyTerms = keyTerms.filter(term => 
              cleanSummary.toLowerCase().includes(term.toLowerCase())
            );
            
            // Extract the main concept (usually the first meaningful phrase)
            let mainConcept = '';
            if (words.length >= 3) {
              // Look for the core business concept (usually 3-5 words)
              mainConcept = words.slice(0, 4).join(' ');
            } else {
              mainConcept = words.join(' ');
            }
            
            // Create a professional title format
            let title = '';
            
            if (foundKeyTerms.length > 0) {
              // Use format: "Main Concept + Key Term"
              const keyTerm = foundKeyTerms[0];
              title = `${mainConcept} ${keyTerm}`;
            } else {
              // Use format: "Main Concept + Platform/Service"
              title = `${mainConcept} Platform`;
            }
            
            // Clean up the title
            title = title
              .replace(/\s+/g, ' ') // Remove extra spaces
              .trim();
            
            // Capitalize properly (Title Case)
            title = title.replace(/\b\w/g, l => l.toUpperCase());
            
            // Ensure it's not too long (max ~8 words)
            const titleWords = title.split(' ');
            if (titleWords.length > 8) {
              title = titleWords.slice(0, 8).join(' ');
            }
            
            return title;
              }
              const shortTitle = generateShortTitle(mappedPlan.businessIdeaSummary);
              // Compose the correct payload for the backend
              const payload = {
            title: shortTitle,
            summary: mappedPlan.businessIdeaSummary,
            sections: {
              'Customer Profile': mappedPlan.customerProfile.description,
              'Customer Struggles': Array.isArray(mappedPlan.customerStruggle) ? mappedPlan.customerStruggle.join('\n') : mappedPlan.customerStruggle,
              'Value Proposition': mappedPlan.valueProposition,
              'Market Size': mappedPlan.marketInformation.marketSize,
              'Market Trends': Array.isArray(mappedPlan.marketInformation.trends) ? mappedPlan.marketInformation.trends.join('\n') : mappedPlan.marketInformation.trends,
              'Competitors': Array.isArray(mappedPlan.marketInformation.competitors) ? mappedPlan.marketInformation.competitors.join('\n') : mappedPlan.marketInformation.competitors,
              'Financial Summary': mappedPlan.financialSummary,
            },
            // Add all nested fields for direct view rendering
            businessIdeaSummary: mappedPlan.businessIdeaSummary,
            customerProfile: mappedPlan.customerProfile,
            customerStruggle: mappedPlan.customerStruggle,
            valueProposition: mappedPlan.valueProposition,
            marketInformation: mappedPlan.marketInformation,
            financialSummary: mappedPlan.financialSummary,
            idea: {
              title: context.idea?.title || 'Untitled Idea',
              description: context.idea?.interests || 'No idea description provided.'
            },
            customer: {
              title: context.customer?.title || 'Customer',
              description: context.customer?.description || 'No customer description provided.'
            },
            job: {
              title: context.job?.title || 'Customer Job',
              description: context.job?.description || 'No job description provided.'
            },
            problem: {
              description: mappedPlan.customerStruggle && Array.isArray(mappedPlan.customerStruggle) ? mappedPlan.customerStruggle[0] : (mappedPlan.customerStruggle || 'No problem description provided.'),
              impact: 'High',
              urgency: 'medium'
            },
            solution: {
              description: mappedPlan.valueProposition || 'No solution description provided.',
              keyFeatures: [mappedPlan.valueProposition || 'Key feature'],
              uniqueValue: mappedPlan.valueProposition || 'Unique value'
            },
            gapAnalysis: gapAnalysis
          };
          await fetch(`${API_URL}/business-plan`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(payload)
          });
        } catch (saveErr) {
          // Optionally handle save error
        }
      }
    } catch (err: any) {
      setError(err.message || 'Unknown error');
      setProgress(100);
      console.error('API error', err);
    } finally {
      setIsLoading(false);
      if (progressInterval.current) clearInterval(progressInterval.current);
      setTimeout(() => setProgress(0), 800);
    }
  }

  useEffect(() => {
    if (plan && plan !== prevPlanRef.current) {
      prevPlanRef.current = plan;
    }
  }, [plan]);

  // Start confetti immediately when the page is shown and business plan is available
  useEffect(() => {
    if (newPlan && !isLoading) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 12500);
    }
  }, [newPlan, isLoading]);

  // Function to generate comprehensive gap analysis
  const toggleSection = (section: 'skills' | 'resources' | 'operations') => {
    setCollapsedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Generate default market trends based on business interests
  const generateDefaultTrends = (interests: string, customerDescription: string): string[] => {
    const interestsLower = interests.toLowerCase();
    const customerLower = customerDescription.toLowerCase();
    
    // Common market trends based on business categories
    const trends: string[] = [];
    
    if (interestsLower.includes('tech') || interestsLower.includes('app') || interestsLower.includes('software')) {
      trends.push('• Growing demand for digital solutions and mobile applications');
      trends.push('• Increasing adoption of cloud-based services and SaaS models');
      trends.push('• Rise of AI and automation in business processes');
    } else if (interestsLower.includes('health') || interestsLower.includes('fitness') || interestsLower.includes('wellness')) {
      trends.push('• Growing health consciousness and demand for wellness solutions');
      trends.push('• Increasing adoption of digital health and fitness tracking');
      trends.push('• Rise of personalized health and nutrition services');
    } else if (interestsLower.includes('education') || interestsLower.includes('learning') || interestsLower.includes('training')) {
      trends.push('• Growing demand for online and personalized learning solutions');
      trends.push('• Increasing adoption of micro-learning and skill-based education');
      trends.push('• Rise of lifelong learning and professional development');
    } else if (interestsLower.includes('food') || interestsLower.includes('restaurant') || interestsLower.includes('catering')) {
      trends.push('• Growing demand for convenient and healthy food options');
      trends.push('• Increasing adoption of food delivery and meal prep services');
      trends.push('• Rise of sustainable and locally-sourced food preferences');
    } else {
      // Generic business trends
      trends.push('• Growing demand for personalized and customized solutions');
      trends.push('• Increasing adoption of digital and online services');
      trends.push('• Rise of sustainable and environmentally-conscious business practices');
    }
    
    return trends;
  };

  // Generate default competitors based on business interests
  const generateDefaultCompetitors = (interests: string, customerDescription: string): string[] => {
    const interestsLower = interests.toLowerCase();
    const customerLower = customerDescription.toLowerCase();
    
    // Common competitors based on business categories
    const competitors: string[] = [];
    
    if (interestsLower.includes('tech') || interestsLower.includes('app') || interestsLower.includes('software')) {
      competitors.push('• Established software companies in the same space');
      competitors.push('• Freelance developers and small development teams');
      competitors.push('• Open-source alternatives and free tools');
    } else if (interestsLower.includes('health') || interestsLower.includes('fitness') || interestsLower.includes('wellness')) {
      competitors.push('• Traditional gyms and fitness centers');
      competitors.push('• Established health and wellness apps');
      competitors.push('• Personal trainers and wellness coaches');
    } else if (interestsLower.includes('education') || interestsLower.includes('learning') || interestsLower.includes('training')) {
      competitors.push('• Traditional educational institutions');
      competitors.push('• Established online learning platforms');
      competitors.push('• Individual tutors and trainers');
    } else if (interestsLower.includes('food') || interestsLower.includes('restaurant') || interestsLower.includes('catering')) {
      competitors.push('• Traditional restaurants and food establishments');
      competitors.push('• Established food delivery services');
      competitors.push('• Local food vendors and caterers');
    } else {
      // Generic competitors
      competitors.push('• Established companies in the same industry');
      competitors.push('• Local businesses offering similar services');
      competitors.push('• Online alternatives and digital solutions');
    }
    
    return competitors;
  };

  const generateGapAnalysis = (skillAssessment: { skills: any[]; selectedSkills: string[]; recommendations: string[]; learningPath: string[] }, businessPlan: any) => {
    const selectedSkillTitles = skillAssessment.skills
      .filter(skill => skillAssessment.selectedSkills.includes(skill.id))
      .map(skill => skill.title);
    
    const missingSkillTitles = skillAssessment.skills
      .filter(skill => !skillAssessment.selectedSkills.includes(skill.id))
      .map(skill => skill.title);

    // Generate resource gaps
    const resourceGaps = {
      financial: [
        'Initial startup capital',
        'Operating expenses for first 6 months',
        'Emergency fund for unexpected costs'
      ],
      human: [
        'Technical expertise for development',
        'Marketing and sales skills',
        'Administrative support'
      ],
      physical: [
        'Office space or workspace',
        'Equipment and technology',
        'Inventory and supplies'
      ]
    };



    // Generate operational gaps
    const operationalGaps = {
      processes: [
        'Standard operating procedures',
        'Quality control systems',
        'Customer service protocols'
      ],
      systems: [
        'Technology infrastructure',
        'Business management software',
        'Data security and backup'
      ],
      infrastructure: [
        'Legal and business registration',
        'Insurance and risk management',
        'Vendor and supplier relationships'
      ]
    };

    return {
      skills: {
        selectedSkills: selectedSkillTitles,
        missingSkills: missingSkillTitles,
        recommendations: skillAssessment.recommendations,
        learningPath: skillAssessment.learningPath
      },
      resources: resourceGaps,
      operations: operationalGaps
    };
  };

  const renderNewPlanSections = () => {
    if (!newPlan) return null;

    // Generate comprehensive gap analysis if skillAssessment is available
    const gapAnalysis = context.skillAssessment ? generateGapAnalysis(context.skillAssessment, newPlan) : null;

    const sections = [
      {
        title: 'Business Idea Summary',
        content: newPlan.businessIdeaSummary,
        type: 'text'
      },
      {
        title: 'Customer Profile',
        content: newPlan.customerProfile.description,
        type: 'text'
      },
      {
        title: 'Customer Struggles',
        content: newPlan.customerStruggle,
        type: 'list'
      },
      {
        title: 'Value Proposition',
        content: newPlan.valueProposition,
        type: 'text'
      },
      {
        title: 'Market Research',
        content: {
          marketSize: newPlan.marketInformation.marketSize,
          trends: newPlan.marketInformation.trends,
          competitors: newPlan.marketInformation.competitors,
        },
        type: 'marketResearch'
      },
      {
        title: 'Financial Summary',
        content: newPlan.financialSummary,
        type: 'text'
      },
    ];

    // Add comprehensive gap analysis section if available
    if (gapAnalysis) {
      sections.push({
        title: 'Comprehensive Gap Analysis',
        content: gapAnalysis as any, // Type assertion to handle complex object
        type: 'gapAnalysis'
      });
    }



    // Only show first 2 sections for unauthenticated users
    const visibleSections = isAuthenticated ? sections : sections.slice(0, 2);

            return (
          <>
            {visibleSections.map((section, index) => (
              <SectionCard key={index} style={section.type === 'gapAnalysis' ? { border: '2px solid #000', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' } : {}}>
            <SectionTitle>{section.title}</SectionTitle>
            {section.type === 'list' ? (
              <ListSection>
                <ListSectionTitle>
                  {section.title}
                </ListSectionTitle>
                <ListSectionList>
                  {Array.isArray(section.content) && section.content.map((item, i) => (
                    <ListSectionItem key={i}>
                      {item}
                    </ListSectionItem>
                  ))}
                </ListSectionList>
              </ListSection>
            ) : section.type === 'marketResearch' ? (
              (() => {
                const content = section.content as { marketSize: string; trends: string[]; competitors: string[] };
                return (
                  <MarketResearchSection>
                    <MarketResearchSubsection>
                      <MarketResearchTitle>
                        Market Size
                      </MarketResearchTitle>
                      <MarketResearchContent>
                        {content.marketSize || 'N/A'}
                      </MarketResearchContent>
                    </MarketResearchSubsection>
                    
                    <MarketResearchSubsection>
                      <MarketResearchTitle>
                        Market Trends
                      </MarketResearchTitle>
                      <MarketResearchList>
                        {Array.isArray(content.trends) && content.trends.length > 0 ? (
                          content.trends.map((trend: string, i: number) => (
                            <MarketResearchListItem key={i}>
                              {trend}
                            </MarketResearchListItem>
                          ))
                        ) : (
                          <MarketResearchListItem>N/A</MarketResearchListItem>
                        )}
                      </MarketResearchList>
                    </MarketResearchSubsection>
                    
                    <MarketResearchSubsection>
                      <MarketResearchTitle>
                        Competitors
                      </MarketResearchTitle>
                      <MarketResearchList>
                        {Array.isArray(content.competitors) && content.competitors.length > 0 ? (
                          content.competitors.map((comp: string, i: number) => (
                            <MarketResearchListItem key={i}>
                              {comp}
                            </MarketResearchListItem>
                          ))
                        ) : (
                          <MarketResearchListItem>N/A</MarketResearchListItem>
                        )}
                      </MarketResearchList>
                    </MarketResearchSubsection>
                  </MarketResearchSection>
                );
              })()
            ) : section.type === 'gapAnalysis' ? (
              (() => {
                const content = section.content as unknown as {
                  skills: { selectedSkills: string[]; missingSkills: string[]; recommendations: string[]; learningPath: string[] };
                  resources: { financial: string[]; human: string[]; physical: string[] };
                  operations: { processes: string[]; systems: string[]; infrastructure: string[] };
                };
                return (
                  <GapAnalysisSection>
                    {/* Skills Gap */}
                    <CollapsibleHeader onClick={() => toggleSection('skills')}>
                      <CollapsibleTitle>Skills Gap</CollapsibleTitle>
                      <CollapsibleIcon isOpen={!collapsedSections.skills}>▼</CollapsibleIcon>
                    </CollapsibleHeader>
                    <CollapsibleContent isOpen={!collapsedSections.skills}>
                      {content.skills.selectedSkills.length > 0 && (
                        <div style={{ marginBottom: '1rem' }}>
                          <div style={{ fontWeight: '600', marginBottom: '0.5rem', color: '#333' }}>Skills You Have:</div>
                          <GapAnalysisList>
                            {content.skills.selectedSkills.map((skill: string, i: number) => (
                              <GapAnalysisListItem key={i}>
                                {skill}
                              </GapAnalysisListItem>
                            ))}
                          </GapAnalysisList>
                        </div>
                      )}
                      {content.skills.missingSkills.length > 0 && (
                        <div style={{ marginBottom: '1rem' }}>
                          <div style={{ fontWeight: '600', marginBottom: '0.5rem', color: '#333' }}>Skills You Need:</div>
                          <GapAnalysisList>
                            {content.skills.missingSkills.map((skill: string, i: number) => (
                              <GapAnalysisListItem key={i}>
                                {skill}
                              </GapAnalysisListItem>
                            ))}
                          </GapAnalysisList>
                        </div>
                      )}
                    </CollapsibleContent>

                    {/* Resource Gap */}
                    <CollapsibleHeader onClick={() => toggleSection('resources')}>
                      <CollapsibleTitle>Resource Gap</CollapsibleTitle>
                      <CollapsibleIcon isOpen={!collapsedSections.resources}>▼</CollapsibleIcon>
                    </CollapsibleHeader>
                    <CollapsibleContent isOpen={!collapsedSections.resources}>
                      <div style={{ marginBottom: '1rem' }}>
                        <div style={{ fontWeight: '600', marginBottom: '0.5rem', color: '#333' }}>Financial Resources:</div>
                        <GapAnalysisList>
                          {content.resources.financial.map((item: string, i: number) => (
                            <GapAnalysisListItem key={i}>
                              {item}
                            </GapAnalysisListItem>
                          ))}
                        </GapAnalysisList>
                      </div>
                      <div style={{ marginBottom: '1rem' }}>
                        <div style={{ fontWeight: '600', marginBottom: '0.5rem', color: '#333' }}>Human Resources:</div>
                        <GapAnalysisList>
                          {content.resources.human.map((item: string, i: number) => (
                            <GapAnalysisListItem key={i}>
                              {item}
                            </GapAnalysisListItem>
                          ))}
                        </GapAnalysisList>
                      </div>
                      <div style={{ marginBottom: '1rem' }}>
                        <div style={{ fontWeight: '600', marginBottom: '0.5rem', color: '#333' }}>Physical Resources:</div>
                        <GapAnalysisList>
                          {content.resources.physical.map((item: string, i: number) => (
                            <GapAnalysisListItem key={i}>
                              {item}
                            </GapAnalysisListItem>
                          ))}
                        </GapAnalysisList>
                      </div>
                    </CollapsibleContent>

                    {/* Operational Gap */}
                    <CollapsibleHeader onClick={() => toggleSection('operations')}>
                      <CollapsibleTitle>Operational Gap</CollapsibleTitle>
                      <CollapsibleIcon isOpen={!collapsedSections.operations}>▼</CollapsibleIcon>
                    </CollapsibleHeader>
                    <CollapsibleContent isOpen={!collapsedSections.operations}>
                      <div style={{ marginBottom: '1rem' }}>
                        <div style={{ fontWeight: '600', marginBottom: '0.5rem', color: '#333' }}>Processes:</div>
                        <GapAnalysisList>
                          {content.operations.processes.map((item: string, i: number) => (
                            <GapAnalysisListItem key={i}>
                              {item}
                            </GapAnalysisListItem>
                          ))}
                        </GapAnalysisList>
                      </div>
                      <div style={{ marginBottom: '1rem' }}>
                        <div style={{ fontWeight: '600', marginBottom: '0.5rem', color: '#333' }}>Systems:</div>
                        <GapAnalysisList>
                          {content.operations.systems.map((item: string, i: number) => (
                            <GapAnalysisListItem key={i}>
                              {item}
                            </GapAnalysisListItem>
                          ))}
                        </GapAnalysisList>
                      </div>
                      <div style={{ marginBottom: '1rem' }}>
                        <div style={{ fontWeight: '600', marginBottom: '0.5rem', color: '#333' }}>Infrastructure:</div>
                        <GapAnalysisList>
                          {content.operations.infrastructure.map((item: string, i: number) => (
                            <GapAnalysisListItem key={i}>
                              {item}
                            </GapAnalysisListItem>
                          ))}
                        </GapAnalysisList>
                      </div>
                    </CollapsibleContent>
                  </GapAnalysisSection>
                );
              })()
            ) : (
              <TextSection>
                <TextContent>
                  {typeof section.content === 'string' ? section.content : ''}
                </TextContent>
              </TextSection>
            )}
          </SectionCard>
        ))}
        {!isAuthenticated && (
          <SignupPrompt>
            <SignupTitle>Unlock Your Full Business Idea</SignupTitle>
            <SignupText>Sign up or log in to see the full idea and save your progress!</SignupText>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1.5rem' }}>
              <ActionButton onClick={onSignup}>Sign Up</ActionButton>
              <ActionButton onClick={onLogin}>Log In</ActionButton>
            </div>
          </SignupPrompt>
        )}
      </>
    );
  };

  return (
    <Container>
      {showConfetti && <Confetti numberOfPieces={180} recycle={false} style={{ pointerEvents: 'none' }} />}
      <Title>Your Business Idea</Title>
      {isLoading && (
        <>
          <ProgressBarContainer>
            <ProgressBarFill percent={progress} />
          </ProgressBarContainer>
          <CenteredText>Generating your business idea...</CenteredText>
        </>
      )}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      {newPlan && !isLoading && (
        <FormCard>
          <CongratsWrapper>
            <Congrats>Congratulations!</Congrats>
          </CongratsWrapper>
          {renderNewPlanSections()}
          {isAuthenticated && (
            <Actions>
              <ActionButton className="centered" onClick={() => navigate('/plans')}>
                Manage Business Ideas
              </ActionButton>
            </Actions>
          )}
        </FormCard>
      )}
      {!isLoading && !newPlan && !error && (
        <CenteredText>
          Sorry, we couldn't generate your business idea. Please try again or contact support.
        </CenteredText>
      )}
    </Container>
  );
} 