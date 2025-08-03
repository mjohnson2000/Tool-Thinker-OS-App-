import React from 'react';
import styled, { createGlobalStyle, keyframes } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import logoImg from '../assets/logo.png';
import Player from 'lottie-react';
import walkthroughAnimation from '../assets/walkthrough.json';

// Monochrome palette for glassy/classy look
const colors = {
  black: '#181a1b',
  darkGrey: '#23272f',
  midGrey: '#44474f',
  lightGrey: '#e5e7eb',
  white: '#fff',
  glass: 'rgba(255,255,255,0.7)',
  glassDark: 'rgba(36,36,36,0.7)',
};

const GlobalStyle = createGlobalStyle`
  body {
    font-family: 'Myriad Pro', Inter, Helvetica, Arial, sans-serif;
    background: ${colors.lightGrey};
    margin: 0;
    padding: 0;
    color: ${colors.black};
  }
`;

const Page = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, ${colors.white} 0%, ${colors.lightGrey} 100%);
`;

// Animations
const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const glassyBgAnim = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const Hero = styled.section`
  /* Success theme: Person celebrating success with money/achievement */
  background: linear-gradient(135deg, rgba(24,26,27,0.7) 0%, rgba(24,26,27,0.6) 100%), 
              url('https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&h=600&fit=crop&crop=center') center/cover;
  
  /* Alternative side hustle options (uncomment to use):
  background: linear-gradient(135deg, rgba(24,26,27,0.9) 0%, rgba(24,26,27,0.8) 100%), 
              url('https://images.unsplash.com/photo-1551434678-e076c223a692?w=1200&h=600&fit=crop&crop=center') center/cover;
  background: linear-gradient(135deg, rgba(24,26,27,0.9) 0%, rgba(24,26,27,0.8) 100%), 
              url('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&h=600&fit=crop&crop=center') center/cover;
  background: linear-gradient(135deg, rgba(24,26,27,0.9) 0%, rgba(24,26,27,0.8) 100%), 
              url('https://images.unsplash.com/photo-1494790108755-2616b612b786?w=1200&h=600&fit=crop&crop=center') center/cover;
  background: linear-gradient(135deg, rgba(24,26,27,0.9) 0%, rgba(24,26,27,0.8) 100%), 
              url('https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=600&fit=crop&crop=center') center/cover;
  background: linear-gradient(135deg, rgba(24,26,27,0.9) 0%, rgba(24,26,27,0.8) 100%), 
              url('https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&h=600&fit=crop&crop=center') center/cover;
  */
  
  color: ${colors.white};
  padding: 5rem 1.5rem 4rem 1.5rem;
  text-align: center;
  position: relative;
  overflow: hidden;
  animation: ${fadeInUp} 1.1s cubic-bezier(0.4,0,0.2,1);
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const HeroGlassyBg = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
  background: linear-gradient(135deg, rgba(24,26,27,0.7) 0%, rgba(24,26,27,0.5) 50%, rgba(24,26,27,0.8) 100%);
  opacity: 1;
`;

const HeroContent = styled.div`
  position: relative;
  z-index: 1;
`;

const LogoImg = styled.img`
  width: 80px;
  height: 80px;
  margin: 0 auto 2rem auto;
  border-radius: 50%;
  background: #fff;
  display: block;
  object-fit: contain;
  box-shadow: 0 2px 16px rgba(24,26,27,0.12);
  animation: ${fadeInUp} 1.2s 0.1s both;
`;

const Tagline = styled.h1`
  font-size: 2.8rem;
  font-weight: 800;
  margin: 0 0 1.2rem 0;
  letter-spacing: -1px;
  color: ${colors.white};
  animation: ${fadeInUp} 1.2s 0.2s both;
`;

const SubTagline = styled.h2`
  font-size: 1.5rem;
  font-weight: 500;
  margin: 0 0 2.2rem 0;
  color: ${colors.lightGrey};
  animation: ${fadeInUp} 1.2s 0.3s both;
`;

const HeroText = styled.p`
  font-size: 1.25rem;
  max-width: 540px;
  margin: 0 auto 2.5rem auto;
  color: ${colors.lightGrey};
  animation: ${fadeInUp} 1.2s 0.4s both;
`;

const CTAButton = styled.button`
  background: ${colors.white};
  color: ${colors.black};
  border: none;
  border-radius: 999px;
  padding: 1rem 2.5rem;
  font-size: 1.2rem;
  font-weight: 700;
  margin: 0 1rem 1rem 1rem;
  cursor: pointer;
  box-shadow: 0 2px 16px rgba(24,26,27,0.10);
  transition: background 0.2s, color 0.2s, transform 0.18s cubic-bezier(0.4,0,0.2,1);
  backdrop-filter: blur(8px);
  animation: ${fadeInUp} 1.2s 0.5s both;
  will-change: transform;
  &:hover, &:focus {
    background: ${colors.lightGrey};
    color: ${colors.black};
    transform: scale(1.045);
  }
`;

const SecondaryButton = styled(CTAButton)`
  background: transparent;
  color: ${colors.white};
  border: 2px solid ${colors.white};
  margin-bottom: 0;
  &:hover, &:focus {
    background: ${colors.white};
    color: ${colors.black};
    transform: scale(1.045);
  }
`;

const GlassSection = styled.section`
  background: ${colors.glass};
  box-shadow: 0 8px 32px 0 rgba(24,26,27,0.12);
  backdrop-filter: blur(12px);
  border-radius: 24px;
  margin: 3rem auto;
  padding: 3rem 1.5rem 2rem 1.5rem;
  max-width: 1100px;
  animation: ${fadeInUp} 1.1s cubic-bezier(0.4,0,0.2,1);
`;

const SocialProofSection = styled.section`
  position: relative;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  padding: 4rem 1.5rem 4rem 1.5rem;
  text-align: center;
  overflow: hidden;
  margin-top: -2rem;
  z-index: 1;
  border-radius: 24px 24px 0 0;
  box-shadow: 0 -4px 20px rgba(0,0,0,0.05);
`;

const SocialProofText = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, #181a1b 0%, #44474f 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 3rem;
  letter-spacing: 0.01em;
`;

const SocialLogos = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const SocialLogo = styled.div`
  background: white;
  border-radius: 16px;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  font-weight: 600;
  color: #23272f;
  letter-spacing: 0.01em;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  border: 2px solid transparent;
  transition: all 0.3s ease;
  user-select: none;
  text-align: center;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 30px rgba(0,0,0,0.12);
    border-color: #007bff;
  }
`;

const HowItWorks = styled(GlassSection)`
  text-align: center;
`;

const Steps = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 2.5rem;
  margin-top: 2.5rem;
`;

const Step = styled.div`
  background: ${colors.glass};
  border-radius: 18px;
  box-shadow: 0 2px 12px rgba(24,26,27,0.08);
  padding: 2rem 1.5rem;
  max-width: 320px;
  min-width: 220px;
  flex: 1 1 220px;
  backdrop-filter: blur(8px);
  transition: transform 0.18s cubic-bezier(0.4,0,0.2,1), box-shadow 0.18s cubic-bezier(0.4,0,0.2,1);
  animation: ${fadeInUp} 1.1s both;
  will-change: transform;
  &:hover, &:focus {
    transform: scale(1.035) translateY(-4px);
    box-shadow: 0 8px 32px 0 rgba(24,26,27,0.16);
  }
`;

const StepNumber = styled.div`
  background: ${colors.black};
  color: ${colors.white};
  width: 38px;
  height: 38px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  font-weight: 700;
  margin: 0 auto 1rem auto;
`;

const StepTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 700;
  margin: 0 0 0.7rem 0;
`;

const StepText = styled.p`
  font-size: 1rem;
  color: ${colors.black};
  margin: 0;
`;

const Benefits = styled(GlassSection)`
  text-align: center;
`;

const BenefitsList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 2.5rem auto 0 auto;
  max-width: 800px;
  text-align: left;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem 2.5rem;
`;

const Benefit = styled.li`
  display: flex;
  align-items: center;
  font-size: 1.1rem;
  color: ${colors.black};
  font-weight: 500;
`;

const Check = styled.span`
  color: #22c55e;
  font-size: 1.5rem;
  margin-right: 1rem;
  flex-shrink: 0;
  display: flex;
  align-items: center;
`;

const Comparison = styled(GlassSection)`
  text-align: center;
`;

const ComparisonTable = styled.div`
  display: flex;
  justify-content: center;
  gap: 2rem;
  flex-wrap: wrap;
  margin-top: 2.5rem;
`;

const ComparisonCol = styled.div`
  background: ${colors.glass};
  border-radius: 16px;
  padding: 2rem 1.5rem;
  min-width: 220px;
  max-width: 320px;
  flex: 1 1 220px;
  box-shadow: 0 2px 12px rgba(24,26,27,0.08);
  backdrop-filter: blur(8px);
`;

const ComparisonTitle = styled.h4`
  font-size: 1.1rem;
  font-weight: 700;
  margin-bottom: 1rem;
`;

const ComparisonList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  text-align: left;
`;

const ComparisonItem = styled.li`
  font-size: 1rem;
  margin-bottom: 0.8rem;
  padding-left: 1.2rem;
  position: relative;
  color: ${colors.black};
  &:before {
    content: '•';
    color: ${colors.midGrey};
    position: absolute;
    left: 0;
    font-size: 1.2rem;
    top: 0.1rem;
  }
`;

const VideoSection = styled(GlassSection)`
  text-align: center;
`;

const VideoPlaceholder = styled.div`
  width: 100%;
  max-width: 600px;
  height: 340px;
  background: ${colors.glassDark};
  border-radius: 18px;
  margin: 0 auto 2rem auto;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${colors.white};
  font-size: 2rem;
  font-weight: 700;
  opacity: 0.85;
  box-shadow: 0 2px 16px rgba(24,26,27,0.12);
  backdrop-filter: blur(8px);
`;

const Testimonials = styled(GlassSection)`
  text-align: center;
`;

const TestimonialList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  justify-content: center;
  margin-top: 2.5rem;
`;

const Testimonial = styled.div`
  background: ${colors.glass};
  border-radius: 16px;
  padding: 2rem 1.5rem;
  max-width: 320px;
  min-width: 220px;
  flex: 1 1 220px;
  box-shadow: 0 2px 12px rgba(24,26,27,0.08);
  color: ${colors.black};
  backdrop-filter: blur(8px);
  transition: transform 0.18s cubic-bezier(0.4,0,0.2,1), box-shadow 0.18s cubic-bezier(0.4,0,0.2,1);
  animation: ${fadeInUp} 1.1s both;
  will-change: transform;
  &:hover, &:focus {
    transform: scale(1.025) translateY(-2px);
    box-shadow: 0 8px 32px 0 rgba(24,26,27,0.16);
  }
`;

const TestimonialName = styled.div`
  font-weight: 700;
  margin-top: 1.2rem;
`;

const Footer = styled.footer`
  background: ${colors.black};
  color: ${colors.white};
  padding: 2.5rem 1.5rem 2rem 1.5rem;
  text-align: center;
  font-size: 1rem;
`;

const FooterLinks = styled.div`
  margin: 1.2rem 0 0 0;
  display: flex;
  justify-content: center;
  gap: 2rem;
  flex-wrap: wrap;
`;

const FooterLink = styled.a`
  color: ${colors.white};
  text-decoration: none;
  font-weight: 600;
  opacity: 0.8;
  &:hover {
    text-decoration: underline;
    opacity: 1;
  }
`;

// Add new styled-components for the interactive demo and walkthrough section
const DemoSection = styled.section`
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
  align-items: stretch;
  justify-content: center;
  max-width: 1100px;
  margin: 3rem auto 0 auto;
  padding: 2.5rem 1.5rem;
  background: ${colors.glass};
  border-radius: 24px;
  box-shadow: 0 8px 32px 0 rgba(24,26,27,0.12);
  backdrop-filter: blur(12px);
  @media (min-width: 900px) {
    flex-direction: row;
    align-items: flex-start;
    gap: 3.5rem;
  }
`;

const DemoWidget = styled.div`
  flex: 1 1 340px;
  background: ${colors.white};
  border-radius: 18px;
  box-shadow: 0 2px 12px rgba(24,26,27,0.08);
  padding: 2rem 1.5rem 2.5rem 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  min-width: 0;
`;

const DemoTitle = styled.h3`
  font-size: 1.3rem;
  font-weight: 700;
  margin-bottom: 1.2rem;
`;

const DemoInput = styled.textarea`
  border: 1.5px solid ${colors.lightGrey};
  border-radius: 10px;
  padding: 0.9rem 1rem;
  font-size: 1.1rem;
  min-height: 60px;
  resize: none;
  margin-bottom: 1rem;
  background: #fafbfc;
  color: ${colors.black};
  transition: border 0.18s;
  &:focus {
    border-color: ${colors.midGrey};
    outline: none;
  }
`;

const DemoButton = styled.button`
  background: ${colors.black};
  color: ${colors.white};
  border: none;
  border-radius: 999px;
  padding: 0.8rem 2rem;
  font-size: 1.1rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  cursor: pointer;
  box-shadow: 0 2px 12px rgba(24,26,27,0.10);
  transition: background 0.2s, color 0.2s, transform 0.18s cubic-bezier(0.4,0,0.2,1);
  &:hover, &:focus {
    background: ${colors.midGrey};
    color: ${colors.white};
    transform: scale(1.045);
  }
`;

const DemoOutput = styled.div<{visible: boolean}>`
  margin-top: 1.2rem;
  background: ${colors.glass};
  border-radius: 10px;
  padding: 1.1rem 1rem;
  font-size: 1.08rem;
  color: ${colors.black};
  min-height: 48px;
  box-shadow: 0 1px 6px rgba(24,26,27,0.06);
  opacity: ${props => props.visible ? 1 : 0};
  transform: translateY(${props => props.visible ? '0' : '16px'});
  transition: opacity 0.5s, transform 0.5s;
`;

const Walkthrough = styled.div`
  flex: 1 1 340px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  min-width: 0;
`;

const WalkthroughImg = styled.div`
  width: 100%;
  max-width: 340px;
  height: 220px;
  background: linear-gradient(120deg, #e5e7eb 0%, #fafbfc 100%);
  border-radius: 16px;
  margin-bottom: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  color: ${colors.midGrey};
  box-shadow: 0 2px 12px rgba(24,26,27,0.08);
  opacity: 0.92;
`;

const WalkthroughCaption = styled.div`
  font-size: 1.08rem;
  color: ${colors.midGrey};
  text-align: center;
`;

// Placeholder Image Components
const PlaceholderImage = styled.div`
  width: 100%;
  height: 200px;
  background: linear-gradient(135deg, #f0f0f0 0%, #e0e0e0 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  font-weight: 500;
  border: 2px dashed #ccc;
  margin: 1rem 0;
`;

const HeroImage = styled(PlaceholderImage)`
  height: 300px;
  background: linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%);
  color: #fff;
  border: 2px dashed #444;
`;

const ComparisonImage = styled(PlaceholderImage)`
  height: 250px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
`;

const TestimonialImage = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 1.2rem;
  margin: 0 auto 1rem auto;
`;

const IconContainer = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
  margin-bottom: 1rem;
`;

const ImageGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin: 2rem 0;
`;

const BeforeAfterContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin: 2rem 0;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const BeforeAfterCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  text-align: center;
`;

const BeforeAfterTitle = styled.h3`
  margin: 0 0 1rem 0;
  font-size: 1.2rem;
  font-weight: 600;
`;

const BeforeAfterImage = styled(PlaceholderImage)`
  height: 150px;
  margin: 1rem 0;
`;

// Visual Content Components
const ComparisonVisual = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  height: 300px;
  background: linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%);
  border-radius: 12px;
  padding: 1.5rem;
  color: white;
`;

const ComparisonSide = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 1rem;
  border-radius: 8px;
  background: rgba(255,255,255,0.1);
`;

const VisualComparisonTitle = styled.h3`
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
  font-weight: 600;
`;

const VisualComparisonList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.4;
`;

const VisualComparisonItem = styled.li`
  margin: 0.5rem 0;
  opacity: 0.8;
`;

const ProcessStep = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 1.5rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  height: 200px;
`;

const StepIcon = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
  margin-bottom: 1rem;
`;

const VisualStepTitle = styled.h4`
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
  font-weight: 600;
`;

const StepDescription = styled.p`
  margin: 0;
  font-size: 0.9rem;
  color: #666;
  line-height: 1.4;
`;

const BeforeAfterVisual = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.5rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  height: 150px;
  justify-content: center;
`;

const BeforeAfterIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.2rem;
  margin-bottom: 1rem;
`;

const BeforeAfterText = styled.div`
  text-align: center;
  font-size: 0.9rem;
  line-height: 1.4;
`;

const IncomeChart = styled.div`
  display: flex;
  align-items: end;
  justify-content: center;
  gap: 0.5rem;
  height: 100px;
  margin: 1.5rem 0 0.5rem 0;
  padding: 1rem;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 12px;
`;

const ChartBar = styled.div<{ height: number; color: string }>`
  width: 24px;
  height: ${props => props.height}px;
  background: linear-gradient(135deg, ${props => props.color} 0%, ${props => props.color}dd 100%);
  border-radius: 6px 6px 0 0;
  position: relative;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
  
  &:hover {
    transform: scale(1.1);
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  }
  
  &::after {
    content: '$${props => props.height === 75 ? '1.5k' : props.height === 60 ? '1.2k' : props.height === 50 ? '800' : '600'}';
    position: absolute;
    bottom: -25px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 0.8rem;
    font-weight: 700;
    color: #333;
    background: white;
    padding: 0.2rem 0.5rem;
    border-radius: 4px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }
`;

// Profile Images - Using realistic placeholder images
const ProfileImage = styled.img`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
  margin: 0 auto 1rem auto;
  display: block;
  border: 2px solid #fff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
`;

const WebLandingPage: React.FC = () => {
  const navigate = useNavigate();
  const howItWorksRef = React.useRef<HTMLDivElement>(null);
  const [demoInput, setDemoInput] = React.useState("");
  const [demoOutput, setDemoOutput] = React.useState("");
  const [demoOutputVisible, setDemoOutputVisible] = React.useState(false);

  function handleStartForFree() {
    // Reset app state in localStorage (if used)
    window.localStorage.removeItem('appState');
    // Optionally, dispatch a custom event or call a context reset if available
    // window.dispatchEvent(new Event('resetAppState'));
    navigate('/app');
  }

  function handleSeeHowItWorks() {
    if (howItWorksRef.current) {
      howItWorksRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }

  function handleDemoClarify() {
    setDemoOutputVisible(false);
    setTimeout(() => {
      setDemoOutput(
        demoInput.trim()
          ? `Side Hustle Ideas for: ${demoInput.trim()}\n\n• Content Writing: $300-800/month\n• Virtual Assistant: $400-1200/month\n• Social Media Management: $500-1500/month\n\nAll fit your 2-hour daily schedule and writing skills!`
          : `Side Hustle Ideas for: Writing skills + 2 hours/day\n\n• Content Writing: $300-800/month\n• Virtual Assistant: $400-1200/month\n• Social Media Management: $500-1500/month\n\nAll fit your 2-hour daily schedule and writing skills!`
      );
      setDemoOutputVisible(true);
    }, 350);
  }

  return (
    <>
      <GlobalStyle />
      <Page>
        {/* Hero Section */}
        <Hero>
          <HeroGlassyBg />
          <HeroContent>
            <LogoImg src={logoImg} alt="Tool Thinker Logo" />
            <Tagline>Stop Guessing, Start Earning</Tagline>
            <SubTagline>AI-Powered Side Hustle Ideas That Actually Work</SubTagline>
            <HeroText>
              Tired of generic "start a blog" advice? Get personalized side hustle ideas based on your location, skills, and schedule. Our AI analyzes your local market to suggest profitable opportunities you can start this weekend.
            </HeroText>
            <CTAButton onClick={handleStartForFree}>Start for Free</CTAButton>
            <SecondaryButton onClick={handleSeeHowItWorks}>See How It Works</SecondaryButton>
          </HeroContent>
        </Hero>
        
        {/* Hero Visual - Moved below */}
        <ComparisonVisual style={{ marginTop: '-2rem', marginBottom: '2rem' }}>
          <ComparisonSide>
            <VisualComparisonTitle>❌ Generic Advice</VisualComparisonTitle>
            <VisualComparisonList>
              <VisualComparisonItem>• "Start a blog"</VisualComparisonItem>
              <VisualComparisonItem>• "Become a freelancer"</VisualComparisonItem>
              <VisualComparisonItem>• "Start dropshipping"</VisualComparisonItem>
              <VisualComparisonItem>• Vague promises</VisualComparisonItem>
            </VisualComparisonList>
          </ComparisonSide>
          <ComparisonSide>
            <VisualComparisonTitle>✅ Tool Thinker</VisualComparisonTitle>
            <VisualComparisonList>
              <VisualComparisonItem>• Pet sitting in Austin: $1,200/month</VisualComparisonItem>
              <VisualComparisonItem>• Social media for restaurants: $1,500/month</VisualComparisonItem>
              <VisualComparisonItem>• Tutoring students: $800/month</VisualComparisonItem>
              <VisualComparisonItem>• Real local opportunities</VisualComparisonItem>
            </VisualComparisonList>
          </ComparisonSide>
        </ComparisonVisual>

        {/* Social Proof */}
        <SocialProofSection>
          <SocialProofText>Join 2,000+ side hustlers who found their perfect opportunity</SocialProofText>
                      <SocialLogos>
                          <SocialLogo>
              <ProfileImage src="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=120&h=120&fit=crop&crop=face" alt="Sarah M" />
              <div style={{ fontWeight: '700', fontSize: '1.1rem', marginBottom: '0.5rem' }}>Sarah M.</div>
              <div style={{ color: '#666', marginBottom: '1rem' }}>Pet Sitting</div>
              <IncomeChart>
                <ChartBar height={60} color="#28a745" />
              </IncomeChart>
            </SocialLogo>
            <SocialLogo>
              <ProfileImage src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&crop=face" alt="Mike T" />
              <div style={{ fontWeight: '700', fontSize: '1.1rem', marginBottom: '0.5rem' }}>Mike T.</div>
              <div style={{ color: '#666', marginBottom: '1rem' }}>Virtual Assistant</div>
              <IncomeChart>
                <ChartBar height={50} color="#007bff" />
              </IncomeChart>
            </SocialLogo>
            <SocialLogo>
              <ProfileImage src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&h=120&fit=crop&crop=face" alt="Lisa K" />
              <div style={{ fontWeight: '700', fontSize: '1.1rem', marginBottom: '0.5rem' }}>Lisa K.</div>
              <div style={{ color: '#666', marginBottom: '1rem' }}>Social Media</div>
              <IncomeChart>
                <ChartBar height={75} color="#ffc107" />
              </IncomeChart>
            </SocialLogo>
            <SocialLogo>
              <ProfileImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&h=120&fit=crop&crop=face" alt="David R" />
              <div style={{ fontWeight: '700', fontSize: '1.1rem', marginBottom: '0.5rem' }}>David R.</div>
              <div style={{ color: '#666', marginBottom: '1rem' }}>Tutoring</div>
              <IncomeChart>
                <ChartBar height={40} color="#6f42c1" />
              </IncomeChart>
            </SocialLogo>
            </SocialLogos>
        </SocialProofSection>

        {/* Interactive Demo & Walkthrough */}
        <DemoSection>
          <DemoWidget>
            <DemoTitle>See How It Works in 30 Seconds</DemoTitle>
            <DemoInput
              placeholder="What are you good at? How much time do you have? (e.g. 'I'm good at writing, live in Austin, have 2 hours a day, want $500/month')"
              value={demoInput}
              onChange={e => setDemoInput(e.target.value)}
              rows={3}
            />
            <DemoButton onClick={handleDemoClarify}>Get Personalized Ideas</DemoButton>
            <DemoOutput visible={demoOutputVisible}>
              {demoOutputVisible && demoOutput}
            </DemoOutput>
          </DemoWidget>
          <Walkthrough>
            <WalkthroughImg>
              <Player
                autoplay
                loop
                animationData={walkthroughAnimation}
                style={{ width: '100%', maxWidth: 320, height: 200 }}
              />
            </WalkthroughImg>
            <WalkthroughCaption>See how Tool Thinker works in 30 seconds</WalkthroughCaption>
          </Walkthrough>
        </DemoSection>

        {/* Before/After Comparison */}
        <GlassSection>
          <h2>Generic Advice vs. Tool Thinker Results</h2>
          <BeforeAfterContainer>
            <BeforeAfterCard>
              <BeforeAfterTitle>❌ Generic Advice</BeforeAfterTitle>
              <BeforeAfterVisual>
                <BeforeAfterIcon style={{ background: '#dc3545' }}>❌</BeforeAfterIcon>
                <BeforeAfterText>
                  "Start a blog and monetize it"<br/>
                  "Become a freelancer"<br/>
                  "Start dropshipping"
                </BeforeAfterText>
              </BeforeAfterVisual>
            </BeforeAfterCard>
            <BeforeAfterCard>
              <BeforeAfterTitle>✅ Tool Thinker Results</BeforeAfterTitle>
              <BeforeAfterVisual>
                <BeforeAfterIcon style={{ background: '#28a745' }}>✅</BeforeAfterIcon>
                <BeforeAfterText>
                  "Pet sitting in Austin: $1,200/month"<br/>
                  "Social media for restaurants: $1,500/month"<br/>
                  "Tutoring students: $800/month"
                </BeforeAfterText>
              </BeforeAfterVisual>
            </BeforeAfterCard>
          </BeforeAfterContainer>
        </GlassSection>

        {/* How It Works */}
        <HowItWorks ref={howItWorksRef}>
          <h2>Why Tool Thinker Works Better Than Generic Advice</h2>
          <Steps>
            <Step>
              <StepNumber>1</StepNumber>
              <StepTitle>Personalized to Your Location</StepTitle>
              <StepText>We analyze your local market to find opportunities that actually exist in your area, not generic online advice.</StepText>
            </Step>
            <Step>
              <StepNumber>2</StepNumber>
              <StepTitle>Matched to Your Reality</StepTitle>
              <StepText>We consider your actual schedule, income goals, and existing skills—no unrealistic "quit your job" advice.</StepText>
            </Step>
            <Step>
              <StepNumber>3</StepNumber>
              <StepTitle>Ready-to-Launch Ideas</StepTitle>
              <StepText>Get specific business ideas with real customer problems and solutions you can start implementing today.</StepText>
            </Step>
          </Steps>
          
          {/* Process Visualization */}
          <ImageGrid>
            <ProcessStep>
              <StepIcon>📍</StepIcon>
              <VisualStepTitle>Enter Your Details</VisualStepTitle>
              <StepDescription>
                Tell us your location, skills, and schedule. We analyze your local market for opportunities.
              </StepDescription>
            </ProcessStep>
            <ProcessStep>
              <StepIcon>🤖</StepIcon>
              <VisualStepTitle>AI Analysis</VisualStepTitle>
              <StepDescription>
                Our AI finds real opportunities in your area that match your skills and schedule.
              </StepDescription>
            </ProcessStep>
            <ProcessStep>
              <StepIcon>💡</StepIcon>
              <VisualStepTitle>Get Results</VisualStepTitle>
              <StepDescription>
                Receive specific business ideas with real income potential and customer problems to solve.
              </StepDescription>
            </ProcessStep>
          </ImageGrid>
        </HowItWorks>

        {/* Benefits */}
        <Benefits>
          <h2>Why Tool Thinker Works When Other Methods Fail</h2>
          <BenefitsList>
            <Benefit>
              <IconContainer>🚫</IconContainer>
              <Check>✓</Check>No more generic "start a blog" advice
            </Benefit>
            <Benefit>
              <IconContainer>📍</IconContainer>
              <Check>✓</Check>Ideas that actually exist in your area
            </Benefit>
            <Benefit>
              <IconContainer>💰</IconContainer>
              <Check>✓</Check>Realistic income expectations
            </Benefit>
            <Benefit>
              <IconContainer>🎯</IconContainer>
              <Check>✓</Check>Start with skills you already have
            </Benefit>
            <Benefit>
              <IconContainer>⏰</IconContainer>
              <Check>✓</Check>No quitting your day job required
            </Benefit>
            <Benefit>
              <IconContainer>🔍</IconContainer>
              <Check>✓</Check>Specific customer problems to solve
            </Benefit>
            <Benefit>
              <IconContainer>🚀</IconContainer>
              <Check>✓</Check>Ready-to-implement solutions
            </Benefit>
            <Benefit>
              <IconContainer>✅</IconContainer>
              <Check>✓</Check>Local market validation built-in
            </Benefit>
          </BenefitsList>
        </Benefits>

        {/* Comparison */}
        <Comparison>
          <h2>Tool Thinker vs. Generic Side Hustle Advice</h2>
          <ComparisonTable>
            <ComparisonCol>
              <ComparisonTitle>Tool Thinker</ComparisonTitle>
              <ComparisonList>
                <ComparisonItem>Personalized to your location & skills</ComparisonItem>
                <ComparisonItem>Realistic income expectations</ComparisonItem>
                <ComparisonItem>Specific customer problems to solve</ComparisonItem>
                <ComparisonItem>Ready-to-implement solutions</ComparisonItem>
              </ComparisonList>
            </ComparisonCol>
            <ComparisonCol>
              <ComparisonTitle>Generic Advice</ComparisonTitle>
              <ComparisonList>
                <ComparisonItem>"Start a blog" (everyone says this)</ComparisonItem>
                <ComparisonItem>Unrealistic income promises</ComparisonItem>
                <ComparisonItem>Vague "find a problem" advice</ComparisonItem>
                <ComparisonItem>No specific next steps</ComparisonItem>
              </ComparisonList>
            </ComparisonCol>
          </ComparisonTable>
        </Comparison>

        {/* Video Section */}
        <VideoSection>
          <h2>See Side Hustle Finder in Action</h2>
          <VideoPlaceholder>Video Demo Coming Soon</VideoPlaceholder>
                          <p>Watch how easy it is to find and launch your perfect side hustle in minutes.</p>
        </VideoSection>

        {/* Testimonials */}
        <Testimonials>
          <h2>Real Results from Real Side Hustlers</h2>
          <TestimonialList>
            <Testimonial>
              <ProfileImage src="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=120&h=120&fit=crop&crop=face" alt="Sarah M" />
              "Finally! No more 'start a blog' advice. Tool Thinker found me a pet-sitting business that makes $1,200/month in my neighborhood."
              <TestimonialName>— Sarah, Office Manager</TestimonialName>
            </Testimonial>
            <Testimonial>
              <ProfileImage src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&crop=face" alt="Mike T" />
              "I was skeptical, but the AI found 3 local businesses that needed social media help. Now I'm making $1,500/month on weekends."
              <TestimonialName>— Mike, Teacher</TestimonialName>
            </Testimonial>
            <Testimonial>
              <ProfileImage src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&h=120&fit=crop&crop=face" alt="Lisa K" />
              "The location-based suggestions are gold. I found tutoring opportunities in my area that I never knew existed."
              <TestimonialName>— Lisa, Software Developer</TestimonialName>
            </Testimonial>
          </TestimonialList>
        </Testimonials>

        {/* Footer */}
        <Footer>
          <div>© {new Date().getFullYear()} Tool Thinker. All rights reserved.</div>
          <FooterLinks>
            <FooterLink href="#">About</FooterLink>
            <FooterLink href="#">Blog</FooterLink>
            <FooterLink href="#">Contact</FooterLink>
            <FooterLink href="#">Privacy</FooterLink>
          </FooterLinks>
        </Footer>
      </Page>
    </>
  );
};

export default WebLandingPage; 