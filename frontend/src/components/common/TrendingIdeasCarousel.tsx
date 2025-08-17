import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { FiTrendingUp, FiClock, FiDollarSign, FiTarget, FiArrowLeft, FiArrowRight, FiBookmark, FiPause, FiPlay, FiMapPin, FiGlobe, FiHeart } from 'react-icons/fi';
import { FaFire } from 'react-icons/fa';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LocationModal } from './LocationModal';

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
  score: number;
  views: number;
  saves: number;
  likes: number;
  isLiked?: boolean;
}

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
  50% { transform: scale(1.05); }
`;

const shimmer = keyframes`
  0% { background-position: -200px 0; }
  100% { background-position: calc(200px + 100%) 0; }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

const Container = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 0;
  
  @media (max-width: 768px) {
    padding: 1rem 0;
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
`;

const HeaderLeft = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const HeaderRight = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.5rem;
  
  @media (max-width: 768px) {
    align-items: flex-start;
  }
`;

const DateDisplay = styled.div`
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  padding: 0.75rem 1.5rem;
  border-radius: 20px;
  border: 1px solid rgba(24, 26, 27, 0.08);
  font-weight: 600;
  color: #374151;
  font-size: 0.9rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  backdrop-filter: blur(10px);
`;

const SlideCounter = styled.div`
  background: linear-gradient(135deg, #181a1b 0%, #374151 100%);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 16px;
  font-weight: 700;
  font-size: 0.85rem;
  box-shadow: 0 2px 8px rgba(24, 26, 27, 0.2);
  animation: ${pulse} 2s ease-in-out infinite;
`;

const Title = styled.h2`
  font-family: 'Audiowide', 'Courier New', monospace;
  font-size: clamp(1.6rem, 3vw, 2.1rem);
  font-weight: 400;
  color: #181a1b;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 0;
  
  svg {
    animation: ${float} 3s ease-in-out infinite;
  }
  
  @media (max-width: 768px) {
    gap: 0.5rem;
  }
`;

const Subtitle = styled.p`
  color: #4b5563;
  max-width: 680px;
  margin: 0.5rem 0 0 0;
  line-height: 1.75;
  padding-left: 3rem;
  
  @media (max-width: 768px) {
    padding-left: 2.5rem;
  }
`;

const CarouselContainer = styled.div`
  position: relative;
  overflow: hidden;
  border-radius: 24px;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  box-shadow: 
    0 20px 40px rgba(0,0,0,0.1),
    0 8px 16px rgba(0,0,0,0.06),
    inset 0 1px 0 rgba(255,255,255,0.8);
  border: 1px solid rgba(255,255,255,0.9);
  backdrop-filter: blur(10px);
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent);
  }
`;

const CarouselTrack = styled.div<{ $currentIndex: number }>`
  display: flex;
  transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  transform: translateX(-${props => props.$currentIndex * 100}%);
`;

const CarouselSlide = styled.div`
  min-width: 100%;
  padding: 2rem;
  
  @media (max-width: 768px) {
    padding: 1.5rem 1rem;
  }
`;

const IdeaCard = styled.div`
  background: linear-gradient(135deg, #ffffff 0%, #fafbfc 100%);
  border-radius: 20px;
  padding: 2.5rem;
  position: relative;
  border: 1px solid rgba(24, 26, 27, 0.08);
  box-shadow: 
    0 8px 32px rgba(0,0,0,0.08),
    0 4px 16px rgba(0,0,0,0.04),
    inset 0 1px 0 rgba(255,255,255,0.9);
  animation: ${fadeIn} 0.6s ease-out;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #181a1b, #374151, #4b5563, #6b7280, #9ca3af);
    background-size: 200% 100%;
    animation: ${shimmer} 3s ease-in-out infinite;
  }
  
  @media (max-width: 768px) {
    padding: 2rem 1.5rem;
  }
`;

const IdeaHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
  position: relative;
`;

const SlideNumber = styled.div`
  position: absolute;
  top: -20px;
  right: -20px;
  background: linear-gradient(135deg, #181a1b 0%, #374151 100%);
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1rem;
  box-shadow: 
    0 4px 16px rgba(24, 26, 27, 0.3),
    0 2px 8px rgba(24, 26, 27, 0.2);
  z-index: 10;
  
  &::before {
    content: '';
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    background: linear-gradient(135deg, #181a1b, #374151);
    border-radius: 50%;
    z-index: -1;
    opacity: 0.3;
    filter: blur(4px);
  }
`;

const IdeaTitle = styled.h3`
  margin: 0 0 0.35rem 0;
  font-size: clamp(1.05rem, 2.2vw, 1.35rem);
  font-weight: 900;
  color: #181a1b;
`;

const ScoreBadge = styled.div`
  background: linear-gradient(135deg, #181a1b 0%, #374151 100%);
  color: white;
  padding: 0.75rem 1.25rem;
  border-radius: 25px;
  font-size: 0.875rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 
    0 4px 16px rgba(24, 26, 27, 0.3),
    0 2px 8px rgba(24, 26, 27, 0.2);
  animation: ${pulse} 2s ease-in-out infinite;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    background: linear-gradient(135deg, #181a1b, #374151);
    border-radius: 27px;
    z-index: -1;
    opacity: 0.3;
    filter: blur(4px);
  }
  
  @media (max-width: 768px) {
    padding: 0.5rem 1rem;
    font-size: 0.8rem;
    gap: 0.25rem;
  }
`;

const IdeaDescription = styled.p`
  color: #4b5563;
  line-height: 1.7;
  margin-bottom: 2rem;
  font-size: 1.1rem;
  font-weight: 400;
  background: linear-gradient(135deg, #4b5563 0%, #6b7280 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const IdeaDetails = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.25rem;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, rgba(248, 250, 252, 0.8) 0%, rgba(241, 245, 249, 0.8) 100%);
  border-radius: 16px;
  border: 1px solid rgba(24, 26, 27, 0.06);
  backdrop-filter: blur(10px);
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
    padding: 1rem;
    margin-bottom: 1.5rem;
  }
`;

const DetailItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #6b7280;
  font-size: 0.9rem;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 12px;
  border: 1px solid rgba(24, 26, 27, 0.04);
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.9);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  }
  
  svg {
    color: #374151;
    flex-shrink: 0;
  }
`;

const DetailLabel = styled.span`
  font-weight: 600;
  color: #374151;
  min-width: 60px;
`;

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 2rem;
  padding: 1rem;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(248, 250, 252, 0.8) 100%);
  border-radius: 16px;
  border: 1px solid rgba(24, 26, 27, 0.06);
  
  @media (max-width: 768px) {
    gap: 0.5rem;
    padding: 0.75rem;
    margin-bottom: 1.5rem;
  }
`;

const Tag = styled.span`
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  color: #475569;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  border: 1px solid rgba(24, 26, 27, 0.08);
  box-shadow: 0 2px 4px rgba(0,0,0,0.04);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
    transition: left 0.5s ease;
  }
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
    
    &::before {
      left: 100%;
    }
  }
  
  @media (max-width: 768px) {
    padding: 0.375rem 0.75rem;
    font-size: 0.75rem;
    border-radius: 16px;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: space-between;
  align-items: center;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0.75rem;
  }
`;

const LikeButton = styled.button<{ $isLiked: boolean }>`
  background: ${props => props.$isLiked 
    ? 'linear-gradient(135deg, #059669 0%, #10b981 100%)' 
    : 'linear-gradient(135deg, #181a1b 0%, #374151 100%)'};
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 16px;
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  position: relative;
  overflow: hidden;
  box-shadow: ${props => props.$isLiked 
    ? '0 4px 16px rgba(5, 150, 105, 0.3), 0 2px 8px rgba(5, 150, 105, 0.2)' 
    : '0 4px 16px rgba(24, 26, 27, 0.3), 0 2px 8px rgba(24, 26, 27, 0.2)'};
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
    transition: left 0.5s ease;
  }
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: ${props => props.$isLiked 
      ? '0 8px 24px rgba(5, 150, 105, 0.4), 0 4px 12px rgba(5, 150, 105, 0.3)' 
      : '0 8px 24px rgba(24, 26, 27, 0.4), 0 4px 12px rgba(24, 26, 27, 0.3)'};
    
    &::before {
      left: 100%;
    }
  }
  
  &:active {
    transform: translateY(-1px);
  }
  
  @media (max-width: 768px) {
    padding: 0.875rem 1.5rem;
    font-size: 0.9rem;
    width: 100%;
    justify-content: center;
  }
`;

const ExploreButton = styled.button`
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  color: #181a1b;
  border: 2px solid rgba(24, 26, 27, 0.12);
  padding: 1rem 2rem;
  border-radius: 16px;
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  box-shadow: 
    0 4px 16px rgba(0,0,0,0.08),
    0 2px 8px rgba(0,0,0,0.04);
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(24, 26, 27, 0.05), transparent);
    transition: left 0.5s ease;
  }
  
  &:hover {
    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
    border-color: rgba(24, 26, 27, 0.2);
    transform: translateY(-3px);
    box-shadow: 
      0 8px 24px rgba(0,0,0,0.12),
      0 4px 12px rgba(0,0,0,0.08);
    
    &::before {
      left: 100%;
    }
  }
  
  &:active {
    transform: translateY(-1px);
  }
  
  @media (max-width: 768px) {
    padding: 0.875rem 1.5rem;
    font-size: 0.9rem;
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
  padding: 0 1rem;
  pointer-events: none;
`;

const NavButton = styled.button`
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(24, 26, 27, 0.08);
  border-radius: 50%;
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  pointer-events: all;
  box-shadow: 
    0 4px 16px rgba(0,0,0,0.1),
    0 2px 8px rgba(0,0,0,0.06);
  backdrop-filter: blur(10px);
  
  svg {
    color: #374151;
    font-size: 1.25rem;
    transition: all 0.3s ease;
  }
  
  &:hover {
    background: white;
    transform: scale(1.1);
    box-shadow: 
      0 8px 24px rgba(0,0,0,0.15),
      0 4px 12px rgba(0,0,0,0.1);
    
    svg {
      color: #181a1b;
      transform: scale(1.1);
    }
  }
  
  &:active {
    transform: scale(1.05);
  }
  
  @media (max-width: 768px) {
    width: 48px;
    height: 48px;
    
    svg {
      font-size: 1.1rem;
    }
  }
`;

const DotsContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.75rem;
  margin-top: 2rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 20px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(24, 26, 27, 0.06);
`;

const Dot = styled.button<{ $active: boolean }>`
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: none;
  background: ${props => props.$active 
    ? 'linear-gradient(135deg, #181a1b 0%, #374151 100%)' 
    : 'linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%)'};
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: ${props => props.$active 
    ? '0 2px 8px rgba(24, 26, 27, 0.3)' 
    : '0 1px 4px rgba(0,0,0,0.1)'};
  
  &:hover {
    background: ${props => props.$active 
      ? 'linear-gradient(135deg, #181a1b 0%, #374151 100%)' 
      : 'linear-gradient(135deg, #d1d5db 0%, #9ca3af 100%)'};
    transform: scale(1.2);
    box-shadow: ${props => props.$active 
      ? '0 4px 12px rgba(24, 26, 27, 0.4)' 
      : '0 2px 8px rgba(0,0,0,0.15)'};
  }
`;

const AutoPlayToggle = styled.button`
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(24, 26, 27, 0.1);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  position: absolute;
  top: 1rem;
  right: 1rem;
  z-index: 10;
  
  &:hover {
    background: white;
    transform: scale(1.1);
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  }
`;

const ProgressBar = styled.div<{ $progress: number }>`
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  background: linear-gradient(90deg, #181a1b 0%, #374151 100%);
  width: ${props => props.$progress}%;
  transition: width 0.3s ease;
  z-index: 10;
`;

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  color: #6b7280;
  font-size: 1.1rem;
`;

const ErrorContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  color: #dc2626;
  font-size: 1.1rem;
  text-align: center;
`;

const IdeaTypeToggle = styled.div`
  display: flex;
  background: #f8fafc;
  border-radius: 12px;
  padding: 4px;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(0, 0, 0, 0.1);
`;

const ToggleButton = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  background: ${props => props.$active ? 'linear-gradient(135deg, #181a1b 0%, #374151 100%)' : 'transparent'};
  color: ${props => props.$active ? 'white' : '#6b7280'};
  box-shadow: ${props => props.$active ? '0 4px 16px rgba(24, 26, 27, 0.3)' : 'none'};
  
  &:hover {
    transform: ${props => props.$active ? 'none' : 'translateY(-1px)'};
    color: ${props => props.$active ? 'white' : '#374151'};
  }
  
  @media (max-width: 768px) {
    padding: 0.5rem 1rem;
    font-size: 0.8rem;
  }
`;

const AuthPrompt = styled.div`
  background: linear-gradient(135deg, #f4f5f7 0%, #e5e7eb 100%);
  border: 1px solid #d1d5db;
  border-radius: 12px;
  padding: 1.5rem;
  margin: 1rem 0;
  text-align: center;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
`;

const AuthPromptTitle = styled.h3`
  color: #374151;
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
  font-weight: 600;
`;

const AuthPromptText = styled.p`
  color: #6b7280;
  margin: 0 0 1rem 0;
  font-size: 0.9rem;
  line-height: 1.5;
`;

const AuthButton = styled.button`
  background: linear-gradient(135deg, #181a1b 0%, #374151 100%);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 16px rgba(24, 26, 27, 0.3);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(24, 26, 27, 0.4);
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
    
    if (pendingRequest === 'true' && isAuthenticated) {
      localStorage.removeItem('pendingLocalRequest');
      setPendingLocalRequest(false);
      
      // Scroll to the carousel
      setTimeout(() => {
        const carouselElement = document.querySelector('[data-carousel-section]');
        if (carouselElement) {
          carouselElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
      
      // Check if user has complete location info
      const hasLocation = user?.location && 
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
    }
  }, [isAuthenticated, user?.location]);

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
        
        // If we've reached the end of the first set, jump to the beginning of the second set
        if (nextIndex >= trendingIdeas.length) {
          // After the transition, reset to the beginning
          setTimeout(() => {
            setCurrentIndex(0);
          }, 500);
          return trendingIdeas.length; // This will show the first slide of the second set
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
      
      const response = await axios.get(`${API_URL}/trending-ideas?type=${ideaType}`, config);
      const data = response.data as any;
      
      if (data.success) {
        setTrendingIdeas(data.data);
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

  const nextSlide = () => {
    pauseAutoPlay();
    setCurrentIndex((prev) => {
      const nextIndex = prev + 1;
      if (nextIndex >= trendingIdeas.length) {
        // Jump to the beginning of the second set
        setTimeout(() => setCurrentIndex(0), 500);
        return trendingIdeas.length;
      }
      return nextIndex;
    });
  };

  const prevSlide = () => {
    pauseAutoPlay();
    setCurrentIndex((prev) => {
      const prevIndex = prev - 1;
      if (prevIndex < 0) {
        // Jump to the end of the first set
        setTimeout(() => setCurrentIndex(trendingIdeas.length - 1), 500);
        return -1;
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

  const handleExplore = (idea: TrendingIdea) => {
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
      source: 'trending-ideas',
      sourceId: idea._id
    };

    // Store the idea data in localStorage for the app to access
    localStorage.setItem('prefilledIdea', JSON.stringify(ideaData));
    
    // Clear any existing app state to start fresh
    localStorage.removeItem('appState');
    
    // Navigate to the app
    navigate('/app');
  };

  const handleIdeaTypeChange = (type: 'general' | 'local') => {
    if (type === 'local' && !isAuthenticated) {
      // Store pending request and redirect to login
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
    // Test: try direct navigation first
    window.location.href = '/app?login=true';
    setShowAuthPrompt(false);
  };

  const testNavigation = () => {
    console.log('Testing navigation to landing page');
    window.location.href = '/';
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
          <FiTrendingUp style={{ marginRight: '0.5rem' }} />
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
    <Container data-carousel-section>
      <Header>
        <HeaderLeft>
          <Title>
            <FaFire style={{ color: '#374151' }} />
            Today's Alpha-Niche Ideas
          </Title>
          <Subtitle>
            AI-curated opportunities with high growth potential
          </Subtitle>
        </HeaderLeft>
        <HeaderRight>
          <DateDisplay>
            {formatDate()}
          </DateDisplay>
          <SlideCounter>
            {getCurrentSlideNumber()} of {trendingIdeas.length}
          </SlideCounter>
        </HeaderRight>
      </Header>

      <IdeaTypeToggle>
        <ToggleButton 
          $active={ideaType === 'general'} 
          onClick={() => handleIdeaTypeChange('general')}
        >
          <FiGlobe />
          General
        </ToggleButton>
        <ToggleButton 
          $active={ideaType === 'local'} 
          onClick={() => handleIdeaTypeChange('local')}
        >
          <FiMapPin />
          Local
        </ToggleButton>
      </IdeaTypeToggle>

      {showAuthPrompt && (
        <AuthPrompt>
          <AuthPromptTitle>Sign In Required</AuthPromptTitle>
          <AuthPromptText>
            To like trending ideas and view local opportunities, you need to sign in to your account.
          </AuthPromptText>
          <AuthButton onClick={handleSignIn}>
            Sign In
          </AuthButton>
          <AuthButton onClick={testNavigation} style={{ marginTop: '10px', backgroundColor: '#181a1b' }}>
            Test Navigation
          </AuthButton>
        </AuthPrompt>
      )}

      {showLocationPrompt && (
        <AuthPrompt>
          <AuthPromptTitle>Location Required</AuthPromptTitle>
          <AuthPromptText>
            To view local trending ideas, please add your location to your profile.
          </AuthPromptText>
          <AuthButton onClick={handleUpdateProfile}>
            Update Profile
          </AuthButton>
        </AuthPrompt>
      )}

      <LocationModal
        isOpen={showLocationModal}
        onClose={handleLocationModalClose}
        onSave={handleLocationModalSave}
      />

      <CarouselContainer>
        {trendingIdeas.length > 1 && (
          <AutoPlayToggle onClick={toggleAutoPlay} title={isAutoPlaying ? 'Pause auto-play' : 'Resume auto-play'}>
            {isAutoPlaying ? <FiPause /> : <FiPlay />}
          </AutoPlayToggle>
        )}
        {trendingIdeas.length > 1 && isAutoPlaying && (
          <ProgressBar $progress={(((currentIndex % trendingIdeas.length) + 1) / trendingIdeas.length) * 100} />
        )}
        <CarouselTrack $currentIndex={currentIndex}>
          {/* Create a seamless loop by duplicating slides */}
          {[...trendingIdeas, ...trendingIdeas].map((idea, index) => (
            <CarouselSlide key={`${idea._id}-${index}`}>
              <IdeaCard>
                <IdeaHeader>
                  <IdeaTitle>{idea.title}</IdeaTitle>
                  <SlideNumber>{(index % trendingIdeas.length) + 1}</SlideNumber>
                </IdeaHeader>

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
                  {idea.tags.map((tag, tagIndex) => (
                    <Tag key={tagIndex}>{tag}</Tag>
                  ))}
                </TagsContainer>

                <ActionButtons>
                  <LikeButton 
                    $isLiked={idea.isLiked || false}
                    onClick={() => handleLike(idea._id)}
                  >
                    <FiHeart />
                    {idea.isLiked ? 'Liked' : 'Like'} ({idea.likes || 0})
                  </LikeButton>
                  <ExploreButton onClick={() => handleExplore(idea)}>
                    Explore This Alpha Idea
                  </ExploreButton>
                </ActionButtons>
              </IdeaCard>
            </CarouselSlide>
          ))}
        </CarouselTrack>

        {trendingIdeas.length > 1 && (
          <NavigationButtons>
            <NavButton onClick={prevSlide}>
              <FiArrowLeft />
            </NavButton>
            <NavButton onClick={nextSlide}>
              <FiArrowRight />
            </NavButton>
          </NavigationButtons>
        )}
      </CarouselContainer>

      {trendingIdeas.length > 1 && (
        <DotsContainer>
          {trendingIdeas.map((_, index) => (
            <Dot
              key={index}
              $active={index === (currentIndex % trendingIdeas.length)}
              onClick={() => goToSlide(index)}
            />
          ))}
        </DotsContainer>
      )}
    </Container>
  );
} 