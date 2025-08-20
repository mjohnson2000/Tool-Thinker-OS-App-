import React from 'react';
import styled, { createGlobalStyle, keyframes } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

import logoImg from '../assets/logo.png';
import heroBg from '../assets/money-woman.jpg';
import howItWorksImg from '../assets/Howitworks1.png';
import { FeedbackWidget } from './common/FeedbackWidget';
import { TrendingIdeasCarousel } from './common/TrendingIdeasCarousel';
import { trackEvent } from '../utils/analytics';

/* Global base (fonts are linked in index.html via <link> tags) */
const GlobalStyle = createGlobalStyle`
  * { box-sizing: border-box; }
  body {
    margin: 0;
    color: #111;
    background: #f5f5f7;
    line-height: 1.6;
    font-family: 'Source Sans Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }
  h1, h2, h3 { margin: 0 0 1rem 0; line-height: 1.15; }
`;

/* Color palette */
const colors = {
  dark: '#181a1b',
  light: '#f5f5f7',
  white: '#fff',
  gray: {
    100: '#f4f5f7',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    800: '#1f2937',
  },
  gradient: {
    primary: 'linear-gradient(135deg, #181a1b 0%, #2d2d2d 100%)',
  },
};

/* Animations */
const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
`;
const slideInLeft = keyframes`
  from { opacity: 0; transform: translateX(-24px); }
  to   { opacity: 1; transform: translateX(0); }
`;
const slideInRight = keyframes`
  from { opacity: 0; transform: translateX(24px); }
  to   { opacity: 1; transform: translateX(0); }
`;

/* Layout */
const Page = styled.div`min-height: 100vh; overflow-x: hidden;`;

const Header = styled.header<{ scrolled?: boolean }>`
  position: fixed; top: 0; left: 0; right: 0; z-index: 1000;
  background: rgba(255,255,255,0.95); backdrop-filter: blur(10px);
  border-bottom: 1px solid ${colors.gray[200]};
  padding: ${({ scrolled }) => (scrolled ? '0.5rem' : '1rem')} 0;
  transition: padding .2s ease, box-shadow .2s ease;
  ${({ scrolled }) => scrolled ? 'box-shadow: 0 6px 18px rgba(0,0,0,.06);' : ''}
  
  @media (max-width: 768px) {
    padding: ${({ scrolled }) => (scrolled ? '0.4rem' : '0.8rem')} 0;
  }
`;
const HeaderContainer = styled.div`
  max-width: 1200px; margin: 0 auto; padding: 0 2rem;
  display: flex; align-items: center; justify-content: space-between;
  
  @media (max-width: 768px) {
    padding: 0 1rem;
    gap: 1rem;
  }
`;
const Logo = styled.div`
  display: flex; align-items: center; gap: .75rem;
  img { width: 56px; height: 56px; border-radius: 12px; }
  span { 
    font-family: 'Audiowide', 'Courier New', monospace; 
    font-size: 1.4rem; 
    color: ${colors.dark}; 
    font-weight: 400;
    font-display: swap;
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
`;

// SVG Logo Component
const LogoSVG = styled.svg`
  width: 48px;
  height: 48px;
  border-radius: 10px;
  background: linear-gradient(135deg, #181a1b 0%, #2d2d2d 100%);
  padding: 6px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
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

const MobileMenuButton = styled.button`
  display: none;
  background: none;
  border: none;
  padding: 0.5rem;
  border-radius: 8px;
  cursor: pointer;
  color: ${colors.dark};
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

const Nav = styled.nav`
  display: flex; align-items: center; gap: 1.5rem;
  a { color: ${colors.gray[600]}; text-decoration: none; font-weight: 600; }
  
  @media (max-width: 768px) {
    gap: 1rem;
    
    a {
      font-size: 0.9rem;
    }
  }
  
  @media (max-width: 480px) {
    gap: 0.8rem;
    
    a {
      font-size: 0.85rem;
    }
  }
`;

const MobileNav = styled.nav<{ $isOpen: boolean }>`
  display: none;
  
  @media (max-width: 768px) {
    display: ${({ $isOpen }) => $isOpen ? 'flex' : 'none'};
    position: fixed;
    top: 100%;
    left: 0;
    right: 0;
    background: rgba(255, 255, 255, 0.98);
    backdrop-filter: blur(10px);
    border-top: 1px solid ${colors.gray[200]};
    padding: 1rem;
    flex-direction: column;
    gap: 1rem;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    
    a {
      color: ${colors.gray[600]};
      text-decoration: none;
      font-weight: 600;
      padding: 0.5rem 0;
      border-bottom: 1px solid ${colors.gray[100]};
      
      &:last-child {
        border-bottom: none;
      }
    }
  }
`;

const DesktopNav = styled(Nav)`
  @media (max-width: 768px) {
    display: none;
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

/* Hero */
const Hero = styled.section`
  padding: 8.5rem 2rem 5rem 2rem;
  background:
    linear-gradient(135deg, rgba(24,26,27,0.55) 0%, rgba(24,26,27,0.45) 100%),
    url(${heroBg}) center/cover no-repeat;
  color: ${colors.white}; position: relative;
`;
const HeroContainer = styled.div`
  max-width: 1200px; margin: 0 auto;
  display: grid; grid-template-columns: 1fr 1fr; gap: 3rem; align-items: center;
  @media (max-width: 900px) { grid-template-columns: 1fr; text-align: left; }
`;
const HeroContent = styled.div`animation: ${slideInLeft} .7s ease both;`;
const Badge = styled.div`
  display: inline-flex; align-items: center; gap: .5rem;
  background: ${colors.white}; color: ${colors.dark}; padding: .35rem .7rem;
  border-radius: 999px; font-weight: 700; font-size: .85rem; margin-bottom: 1rem;
  &::before { content: '✨'; }
`;
const HeroTitle = styled.h1`
  font-family: 'Audiowide', 'Courier New', monospace;
  font-size: clamp(2.1rem, 5.5vw, 3.8rem);
  font-weight: 400; margin-bottom: .75rem;
`;
const HeroSubtitle = styled.p`
  font-size: clamp(1.05rem, 2.2vw, 1.35rem);
  color: ${colors.gray[100]}; margin: 0 0 1.25rem 0; font-weight: 600;
`;
const HeroButtons = styled.div`
  display: flex; gap: .8rem; flex-wrap: wrap;
`;
const PrimaryButton = styled.button`
  background: ${colors.white}; color: ${colors.dark};
  border: none; border-radius: 12px; padding: .9rem 1.4rem; font-weight: 800; cursor: pointer;
`;
const SecondaryButton = styled.button`
  background: transparent; color: ${colors.white};
  border: 2px solid ${colors.white}; border-radius: 12px; padding: .85rem 1.35rem; font-weight: 800; cursor: pointer;
`;

const HeroVisual = styled.div`animation: ${slideInRight} .7s ease both;`;
const HeroCard = styled.div`
  width: 100%;
  aspect-ratio: 16 / 10;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid ${colors.gray[200]};
  background: rgba(255,255,255,0.06);
  box-shadow: 0 14px 34px rgba(0,0,0,0.25);
  display: grid; place-items: center;
`;

/* Stats */
const Stats = styled.section`
  padding: 3.25rem 2rem;
  background: linear-gradient(180deg, #1a1c1d 0%, #0f1011 100%); color: ${colors.white};
`;
const StatsGrid = styled.div`
  max-width: 1200px; margin: 0 auto;
  display: grid; gap: 2rem; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
`;
const StatCard = styled.div`text-align: center; animation: ${fadeInUp} .6s ease both;`;
const StatNumber = styled.div`font-size: 2.6rem; font-weight: 900; margin-bottom: .25rem;`;
const StatLabel = styled.div`font-size: 1.05rem; color: ${colors.gray[200]}; opacity: .95;`;

/* Features */
const Section = styled.section`padding: 4.5rem 2rem; background: ${colors.light};`;
const SectionInner = styled.div`max-width: 1200px; margin: 0 auto;`;
const SectionTitle = styled.h2`
  font-family: 'Audiowide', 'Courier New', monospace; font-size: clamp(1.6rem, 3vw, 2.1rem);
  text-align: center; margin-bottom: .75rem; font-weight: 400;
`;
const SectionSubtitle = styled.p`
  text-align: center; color: ${colors.gray[600]}; max-width: 680px; margin: 0 auto 2.25rem auto; line-height: 1.75;
`;
const FeaturesGrid = styled.div`
  display: grid; gap: 1.5rem; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
`;
const FeatureCard = styled.div`
  background: ${colors.white}; border-radius: 14px; padding: 1.4rem; border: 1px solid ${colors.gray[200]};
  box-shadow: 0 6px 18px rgba(0,0,0,0.06);
`;
const FeatureTitle = styled.h3`margin-bottom: .4rem;`;

/* Demo */
const Demo = styled.section`padding: 4.5rem 2rem; background: ${colors.white};`;
const DemoWrap = styled.div`
  max-width: 1100px; margin: 0 auto; display: grid; gap: 2rem; grid-template-columns: 1fr 1fr;
  @media (max-width: 900px) { grid-template-columns: 1fr; }
`;
const DemoCard = styled.div`
  width: 100%;
  aspect-ratio: 16 / 10;
  background: ${colors.white};
  border: 1px solid ${colors.gray[200]};
  border-radius: 16px;
  box-shadow: 0 10px 28px rgba(0,0,0,0.08);
  overflow: hidden;
  display: grid; place-items: center;
  position: relative;
`;

/* New: Steps list and badge to match screenshot */
const StepsList = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.2rem;
`;
const StepCard = styled(FeatureCard)`
  padding: 1.25rem 1.2rem;
  border-radius: 12px;
`;
const StepTitle = styled.h3`
  margin: 0 0 .35rem 0;
  font-size: clamp(1.05rem, 2.2vw, 1.35rem);
  font-weight: 900;
`;
const StepText = styled.div`
  color: ${colors.gray[600]};
`;
const DemoBadge = styled.div`
  position: absolute; top: 14px; left: 14px;
  background: #111; color: #fff; border-radius: 999px;
  padding: .4rem .8rem; font-weight: 800; font-size: .95rem;
  box-shadow: 0 8px 22px rgba(0,0,0,0.18);
`;

/* CTA */
const CTA = styled.section`
  padding: 4rem 2rem; background: ${colors.gradient.primary}; color: ${colors.white}; text-align: center;
`;
const CTATitle = styled.h2`
  font-family: 'Audiowide', 'Courier New', monospace; font-size: clamp(1.6rem, 3vw, 2.1rem); margin-bottom: .8rem; font-weight: 400;
`;
const CTADesc = styled.p`opacity: .95; margin: 0 auto 1.2rem auto; max-width: 680px;`;

/* Footer (reused from App footer sitewide; landing no footer block) */

const WebLandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [scrolled, setScrolled] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled((window.scrollY || 0) > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleStart = () => {
    window.localStorage.removeItem('appState');
    trackEvent('hero_primary_cta', 'engagement', 'start_for_free');
    navigate('/app');
  };

  const handleLogin = () => {
    trackEvent('header_login_click', 'engagement', 'login');
    navigate('/app?login=true');
  };

  const scrollTo = (id: string, label: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    trackEvent('nav_click', 'engagement', label);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <>
      <GlobalStyle />
      <Page>
        <Header scrolled={scrolled}>
          <HeaderContainer>
            <Logo>
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
            <DesktopNav>
              <a href="#features" onClick={scrollTo('features', 'features')}>Features</a>
              <a href="#demo" onClick={scrollTo('demo', 'demo')}>Demo</a>
              <a href="#testimonials" onClick={scrollTo('testimonials', 'testimonials')}>Testimonials</a>
            </DesktopNav>
            {!isAuthenticated && (
              <TopBarRight>
                <LoginButton onClick={handleLogin}>Log in</LoginButton>
                <SignupFreeButton onClick={handleStart}>Sign up for free</SignupFreeButton>
              </TopBarRight>
            )}
            <MobileMenuButton 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle mobile menu"
            >
              ☰
            </MobileMenuButton>
          </HeaderContainer>
          <MobileNav $isOpen={mobileMenuOpen}>
            <a href="#features" onClick={(e) => { scrollTo('features', 'features')(e); setMobileMenuOpen(false); }}>Features</a>
            <a href="#demo" onClick={(e) => { scrollTo('demo', 'demo')(e); setMobileMenuOpen(false); }}>Demo</a>
            <a href="#testimonials" onClick={(e) => { scrollTo('testimonials', 'testimonials')(e); setMobileMenuOpen(false); }}>Testimonials</a>
            {!isAuthenticated && <a href="#" onClick={() => { handleLogin(); setMobileMenuOpen(false); }}>Log in</a>}
            <a href="#" onClick={() => { handleStart(); setMobileMenuOpen(false); }}>Sign up for free</a>
          </MobileNav>
        </Header>

        <Hero>
          <HeroContainer>
            <HeroContent>
              <Badge>Alpha-Niche Side Hustle Discovery</Badge>
              <HeroTitle>Need Extra Money?</HeroTitle>
              <HeroSubtitle>Add an extra $1–$3k/month with early-growth side hustle niches</HeroSubtitle>
              <HeroButtons>
                <PrimaryButton onClick={handleStart}>Start for Free</PrimaryButton>
                <SecondaryButton onClick={() => document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })}>
                  Watch Demo
                </SecondaryButton>
              </HeroButtons>
            </HeroContent>
            <HeroVisual>
              <HeroCard>
                <img
                  src={howItWorksImg}
                  alt="How it works"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  loading="eager"
                  decoding="async"
                />
              </HeroCard>
            </HeroVisual>
          </HeroContainer>
        </Hero>

        <Stats>
          <StatsGrid>
            <StatCard>
              <StatNumber>2,000+</StatNumber>
              <StatLabel>Side Hustlers Helped</StatLabel>
            </StatCard>
            <StatCard>
              <StatNumber>$2,400</StatNumber>
              <StatLabel>Average Monthly Side Income</StatLabel>
            </StatCard>
            <StatCard>
              <StatNumber>96%</StatNumber>
              <StatLabel>Success Rate</StatLabel>
            </StatCard>
            <StatCard>
              <StatNumber>12min</StatNumber>
              <StatLabel>Time to Find Your Idea</StatLabel>
            </StatCard>
          </StatsGrid>
        </Stats>

        <Section id="features">
          <SectionInner>
            <SectionTitle>Why The Alpha-Niche Side Hustle Discovery Works</SectionTitle>
            <SectionSubtitle>
              While others suggest saturated side hustles, we help you find untapped opportunities with less competition and higher profit margins.
            </SectionSubtitle>
            <FeaturesGrid>
              <FeatureCard>
                <FeatureTitle>Find Untapped Side Hustles</FeatureTitle>
                <div>Discover side hustle opportunities in emerging markets before they become crowded and competitive.</div>
              </FeatureCard>
              <FeatureCard>
                <FeatureTitle>Higher Side Income Potential</FeatureTitle>
                <div>Alpha-niche side hustles often pay 2-3x more than traditional side hustle options.</div>
              </FeatureCard>
              <FeatureCard>
                <FeatureTitle>Flexible for Your Schedule</FeatureTitle>
                <div>All opportunities are designed to work around your full-time job and existing commitments.</div>
              </FeatureCard>
            </FeaturesGrid>
          </SectionInner>
        </Section>

        <Demo id="demo">
          <DemoWrap>
            <div>
              <SectionTitle>How It Works</SectionTitle>
              <SectionSubtitle>
                Tell us about your skills, schedule, and goals, and we'll find untapped side hustle opportunities perfect for you.
              </SectionSubtitle>
              {/* New vertical steps matching screenshot */}
              <StepsList>
                <StepCard>
                  <StepTitle>1. Share your profile</StepTitle>
                  <StepText>Skills, location, schedule, income goals</StepText>
                </StepCard>
                <StepCard>
                  <StepTitle>2. Discover side hustle ideas</StepTitle>
                  <StepText>AI finds untapped opportunities for your situation</StepText>
                </StepCard>
                <StepCard>
                  <StepTitle>3. Start your side hustle</StepTitle>
                  <StepText>Get a complete plan to launch and earn</StepText>
                </StepCard>
              </StepsList>
            </div>
            <DemoCard>
              <DemoBadge>Side Hustle Discovery</DemoBadge>
              <img
                src={howItWorksImg}
                alt="How it works walkthrough"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                loading="lazy"
                decoding="async"
              />
            </DemoCard>
          </DemoWrap>
        </Demo>

        {/* Trending Ideas Section */}
        <Section style={{ background: colors.light }}>
          <SectionInner>
            <TrendingIdeasCarousel />
          </SectionInner>
        </Section>

        <Section id="testimonials" style={{ background: colors.white }}>
          <SectionInner>
            <SectionTitle>Side Hustle Success Stories</SectionTitle>
            <SectionSubtitle>See how our users found untapped side hustle opportunities and built profitable income streams.</SectionSubtitle>
            <FeaturesGrid>
              <FeatureCard>
                <FeatureTitle>Sarah Mitchell</FeatureTitle>
                <div>"Found a niche in AI-powered local business automation. Now making $3,200/month as a side hustle helping small businesses implement AI solutions."</div>
              </FeatureCard>
              <FeatureCard>
                <FeatureTitle>Mike Thompson</FeatureTitle>
                <div>"Discovered an untapped market in sustainable packaging for local restaurants. $2,800/month side income with minimal competition."</div>
              </FeatureCard>
              <FeatureCard>
                <FeatureTitle>Lisa Kim</FeatureTitle>
                <div>"The AI identified a gap in remote work wellness services. Now running a $1,900/month virtual wellness coaching side hustle."</div>
              </FeatureCard>
            </FeaturesGrid>
          </SectionInner>
        </Section>

        <CTA>
          <CTATitle>Ready to Start Your Alpha Side Hustle?</CTATitle>
          <CTADesc>Join thousands of side hustlers who discovered untapped opportunities and built profitable income streams.</CTADesc>
          <PrimaryButton onClick={handleStart}>Find Your Side Hustle Now</PrimaryButton>
        </CTA>

        {/* Floating feedback */}
        <FeedbackWidget route="/" />
      </Page>
    </>
  );
};

export default WebLandingPage;