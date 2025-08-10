import React from 'react';
import styled, { createGlobalStyle, keyframes } from 'styled-components';
import { useNavigate } from 'react-router-dom';

import logoImg from '../assets/logo.png';
import heroBg from '../assets/money-woman.jpg';
import howItWorksImg from '../assets/Howitworks1.png';
import { FeedbackWidget } from './common/FeedbackWidget';
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
`;
const HeaderContainer = styled.div`
  max-width: 1200px; margin: 0 auto; padding: 0 2rem;
  display: flex; align-items: center; justify-content: space-between;
`;
const Logo = styled.div`
  display: flex; align-items: center; gap: .75rem;
  img { width: 56px; height: 56px; border-radius: 12px; }
  span { font-family: 'Audiowide', cursive; font-size: 1.4rem; color: ${colors.dark}; }
`;
const Nav = styled.nav`
  display: flex; align-items: center; gap: 1.5rem;
  a { color: ${colors.gray[600]}; text-decoration: none; font-weight: 600; }
`;
const HeaderButton = styled.button`
  background: ${colors.gradient.primary}; color: ${colors.white}; border: none; border-radius: 10px;
  padding: .7rem 1.25rem; font-weight: 700; cursor: pointer;
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
  font-family: 'Audiowide', cursive;
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
  font-family: 'Audiowide', cursive; font-size: clamp(1.6rem, 3vw, 2.1rem);
  text-align: center; margin-bottom: .75rem;
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
  font-family: 'Audiowide', cursive; font-size: clamp(1.6rem, 3vw, 2.1rem); margin-bottom: .8rem;
`;
const CTADesc = styled.p`opacity: .95; margin: 0 auto 1.2rem auto; max-width: 680px;`;

/* Footer (reused from App footer sitewide; landing no footer block) */

const WebLandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = React.useState(false);

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
              <img src={logoImg} alt="Tool Thinker" />
              <span>Tool Thinker</span>
            </Logo>
            <Nav>
              <a href="#features" onClick={scrollTo('features', 'features')}>Features</a>
              <a href="#demo" onClick={scrollTo('demo', 'demo')}>Demo</a>
              <a href="#testimonials" onClick={scrollTo('testimonials', 'testimonials')}>Testimonials</a>
            </Nav>
            <HeaderButton onClick={handleStart}>Get Started</HeaderButton>
          </HeaderContainer>
        </Header>

        <Hero>
          <HeroContainer>
            <HeroContent>
              <Badge>AI-Powered Side Hustle Discovery</Badge>
              <HeroTitle>Need Extra Money?</HeroTitle>
              <HeroSubtitle>Turn Your Idea into a Side Hustle Business</HeroSubtitle>
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
        </Stats>

        <Section id="features">
          <SectionInner>
            <SectionTitle>Why Tool Thinker Works</SectionTitle>
            <SectionSubtitle>
              Unlike generic advice, we analyze your specific situation to find opportunities that actually work for you.
            </SectionSubtitle>
            <FeaturesGrid>
              <FeatureCard>
                <FeatureTitle>Location-Based Discovery</FeatureTitle>
                <div>We analyze your local market to find real opportunities that exist in your area.</div>
              </FeatureCard>
              <FeatureCard>
                <FeatureTitle>Skill-Matched Ideas</FeatureTitle>
                <div>Ideas tailored to your existing strengths so you can start earning faster.</div>
              </FeatureCard>
              <FeatureCard>
                <FeatureTitle>Schedule-Friendly</FeatureTitle>
                <div>Fit your availability—2 hours or 20 per week—with realistic income ranges.</div>
              </FeatureCard>
            </FeaturesGrid>
          </SectionInner>
        </Section>

        <Demo id="demo">
          <DemoWrap>
            <div>
              <SectionTitle>See How It Works</SectionTitle>
              <SectionSubtitle>
                Tell us a bit about your skills and situation, and we’ll show you personalized opportunities.
              </SectionSubtitle>
              {/* New vertical steps matching screenshot */}
              <StepsList>
                <StepCard>
                  <StepTitle>1. Describe yourself</StepTitle>
                  <StepText>Location, skills, schedule, goals</StepText>
                </StepCard>
                <StepCard>
                  <StepTitle>2. Get ideas instantly</StepTitle>
                  <StepText>Matched to your profile</StepText>
                </StepCard>
                <StepCard>
                  <StepTitle>3. Start your plan</StepTitle>
                  <StepText>Turn ideas into action</StepText>
                </StepCard>
              </StepsList>
            </div>
            <DemoCard>
              <DemoBadge>How it works</DemoBadge>
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

        <Section id="testimonials" style={{ background: colors.light }}>
          <SectionInner>
            <SectionTitle>Real Results from Real People</SectionTitle>
            <SectionSubtitle>See how Tool Thinker helped others find their perfect side hustle.</SectionSubtitle>
            <FeaturesGrid>
              <FeatureCard>
                <FeatureTitle>Sarah Mitchell</FeatureTitle>
                <div>"No more 'start a blog' advice. Found a pet-sitting business that makes $1,200/month in my neighborhood."</div>
              </FeatureCard>
              <FeatureCard>
                <FeatureTitle>Mike Thompson</FeatureTitle>
                <div>"AI found 3 local businesses that needed social media help. Now I’m making $1,500/month on weekends."</div>
              </FeatureCard>
              <FeatureCard>
                <FeatureTitle>Lisa Kim</FeatureTitle>
                <div>"The location-based suggestions are gold. I discovered local tutoring opportunities I never knew existed."</div>
              </FeatureCard>
            </FeaturesGrid>
          </SectionInner>
        </Section>

        <CTA>
          <CTATitle>Ready to Find Your Side Hustle?</CTATitle>
          <CTADesc>Join thousands who discovered their perfect opportunity. Start your journey today.</CTADesc>
          <PrimaryButton onClick={handleStart}>Start for Free Now</PrimaryButton>
        </CTA>

        {/* Floating feedback */}
        <FeedbackWidget route="/" />
      </Page>
    </>
  );
};

export default WebLandingPage;