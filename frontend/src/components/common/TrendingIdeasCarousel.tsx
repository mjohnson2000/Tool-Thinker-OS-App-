import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { FiTrendingUp, FiClock, FiDollarSign, FiTarget, FiArrowLeft, FiArrowRight, FiBookmark, FiPause, FiPlay, FiMapPin, FiGlobe, FiHeart, FiChevronDown } from 'react-icons/fi';
import { FaFire } from 'react-icons/fa';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LocationModal } from './LocationModal';
import { fetchChatGPT } from '../../utils/chatgpt';

interface TrendingIdea {
  _id: string;
  title: string;
  description: string;
  market: string;
  trend: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  investment: 'Low' | 'Medium' | 'High';
  timeToLaunch: '1-2 weeks' | '1-2 months' | '3+ months';
  potential: '$500-2K/month' | '$2K-5K/month' | '$5K+/month';
  tags: string[];
  businessType: 'digital-services' | 'local-services' | 'creative-services' | 'professional-services' | 'physical-products' | 'online-business';
  score: number;
  views: number;
  saves: number;
  likes: number;
  isLiked?: boolean;
}

const businessTypes = [
  {
    id: 'digital-services',
    title: 'Digital Services',
    icon: '💻',
    color: '#6b7280'
  },
  {
    id: 'local-services',
    title: 'Local Services',
    icon: '🏠',
    color: '#6b7280'
  },
  {
    id: 'creative-services',
    title: 'Creative Services',
    icon: '🎨',
    color: '#6b7280'
  },
  {
    id: 'professional-services',
    title: 'Professional Services',
    icon: '👔',
    color: '#6b7280'
  },
  {
    id: 'physical-products',
    title: 'Physical Products',
    icon: '🛍️',
    color: '#6b7280'
  },
  {
    id: 'online-business',
    title: 'Online Business',
    icon: '🌐',
    color: '#6b7280'
  }
];

const scopeOptions = [
  {
    id: 'part-time-low',
    title: 'Part-Time Low',
    description: '5-10 hrs/week • $500-2K/month',
    hoursPerWeek: 7,
    incomeTarget: 1250
  },
  {
    id: 'part-time-medium',
    title: 'Part-Time Medium',
    description: '10-20 hrs/week • $2K-5K/month',
    hoursPerWeek: 15,
    incomeTarget: 3500
  },
  {
    id: 'full-time',
    title: 'Full-Time',
    description: '20+ hrs/week • $5K+/month',
    hoursPerWeek: 25,
    incomeTarget: 7500
  }
];

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const slideIn = keyframes`
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.02); }
`;

const shimmer = keyframes`
  0% { background-position: -200px 0; }
  100% { background-position: calc(200px + 100%) 0; }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-5px); }
`;

const Container = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0.0625rem 0;
  position: relative;
  
  @media (max-width: 768px) {
    padding: 0.03125rem 0.5rem;
    max-width: 100%;
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 1.5rem;
  }
`;

const HeaderLeft = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const HeaderRight = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 1rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
`;

const DateDisplay = styled.div`
  background: #f8fafc;
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  font-size: 0.9rem;
  color: #6b7280;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  @media (max-width: 768px) {
    padding: 0.5rem 1rem;
    font-size: 0.85rem;
  }
`;

const Title = styled.h2`
  font-family: 'Audiowide', 'Courier New', monospace;
  font-size: clamp(1.6rem, 3vw, 2.1rem);
  font-weight: 400;
  color: #181a1b;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding-left: 2rem;
  
  svg {
    color: #374151;
    animation: ${float} 3s ease-in-out infinite;
  }
  
  @media (max-width: 768px) {
    padding-left: 1rem;
  }
`;

const Subtitle = styled.p`
  color: #6b7280;
  font-size: 1.1rem;
  line-height: 1.6;
  margin: 0;
  max-width: 600px;
  padding-left: 2rem;
  
  @media (max-width: 768px) {
    font-size: 1rem;
    line-height: 1.5;
    padding-left: 1rem;
  }
`;

const ToggleContainer = styled.div`
  display: flex;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 12px;
  padding: 0.125rem;
  gap: 0.125rem;
  width: 100%;
  min-height: 44px;
`;

const ToggleButton = styled.button<{ $active: boolean; $isLocal?: boolean }>`
  background: ${props => props.$active ? (props.$isLocal ? '#6b7280' : '#6b7280') : 'transparent'};
  color: ${props => props.$active ? 'white' : '#1d1d1f'};
  border: none;
  padding: 0.75rem 1.25rem;
  border-radius: 10px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  flex: 1;
  min-height: 36px;
  
  &:hover {
    background: ${props => props.$active ? (props.$isLocal ? '#4b5563' : '#4b5563') : 'rgba(255, 255, 255, 0.9)'};
    color: ${props => props.$active ? 'white' : '#1d1d1f'};
    transform: translateY(-1px);
  }
  
  @media (max-width: 768px) {
    padding: 0.625rem 1rem;
    font-size: 0.95rem;
    min-height: 32px;
  }
`;

const CarouselContainer = styled.div`
  position: relative;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 0.5rem 2rem;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0,0,0,0.04);
  
  @media (max-width: 768px) {
    padding: 0.375rem 1rem;
    border-radius: 12px;
    margin: 0 0.5rem;
  }
`;

const IdeaHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  position: relative;
`;

const SlideNumber = styled.div`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: linear-gradient(135deg, #181a1b 0%, #4a4a4a 100%);
  color: white;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Audiowide', 'Courier New', monospace;
  font-weight: 400;
  font-size: 0.9rem;
  box-shadow: 
    0 4px 12px rgba(0,0,0,0.15),
    0 2px 4px rgba(0,0,0,0.1);
  z-index: 10;
  border: 1px solid rgba(255,255,255,0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 
      0 6px 16px rgba(0,0,0,0.2),
      0 3px 6px rgba(0,0,0,0.15);
  }
  
  @media (max-width: 768px) {
    width: 32px;
    height: 32px;
    font-size: 0.8rem;
    top: 0.75rem;
    right: 0.75rem;
  }
`;

const IdeaTitle = styled.h3`
  margin: 0 0 1.25rem 0;
  font-size: clamp(1.4rem, 3vw, 1.8rem);
  font-weight: 800;
  color: #111827;
  line-height: 1.2;
  letter-spacing: -0.025em;
`;

const IdeaDescription = styled.p`
  color: #374151;
  line-height: 1.6;
  margin-bottom: 2.5rem;
  font-size: 1.1rem;
  font-weight: 500;
  
  @media (max-width: 768px) {
    font-size: 1rem;
    line-height: 1.5;
    margin-bottom: 2rem;
  }
`;

const IdeaDetails = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
`;

const DetailItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #374151;
  font-size: 1rem;
  font-weight: 500;
  padding: 1rem;
  background: #ffffff;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  
  svg {
    color: #059669;
    flex-shrink: 0;
    font-size: 1.1rem;
  }
`;

const DetailLabel = styled.span`
  font-weight: 700;
  color: #111827;
  min-width: 70px;
  font-size: 0.9rem;
`;

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 2.5rem;
`;

const Tag = styled.span<{ $isHighlighted?: boolean; $color?: string }>`
  background: ${props => props.$isHighlighted ? 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)' : '#f0f9ff'};
  color: ${props => props.$isHighlighted ? '#495057' : '#0369a1'};
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  border: 1px solid ${props => props.$isHighlighted ? '#dee2e6' : '#bae6fd'};
  transition: all 0.2s ease;
  box-shadow: ${props => props.$isHighlighted ? '0 1px 3px rgba(0, 0, 0, 0.1)' : 'none'};
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0.75rem;
  }
`;

const LikeButton = styled.button<{ $isLiked: boolean }>`
  background: ${props => props.$isLiked ? '#059669' : '#f8fafc'};
  color: ${props => props.$isLiked ? 'white' : '#374151'};
  border: 1px solid ${props => props.$isLiked ? '#059669' : '#e5e7eb'};
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    background: ${props => props.$isLiked ? '#047857' : '#f1f5f9'};
    transform: translateY(-1px);
  }
  
  @media (max-width: 768px) {
    padding: 0.625rem 1.25rem;
    font-size: 0.85rem;
    width: 100%;
    justify-content: center;
  }
`;

const ExploreButton = styled.button`
  background: #181a1b;
  color: white;
  border: 1px solid #181a1b;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #374151;
    border-color: #374151;
    transform: translateY(-1px);
  }
  
  @media (max-width: 768px) {
    padding: 0.625rem 1.25rem;
    font-size: 0.85rem;
    width: 100%;
    justify-content: center;
  }
`;

const NavigationButtons = styled.div`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  justify-content: space-between;
  width: 100%;
  padding: 0 1.5rem;
  pointer-events: none;
  
  .nav-left {
    margin-left: -4.5rem;
  }
  
  .nav-right {
    margin-right: -0.5rem;
  }
  
  @media (max-width: 768px) {
    padding: 0 1rem;
    
    .nav-left {
      margin-left: -2rem;
    }
    
    .nav-right {
      margin-right: -2rem;
    }
  }
`;

const NavButton = styled.button`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 50%;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  pointer-events: all;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  
  svg {
    color: #374151;
    font-size: 1.125rem;
  }
  
  &:hover {
    background: #f8fafc;
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(0,0,0,0.12);
  }
  
  @media (max-width: 768px) {
    width: 40px;
    height: 40px;
    
    svg {
      font-size: 1rem;
    }
  }
`;

const ProgressContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 2rem;
  gap: 0.5rem;
  
  @media (max-width: 768px) {
    margin-top: 1.5rem;
    gap: 0.4rem;
  }
`;

const Dot = styled.button<{ $active: boolean }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: none;
  background: ${props => props.$active ? '#374151' : '#d1d5db'};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.$active ? '#374151' : '#9ca3af'};
  }
  
  @media (max-width: 768px) {
    width: 10px;
    height: 10px;
  }
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 4px;
  background: #e5e7eb;
  border-radius: 2px;
  overflow: hidden;
  margin-top: 1rem;
`;

const ProgressFill = styled.div<{ $progress: number }>`
  height: 100%;
  background: #374151;
  border-radius: 2px;
  transition: width 0.3s ease;
  width: ${props => props.$progress}%;
`;

const ErrorContainer = styled.div`
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
  margin: 2rem 0;
`;

const LocationBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 1rem;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.2);
  
  svg {
    font-size: 1rem;
  }
  
  @media (max-width: 768px) {
    font-size: 0.8rem;
    padding: 0.4rem 0.8rem;
    
    svg {
      font-size: 0.9rem;
    }
  }
`;

const LocationIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  padding: 0.625rem 1.125rem;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 600;
  margin-top: 0.75rem;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
  
  svg {
    font-size: 1rem;
  }
  
  @media (max-width: 768px) {
    font-size: 0.85rem;
    padding: 0.5rem 1rem;
    margin-top: 0.5rem;
    
    svg {
      font-size: 0.9rem;
    }
  }
`;

const GlobalSelectorsContainer = styled.div`
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 0;
  box-shadow: 0 4px 12px rgba(0,0,0,0.04);
  overflow: visible;
  position: relative;
  z-index: 10;
  
  @media (max-width: 768px) {
    padding: 1.5rem;
    margin-bottom: 0;
    border-radius: 12px;
  }
`;

const SelectorGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
  align-items: stretch;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  padding: 1.5rem;
  position: relative;
  min-height: 140px;
  justify-content: flex-start;
  overflow: visible;
  
  &:not(:last-child)::after {
    content: '';
    position: absolute;
    right: -1px;
    top: 20%;
    bottom: 20%;
    width: 1px;
    background: linear-gradient(to bottom, transparent, rgba(0, 0, 0, 0.1), transparent);
  }
  
  @media (max-width: 768px) {
    gap: 0.75rem;
    padding: 1.25rem;
    min-height: auto;
    
    &:not(:last-child)::after {
      display: none;
    }
  }
`;

const SelectorLabel = styled.label`
  font-size: 1rem;
  font-weight: 600;
  color: #1d1d1f;
  margin-bottom: 0.625rem;
  letter-spacing: -0.01em;
  
  @media (max-width: 768px) {
    font-size: 0.95rem;
    margin-bottom: 0.5rem;
  }
`;

const SelectorDropdown = styled.select`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 12px;
  padding: 1rem 1.25rem;
  font-size: 1rem;
  font-weight: 500;
  color: #1d1d1f;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;
  appearance: none;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 1rem center;
  background-repeat: no-repeat;
  background-size: 1.5em 1.5em;
  padding-right: 3rem;
  
  &:hover {
    background-color: rgba(255, 255, 255, 1);
    border-color: rgba(0, 0, 0, 0.2);
  }
  
  &:focus {
    outline: none;
    border-color: #6b7280;
    box-shadow: 0 0 0 3px rgba(107, 114, 128, 0.1);
  }
  
  option {
    background: white !important;
    color: #1d1d1f !important;
    padding: 0.75rem !important;
  }
  
  option:hover {
    background: #f3f4f6 !important;
  }
  
  option:checked {
    background: #6b7280 !important;
    color: white !important;
  }
  
  option:focus {
    background: #f3f4f6 !important;
  }
  
  @media (max-width: 768px) {
    font-size: 0.95rem;
    padding: 0.875rem 1rem;
    padding-right: 2.75rem;
  }
`;

const SelectorsRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 0;
  align-items: start;
  position: relative;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
`;

const SelectorsTitle = styled.h3`
  font-size: 1.75rem;
  font-weight: 700;
  color: #1d1d1f;
  margin: 0 0 2rem 0;
  text-align: center;
  letter-spacing: -0.02em;
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
    margin-bottom: 1.5rem;
  }
`;

const CollapsibleHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  padding: 1rem 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  margin-bottom: 1.5rem;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(0, 0, 0, 0.02);
    border-radius: 8px;
    padding-left: 0.5rem;
    padding-right: 0.5rem;
  }
  
  @media (max-width: 768px) {
    padding: 0.875rem 0;
    margin-bottom: 1.25rem;
    min-height: 44px; /* Better touch target */
  }
`;

const CollapsibleTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 600;
  color: #1d1d1f;
  margin: 0;
  letter-spacing: -0.01em;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  
  @media (max-width: 768px) {
    font-size: 1.3rem;
    gap: 0.5rem;
  }
`;

const CollapsibleIcon = styled.div<{ $isExpanded: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 6px;
  background: ${props => props.$isExpanded ? '#6b7280' : 'rgba(0, 0, 0, 0.1)'};
  color: ${props => props.$isExpanded ? 'white' : '#1d1d1f'};
  transition: all 0.2s ease;
  transform: ${props => props.$isExpanded ? 'rotate(180deg)' : 'rotate(0deg)'};
  
  svg {
    width: 16px;
    height: 16px;
  }
  
  @media (max-width: 768px) {
    width: 28px;
    height: 28px;
    border-radius: 8px;
    
    svg {
      width: 18px;
      height: 18px;
    }
  }
`;

const CollapsibleContent = styled.div<{ $isExpanded: boolean }>`
  max-height: ${props => props.$isExpanded ? '1000px' : '0'};
  overflow: visible;
  transition: all 0.3s ease-in-out;
  opacity: ${props => props.$isExpanded ? '1' : '0'};
`;

const CustomDropdown = styled.div`
  position: relative;
  width: 100%;
  z-index: 999999;
`;

const CustomDropdownButton = styled.button`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 12px;
  padding: 1rem 1.25rem;
  font-size: 1rem;
  font-weight: 500;
  color: #1d1d1f;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;
  text-align: left;
  display: flex;
  align-items: center;
  justify-content: space-between;
  
  &:hover {
    background-color: rgba(255, 255, 255, 1);
    border-color: rgba(0, 0, 0, 0.2);
  }
  
  &:focus {
    outline: none;
    border-color: #6b7280;
    box-shadow: 0 0 0 3px rgba(107, 114, 128, 0.1);
  }
  
  @media (max-width: 768px) {
    font-size: 0.95rem;
    padding: 0.875rem 1rem;
  }
`;

const CustomDropdownMenu = styled.div<{ $isOpen: boolean }>`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  z-index: 999999;
  max-height: ${props => props.$isOpen ? '300px' : '0'};
  overflow: hidden;
  transition: all 0.2s ease;
  opacity: ${props => props.$isOpen ? '1' : '0'};
  margin-top: 4px;
`;

const CustomDropdownOption = styled.div<{ $isSelected?: boolean }>`
  padding: 0.875rem 1.25rem;
  cursor: pointer;
  transition: all 0.2s ease;
  background: ${props => props.$isSelected ? '#6b7280' : 'white'};
  color: ${props => props.$isSelected ? 'white' : '#1d1d1f'};
  
  &:hover {
    background: ${props => props.$isSelected ? '#4b5563' : '#f3f4f6'};
  }
  
  &:first-child {
    border-radius: 12px 12px 0 0;
  }
  
  &:last-child {
    border-radius: 0 0 12px 12px;
  }
  
  @media (max-width: 768px) {
    padding: 0.75rem 1rem;
    min-height: 44px; /* Better touch target */
    display: flex;
    align-items: center;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 2rem;
  gap: 1rem;
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 3px solid #e5e7eb;
  border-top: 3px solid #374151;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const AuthModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999999;
  padding: 1rem;
  
  @media (max-width: 768px) {
    padding: 0.5rem;
    align-items: flex-start;
    padding-top: 2rem;
  }
`;

const AuthModalCard = styled.div`
  background: linear-gradient(135deg, #ffffff 0%, #fafbfc 100%);
  border-radius: 20px;
  padding: 2.5rem;
  box-shadow: 
    0 4px 20px rgba(0,0,0,0.08),
    0 1px 3px rgba(0,0,0,0.1);
  border: 1px solid rgba(255,255,255,0.8);
  max-width: 500px;
  width: 100%;
  position: relative;
  overflow: hidden;
  
  @media (max-width: 768px) {
    padding: 1.5rem 1rem;
    border-radius: 16px;
    max-width: calc(100vw - 1rem);
    margin: 0 0.5rem;
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
`;

const AuthModalTitle = styled.div`
  font-family: 'Audiowide', 'Courier New', monospace;
  font-size: 1.5rem;
  font-weight: 400;
  margin-bottom: 1rem;
  text-align: center;
  color: var(--text-primary);
  letter-spacing: -0.03em;
  background: linear-gradient(135deg, #181a1b 0%, #4a4a4a 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  
  @media (max-width: 768px) {
    font-size: 1.2rem;
    margin-bottom: 0.75rem;
  }
`;

const AuthModalMessage = styled.div`
  font-size: 1rem;
  color: var(--text-secondary);
  text-align: center;
  line-height: 1.6;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    font-size: 0.9rem;
    line-height: 1.5;
    margin-bottom: 1.5rem;
  }
`;

const AuthModalButtons = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0.75rem;
    width: 100%;
  }
`;

const AuthModalButton = styled.button`
  padding: 0.75rem 1.5rem;
  font-family: 'Audiowide', 'Courier New', monospace;
  font-size: 0.9rem;
  font-weight: 400;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  outline: none;
  position: relative;
  overflow: hidden;
  text-align: center;
  font-display: swap;
  
  @media (max-width: 768px) {
    padding: 0.875rem 1rem;
    font-size: 0.85rem;
    min-height: 44px;
    width: 100%;
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
  
  &:hover, &:focus {
    transform: translateY(-1px);
    
    &::before {
      left: 100%;
    }
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &.primary {
    background: linear-gradient(135deg, #181a1b 0%, #4a4a4a 100%);
    color: white;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    
    &:hover {
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
  }
  
  &.secondary {
    background: linear-gradient(135deg, #ffffff 0%, #fafbfc 100%);
    color: var(--text-primary);
    border: 2px solid #E5E5E5;
    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
    
    &:hover {
      border-color: #181a1b;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
  }
`;

const AutoPlayToggle = styled.button`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  position: absolute;
  top: 1rem;
  right: 1rem;
  z-index: 10;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  
  &:hover {
    background: #f8fafc;
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(0,0,0,0.12);
  }
  
  svg {
    color: #374151;
    font-size: 1rem;
  }
`;

const CarouselWrapper = styled.div`
  width: 100%;
  overflow: hidden;
  position: relative;
  margin-top: 1rem;
`;

const CarouselTrack = styled.div<{ $currentIndex: number }>`
  display: flex;
  width: 100%;
  transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  transform: translateX(-${props => props.$currentIndex * 100}%);
`;

const CarouselSlide = styled.div`
  min-width: 100%;
  width: 100%;
  flex-shrink: 0;
  padding: 0;
  height: 600px;
  display: flex;
  align-items: stretch;
  
  @media (max-width: 768px) {
    height: 700px;
  }
`;

const IdeaCard = styled.div`
  background: #ffffff;
  border-radius: 12px;
  padding: 2rem;
  border: 1px solid #e5e7eb;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  position: relative;
  animation: ${fadeIn} 0.6s ease-out;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  
  @media (max-width: 768px) {
    padding: 1.5rem;
  }
`;

export function TrendingIdeasCarousel() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();
  const [trendingIdeas, setTrendingIdeas] = useState<TrendingIdea[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [ideaType, setIdeaType] = useState<'general' | 'local'>('general');
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [pendingLocalRequest, setPendingLocalRequest] = useState(false);
  const [exploringIdeaId, setExploringIdeaId] = useState<string | null>(null);
  
  // Global selections
  const [selectedBusinessType, setSelectedBusinessType] = useState<string | null>(null);
  const [selectedScope, setSelectedScope] = useState<string | null>(null);
  const [isRefineSearchExpanded, setIsRefineSearchExpanded] = useState(false);
  const [showBusinessTypeDropdown, setShowBusinessTypeDropdown] = useState(false);
  const [showScopeDropdown, setShowScopeDropdown] = useState(false);



  useEffect(() => {
    fetchTrendingIdeas();
  }, [ideaType]);

  // Check for pending local request when returning from login
  useEffect(() => {
    const pendingRequest = localStorage.getItem('pendingLocalRequest');
    console.log('=== Pending Request Check ===');
    console.log('pendingRequest:', pendingRequest);
    console.log('isAuthenticated:', isAuthenticated);
    console.log('user:', user);
    console.log('user?.location:', user?.location);
    
    if (pendingRequest === 'true' && isAuthenticated && user) {
      localStorage.removeItem('pendingLocalRequest');
      setPendingLocalRequest(false);
      
      // Add a small delay to ensure user data is fully loaded
      setTimeout(() => {
        // Scroll to the carousel
        const carouselElement = document.querySelector('[data-carousel-section]');
        if (carouselElement) {
          carouselElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        
        // Check if user has complete location info
        const hasLocation = user.location && 
                           user.location.city && 
                           user.location.region && 
                           user.location.country &&
                           user.location.city.trim() !== '' &&
                           user.location.region.trim() !== '' &&
                           user.location.country.trim() !== '';
        
        console.log('hasLocation:', hasLocation);
        console.log('user?.location?.city:', user?.location?.city);
        console.log('user?.location?.region:', user?.location?.region);
        console.log('user?.location?.country:', user?.location?.country);
        
        if (!hasLocation) {
          console.log('Showing location modal');
          setShowLocationModal(true);
        } else {
          console.log('Switching to local ideas');
          setIdeaType('local');
        }
      }, 200); // Small delay to ensure user data is fully loaded
    }
  }, [isAuthenticated, user]);

  // Handle post-login navigation back to landing page
  useEffect(() => {
    const pendingRequest = localStorage.getItem('pendingLocalRequest');
    console.log('Post-login check:', { pendingRequest, isAuthenticated, pathname: window.location.pathname });
    if (pendingRequest === 'true' && isAuthenticated) {
      // If we're on the app page and have a pending request, navigate back to landing
      if (window.location.pathname === '/app') {
        console.log('Navigating back to landing page');
        navigate('/');
      }
    }
  }, [isAuthenticated, navigate]);

  // Remember last selection
  useEffect(() => {
    const lastSelection = localStorage.getItem('lastIdeaType');
    if (lastSelection === 'local' && isAuthenticated) {
      // Only restore local selection if user is authenticated
      setIdeaType('local');
    } else if (lastSelection === 'general') {
      // Always restore general selection
      setIdeaType('general');
    } else {
      // Default to general for unauthenticated users
      setIdeaType('general');
    }
  }, [isAuthenticated]);



  // Auto-slide effect - always goes forward
  useEffect(() => {
    if (!isAutoPlaying || trendingIdeas.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const nextIndex = prev + 1;
        
        // Loop back to first slide when reaching the end
        if (nextIndex >= trendingIdeas.length) {
          return 0;
        }
        
        return nextIndex;
      });
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [isAutoPlaying, trendingIdeas.length]);

  // Pause auto-play when user interacts
  const pauseAutoPlay = () => {
    setIsAutoPlaying(false);
    // Resume auto-play after 10 seconds of inactivity
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const fetchTrendingIdeas = async () => {
    try {
      setLoading(true);
      setError(null);
      setShowAuthPrompt(false);
      setShowLocationPrompt(false);
      
      const config: any = {};
      
      // Add authentication header for both local and general ideas to get like status
      if (isAuthenticated) {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers = { Authorization: `Bearer ${token}` };
        }
      }
      
      // For local ideas, include user location in the request
      let url = `${API_URL}/trending-ideas?type=${ideaType}&limit=5`;
      if (ideaType === 'local' && user?.location) {
        const { city, region, country } = user.location;
        if (city && region && country) {
          url += `&city=${encodeURIComponent(city)}&region=${encodeURIComponent(region)}&country=${encodeURIComponent(country)}`;
        }
      }
      
      const response = await axios.get(url, config);
      const data = response.data as any;
      
      if (data.status === 'success') {
        setTrendingIdeas(data.data);
        
        // If no local ideas found and user has location, try to generate them
        if (ideaType === 'local' && data.data.length === 0 && user?.location) {
          const { city, region, country } = user.location;
          if (city && region && country) {
            await generateLocalTrendingIdeas(city, region, country);
            // Fetch again after generation
            const retryResponse = await axios.get(url, config);
            const retryData = retryResponse.data as any;
            if (retryData.status === 'success') {
              setTrendingIdeas(retryData.data);
            }
          }
        }
      } else {
        setError('Failed to fetch trending ideas');
      }
    } catch (err: any) {
      console.error('Error fetching trending ideas:', err);
      
      if (err.response?.data?.requiresAuth) {
        setShowAuthPrompt(true);
        setError('Please sign in to view local trending ideas');
      } else if (err.response?.data?.requiresLocation) {
        setShowLocationPrompt(true);
        setError('Please add your location to your profile to view local trending ideas');
      } else {
        setError('Failed to load trending ideas');
      }
    } finally {
      setLoading(false);
    }
  };

  const generateLocalTrendingIdeas = async (city: string, region: string, country: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/trending-ideas/generate-local`,
        {
          city,
          region,
          country
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('Generated local trending ideas:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error generating local trending ideas:', error);
    }
  };

  const nextSlide = () => {
    pauseAutoPlay();
    setCurrentIndex((prev) => {
      const nextIndex = prev + 1;
      if (nextIndex >= trendingIdeas.length) {
        return 0; // Loop back to first slide
      }
      return nextIndex;
    });
  };

  const prevSlide = () => {
    pauseAutoPlay();
    setCurrentIndex((prev) => {
      const prevIndex = prev - 1;
      if (prevIndex < 0) {
        return trendingIdeas.length - 1; // Loop to last slide
      }
      return prevIndex;
    });
  };

  const goToSlide = (index: number) => {
    pauseAutoPlay();
    setCurrentIndex(index);
  };

  // Calculate the actual slide index for display (handles looping)
  const getDisplayIndex = (index: number) => {
    return index % trendingIdeas.length;
  };

  const handleLike = async (ideaId: string) => {
    if (!isAuthenticated) {
      setShowAuthPrompt(true);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/trending-ideas/${ideaId}/like`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      // Update local state to reflect the like
      const responseData = response.data as any;
      setTrendingIdeas(prev => 
        prev.map(idea => 
          idea._id === ideaId 
            ? { 
                ...idea, 
                likes: responseData.data.likes,
                isLiked: responseData.data.isLiked || false
              }
            : idea
        )
      );
    } catch (err: any) {
      if (err.response?.status === 401) {
        setShowAuthPrompt(true);
      } else {
        console.error('Error liking idea:', err);
      }
    }
  };

  const generateIdeaSummary = async (idea: TrendingIdea): Promise<string> => {
    try {
      const businessTypeInfo = businessTypes.find(bt => bt.id === idea.businessType);
      const locationContext = user?.location ? 
        `Location: ${user.location.city}, ${user.location.region}, ${user.location.country}. ` : 
        '';
      
      const prompt = `Create a concise 50-word summary of this business idea for a user to explore. Include the key opportunity, target market, and potential. Make it engaging and actionable.

Business Type: ${businessTypeInfo?.title || 'General'}
${locationContext}
Title: ${idea.title}
Description: ${idea.description}
Market: ${idea.market}
Trend: ${idea.trend}
Difficulty: ${idea.difficulty}
Investment: ${idea.investment}
Time to Launch: ${idea.timeToLaunch}
Potential: ${idea.potential}

Write exactly 50 words:`;

      const response = await fetchChatGPT(prompt);
      return typeof response === 'string' ? response : response.message || idea.description;
    } catch (error) {
      console.error('Error generating idea summary:', error);
      // Fallback to a simple summary if AI fails
      return `${idea.title}: ${idea.description.substring(0, 100)}...`;
    }
  };

  const handleExplore = async (idea: TrendingIdea) => {
    try {
      setExploringIdeaId(idea._id);
      
      // Generate AI summary with retry logic
      let aiSummary = '';
      try {
        aiSummary = await generateIdeaSummary(idea);
      } catch (summaryError) {
        console.warn('AI summary generation failed, using fallback:', summaryError);
        aiSummary = `${idea.title}: ${idea.description.substring(0, 100)}...`;
      }
      
      // Prepare the idea data for the app
      const ideaData = {
        title: idea.title,
        description: idea.description,
        market: idea.market,
        trend: idea.trend,
        difficulty: idea.difficulty,
        investment: idea.investment,
        timeToLaunch: idea.timeToLaunch,
        potential: idea.potential,
        tags: idea.tags,
        businessType: idea.businessType,
        aiSummary: aiSummary,
        selectedBusinessType: selectedBusinessType,
        selectedScope: selectedScope,
        scopeData: selectedScope ? scopeOptions.find(s => s.id === selectedScope) : null,
        source: 'trending-ideas',
        sourceId: idea._id
      };

      // Store the idea data in localStorage for the app to access
      localStorage.setItem('prefilledIdea', JSON.stringify(ideaData));
      
      // Add a flag to indicate idea exploration was initiated
      localStorage.setItem('ideaExplorationInitiated', 'true');
      
      // Clear any existing app state to start fresh
      localStorage.removeItem('appState');
      
      // Add a small delay to ensure localStorage is written
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Navigate to the dedicated idea explorer
      navigate('/explore-idea');
    } catch (error) {
      console.error('Error handling explore:', error);
      // Fallback to original behavior if everything fails
      const ideaData = {
        title: idea.title,
        description: idea.description,
        market: idea.market,
        trend: idea.trend,
        difficulty: idea.difficulty,
        investment: idea.investment,
        timeToLaunch: idea.timeToLaunch,
        potential: idea.potential,
        tags: idea.tags,
        businessType: idea.businessType,
        source: 'trending-ideas',
        sourceId: idea._id
      };
      
      localStorage.setItem('prefilledIdea', JSON.stringify(ideaData));
      
      // Add a flag to indicate idea exploration was initiated
      localStorage.setItem('ideaExplorationInitiated', 'true');
      
      localStorage.removeItem('appState');
      
      // Add a small delay to ensure localStorage is written
      setTimeout(() => {
        navigate('/explore-idea');
      }, 100);
    } finally {
      setExploringIdeaId(null);
    }
  };

  const handleIdeaTypeChange = (type: 'general' | 'local') => {
    if (type === 'local' && !isAuthenticated) {
      // Store pending request and show auth modal
      localStorage.setItem('pendingLocalRequest', 'true');
      setPendingLocalRequest(true);
      setShowAuthPrompt(true);
      return;
    }
    
    if (type === 'local' && isAuthenticated) {
      // Check if user has complete location info
      const hasLocation = user?.location && 
                         user.location.city && 
                         user.location.region && 
                         user.location.country &&
                         user.location.city.trim() !== '' &&
                         user.location.region.trim() !== '' &&
                         user.location.country.trim() !== '';
      
      if (!hasLocation) {
        setShowLocationModal(true);
        return;
      }
    }
    
    // Only save the selection if we're actually switching to it
    if (type === 'general' || (type === 'local' && isAuthenticated)) {
      localStorage.setItem('lastIdeaType', type);
    }
    
    setIdeaType(type);
    setCurrentIndex(0);
    setShowAuthPrompt(false);
    setShowLocationPrompt(false);
  };

  const handleSignIn = () => {
    // Set flag for pending local request and navigate to login
    localStorage.setItem('pendingLocalRequest', 'true');
    console.log('Setting pendingLocalRequest and navigating to login');
    setShowAuthPrompt(false);
    // Navigate to login
    window.location.href = '/app?login=true';
  };



  const handleUpdateProfile = () => {
    navigate('/app?profile=1');
  };

  const handleLocationModalSave = () => {
    setShowLocationModal(false);
    // Switch to local ideas after saving location
    setIdeaType('local');
    setCurrentIndex(0);
  };

  const handleLocationModalClose = () => {
    setShowLocationModal(false);
    // Switch back to general if user cancels
    setIdeaType('general');
    setCurrentIndex(0);
  };

  const toggleAutoPlay = () => {
    setIsAutoPlaying(!isAutoPlaying);
  };

  const formatDate = () => {
    const today = new Date();
    return today.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getCurrentSlideNumber = () => {
    return (currentIndex % trendingIdeas.length) + 1;
  };

  if (loading) {
    return (
      <Container>
        <LoadingContainer>
          <LoadingSpinner />
          Loading today's trending ideas...
        </LoadingContainer>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <ErrorContainer>
          {error}
        </ErrorContainer>
      </Container>
    );
  }

  if (trendingIdeas.length === 0) {
    return (
      <Container>
        <ErrorContainer>
          No trending ideas available today. Check back tomorrow!
        </ErrorContainer>
      </Container>
    );
  }

  return (
    <Container className="carousel-container" data-carousel-section>
      <Header>
        <HeaderLeft>
          <Title>
            Today's Alpha-Niche Ideas
          </Title>
          <Subtitle>
            AI-curated opportunities with high growth potential
          </Subtitle>
        </HeaderLeft>
        <HeaderRight>
          <DateDisplay>
            <FiClock />
            {formatDate()}
          </DateDisplay>
        </HeaderRight>
      </Header>

      {showAuthPrompt && (
        <AuthModalOverlay onClick={() => setShowAuthPrompt(false)}>
          <AuthModalCard onClick={(e) => e.stopPropagation()}>
            <AuthModalTitle>🔐 Sign In Required</AuthModalTitle>
            <AuthModalMessage>
              To view local opportunities tailored to your area, you need to sign in to your account.
            </AuthModalMessage>
            <AuthModalButtons>
              <AuthModalButton
                className="primary"
                onClick={handleSignIn}
              >
                Sign In
              </AuthModalButton>
              <AuthModalButton
                className="secondary"
                onClick={() => setShowAuthPrompt(false)}
              >
                Cancel
              </AuthModalButton>
            </AuthModalButtons>
          </AuthModalCard>
        </AuthModalOverlay>
      )}

      {showLocationPrompt && (
        <AuthModalOverlay onClick={() => setShowLocationPrompt(false)}>
          <AuthModalCard onClick={(e) => e.stopPropagation()}>
            <AuthModalTitle>📍 Location Required</AuthModalTitle>
            <AuthModalMessage>
              To view local trending ideas, please add your location to your profile.
            </AuthModalMessage>
            <AuthModalButtons>
              <AuthModalButton
                className="primary"
                onClick={handleUpdateProfile}
              >
                Update Profile
              </AuthModalButton>
              <AuthModalButton
                className="secondary"
                onClick={() => setShowLocationPrompt(false)}
              >
                Cancel
              </AuthModalButton>
            </AuthModalButtons>
          </AuthModalCard>
        </AuthModalOverlay>
      )}

      <LocationModal
        isOpen={showLocationModal}
        onClose={handleLocationModalClose}
        onSave={handleLocationModalSave}
      />

      <GlobalSelectorsContainer>
        <CollapsibleHeader onClick={() => setIsRefineSearchExpanded(!isRefineSearchExpanded)}>
          <CollapsibleTitle>
            <FiTarget />
            Refine Your Search
          </CollapsibleTitle>
          <CollapsibleIcon $isExpanded={isRefineSearchExpanded}>
            <FiChevronDown />
          </CollapsibleIcon>
        </CollapsibleHeader>
        
        <CollapsibleContent $isExpanded={isRefineSearchExpanded}>
          <SelectorsRow>
            <SelectorGroup>
              <SelectorLabel>Idea Type</SelectorLabel>
              <ToggleContainer>
                <ToggleButton 
                  $active={ideaType === 'general'} 
                  onClick={() => handleIdeaTypeChange('general')}
                >
                  <FiGlobe />
                  General
                </ToggleButton>
                <ToggleButton 
                  $active={ideaType === 'local'} 
                  $isLocal={true}
                  onClick={() => handleIdeaTypeChange('local')}
                >
                  <FiMapPin />
                  Local
                </ToggleButton>
              </ToggleContainer>
              {ideaType === 'local' && user?.location && (
                <LocationIndicator>
                  <FiMapPin />
                  {user.location.city}, {user.location.region}
                </LocationIndicator>
              )}
            </SelectorGroup>
            
            <SelectorGroup>
              <SelectorLabel>Business Type</SelectorLabel>
              <CustomDropdown>
                <CustomDropdownButton
                  onClick={() => setShowBusinessTypeDropdown(!showBusinessTypeDropdown)}
                  onBlur={() => setTimeout(() => setShowBusinessTypeDropdown(false), 150)}
                >
                  {selectedBusinessType ? businessTypes.find(bt => bt.id === selectedBusinessType)?.title : 'Select business type'}
                  <FiChevronDown style={{ transform: showBusinessTypeDropdown ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }} />
                </CustomDropdownButton>
                <CustomDropdownMenu 
                  $isOpen={showBusinessTypeDropdown}
                >
                  <CustomDropdownOption
                    onClick={() => {
                      setSelectedBusinessType(null);
                      setShowBusinessTypeDropdown(false);
                    }}
                  >
                    Select business type
                  </CustomDropdownOption>
                  {businessTypes.map((businessType) => (
                    <CustomDropdownOption
                      key={businessType.id}
                      $isSelected={selectedBusinessType === businessType.id}
                      onClick={() => {
                        setSelectedBusinessType(businessType.id);
                        setShowBusinessTypeDropdown(false);
                      }}
                    >
                      {businessType.title}
                    </CustomDropdownOption>
                  ))}
                </CustomDropdownMenu>
              </CustomDropdown>
            </SelectorGroup>
            
            <SelectorGroup>
              <SelectorLabel>Time Commitment</SelectorLabel>
              <CustomDropdown>
                <CustomDropdownButton
                  onClick={() => setShowScopeDropdown(!showScopeDropdown)}
                  onBlur={() => setTimeout(() => setShowScopeDropdown(false), 150)}
                >
                  {selectedScope ? scopeOptions.find(s => s.id === selectedScope)?.description : 'Select time commitment'}
                  <FiChevronDown style={{ transform: showScopeDropdown ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }} />
                </CustomDropdownButton>
                <CustomDropdownMenu 
                  $isOpen={showScopeDropdown}
                >
                  <CustomDropdownOption
                    onClick={() => {
                      setSelectedScope(null);
                      setShowScopeDropdown(false);
                    }}
                  >
                    Select time commitment
                  </CustomDropdownOption>
                  {scopeOptions.map((scope) => (
                    <CustomDropdownOption
                      key={scope.id}
                      $isSelected={selectedScope === scope.id}
                      onClick={() => {
                        setSelectedScope(scope.id);
                        setShowScopeDropdown(false);
                      }}
                    >
                      {scope.description}
                    </CustomDropdownOption>
                  ))}
                </CustomDropdownMenu>
              </CustomDropdown>
            </SelectorGroup>
          </SelectorsRow>
        </CollapsibleContent>
      </GlobalSelectorsContainer>
      


      <CarouselContainer>
        {trendingIdeas.length > 1 && (
          <AutoPlayToggle onClick={toggleAutoPlay} title={isAutoPlaying ? 'Pause auto-play' : 'Resume auto-play'}>
            {isAutoPlaying ? <FiPause /> : <FiPlay />}
          </AutoPlayToggle>
        )}
        {trendingIdeas.length > 1 && isAutoPlaying && (
          <ProgressBar>
            <ProgressFill $progress={(((currentIndex % trendingIdeas.length) + 1) / trendingIdeas.length) * 100} />
          </ProgressBar>
        )}
        <CarouselWrapper>
          <CarouselTrack $currentIndex={currentIndex}>
            {/* Show only the original slides (no infinite scrolling) */}
            {trendingIdeas.map((idea, index) => (
              <CarouselSlide key={`${idea._id}-${index}`}>
                <IdeaCard>
                  <IdeaHeader>
                    <IdeaTitle>{idea.title}</IdeaTitle>
                    <SlideNumber>{index + 1}</SlideNumber>
                  </IdeaHeader>
                  
                  {ideaType === 'local' && user?.location && (
                    <LocationBadge>
                      <FiMapPin />
                      {user.location.city}, {user.location.region}
                    </LocationBadge>
                  )}

                  <IdeaDescription>{idea.description}</IdeaDescription>

                  <IdeaDetails>
                    <DetailItem>
                      <FiTarget />
                      <DetailLabel>Market:</DetailLabel>
                      {idea.market}
                    </DetailItem>
                    <DetailItem>
                      <FiTrendingUp />
                      <DetailLabel>Trend:</DetailLabel>
                      {idea.trend}
                    </DetailItem>
                    <DetailItem>
                      <FiClock />
                      <DetailLabel>Launch:</DetailLabel>
                      {idea.timeToLaunch}
                    </DetailItem>
                    <DetailItem>
                      <FiDollarSign />
                      <DetailLabel>Potential:</DetailLabel>
                      {idea.potential}
                    </DetailItem>
                  </IdeaDetails>

                                                                  <TagsContainer>
                                  {selectedBusinessType && (
                                    <Tag 
                                      $isHighlighted={true}
                                      $color={businessTypes.find(bt => bt.id === selectedBusinessType)?.color || '#6b7280'}
                                    >
                                      <strong>Business Type:</strong> {businessTypes.find(bt => bt.id === selectedBusinessType)?.title}
                                    </Tag>
                                  )}
                                  {selectedScope && (
                                    <Tag 
                                      $isHighlighted={true}
                                      $color="#8b5cf6"
                                    >
                                      <strong>Scope:</strong> {scopeOptions.find(s => s.id === selectedScope)?.description}
                                    </Tag>
                                  )}
                                </TagsContainer>

                  <ActionButtons>
                    <LikeButton 
                      $isLiked={idea.isLiked || false}
                      onClick={() => handleLike(idea._id)}
                    >
                      <FiHeart />
                      {idea.isLiked ? 'Liked' : 'Like'} ({idea.likes || 0})
                    </LikeButton>
                    <ExploreButton 
                      onClick={() => handleExplore(idea)}
                      disabled={exploringIdeaId === idea._id}
                    >
                      {exploringIdeaId === idea._id ? 'Generating Summary...' : 
                        `Explore This Alpha Idea${selectedBusinessType || selectedScope ? ` (${[
                          selectedBusinessType && businessTypes.find(bt => bt.id === selectedBusinessType)?.title,
                          selectedScope && scopeOptions.find(s => s.id === selectedScope)?.title
                        ].filter(Boolean).join(' • ')})` : ''}`}
                    </ExploreButton>
                  </ActionButtons>
                </IdeaCard>
              </CarouselSlide>
            ))}
          </CarouselTrack>
        </CarouselWrapper>

        {trendingIdeas.length > 1 && (
          <NavigationButtons>
            <NavButton className="nav-left" onClick={prevSlide}>
              <FiArrowLeft />
            </NavButton>
            <NavButton className="nav-right" onClick={nextSlide}>
              <FiArrowRight />
            </NavButton>
          </NavigationButtons>
        )}
      </CarouselContainer>

      {trendingIdeas.length > 1 && (
        <ProgressContainer>
          {trendingIdeas.map((_, index) => (
            <Dot
              key={index}
              $active={index === currentIndex}
              onClick={() => goToSlide(index)}
            />
          ))}
        </ProgressContainer>
      )}
    </Container>
  );
} 