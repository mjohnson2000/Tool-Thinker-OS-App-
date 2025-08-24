import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { FaArrowLeft, FaEdit, FaSave, FaCheckCircle, FaSpinner, FaTimes, FaHistory, FaInfoCircle } from 'react-icons/fa';
// Logo components for consistent branding
import { sideHustleCoach } from '../../utils/sideHustleCoach';
import type { CoachEvaluation } from '../../utils/sideHustleCoach';
import { FeedbackBar } from '../common/FeedbackBar';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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

const TopActions = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0.8rem;
  }
`;

const PrimaryButton = styled.button`
  background: linear-gradient(135deg, #181a1b 0%, #2d2d2d 100%);
  color: #fff;
  border: none;
  border-radius: 12px;
  padding: 0.8rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
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
    background: linear-gradient(135deg, #000 0%, #181a1b 100%);
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0,0,0,0.2);
  }
  
  &:hover::before {
    left: 100%;
  }
`;

const SecondaryButton = styled.button`
  background: #fff;
  color: #181a1b;
  border: 2px solid #181a1b;
  border-radius: 12px;
  padding: 0.8rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  
  &:hover {
    background: #f8f9fa;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.12);
  }
`;

const Title = styled.h1`
  font-family: 'Audiowide', 'Courier New', monospace;
  font-size: 2.4rem;
  font-weight: 400;
  margin-bottom: 1.2rem;
  text-align: center;
  color: #181a1b;
  letter-spacing: -0.03em;
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
  font-size: 1.2rem;
  color: #444;
  margin-bottom: 2rem;
  line-height: 1.6;
  text-align: center;
  
  @media (max-width: 768px) {
    font-size: 1.1rem;
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

const Section = styled.div`
  margin-bottom: 2rem;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  position: relative;
  overflow: hidden;
  
  @media (max-width: 768px) {
    padding: 1.2rem;
    margin-bottom: 1.5rem;
  }
  

`;

const SectionLabel = styled.h2`
  font-family: 'Audiowide', 'Courier New', monospace;
  font-size: 1.3rem;
  font-weight: 400;
  color: #181a1b;
  margin-bottom: 1rem;
  font-display: swap;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -4px;
    left: 0;
    width: 40px;
    height: 2px;
    background: linear-gradient(90deg, #181a1b, #4a4a4a);
    border-radius: 1px;
  }
`;

const SectionContent = styled.div`
  font-size: 1rem;
  color: #333;
  line-height: 1.6;
  margin-bottom: 1rem;
  
  @media (max-width: 768px) {
    font-size: 0.95rem;
  }
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const Meta = styled.div`
  font-size: 0.95rem;
  color: #666;
  margin-bottom: 1.5rem;
  text-align: center;
  background: rgba(248, 249, 250, 0.8);
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.08);
`;

const GapAnalysisSection = styled.div`
  margin-bottom: 2rem;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  padding: 1.5rem;
  border: 2px solid #000;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  
  @media (max-width: 768px) {
    padding: 1.2rem;
    margin-bottom: 1.5rem;
  }
`;

const EditTextArea = styled.textarea`
  width: 100%;
  min-height: 120px;
  border-radius: 12px;
  border: 2px solid #e9ecef;
  padding: 1rem 1.2rem;
  font-size: 1rem;
  line-height: 1.6;
  color: #333;
  background: #ffffff;
  margin-bottom: 1rem;
  resize: vertical;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: inset 0 1px 3px rgba(0,0,0,0.05);
  
  &:focus {
    outline: none;
    border-color: #181a1b;
    box-shadow: 0 0 0 3px rgba(24, 26, 27, 0.1), inset 0 1px 3px rgba(0,0,0,0.05);
    background: #ffffff;
  }
  
  &:hover {
    border-color: #adb5bd;
    box-shadow: inset 0 1px 3px rgba(0,0,0,0.08);
  }
  
  &::placeholder {
    color: #666;
    font-style: italic;
  }
  
  &:disabled {
    background: #f8f9fa;
    color: #666;
    cursor: not-allowed;
    opacity: 0.7;
  }
`;

const EditInput = styled.input`
  width: 100%;
  border-radius: 12px;
  border: 2px solid #e9ecef;
  padding: 0.8rem 1rem;
  font-size: 1rem;
  color: #333;
  background: #ffffff;
  margin-bottom: 0.5rem;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: inset 0 1px 3px rgba(0,0,0,0.05);
  
  &:focus {
    outline: none;
    border-color: #181a1b;
    box-shadow: 0 0 0 3px rgba(24, 26, 27, 0.1), inset 0 1px 3px rgba(0,0,0,0.05);
    background: #ffffff;
  }
  
  &:hover {
    border-color: #adb5bd;
    box-shadow: inset 0 1px 3px rgba(0,0,0,0.08);
  }
  
  &::placeholder {
    color: #666;
    font-style: italic;
  }
`;

const EditSubLabel = styled.div`
  font-weight: 600;
  color: #181a1b;
  margin-bottom: 0.5rem;
  font-size: 0.95rem;
`;

const CollapsibleHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  padding: 0.8rem 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  margin-bottom: 1rem;
  
  &:hover {
    background: rgba(0, 0, 0, 0.02);
    border-radius: 6px;
  }
`;

const CollapsibleTitle = styled.h3`
  font-family: 'Audiowide', 'Courier New', monospace;
  font-size: 1.1rem;
  font-weight: 400;
  color: #181a1b;
  margin: 0;
  font-display: swap;
`;

const CollapsibleIcon = styled.span<{ isOpen: boolean }>`
  font-size: 0.8rem;
  color: #666;
  transform: rotate(${props => props.isOpen ? '180deg' : '0deg'});
  transition: transform 0.3s ease;
`;

const CollapsibleContent = styled.div<{ isOpen: boolean }>`
  max-height: ${props => props.isOpen ? '1000px' : '0'};
  overflow: hidden;
  transition: max-height 0.3s ease;
  margin-bottom: ${props => props.isOpen ? '1rem' : '0'};
`;

const GapAnalysisList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const GapAnalysisListItem = styled.li`
  background: rgba(248, 249, 250, 0.8);
  border-radius: 6px;
  padding: 0.6rem 0.8rem;
  margin-bottom: 0.5rem;
  border-left: 3px solid #181a1b;
  font-size: 0.95rem;
  color: #333;
  
  &:last-child {
    margin-bottom: 0;
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

const Score = styled.div<{ color: string }>`
  font-weight: 700;
  font-size: 1.1rem;
  margin-bottom: 1.2rem;
  color: ${({ color }) => color};
  cursor: pointer;
  text-align: center;
  background: rgba(255, 255, 255, 0.9);
  padding: 0.8rem;
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.08);
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  user-select: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  margin-bottom: 2rem;
  
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
    margin-bottom: 1.5rem;
    
    span {
      font-size: 1.1rem;
    }
  }
  
  @media (max-width: 480px) {
    gap: 0.4rem;
    margin-bottom: 1rem;
    
    span {
      font-size: 1rem;
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
  title: string;
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
  gapAnalysis?: {
    skills: { selectedSkills: string[]; missingSkills: string[]; recommendations: string[]; learningPath: string[] };
    resources: { financial: string[]; human: string[]; physical: string[] };
    operations: { processes: string[]; systems: string[]; infrastructure: string[] };
  };
  changeLog?: {
    version: number;
    date: string;
    changes: string[];
    reason: string;
  }[];
}

function mapPlanToView(plan: any): StartupPlan {
  console.log('Mapping plan to view:', plan);
  
  // Helper function to safely split and filter strings
  const safeSplit = (str: string | undefined, separator: string = '\n') => {
    if (!str || typeof str !== 'string') return [];
    console.log('SafeSplit input:', str);
    const result = str.split(separator).filter(Boolean);
    console.log('SafeSplit result:', result);
    return result;
  };

  // Helper function to get section content with fallbacks
  const getSectionContent = (sectionName: string, fallback: string = '') => {
    return plan.sections?.[sectionName] || fallback;
  };

  const mappedPlan = {
    _id: plan._id,
    title: plan.title || 'Untitled Plan',
    businessIdeaSummary: plan.businessIdeaSummary || plan.summary || getSectionContent('Business Idea Summary', ''),
    customerProfile: {
      description: plan.customerProfile?.description || 
                  getSectionContent('Customer Profile') || 
                  getSectionContent('Customer Persona', '')
    },
    customerStruggle: (() => {
      const enhanced = plan.customerStruggle;
      const sectionStruggles = safeSplit(getSectionContent('Customer Struggles'));
      const sectionStruggle = safeSplit(getSectionContent('Customer Struggle'));
      
              console.log('Customer Struggle mapping:', {
          enhanced,
          sectionStruggles,
          sectionStruggle,
          final: enhanced || sectionStruggles || sectionStruggle || []
        });
        console.log('Raw Customer Struggles section:', plan.sections?.['Customer Struggles']);
        console.log('SafeSplit result:', safeSplit(plan.sections?.['Customer Struggles']));
      
      return enhanced.length > 0 ? enhanced : (sectionStruggles.length > 0 ? sectionStruggles : (sectionStruggle.length > 0 ? sectionStruggle : []));
    })(),
    valueProposition: plan.valueProposition || getSectionContent('Value Proposition', ''),
    marketInformation: {
      marketSize: plan.marketInformation?.marketSize || getSectionContent('Market Size', ''),
      competitors: (() => {
        const enhanced = plan.marketInformation?.competitors || [];
        const sectionCompetitors = safeSplit(getSectionContent('Competitors'));
        const sectionCompetitorAnalysis = safeSplit(getSectionContent('Competitor Analysis'));
        
        return enhanced.length > 0 ? enhanced : (sectionCompetitors.length > 0 ? sectionCompetitors : (sectionCompetitorAnalysis.length > 0 ? sectionCompetitorAnalysis : []));
      })(),
      trends: (() => {
        const enhanced = plan.marketInformation?.trends || [];
        const sectionMarketTrends = safeSplit(getSectionContent('Market Trends'));
        const sectionTrends = safeSplit(getSectionContent('Trends'));
        
        return enhanced.length > 0 ? enhanced : (sectionMarketTrends.length > 0 ? sectionMarketTrends : (sectionTrends.length > 0 ? sectionTrends : []));
      })(),
      validation: plan.marketInformation?.validation || getSectionContent('Market Validation', ''),
    },
    financialSummary: plan.financialSummary || getSectionContent('Financial Summary', ''),
    status: plan.status || 'draft',
    version: plan.version || 1,
    createdAt: plan.createdAt,
    updatedAt: plan.updatedAt,
    marketEvaluation: plan.marketEvaluation,
    gapAnalysis: plan.gapAnalysis,
    changeLog: plan.changeLog,
  };

  console.log('Mapped plan result:', mappedPlan);
  return mappedPlan;
}

export default function StartupPlanViewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [plan, setPlan] = useState<StartupPlan | null>(null);
  const [rawPlan, setRawPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editPlan, setEditPlan] = useState<StartupPlan>({
    _id: '',
    title: '',
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
  const [evaluationResult, setEvaluationResult] = useState<any>(null);
  const [collapsedSections, setCollapsedSections] = useState({
    skills: true,
    resources: true,
    operations: true,
    versionHistory: true
  });
  const [showRevertModal, setShowRevertModal] = useState(false);
  const [revertTargetVersion, setRevertTargetVersion] = useState<number | null>(null);
  const [reverting, setReverting] = useState(false);
  const [revertSuccess, setRevertSuccess] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPlan() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_URL}/side-hustle/${id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (!res.ok) throw new Error('Failed to fetch business plan');
        const data = await res.json();
        console.log('View page received plan data:', data);
        console.log('Plan version:', data.version);
        console.log('Plan sections:', data.sections);
        console.log('Customer Struggles section:', data.sections?.['Customer Struggles']);
        console.log('Customer Struggle section:', data.sections?.['Customer Struggle']);
        console.log('Market Trends section:', data.sections?.['Market Trends']);
        console.log('Competitors section:', data.sections?.['Competitors']);
        console.log('Plan enhanced fields:', {
          businessIdeaSummary: data.businessIdeaSummary,
          customerProfile: data.customerProfile,
          customerStruggle: data.customerStruggle,
          valueProposition: data.valueProposition,
          marketInformation: data.marketInformation,
          financialSummary: data.financialSummary
        });
        console.log('Plan changeLog:', data.changeLog);
        console.log('Plan version:', data.version);
        
        // Fix missing version 1 if needed
        const fixedData = fixMissingVersion1(data);
        console.log('Fixed plan changeLog:', fixedData.changeLog);
        
        setRawPlan(fixedData);
        const mappedPlan = mapPlanToView(fixedData);
        console.log('Mapped plan data:', mappedPlan);
        setPlan(mappedPlan);
        setLoading(false);
      } catch (err: any) {
        setError(err.message || 'Unknown error');
      } finally {
        setLoading(false);
      }
    }
    fetchPlan();
  }, [id, location.search]); // Re-fetch when URL changes (including refresh parameter)

  // Clear success message after 3 seconds
  useEffect(() => {
    if (revertSuccess) {
      const timer = setTimeout(() => {
        setRevertSuccess(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [revertSuccess]);

  useEffect(() => {
    if (plan && editMode) {
      console.log('Setting up editPlan with plan data:', plan);
      const editPlanData = {
        _id: plan._id,
        title: plan.title || '',
        businessIdeaSummary: plan.businessIdeaSummary || '',
        customerProfile: { description: plan.customerProfile?.description || '' },
        customerStruggle: plan.customerStruggle || [],
        valueProposition: plan.valueProposition || '',
        marketInformation: {
          marketSize: plan.marketInformation?.marketSize || '',
          competitors: plan.marketInformation?.competitors || [],
          trends: plan.marketInformation?.trends || [],
          validation: plan.marketInformation?.validation || '',
        },
        financialSummary: plan.financialSummary || '',
        status: plan.status,
        version: plan.version,
        createdAt: plan.createdAt,
        updatedAt: plan.updatedAt,
      };
      console.log('Setting editPlan to:', editPlanData);
      setEditPlan(editPlanData);
    }
  }, [plan, editMode]);

  let scoreColor = '#888';
  const score = plan?.marketEvaluation && typeof plan.marketEvaluation.score === 'number' ? plan.marketEvaluation.score : 0;
  if (score >= 80) scoreColor = '#28a745';
  else if (score >= 60) scoreColor = '#ffc107';
  else if (score > 0) scoreColor = '#dc3545';

  const handleEdit = () => setEditMode(true);
  const handleCancelEdit = () => setEditMode(false);
  
  // Function to fix missing version 1 in changeLog
  const fixMissingVersion1 = (plan: any) => {
    if (!plan.changeLog || plan.changeLog.length === 0) {
      return plan;
    }
    
    // Check if version 1 exists
    const hasVersion1 = plan.changeLog.some((entry: any) => entry.version === 1);
    
    if (!hasVersion1) {
      // Add version 1 entry at the beginning
      plan.changeLog.unshift({
        version: 1,
        date: plan.createdAt || new Date(),
        changes: ['Initial business plan created'],
        reason: 'Original Business Plan'
      });
    }
    
    return plan;
  };

  const handleRevertToVersion = async (targetVersion: number) => {
    // Show confirmation modal instead of browser confirm
    setRevertTargetVersion(targetVersion);
    setShowRevertModal(true);
  };

  const confirmRevert = async () => {
    if (!plan || !revertTargetVersion) return;
    
    setReverting(true);
    try {
      // Find the target version in the change log
      const targetEntry = plan.changeLog?.find((entry: any) => entry.version === revertTargetVersion);
      if (!targetEntry) {
        setError('Version not found in history');
        setShowRevertModal(false);
        setReverting(false);
        return;
      }
      
              const revertUrl = `${API_URL}/side-hustle/${plan._id}/revert`;
      console.log('Calling revert URL:', revertUrl);
      console.log('API_URL:', API_URL);
      console.log('Plan ID:', plan._id);
      
      const res = await fetch(revertUrl, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ targetVersion: revertTargetVersion })
      });
      
      console.log('Revert response status:', res.status);
      console.log('Revert response headers:', res.headers);
      
      if (res.ok) {
        const updatedPlan = await res.json();
        setPlan(mapPlanToView(updatedPlan));
        setRawPlan(updatedPlan);
        setShowRevertModal(false);
        setRevertTargetVersion(null);
        setRevertSuccess('Reverted to Version ' + revertTargetVersion + ' successfully!');
        // Show success message (you can add a toast notification here)
      } else {
        const error = await res.json();
        console.log('Revert error response:', error);
        setError(`Failed to revert: ${error.error}`);
        setShowRevertModal(false);
      }
    } catch (err) {
      console.error('Revert error:', err);
      setError('Failed to revert to previous version');
      setShowRevertModal(false);
    } finally {
      setReverting(false);
    }
  };

  const cancelRevert = () => {
    setShowRevertModal(false);
    setRevertTargetVersion(null);
    setReverting(false);
  };

  const handleSave = async () => {
    if (!plan) return;
    setSaving(true);
    try {
      // Transform the edit data to match the backend's expected format
      const payload = {
        // Map the view format to the backend format
        summary: editPlan.businessIdeaSummary || '',
        sections: {
          'Business Idea Summary': editPlan.businessIdeaSummary || '',
          'Customer Profile': editPlan.customerProfile?.description || '',
          'Customer Struggles': editPlan.customerStruggle?.length > 0 ? editPlan.customerStruggle.join('\n') : '',
          'Value Proposition': editPlan.valueProposition || '',
          'Market Size': editPlan.marketInformation?.marketSize || '',
          'Competitors': editPlan.marketInformation?.competitors?.length > 0 ? editPlan.marketInformation.competitors.join('\n') : '',
          'Market Trends': editPlan.marketInformation?.trends?.length > 0 ? editPlan.marketInformation.trends.join('\n') : '',
          'Financial Summary': editPlan.financialSummary || '',
        },
        // Keep existing objects from rawPlan
        idea: rawPlan?.idea || {
          title: 'Untitled Idea',
          description: ''
        },
        customer: {
          ...rawPlan?.customer,
          description: editPlan.customerProfile?.description || ''
        },
        job: rawPlan?.job || {
          title: 'Customer Job',
          description: ''
        },
        problem: {
          ...rawPlan?.problem,
          description: editPlan.customerStruggle?.length > 0 ? editPlan.customerStruggle[0] : 'No problem description provided.',
          impact: 'High',
          urgency: 'medium'
        },
        solution: {
          ...rawPlan?.solution,
          description: editPlan.valueProposition || 'No solution description provided.',
          keyFeatures: editPlan.valueProposition ? [editPlan.valueProposition] : ['Key feature'],
          uniqueValue: editPlan.valueProposition || 'Unique value'
        },
        // Add enhanced fields that the backend expects
        businessIdeaSummary: editPlan.businessIdeaSummary || '',
        customerProfile: {
          description: editPlan.customerProfile?.description || ''
        },
        customerStruggle: editPlan.customerStruggle || [],
        valueProposition: editPlan.valueProposition || '',
        marketInformation: {
          marketSize: editPlan.marketInformation?.marketSize || '',
          trends: editPlan.marketInformation?.trends || [],
          competitors: editPlan.marketInformation?.competitors || []
        },
        financialSummary: editPlan.financialSummary || '',
      };
      
      console.log('Sending payload to backend:', payload);
      
              const res = await fetch(`${API_URL}/side-hustle/${plan._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to save changes');
      }
      
      const updated = await res.json();
      console.log('Backend response:', updated);
      console.log('Mapped plan data:', mapPlanToView(updated));
      
      setPlan(mapPlanToView(updated));
      setRawPlan(updated);
      setEditMode(false);
    } catch (err: any) {
      console.error('Failed to save changes:', err);
      alert(`Failed to save changes: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const toggleSection = (section: 'skills' | 'resources' | 'operations') => {
    setCollapsedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const generateGapAnalysis = (businessPlan: any) => {
    // Generate default gap analysis since we don't have skill assessment data
    const defaultGapAnalysis = {
      skills: {
        selectedSkills: [
          'Business planning',
          'Market research',
          'Customer analysis'
        ],
        missingSkills: [
          'Technical development',
          'Financial modeling',
          'Legal compliance'
        ],
        recommendations: [
          'Consider taking online courses in business development',
          'Network with industry professionals',
          'Seek mentorship from experienced entrepreneurs'
        ],
        learningPath: [
          'Complete business fundamentals course',
          'Attend startup workshops',
          'Join entrepreneur communities'
        ]
      },
      resources: {
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
      },
      operations: {
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
      }
    };

    return defaultGapAnalysis;
  };

  const handleEvaluate = async () => {
    if (!plan) return;
    setEvaluating(true);
    setShowDetails(false);
    try {
      console.log('Side Hustle Coach evaluating plan:', plan);
      
      // Use Side Hustle Coach for evaluation
      const coachEvaluation: CoachEvaluation = await sideHustleCoach.evaluateBusinessPlan(plan);
      console.log('Coach evaluation result:', coachEvaluation);
      
      // Save evaluation score to backend
              const res = await fetch(`${API_URL}/side-hustle/${plan._id}/evaluation-score`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ score: coachEvaluation.overallScore })
      });
      if (!res.ok) throw new Error('Failed to save evaluation score');
      
      // Update plan with coach's evaluation
      setPlan(prev => prev ? { 
        ...prev, 
        marketEvaluation: { 
          ...prev.marketEvaluation, 
          score: coachEvaluation.overallScore 
        } 
      } : prev);
      
      // Convert coach evaluation to display format
      const evaluationResult = {
        criteria: [
          { key: 'sideHustleViability', score: Math.round(coachEvaluation.sideHustleViability / 20), feedback: `Side hustle viability: ${coachEvaluation.sideHustleViability}/100` },
          { key: 'marketOpportunity', score: Math.round(coachEvaluation.marketOpportunity / 20), feedback: `Market opportunity: ${coachEvaluation.marketOpportunity}/100` },
          { key: 'executionFeasibility', score: Math.round(coachEvaluation.executionFeasibility / 20), feedback: `Execution feasibility: ${coachEvaluation.executionFeasibility}/100` },
          { key: 'riskAssessment', score: Math.round(coachEvaluation.riskAssessment / 20), feedback: `Risk assessment: ${coachEvaluation.riskAssessment}/100` }
        ],
        totalScore: coachEvaluation.overallScore,
        summary: `Coach Alex Chen's evaluation: ${coachEvaluation.overallScore >= 80 ? 'Excellent side hustle potential!' : coachEvaluation.overallScore >= 60 ? 'Good potential with some improvements needed.' : 'Needs significant work before launching.'}`,
        strengths: coachEvaluation.validationInsights.strengths,
        recommendations: coachEvaluation.recommendations
      };
      
      setEvaluationResult(evaluationResult);
    } catch (err) {
      console.error('Failed to evaluate plan:', err);
    } finally {
      setEvaluating(false);
    }
  };

        console.log('StartupPlanViewPage render state:', { loading, error, plan: !!plan, planId: id });
        
        if (loading) return <Container>Loading business plan...</Container>;
        if (error) return <Container style={{ color: '#dc3545' }}>{error}</Container>;
        if (!plan) {
          console.log('No plan data, returning null');
          return <Container style={{ background: 'yellow', padding: '2rem', color: 'black' }}>
            DEBUG: No plan data available. Plan ID: {id}
          </Container>;
        }

  return (
    <Container>
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
      <FormCard>
        <TopActions>
          <PrimaryButton onClick={() => navigate('/plans')}><FaArrowLeft /> Back to Ideas</PrimaryButton>
          {!editMode && <SecondaryButton onClick={handleEdit}><FaEdit /> Edit</SecondaryButton>}
          {!editMode && plan.status !== 'validated' && (
            <SecondaryButton onClick={() => navigate(`/validate/${plan._id}`)}>
              <FaCheckCircle /> Validate
            </SecondaryButton>
          )}
          {!editMode && plan.status === 'validated' && (
            <SecondaryButton onClick={() => navigate(`/validate/${plan._id}`)}>
              <FaHistory /> View Validation Results
            </SecondaryButton>
          )}
          {!editMode && <SecondaryButton onClick={handleEvaluate} disabled={evaluating}>
            {evaluating ? <FaSpinner className="fa-spin" /> : <FaCheckCircle />} Evaluate
          </SecondaryButton>}

          {editMode && <PrimaryButton onClick={handleSave} disabled={saving}><FaSave /> {saving ? 'Saving...' : 'Save'}</PrimaryButton>}
          {editMode && <SecondaryButton onClick={handleCancelEdit}>Cancel</SecondaryButton>}
        </TopActions>
        
        {/* Success Notification */}
        {revertSuccess && (
          <div style={{
            background: 'linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%)',
            border: '1px solid #c3e6cb',
            borderRadius: '12px',
            padding: '12px 16px',
            marginBottom: '16px',
            color: '#155724',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <FaCheckCircle style={{ color: '#28a745' }} />
            {revertSuccess}
          </div>
        )}
        
        <div style={{ margin: '0 0 16px 0' }}>
          <FeedbackBar context="plan_view_actions" />
        </div>
      {editMode ? (
        <>
          <Section>
            <SectionLabel>Business Idea Summary</SectionLabel>
            <EditTextArea 
              value={editPlan.businessIdeaSummary} 
              onChange={e => setEditPlan(prev => ({ ...prev, businessIdeaSummary: e.target.value }))} 
              placeholder="Enter your business idea summary..."
            />
          </Section>
          <Section>
            <SectionLabel>Customer Profile</SectionLabel>
            <EditTextArea 
              value={editPlan.customerProfile.description} 
              onChange={e => setEditPlan(prev => ({ ...prev, customerProfile: { ...prev.customerProfile, description: e.target.value } }))} 
              placeholder="Describe your target customer profile..."
            />
          </Section>
          <Section>
            <SectionLabel>Customer Struggle</SectionLabel>
            <EditTextArea 
              value={editPlan.customerStruggle.join('\n')} 
              onChange={e => setEditPlan(prev => ({ ...prev, customerStruggle: e.target.value.split('\n') }))} 
              placeholder="Enter customer struggles (one per line)..."
            />
          </Section>
          <Section>
            <SectionLabel>Value Proposition</SectionLabel>
            <EditTextArea 
              value={editPlan.valueProposition} 
              onChange={e => setEditPlan(prev => ({ ...prev, valueProposition: e.target.value }))} 
              placeholder="Describe your unique value proposition..."
            />
          </Section>
          <Section>
            <SectionLabel>Market Information</SectionLabel>
            <div style={{ marginBottom: '1rem' }}>
              <EditSubLabel>Market Size</EditSubLabel>
              <EditInput 
                value={editPlan.marketInformation.marketSize} 
                onChange={e => setEditPlan(prev => ({ ...prev, marketInformation: { ...prev.marketInformation, marketSize: e.target.value } }))} 
                placeholder="Describe your target market size..."
              />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <EditSubLabel>Competitors</EditSubLabel>
              <EditTextArea 
                value={editPlan.marketInformation.competitors.join('\n')} 
                onChange={e => setEditPlan(prev => ({ ...prev, marketInformation: { ...prev.marketInformation, competitors: e.target.value.split('\n') } }))} 
                placeholder="List your main competitors (one per line)..."
                style={{ minHeight: 80 }}
              />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <EditSubLabel>Trends</EditSubLabel>
              <EditTextArea 
                value={editPlan.marketInformation.trends.join('\n')} 
                onChange={e => setEditPlan(prev => ({ ...prev, marketInformation: { ...prev.marketInformation, trends: e.target.value.split('\n') } }))} 
                placeholder="Describe market trends (one per line)..."
                style={{ minHeight: 80 }}
              />
            </div>
          </Section>
          <Section>
            <SectionLabel>Financial Summary</SectionLabel>
            <EditTextArea 
              value={editPlan.financialSummary} 
              onChange={e => setEditPlan(prev => ({ ...prev, financialSummary: e.target.value }))} 
              placeholder="Describe your financial model and revenue streams..."
            />
          </Section>
        </>
      ) : (
        <>
          <Title title={plan.title}>
            {plan.title.length > 80
              ? plan.title.slice(0, 80) + '…'
              : plan.title}
          </Title>
          <Meta>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                background: '#f8f9fa',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                border: '1px solid #e9ecef'
              }}>
                <span style={{ fontWeight: 600, color: '#181a1b' }}>Version {plan.version}</span>
                {plan.version > 1 && (
                  <span style={{ 
                    fontSize: '0.8rem', 
                    color: '#6c757d',
                    fontStyle: 'italic'
                  }}>
                    (Updated {plan.version - 1} times)
                  </span>
                )}
              </div>
              <span style={{ color: '#6c757d' }}>|</span>
              <span>Updated: {new Date(plan.updatedAt).toLocaleDateString()}</span>
              <span style={{ color: '#6c757d' }}>|</span>
              <span style={{ 
                padding: '0.25rem 0.75rem',
                borderRadius: '12px',
                fontSize: '0.85rem',
                fontWeight: 600,
                background: plan.status === 'validated' ? '#d4edda' : plan.status === 'active' ? '#fff3cd' : '#f8d7da',
                color: plan.status === 'validated' ? '#155724' : plan.status === 'active' ? '#856404' : '#721c24'
              }}>
                {plan.status.charAt(0).toUpperCase() + plan.status.slice(1)}
              </span>
            </div>
          </Meta>
          {score > 0 ? (
            <Score 
              color={scoreColor} 
              style={{ 
                cursor: 'pointer',
                position: 'relative',
                transition: 'all 0.3s ease',
                border: '2px solid transparent',
                borderRadius: '8px',
                padding: '0.5rem 1rem'
              }} 
              onClick={() => setShowDetails(true)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                e.currentTarget.style.borderColor = scoreColor;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = 'transparent';
              }}
              title="Click to view detailed evaluation insights from Side Hustle Coach Alex Chen"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>Evaluation Score: {score}/100</span>
                <FaInfoCircle style={{ fontSize: '0.8rem', opacity: 0.7 }} />
              </div>
              <div style={{ 
                fontSize: '0.75rem', 
                opacity: 0.7, 
                marginTop: '0.25rem',
                fontStyle: 'italic'
              }}>
                Click for detailed insights
              </div>
            </Score>
          ) : (
            <div style={{
              background: '#f8f9fa',
              border: '2px dashed #dee2e6',
              borderRadius: '8px',
              padding: '1rem',
              textAlign: 'center',
              color: '#6c757d',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onClick={() => handleEvaluate()}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#e9ecef';
              e.currentTarget.style.borderColor = '#adb5bd';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#f8f9fa';
              e.currentTarget.style.borderColor = '#dee2e6';
            }}
            title="Click to get evaluation from Side Hustle Coach Alex Chen"
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <FaCheckCircle style={{ fontSize: '1rem' }} />
                <span style={{ fontWeight: 600 }}>Get Evaluation</span>
              </div>
              <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>
                Click to get expert evaluation from Side Hustle Coach
              </div>
            </div>
          )}
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
                      {evaluationResult.criteria.map((c: any, i: number) => (
                        <li key={i} style={{ marginBottom: 4 }}>
                          <strong>{c.key.replace(/([A-Z])/g, ' $1').replace(/^./, (s: string) => s.toUpperCase())}:</strong> {c.score}/5 – {c.feedback}
                        </li>
                      ))}
                    </ul>
                    <div style={{ fontWeight: 600, marginBottom: 8 }}>Strengths:</div>
                    <ul>{evaluationResult.strengths.length > 0 ? evaluationResult.strengths.map((s: string, i: number) => <li key={i}>{s}</li>) : <li>No major strengths yet.</li>}</ul>
                    <div style={{ fontWeight: 600, margin: '16px 0 8px 0' }}>Recommendations:</div>
                    <ul>{evaluationResult.recommendations.length > 0 ? evaluationResult.recommendations.map((rec: string, i: number) => <li key={i}>{rec}</li>) : <li>No recommendations at this time.</li>}</ul>
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
          {plan.changeLog && plan.changeLog.length > 0 && (
            <SectionCard>
              <div 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  padding: '0.5rem 0'
                }}
                onClick={() => setCollapsedSections(prev => ({ ...prev, versionHistory: !prev.versionHistory }))}
              >
                <SectionLabel style={{ margin: 0, cursor: 'pointer' }}>Version History</SectionLabel>
                <span style={{ 
                  fontSize: '1.2rem', 
                  color: '#6c757d',
                  transition: 'transform 0.2s ease',
                  transform: collapsedSections.versionHistory ? 'rotate(0deg)' : 'rotate(90deg)'
                }}>
                  ▶
                </span>
              </div>
              {!collapsedSections.versionHistory && (
                <div style={{ maxHeight: '300px', overflowY: 'auto', marginTop: '1rem' }}>
                {(() => {
                  console.log('Rendering version history:', {
                    changeLog: plan.changeLog,
                    changeLogLength: plan.changeLog?.length,
                    reversed: plan.changeLog?.slice().reverse(),
                    currentVersion: plan.version,
                    changeLogEntries: plan.changeLog?.map(entry => ({ version: entry.version, reason: entry.reason })),
                    firstEntry: plan.changeLog?.[0],
                    allEntries: plan.changeLog
                  });
                  return plan.changeLog?.slice().reverse().map((entry: any, index: number) => (
                    <div key={index} style={{
                      border: '1px solid #e9ecef',
                      borderRadius: '8px',
                      padding: '1rem',
                      marginBottom: '1rem',
                      background: entry.version === plan.version ? '#f8f9fa' : '#fff',
                      borderLeft: entry.version === plan.version ? '4px solid #181a1b' : '1px solid #e9ecef'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontWeight: 600, color: '#181a1b' }}>Version {entry.version}</span>
                          {entry.version === plan.version && (
                            <span style={{ 
                              fontSize: '0.75rem', 
                              background: '#181a1b', 
                              color: '#fff', 
                              padding: '0.2rem 0.5rem', 
                              borderRadius: '4px' 
                            }}>Current</span>
                          )}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontSize: '0.85rem', color: '#6c757d' }}>
                            {new Date(entry.date).toLocaleDateString()}
                          </span>
                          {entry.version !== plan.version && (
                            <button
                              onClick={() => handleRevertToVersion(entry.version)}
                              style={{
                                background: '#f8f9fa',
                                border: '1px solid #dee2e6',
                                borderRadius: '4px',
                                padding: '0.25rem 0.5rem',
                                fontSize: '0.8rem',
                                cursor: 'pointer',
                                color: '#495057',
                                transition: 'all 0.2s ease'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#e9ecef';
                                e.currentTarget.style.borderColor = '#adb5bd';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = '#f8f9fa';
                                e.currentTarget.style.borderColor = '#dee2e6';
                              }}
                            >
                              Revert to This Version
                            </button>
                          )}
                        </div>
                      </div>
                      <div style={{ fontSize: '0.9rem', color: '#495057', marginBottom: '0.5rem' }}>
                        <strong>Reason:</strong> {entry.reason}
                      </div>
                      {entry.changes && entry.changes.length > 0 && (
                        <div style={{ fontSize: '0.85rem', color: '#6c757d' }}>
                          <strong>Changes:</strong>
                          <ul style={{ margin: '0.25rem 0 0 0', paddingLeft: '1.2rem' }}>
                            {entry.changes.map((change: string, i: number) => (
                              <li key={i}>{change}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )) || [];
                })()}
              </div>
              )}
            </SectionCard>
          )}
          
          <SectionCard>
            <SectionLabel>Business Idea Summary</SectionLabel>
            <SectionContent>{plan.businessIdeaSummary}</SectionContent>
          </SectionCard>
          
          <SectionCard>
            <SectionLabel>Customer Profile</SectionLabel>
            <SectionContent>{plan.customerProfile.description}</SectionContent>
          </SectionCard>
          
          <SectionCard>
            <SectionLabel>Customer Struggles</SectionLabel>
            {plan.customerStruggle && plan.customerStruggle.length > 0 ? (
              <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#333', lineHeight: '1.6' }}>
                {plan.customerStruggle.map((struggle, i) => (
                  <li key={i} style={{ marginBottom: '0.8rem' }}>
                    {struggle.replace(/^[-–—]\s*/, '')}
                  </li>
                ))}
              </ul>
            ) : (
              <SectionContent style={{ color: '#666', fontStyle: 'italic' }}>
                No customer struggles identified yet. Click "Edit" to add customer struggles.
              </SectionContent>
            )}
          </SectionCard>
          
          <SectionCard>
            <SectionLabel>Value Proposition</SectionLabel>
            <SectionContent>{plan.valueProposition}</SectionContent>
          </SectionCard>
          
          <SectionCard>
            <SectionLabel>Market Research</SectionLabel>
            <MarketResearchSection>
              <MarketResearchSubsection>
                <MarketResearchTitle>Market Size</MarketResearchTitle>
                <MarketResearchContent>
                  {plan.marketInformation.marketSize || 'N/A'}
                </MarketResearchContent>
              </MarketResearchSubsection>
              
              <MarketResearchSubsection>
                <MarketResearchTitle>Market Trends</MarketResearchTitle>
                <MarketResearchList>
                  {Array.isArray(plan.marketInformation.trends) && plan.marketInformation.trends.length > 0 ? (
                    plan.marketInformation.trends.map((trend: string, i: number) => (
                      <MarketResearchListItem key={i}>
                        {trend.replace(/^[-–—]\s*/, '')}
                      </MarketResearchListItem>
                    ))
                  ) : (
                    <MarketResearchListItem style={{ color: '#666', fontStyle: 'italic' }}>
                      Market trends not yet analyzed. Click "Edit" to add market trends.
                    </MarketResearchListItem>
                  )}
                </MarketResearchList>
              </MarketResearchSubsection>
              
              <MarketResearchSubsection>
                <MarketResearchTitle>Competitors</MarketResearchTitle>
                <MarketResearchList>
                  {Array.isArray(plan.marketInformation.competitors) && plan.marketInformation.competitors.length > 0 ? (
                    plan.marketInformation.competitors.map((comp: string, i: number) => (
                      <MarketResearchListItem key={i}>
                        {comp.replace(/^[-–—]\s*/, '')}
                      </MarketResearchListItem>
                    ))
                  ) : (
                    <MarketResearchListItem style={{ color: '#666', fontStyle: 'italic' }}>
                      Competitor analysis not yet completed. Click "Edit" to add competitors.
                    </MarketResearchListItem>
                  )}
                </MarketResearchList>
              </MarketResearchSubsection>
            </MarketResearchSection>
          </SectionCard>
          
          <SectionCard>
            <SectionLabel>Financial Summary</SectionLabel>
            <SectionContent>{plan.financialSummary}</SectionContent>
          </SectionCard>
          
          {/* Gap Analysis Section - Show gap analysis (generated if not available) */}
          {(() => {
            const gapAnalysisData = plan.gapAnalysis || generateGapAnalysis(plan);
            return gapAnalysisData && (
              <GapAnalysisSection>
                <SectionLabel>Comprehensive Gap Analysis</SectionLabel>
                
                {/* Skills Gap */}
                <CollapsibleHeader onClick={() => toggleSection('skills')}>
                  <CollapsibleTitle>Skills Gap</CollapsibleTitle>
                  <CollapsibleIcon isOpen={!collapsedSections.skills}>▼</CollapsibleIcon>
                </CollapsibleHeader>
                <CollapsibleContent isOpen={!collapsedSections.skills}>
                  {gapAnalysisData.skills?.selectedSkills?.length > 0 && (
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ fontWeight: '600', marginBottom: '0.5rem', color: '#333' }}>Skills You Have:</div>
                    <GapAnalysisList>
                      {gapAnalysisData.skills.selectedSkills.map((skill: string, i: number) => (
                        <GapAnalysisListItem key={i}>
                          {skill}
                        </GapAnalysisListItem>
                      ))}
                    </GapAnalysisList>
                  </div>
                )}
                {gapAnalysisData.skills?.missingSkills?.length > 0 && (
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ fontWeight: '600', marginBottom: '0.5rem', color: '#333' }}>Skills You Need:</div>
                    <GapAnalysisList>
                      {gapAnalysisData.skills.missingSkills.map((skill: string, i: number) => (
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
                {gapAnalysisData.resources?.financial?.length > 0 && (
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ fontWeight: '600', marginBottom: '0.5rem', color: '#333' }}>Financial Resources:</div>
                    <GapAnalysisList>
                      {gapAnalysisData.resources.financial.map((item: string, i: number) => (
                        <GapAnalysisListItem key={i}>
                          {item}
                        </GapAnalysisListItem>
                      ))}
                    </GapAnalysisList>
                  </div>
                )}
                {gapAnalysisData.resources?.human?.length > 0 && (
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ fontWeight: '600', marginBottom: '0.5rem', color: '#333' }}>Human Resources:</div>
                    <GapAnalysisList>
                      {gapAnalysisData.resources.human.map((item: string, i: number) => (
                        <GapAnalysisListItem key={i}>
                          {item}
                        </GapAnalysisListItem>
                      ))}
                    </GapAnalysisList>
                  </div>
                )}
                {gapAnalysisData.resources?.physical?.length > 0 && (
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ fontWeight: '600', marginBottom: '0.5rem', color: '#333' }}>Physical Resources:</div>
                    <GapAnalysisList>
                      {gapAnalysisData.resources.physical.map((item: string, i: number) => (
                        <GapAnalysisListItem key={i}>
                          {item}
                        </GapAnalysisListItem>
                      ))}
                    </GapAnalysisList>
                  </div>
                )}
              </CollapsibleContent>

              {/* Operational Gap */}
              <CollapsibleHeader onClick={() => toggleSection('operations')}>
                <CollapsibleTitle>Operational Gap</CollapsibleTitle>
                <CollapsibleIcon isOpen={!collapsedSections.operations}>▼</CollapsibleIcon>
              </CollapsibleHeader>
              <CollapsibleContent isOpen={!collapsedSections.operations}>
                {gapAnalysisData.operations?.processes?.length > 0 && (
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ fontWeight: '600', marginBottom: '0.5rem', color: '#333' }}>Processes:</div>
                    <GapAnalysisList>
                      {gapAnalysisData.operations.processes.map((item: string, i: number) => (
                        <GapAnalysisListItem key={i}>
                          {item}
                        </GapAnalysisListItem>
                      ))}
                    </GapAnalysisList>
                  </div>
                )}
                {gapAnalysisData.operations?.systems?.length > 0 && (
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ fontWeight: '600', marginBottom: '0.5rem', color: '#333' }}>Systems:</div>
                    <GapAnalysisList>
                      {gapAnalysisData.operations.systems.map((item: string, i: number) => (
                        <GapAnalysisListItem key={i}>
                          {item}
                        </GapAnalysisListItem>
                      ))}
                    </GapAnalysisList>
                  </div>
                )}
                {gapAnalysisData.operations?.infrastructure?.length > 0 && (
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ fontWeight: '600', marginBottom: '0.5rem', color: '#333' }}>Infrastructure:</div>
                    <GapAnalysisList>
                      {gapAnalysisData.operations.infrastructure.map((item: string, i: number) => (
                        <GapAnalysisListItem key={i}>
                          {item}
                        </GapAnalysisListItem>
                      ))}
                    </GapAnalysisList>
                  </div>
                )}
              </CollapsibleContent>
            </GapAnalysisSection>
            );
          })()}
          
          <div style={{ marginTop: '12px' }}>
            <FeedbackBar context="plan_view_sections" />
          </div>
        </>
      )}
      </FormCard>
      {showRevertModal && (
        <OverlayBackdrop onClick={cancelRevert}>
          <OverlayCard onClick={e => e.stopPropagation()}>
            <OverlayClose onClick={cancelRevert} aria-label="Close"><FaTimes /></OverlayClose>
            <div style={{ fontWeight: 700, fontSize: '1.2rem', marginBottom: 16 }}>Confirm Revert</div>
            <p>Are you sure you want to revert to Version {revertTargetVersion}? This will create a new version with the reverted content.</p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <SecondaryButton onClick={cancelRevert} disabled={reverting}>Cancel</SecondaryButton>
              <PrimaryButton onClick={confirmRevert} disabled={reverting}>
                {reverting ? <FaSpinner className="fa-spin" /> : 'Confirm Revert'}
              </PrimaryButton>
            </div>
          </OverlayCard>
        </OverlayBackdrop>
      )}
    </Container>
  );
} 