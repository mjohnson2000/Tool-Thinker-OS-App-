import React from 'react';
import styled, { createGlobalStyle, keyframes } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import logoImg from '../assets/logo.png';
import moneyJourneyImg from '../assets/Money Journey.png';
import Player from 'lottie-react';
import walkthroughAnimation from '../assets/walkthrough.json';

// Color palette matching the app's design
const colors = {
  primary: '#181a1b',
  primaryDark: '#000',
  secondary: '#4a4a4a',
  success: '#10b981',
  danger: '#ef4444',
  dark: '#181a1b',
  darker: '#000',
  light: '#f5f5f7',
  white: '#ffffff',
  gray: {
    50: '#fafbfc',
    100: '#f8f9fa',
    200: '#e5e5e5',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#666',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
  gradient: {
    primary: 'linear-gradient(135deg, #181a1b 0%, #2d2d2d 100%)',
    secondary: 'linear-gradient(135deg, #000 0%, #181a1b 100%)',
    dark: 'linear-gradient(135deg, #181a1b 0%, #4a4a4a 100%)',
    light: 'linear-gradient(135deg, #f5f5f7 0%, #ffffff 100%)',
  }
};

const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Audiowide&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=Source+Sans+Pro:ital,wght@0,400;0,600;1,400&display=swap');
  
  * {
    box-sizing: border-box;
  }
  
  body {
    font-family: 'Source Sans Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    margin: 0;
    padding: 0;
    color: var(--text-primary);
    background: ${colors.light};
    line-height: 1.6;
  }
  
  h1, h2, h3, h4, h5, h6 {
    font-family: 'Audiowide', cursive;
    font-weight: 400;
    line-height: 1.2;
    margin: 0 0 1rem 0;
    letter-spacing: 0.02em;
  }
  
  p {
    margin: 0 0 1rem 0;
  }
`;

const Page = styled.div`
  min-height: 100vh;
  overflow-x: hidden;
`;

// Animations
const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
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

const slideInLeft = keyframes`
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const slideInRight = keyframes`
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

// Header
const Header = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid ${colors.gray[200]};
  padding: 1rem 0;
  transition: all 0.3s ease;
`;

const HeaderContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  
  img {
    width: 60px;
    height: 60px;
    border-radius: 12px;
  }
  
  span {
    font-weight: 700;
    font-size: 1.5rem;
    color: ${colors.dark};
  }
`;

const Nav = styled.nav`
  display: flex;
  align-items: center;
  gap: 2rem;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const NavLink = styled.a`
  color: ${colors.gray[600]};
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s ease;
  
  &:hover {
    color: ${colors.primary};
  }
`;

const HeaderButton = styled.button`
  background: ${colors.gradient.primary};
  color: ${colors.white};
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(99, 102, 241, 0.3);
  }
`;

// Hero Section
const Hero = styled.section`
  padding: 8rem 2rem 6rem 2rem;
  background: linear-gradient(135deg, rgba(24,26,27,0.5) 0%, rgba(24,26,27,0.4) 100%), 
              url('/src/assets/money-woman.jpg') center/cover;
  position: relative;
  overflow: hidden;
  color: ${colors.white};
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(24,26,27,0.7) 0%, rgba(24,26,27,0.5) 50%, rgba(24,26,27,0.8) 100%);
    opacity: 1;
  }
`;

const HeroContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
  position: relative;
  z-index: 1;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    text-align: center;
  }
`;

const HeroContent = styled.div`
  animation: ${slideInLeft} 1s ease-out;
`;

const HeroBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: ${colors.white};
  color: ${colors.primary};
  padding: 0.5rem 1rem;
  border-radius: 50px;
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  
  &::before {
    content: '✨';
    font-size: 1rem;
  }
`;

const HeroTitle = styled.h1`
  font-size: 3.5rem;
  font-weight: 400;
  color: ${colors.white};
  margin-bottom: 1.5rem;
  line-height: 1.1;
  
  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

const HeroSubtitle = styled.p`
  font-size: 2rem;
  color: ${colors.gray[200]};
  margin-bottom: 2rem;
  line-height: 1.6;
  font-weight: 500;
`;

const HeroButtons = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    justify-content: center;
  }
`;

const PrimaryButton = styled.button`
  background: ${colors.white};
  color: ${colors.primary};
  border: none;
  border-radius: 12px;
  padding: 1rem 2rem;
  font-size: 1.125rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(24, 26, 27, 0.2);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(24, 26, 27, 0.3);
  }
`;

const SecondaryButton = styled.button`
  background: transparent;
  color: ${colors.white};
  border: 2px solid ${colors.white};
  border-radius: 12px;
  padding: 1rem 2rem;
  font-size: 1.125rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${colors.white};
    color: ${colors.primary};
    transform: translateY(-2px);
  }
`;

const HeroVisual = styled.div`
  animation: ${slideInRight} 1s ease-out;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: -20px;
    right: -20px;
    width: 200px;
    height: 200px;
    background: ${colors.gradient.primary};
    border-radius: 50%;
    opacity: 0.1;
    animation: ${float} 6s ease-in-out infinite;
  }
`;

const HeroImage = styled.div`
  width: 100%;
  height: 400px;
  background: ${colors.white};
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${colors.primary};
  font-size: 1.5rem;
  font-weight: 600;
  box-shadow: 0 20px 40px rgba(24, 26, 27, 0.2);
  position: relative;
  overflow: hidden;
  border: 2px solid ${colors.gray[200]};
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(45deg, transparent 30%, rgba(24,26,27,0.05) 50%, transparent 70%);
    animation: shimmer 3s ease-in-out infinite;
  }
  
  @keyframes shimmer {
    0%, 100% { transform: translateX(-100%); }
    50% { transform: translateX(100%); }
  }
`;

// Features Section
const Features = styled.section`
  padding: 6rem 2rem;
  background: ${colors.light};
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const SectionHeader = styled.div`
  text-align: center;
  margin-bottom: 4rem;
  animation: ${fadeInUp} 1s ease-out;
`;

const SectionTitle = styled.h2`
  font-size: 2.5rem;
  font-weight: 800;
  color: ${colors.dark};
  margin-bottom: 1rem;
`;

const SectionSubtitle = styled.p`
  font-size: 1.125rem;
  color: ${colors.gray[600]};
  max-width: 600px;
  margin: 0 auto;
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 3rem;
`;

const FeatureCard = styled.div`
  background: ${colors.white};
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid ${colors.gray[200]};
  transition: all 0.3s ease;
  animation: ${fadeInUp} 1s ease-out;
  
  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  }
`;

const FeatureIcon = styled.div`
  width: 60px;
  height: 60px;
  background: ${colors.gradient.primary};
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${colors.white};
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
`;

const FeatureTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 700;
  color: ${colors.dark};
  margin-bottom: 1rem;
`;

const FeatureDescription = styled.p`
  color: ${colors.gray[600]};
  line-height: 1.6;
`;

// Stats Section
const Stats = styled.section`
  padding: 4rem 2rem;
  background: ${colors.gradient.primary};
  color: ${colors.white};
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const StatCard = styled.div`
  text-align: center;
  animation: ${fadeInUp} 1s ease-out;
`;

const StatNumber = styled.div`
  font-size: 3rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
  background: ${colors.white};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const StatLabel = styled.div`
  font-size: 1.125rem;
  color: ${colors.gray[300]};
  font-weight: 500;
`;

// Demo Section
const Demo = styled.section`
  padding: 6rem 2rem;
  background: ${colors.white};
`;

const DemoContainer = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const DemoContent = styled.div`
  animation: ${slideInLeft} 1s ease-out;
`;

const DemoTitle = styled.h2`
  font-size: 2.5rem;
  font-weight: 800;
  color: ${colors.dark};
  margin-bottom: 1.5rem;
`;

const DemoDescription = styled.p`
  font-size: 1.125rem;
  color: ${colors.gray[600]};
  margin-bottom: 2rem;
  line-height: 1.6;
`;

const DemoForm = styled.div`
  background: ${colors.white};
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
`;

const DemoInput = styled.textarea`
  width: 100%;
  border: 2px solid ${colors.gray[200]};
  border-radius: 12px;
  padding: 1rem;
  font-size: 1rem;
  margin-bottom: 1rem;
  resize: vertical;
  min-height: 100px;
  transition: border-color 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: ${colors.primary};
  }
`;

const DemoButton = styled.button`
  background: ${colors.gradient.primary};
  color: ${colors.white};
  border: none;
  border-radius: 12px;
  padding: 1rem 2rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(99, 102, 241, 0.3);
  }
`;

const DemoOutput = styled.div<{ visible: boolean }>`
  margin-top: 1rem;
  padding: 1rem;
  background: ${colors.gray[100]};
  border-radius: 8px;
  font-size: 0.875rem;
  color: ${colors.dark};
  white-space: pre-line;
  opacity: ${props => props.visible ? 1 : 0};
  transform: translateY(${props => props.visible ? '0' : '10px'});
  transition: all 0.3s ease;
`;

const DemoVisual = styled.div`
  animation: ${slideInRight} 1s ease-out;
  text-align: center;
`;

const DemoImage = styled.div`
  width: 100%;
  height: 300px;
  background: ${colors.gradient.primary};
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${colors.white};
  font-size: 1.25rem;
  font-weight: 600;
  box-shadow: 0 20px 40px rgba(99, 102, 241, 0.2);
`;

// Testimonials Section
const Testimonials = styled.section`
  padding: 6rem 2rem;
  background: ${colors.light};
`;

const TestimonialsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 3rem;
`;

const TestimonialCard = styled.div`
  background: ${colors.white};
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid ${colors.gray[200]};
  transition: all 0.3s ease;
  animation: ${fadeInUp} 1s ease-out;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1);
  }
`;

const TestimonialContent = styled.p`
  font-size: 1.125rem;
  color: ${colors.gray[700]};
  margin-bottom: 1.5rem;
  line-height: 1.6;
  font-style: italic;
`;

const TestimonialAuthor = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const AuthorAvatar = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: ${colors.gradient.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${colors.white};
  font-weight: 600;
`;

const AuthorInfo = styled.div`
  flex: 1;
`;

const AuthorName = styled.div`
  font-weight: 600;
  color: ${colors.dark};
`;

const AuthorRole = styled.div`
  font-size: 0.875rem;
  color: ${colors.gray[600]};
`;

// CTA Section
const CTA = styled.section`
  padding: 6rem 2rem;
  background: ${colors.gradient.primary};
  color: ${colors.white};
  text-align: center;
`;

const CTAContent = styled.div`
  max-width: 600px;
  margin: 0 auto;
  animation: ${fadeInUp} 1s ease-out;
`;

const CTATitle = styled.h2`
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 1.5rem;
`;

const CTADescription = styled.p`
  font-size: 1.125rem;
  margin-bottom: 2rem;
  opacity: 0.9;
`;

const CTAButton = styled.button`
  background: ${colors.white};
  color: ${colors.primary};
  border: none;
  border-radius: 12px;
  padding: 1rem 2.5rem;
  font-size: 1.125rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(255, 255, 255, 0.3);
  }
`;

// Footer
const Footer = styled.footer`
  background: ${colors.primary};
  color: ${colors.white};
  padding: 3rem 2rem 2rem 2rem;
`;

const FooterContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
`;

const FooterSection = styled.div`
  h3 {
    font-weight: 600;
    margin-bottom: 1rem;
  }
  
  a {
    color: ${colors.gray[400]};
    text-decoration: none;
    display: block;
    margin-bottom: 0.5rem;
    transition: color 0.2s ease;
    
    &:hover {
      color: ${colors.white};
    }
  }
`;

const FooterBottom = styled.div`
  border-top: 1px solid ${colors.gray[800]};
  margin-top: 2rem;
  padding-top: 2rem;
  text-align: center;
  color: ${colors.gray[400]};
`;

const WebLandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [demoInput, setDemoInput] = React.useState("");
  const [demoOutput, setDemoOutput] = React.useState("");
  const [demoOutputVisible, setDemoOutputVisible] = React.useState(false);

  function handleStartForFree() {
    window.localStorage.removeItem('appState');
    navigate('/app');
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
        {/* Header */}
        <Header>
          <HeaderContainer>
            <Logo>
              <img src={logoImg} alt="Tool Thinker" />
              <span>Tool Thinker</span>
            </Logo>
            <Nav>
              <NavLink href="#features">Features</NavLink>
              <NavLink href="#demo">Demo</NavLink>
              <NavLink href="#testimonials">Testimonials</NavLink>
            </Nav>
            <HeaderButton onClick={handleStartForFree}>Get Started</HeaderButton>
          </HeaderContainer>
        </Header>

        {/* Hero Section */}
        <Hero>
          <HeroContainer>
            <HeroContent>
              <HeroBadge>AI-Powered Side Hustle Discovery</HeroBadge>
              <HeroTitle>
                Need Extra Money?
              </HeroTitle>
              <HeroSubtitle>
                Turn Your Idea In A Side Hustle Business
              </HeroSubtitle>
              <HeroButtons>
                <PrimaryButton onClick={handleStartForFree}>
                  Start for Free
                </PrimaryButton>
                <SecondaryButton>
                  Watch Demo
                </SecondaryButton>
              </HeroButtons>
            </HeroContent>
            <HeroVisual>
              <HeroImage>
                <img
                  src={moneyJourneyImg}
                  alt="Money Journey - Side Hustle Success"
                  style={{ 
                    width: '100%', 
                    height: '100%',
                    borderRadius: '20px',
                    objectFit: 'cover'
                  }}
                />
              </HeroImage>
            </HeroVisual>
          </HeroContainer>
        </Hero>

        {/* Stats Section */}
        <Stats>
          <Container>
            <StatsGrid>
              <StatCard>
                <StatNumber>2,000+</StatNumber>
                <StatLabel>Side Hustlers Helped</StatLabel>
              </StatCard>
              <StatCard>
                <StatNumber>$1,200</StatNumber>
                <StatLabel>Average Monthly Income</StatLabel>
              </StatCard>
              <StatCard>
                <StatNumber>94%</StatNumber>
                <StatLabel>Success Rate</StatLabel>
              </StatCard>
              <StatCard>
                <StatNumber>15min</StatNumber>
                <StatLabel>Average Setup Time</StatLabel>
              </StatCard>
            </StatsGrid>
          </Container>
        </Stats>

        {/* Features Section */}
        <Features id="features">
          <Container>
            <SectionHeader>
              <SectionTitle>Why Tool Thinker Works</SectionTitle>
              <SectionSubtitle>
                Unlike generic advice, we analyze your specific situation to find opportunities that actually work for you.
              </SectionSubtitle>
            </SectionHeader>
            <FeaturesGrid>
              <FeatureCard>
                <FeatureIcon>📍</FeatureIcon>
                <FeatureTitle>Location-Based Discovery</FeatureTitle>
                <FeatureDescription>
                  We analyze your local market to find opportunities that actually exist in your area, not generic online advice.
                </FeatureDescription>
              </FeatureCard>
              <FeatureCard>
                <FeatureIcon>⚡</FeatureIcon>
                <FeatureTitle>Skill-Matched Opportunities</FeatureTitle>
                <FeatureDescription>
                  Get ideas that match your existing skills and experience, so you can start earning faster.
                </FeatureDescription>
              </FeatureCard>
              <FeatureCard>
                <FeatureIcon>💰</FeatureIcon>
                <FeatureTitle>Realistic Income Expectations</FeatureTitle>
                <FeatureDescription>
                  See actual income ranges based on real market data, not unrealistic promises.
                </FeatureDescription>
              </FeatureCard>
              <FeatureCard>
                <FeatureIcon>🎯</FeatureIcon>
                <FeatureTitle>Ready-to-Launch Ideas</FeatureTitle>
                <FeatureDescription>
                  Get specific business ideas with real customer problems and solutions you can implement today.
                </FeatureDescription>
              </FeatureCard>
              <FeatureCard>
                <FeatureIcon>📅</FeatureIcon>
                <FeatureTitle>Schedule-Friendly Options</FeatureTitle>
                <FeatureDescription>
                  Find opportunities that fit your actual schedule, whether you have 2 hours or 20 hours per week.
                </FeatureDescription>
              </FeatureCard>
              <FeatureCard>
                <FeatureIcon>🛡️</FeatureIcon>
                <FeatureTitle>Risk-Free Start</FeatureTitle>
                <FeatureDescription>
                  Start with low-risk, low-cost opportunities that don't require quitting your day job.
                </FeatureDescription>
              </FeatureCard>
            </FeaturesGrid>
          </Container>
        </Features>

        {/* Demo Section */}
        <Demo id="demo">
          <Container>
            <DemoContainer>
              <DemoContent>
                <DemoTitle>See How It Works</DemoTitle>
                <DemoDescription>
                  Try our AI-powered side hustle finder. Tell us about your skills and situation, 
                  and we'll show you personalized opportunities.
                </DemoDescription>
                <DemoForm>
                  <DemoInput
                    placeholder="e.g., 'I'm good at writing, live in Austin, have 2 hours a day, want $500/month'"
                    value={demoInput}
                    onChange={e => setDemoInput(e.target.value)}
                  />
                  <DemoButton onClick={handleDemoClarify}>
                    Get Personalized Ideas
                  </DemoButton>
                  <DemoOutput visible={demoOutputVisible}>
                    {demoOutputVisible && demoOutput}
                  </DemoOutput>
                </DemoForm>
              </DemoContent>
              <DemoVisual>
                <DemoImage>
                  <Player
                    autoplay
                    loop
                    animationData={walkthroughAnimation}
                    style={{ width: '100%', height: '100%' }}
                  />
                </DemoImage>
              </DemoVisual>
            </DemoContainer>
          </Container>
        </Demo>

        {/* Testimonials Section */}
        <Testimonials id="testimonials">
          <Container>
            <SectionHeader>
              <SectionTitle>Real Results from Real People</SectionTitle>
              <SectionSubtitle>
                See how Tool Thinker helped others find their perfect side hustle.
              </SectionSubtitle>
            </SectionHeader>
            <TestimonialsGrid>
              <TestimonialCard>
                <TestimonialContent>
                  "Finally! No more 'start a blog' advice. Tool Thinker found me a pet-sitting business that makes $1,200/month in my neighborhood."
                </TestimonialContent>
                <TestimonialAuthor>
                  <AuthorAvatar>SM</AuthorAvatar>
                  <AuthorInfo>
                    <AuthorName>Sarah Mitchell</AuthorName>
                    <AuthorRole>Office Manager</AuthorRole>
                  </AuthorInfo>
                </TestimonialAuthor>
              </TestimonialCard>
              <TestimonialCard>
                <TestimonialContent>
                  "I was skeptical, but the AI found 3 local businesses that needed social media help. Now I'm making $1,500/month on weekends."
                </TestimonialContent>
                <TestimonialAuthor>
                  <AuthorAvatar>MT</AuthorAvatar>
                  <AuthorInfo>
                    <AuthorName>Mike Thompson</AuthorName>
                    <AuthorRole>Teacher</AuthorRole>
                  </AuthorInfo>
                </TestimonialAuthor>
              </TestimonialCard>
              <TestimonialCard>
                <TestimonialContent>
                  "The location-based suggestions are gold. I found tutoring opportunities in my area that I never knew existed."
                </TestimonialContent>
                <TestimonialAuthor>
                  <AuthorAvatar>LK</AuthorAvatar>
                  <AuthorInfo>
                    <AuthorName>Lisa Kim</AuthorName>
                    <AuthorRole>Software Developer</AuthorRole>
                  </AuthorInfo>
                </TestimonialAuthor>
              </TestimonialCard>
            </TestimonialsGrid>
          </Container>
        </Testimonials>

        {/* CTA Section */}
        <CTA>
          <CTAContent>
            <CTATitle>Ready to Find Your Side Hustle?</CTATitle>
            <CTADescription>
              Join thousands of people who've discovered their perfect opportunity. 
              Start your journey to financial freedom today.
            </CTADescription>
            <CTAButton onClick={handleStartForFree}>
              Start for Free Now
            </CTAButton>
          </CTAContent>
        </CTA>

        {/* Footer */}
        <Footer>
          <FooterContainer>
            <FooterSection>
              <h3>Tool Thinker</h3>
              <p>AI-powered side hustle discovery platform helping people find their perfect opportunity.</p>
            </FooterSection>
            <FooterSection>
              <h3>Product</h3>
              <a href="#features">Features</a>
              <a href="#demo">Demo</a>
              <a href="#testimonials">Testimonials</a>
            </FooterSection>
            <FooterSection>
              <h3>Support</h3>
              <a href="#">Help Center</a>
              <a href="#">Contact Us</a>
              <a href="#">Privacy Policy</a>
            </FooterSection>
            <FooterSection>
              <h3>Company</h3>
              <a href="#">About Us</a>
              <a href="#">Blog</a>
              <a href="#">Careers</a>
            </FooterSection>
          </FooterContainer>
          <FooterBottom>
            <p>&copy; 2024 Tool Thinker. All rights reserved.</p>
          </FooterBottom>
        </Footer>
      </Page>
    </>
  );
};

export default WebLandingPage; 