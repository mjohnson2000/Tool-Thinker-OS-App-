import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { FiTrendingUp, FiClock, FiDollarSign, FiTarget, FiArrowLeft, FiArrowRight, FiBookmark, FiPause, FiPlay, FiMapPin, FiGlobe, FiHeart } from 'react-icons/fi';
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
    color: '#3b82f6'
  },
  {
    id: 'local-services',
    title: 'Local Services',
    icon: '🏠',
    color: '#10b981'
  },
  {
    id: 'creative-services',
    title: 'Creative Services',
    icon: '🎨',
    color: '#8b5cf6'
  },
  {
    id: 'professional-services',
    title: 'Professional Services',
    icon: '👔',
    color: '#f59e0b'
  },
  {
    id: 'physical-products',
    title: 'Physical Products',
    icon: '🛍️',
    color: '#ef4444'
  },
  {
    id: 'online-business',
    title: 'Online Business',
    icon: '🌐',
    color: '#06b6d4'
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
  padding: 0.25rem 0;
  
  @media (max-width: 768px) {
    padding: 0.125rem 0;
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 3rem;
  
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
  
  svg {
    color: #374151;
    animation: ${float} 3s ease-in-out infinite;
  }
`;

const Subtitle = styled.p`
  color: #6b7280;
  font-size: 1.1rem;
  line-height: 1.6;
  margin: 0;
  max-width: 600px;
`;

const ToggleContainer = styled.div`
  display: flex;
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 0.25rem;
  gap: 0.25rem;
`;

const ToggleButton = styled.button<{ $active: boolean }>`
  background: ${props => props.$active ? '#ffffff' : 'transparent'};
  color: ${props => props.$active ? '#181a1b' : '#6b7280'};
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: ${props => props.$active ? '0 2px 8px rgba(0,0,0,0.08)' : 'none'};
  
  &:hover {
    background: ${props => props.$active ? '#ffffff' : '#f1f5f9'};
    color: ${props => props.$active ? '#181a1b' : '#374151'};
  }
  
  @media (max-width: 768px) {
    padding: 0.5rem 1rem;
    font-size: 0.85rem;
  }
`;

const CarouselContainer = styled.div`
  position: relative;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 1rem 2rem;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0,0,0,0.04);
  
  @media (max-width: 768px) {
    padding: 0.75rem 1.5rem;
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
  top: 5px;
  right: 5px;
  background: #374151;
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.875rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  z-index: 10;
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
  padding: 0.5rem 1rem;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 600;
  margin-right: 1rem;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.2);
  
  svg {
    font-size: 1rem;
  }
  
  @media (max-width: 768px) {
    font-size: 0.8rem;
    padding: 0.4rem 0.8rem;
    margin-right: 0.5rem;
    
    svg {
      font-size: 0.9rem;
    }
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

const AuthPrompt = styled.div`
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  margin: 2rem 0;
`;

const AuthPromptTitle = styled.h3`
  color: #374151;
  margin: 0 0 0.75rem 0;
  font-size: 1.1rem;
  font-weight: 600;
`;

const AuthPromptText = styled.p`
  color: #6b7280;
  margin: 0 0 1.5rem 0;
  line-height: 1.6;
`;

const AuthButton = styled.button`
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
      // Generate AI summary
      const aiSummary = await generateIdeaSummary(idea);
      
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
        source: 'trending-ideas',
        sourceId: idea._id
      };

      // Store the idea data in localStorage for the app to access
      localStorage.setItem('prefilledIdea', JSON.stringify(ideaData));
      
      // Clear any existing app state to start fresh
      localStorage.removeItem('appState');
      
      // Navigate to the app
      navigate('/app');
    } catch (error) {
      console.error('Error handling explore:', error);
      // Fallback to original behavior if AI summary fails
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
      localStorage.removeItem('appState');
      navigate('/app');
    } finally {
      setExploringIdeaId(null);
    }
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
            <FiClock />
            {formatDate()}
          </DateDisplay>
          {ideaType === 'local' && user?.location && (
            <LocationIndicator>
              <FiMapPin />
              {user.location.city}, {user.location.region}
            </LocationIndicator>
          )}
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
              onClick={() => handleIdeaTypeChange('local')}
            >
              <FiMapPin />
              Local
            </ToggleButton>
          </ToggleContainer>
        </HeaderRight>
      </Header>

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
          <ProgressBar>
            <ProgressFill $progress={(((currentIndex % trendingIdeas.length) + 1) / trendingIdeas.length) * 100} />
          </ProgressBar>
        )}
        <CarouselWrapper>
          <CarouselTrack $currentIndex={currentIndex}>
            {/* Create a seamless loop by duplicating slides */}
            {[...trendingIdeas, ...trendingIdeas].map((idea, index) => (
              <CarouselSlide key={`${idea._id}-${index}`}>
                <IdeaCard>
                  <IdeaHeader>
                    <IdeaTitle>{idea.title}</IdeaTitle>
                    <SlideNumber>{(index % trendingIdeas.length) + 1}</SlideNumber>
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
                                  {idea.businessType && (
                                    <Tag 
                                      $isHighlighted={true}
                                      $color={businessTypes.find(bt => bt.id === idea.businessType)?.color || '#3b82f6'}
                                    >
                                      <strong>Business Type:</strong> {businessTypes.find(bt => bt.id === idea.businessType)?.title}
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
                      {exploringIdeaId === idea._id ? 'Generating Summary...' : 'Explore This Alpha Idea'}
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
              $active={index === (currentIndex % trendingIdeas.length)}
              onClick={() => goToSlide(index)}
            />
          ))}
        </ProgressContainer>
      )}
    </Container>
  );
} 