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
  background: ${colors.black};
  color: ${colors.white};
  padding: 5rem 1.5rem 4rem 1.5rem;
  text-align: center;
  position: relative;
  overflow: hidden;
  animation: ${fadeInUp} 1.1s cubic-bezier(0.4,0,0.2,1);
`;

const HeroGlassyBg = styled.div`
  position: absolute;
  top: -30%;
  left: -30%;
  width: 160%;
  height: 160%;
  z-index: 0;
  pointer-events: none;
  background: linear-gradient(120deg, rgba(255,255,255,0.08) 0%, rgba(36,36,36,0.12) 100%);
  filter: blur(32px) saturate(1.2);
  opacity: 0.7;
  animation: ${glassyBgAnim} 12s ease-in-out infinite;
  background-size: 200% 200%;
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
  background: ${colors.white};
  padding: 3.5rem 1.5rem 3.5rem 1.5rem;
  text-align: center;
  overflow: hidden;
  margin-top: -3rem;
  z-index: 1;
  
  &:before, &:after {
    content: '';
    position: absolute;
    left: 0; right: 0;
    height: 48px;
    z-index: 2;
    pointer-events: none;
  }
  &:before {
    top: 0;
    background: linear-gradient(to bottom, #cfd1d6 0%, rgba(255,255,255,0) 100%);
  }
  &:after {
    bottom: 0;
    background: linear-gradient(to top, #e5e7eb 0%, rgba(255,255,255,0) 100%);
  }
`;

const SocialProofText = styled.div`
  font-size: 1.25rem;
  font-weight: 500;
  color: ${colors.black};
  margin-bottom: 2.2rem;
  letter-spacing: 0.01em;
`;

const SocialLogos = styled.div`
  display: flex;
  justify-content: center;
  gap: 2.5rem;
  flex-wrap: wrap;
`;

const SocialLogo = styled.div`
  min-width: 140px;
  min-height: 48px;
  padding: 0 2.2rem;
  background: rgba(245,245,245,0.7);
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.18rem;
  font-weight: 500;
  color: #23272f;
  letter-spacing: 0.01em;
  box-shadow: none;
  border: none;
  transition: none;
  margin-bottom: 1rem;
  user-select: none;
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
            <Tagline>Turn Your Skills Into Extra Income</Tagline>
            <SubTagline>Your Side Hustle Idea Generator</SubTagline>
            <HeroText>
              Discover profitable side hustle ideas that fit your schedule and skills. Tool Thinker helps busy professionals find, validate, and launch part-time businesses for extra income—no quitting your day job required.
            </HeroText>
            <CTAButton onClick={handleStartForFree}>Start for Free</CTAButton>
            <SecondaryButton onClick={handleSeeHowItWorks}>See How It Works</SecondaryButton>
          </HeroContent>
        </Hero>

        {/* Social Proof */}
        <SocialProofSection>
          <SocialProofText>Trusted by side hustlers from</SocialProofText>
          <SocialLogos>
            <SocialLogo>SideHustle Pro</SocialLogo>
            <SocialLogo>Freelance Hub</SocialLogo>
            <SocialLogo>Part-Time Pros</SocialLogo>
            <SocialLogo>Income Multipliers</SocialLogo>
          </SocialLogos>
        </SocialProofSection>

        {/* Interactive Demo & Walkthrough */}
        <DemoSection>
          <DemoWidget>
            <DemoTitle>Try Side Hustle Finder Instantly</DemoTitle>
            <DemoInput
              placeholder="Describe your skills or interests… (e.g. 'I'm good at writing and have 2 hours a day')"
              value={demoInput}
              onChange={e => setDemoInput(e.target.value)}
              rows={3}
            />
            <DemoButton onClick={handleDemoClarify}>Find Ideas</DemoButton>
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

        {/* How It Works */}
        <HowItWorks ref={howItWorksRef}>
          <h2>How Side Hustle Finder Works</h2>
          <Steps>
            <Step>
              <StepNumber>1</StepNumber>
              <StepTitle>Share Your Skills & Time</StepTitle>
              <StepText>Tell us what you're good at and how much time you have available for extra income.</StepText>
            </Step>
            <Step>
              <StepNumber>2</StepNumber>
              <StepTitle>AI-Powered Idea Generation</StepTitle>
              <StepText>Our AI finds profitable side hustle opportunities that match your skills, schedule, and income goals.</StepText>
            </Step>
            <Step>
              <StepNumber>3</StepNumber>
              <StepTitle>Your Action Plan</StepTitle>
              <StepText>Get a step-by-step plan to launch your side hustle—from validation to first customer.</StepText>
            </Step>
          </Steps>
        </HowItWorks>

        {/* Benefits */}
        <Benefits>
          <h2>Why Side Hustle Finder?</h2>
          <BenefitsList>
            <Benefit><Check>✓</Check>Keep your day job—no quitting required</Benefit>
            <Benefit><Check>✓</Check>Find ideas that fit your schedule</Benefit>
            <Benefit><Check>✓</Check>AI-powered opportunity matching</Benefit>
            <Benefit><Check>✓</Check>Low-risk, high-reward side hustles</Benefit>
            <Benefit><Check>✓</Check>Start with skills you already have</Benefit>
            <Benefit><Check>✓</Check>Step-by-step launch roadmap</Benefit>
            <Benefit><Check>✓</Check>Validate ideas before investing time</Benefit>
            <Benefit><Check>✓</Check>Track progress and income goals</Benefit>
          </BenefitsList>
        </Benefits>

        {/* Comparison */}
        <Comparison>
          <h2>Side Hustle Finder vs. Traditional Methods</h2>
          <ComparisonTable>
            <ComparisonCol>
              <ComparisonTitle>Side Hustle Finder</ComparisonTitle>
              <ComparisonList>
                <ComparisonItem>AI-powered idea generation</ComparisonItem>
                <ComparisonItem>Fits your existing schedule</ComparisonItem>
                <ComparisonItem>Low-risk, validated opportunities</ComparisonItem>
                <ComparisonItem>Start with skills you have</ComparisonItem>
              </ComparisonList>
            </ComparisonCol>
            <ComparisonCol>
              <ComparisonTitle>Traditional Methods</ComparisonTitle>
              <ComparisonList>
                <ComparisonItem>Random internet searches</ComparisonItem>
                <ComparisonItem>Requires quitting your job</ComparisonItem>
                <ComparisonItem>High-risk, unvalidated ideas</ComparisonItem>
                <ComparisonItem>Assumes you need new skills</ComparisonItem>
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
          <h2>What Our Side Hustlers Say</h2>
          <TestimonialList>
            <Testimonial>
              "Side Hustle Finder helped me discover I could make $500/month writing content—while keeping my day job!"
              <TestimonialName>— Alex, Marketing Manager</TestimonialName>
            </Testimonial>
            <Testimonial>
              "I found 3 side hustle ideas that fit my 2-hour evening schedule. Now I'm making extra income without stress."
              <TestimonialName>— Jamie, Software Developer</TestimonialName>
            </Testimonial>
            <Testimonial>
              "The AI matched my photography skills with local business opportunities. I'm booked solid on weekends!"
              <TestimonialName>— Priya, Teacher</TestimonialName>
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