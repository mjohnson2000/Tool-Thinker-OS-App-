import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { fetchChatGPT } from '../../utils/chatgpt';

const Container = styled.div`
  max-width: 600px;
  margin: 2rem auto;
  padding: 2rem;
  background: linear-gradient(135deg, #ffffff 0%, #fafbfc 100%);
  border-radius: 20px;
  box-shadow: 
    0 4px 20px rgba(0,0,0,0.08),
    0 1px 3px rgba(0,0,0,0.1);
  border: 1px solid rgba(255,255,255,0.8);
  text-align: center;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, #181a1b, #4a4a4a, #181a1b);
    border-radius: 20px 20px 0 0;
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
  
  @media (max-width: 768px) {
    margin: 1rem auto;
    padding: 1.5rem;
    border-radius: 16px;
    max-width: 95%;
    
    &::before {
      border-radius: 16px 16px 0 0;
    }
  }
  
  @media (max-width: 480px) {
    margin: 0.5rem auto;
    padding: 1rem;
    border-radius: 12px;
    
    &::before {
      border-radius: 12px 12px 0 0;
    }
  }
`;

const Title = styled.h1`
  font-family: 'Audiowide', 'Courier New', monospace;
  font-size: 2.4rem;
  font-weight: 400;
  margin-top: 2rem;
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
  
  @media (max-width: 768px) {
    font-size: 2rem;
    margin-top: 1.5rem;
    margin-bottom: 1rem;
    
    &::after {
      width: 50px;
    }
  }
  
  @media (max-width: 480px) {
    font-size: 1.8rem;
    margin-top: 1rem;
    margin-bottom: 0.8rem;
    
    &::after {
      width: 40px;
    }
  }
`;

const Subtitle = styled.p`
  font-size: 1.15rem;
  color: var(--text-secondary);
  margin-bottom: 2rem;
  text-align: center;
  line-height: 1.6;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  font-weight: 400;
  opacity: 0.9;
  
  @media (max-width: 768px) {
    font-size: 1.1rem;
    margin-bottom: 1.5rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1rem;
    margin-bottom: 1.2rem;
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  min-height: 140px;
  padding: 1.2rem;
  font-size: 1rem;
  border: 2px solid #E5E5E5;
  border-radius: 14px;
  resize: vertical;
  margin-bottom: 1.5rem;
  background: linear-gradient(135deg, #fafbfc 0%, #f8f9fa 100%);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 4px rgba(0,0,0,0.04);
  
  &:focus {
    outline: none;
    border-color: #181a1b;
    box-shadow: 0 0 0 3px rgba(24, 26, 27, 0.1), 0 4px 12px rgba(0,0,0,0.08);
    background: linear-gradient(135deg, #fff 0%, #fafbfc 100%);
    transform: translateY(-1px);
  }
  
  &:hover {
    border-color: #ccc;
    background: linear-gradient(135deg, #f8f9fa 0%, #f1f3f4 100%);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  }
  
  @media (max-width: 768px) {
    min-height: 120px;
    padding: 1rem;
    font-size: 0.95rem;
    margin-bottom: 1.2rem;
  }
  
  @media (max-width: 480px) {
    min-height: 100px;
    padding: 0.8rem;
    font-size: 0.9rem;
    margin-bottom: 1rem;
  }
`;

const ImprovementContainer = styled.div`
  background: linear-gradient(135deg, #ffffff 0%, #fafbfc 100%);
  border: 2px solid #e5e5e5;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.06);
  padding: 1.8rem 1.5rem;
  margin-top: 1.5rem;
  width: 100%;
  text-align: left;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:hover {
    border-color: #181a1b;
    box-shadow: 0 8px 24px rgba(0,0,0,0.12);
    transform: translateY(-2px);
  }
`;

const ImprovementHeader = styled.h4`
  font-size: 1.1rem;
  font-weight: 700;
  color: #181a1b;
  margin-bottom: 0.5rem;
`;

const ImprovementText = styled.p`
  font-size: 1rem;
  color: #333;
  white-space: pre-wrap;
  margin-bottom: 1rem;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  
  @media (max-width: 768px) {
    gap: 0.8rem;
    margin-top: 0.8rem;
  }
  
  @media (max-width: 480px) {
    flex-direction: column;
    gap: 0.6rem;
    margin-top: 0.6rem;
  }
`;

const ImprovementButton = styled.button<{ accept?: boolean }>`
  padding: 1.2rem 2rem;
  border: none;
  border-radius: 16px;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  background: ${props => props.accept ? 'linear-gradient(135deg, #181a1b 0%, #2d2d2d 100%)' : 'linear-gradient(135deg, #f5f5f7 0%, #e9ecef 100%)'};
  color: ${props => props.accept ? '#fff' : '#181a1b'};
  box-shadow: 0 4px 12px rgba(24,26,27,0.15);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
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
  
  &:hover, &:focus {
    background: ${props => props.accept ? 'linear-gradient(135deg, #000 0%, #181a1b 100%)' : 'linear-gradient(135deg, #e5e5e5 0%, #dee2e6 100%)'};
    color: ${props => props.accept ? '#fff' : '#181a1b'};
    box-shadow: 0 8px 24px rgba(24,26,27,0.25);
    transform: translateY(-2px);
    
    &::before {
      left: 100%;
    }
  }
  
  &:active {
    transform: translateY(-1px);
    box-shadow: 0 6px 16px rgba(24,26,27,0.2);
  }
  
  &:disabled {
    background: linear-gradient(135deg, #e5e5e5 0%, #ddd 100%);
    color: #aaa;
    cursor: not-allowed;
    transform: none;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    
    &::before {
      display: none;
    }
  }
  
  @media (max-width: 768px) {
    padding: 1rem 1.5rem;
    font-size: 1rem;
    border-radius: 12px;
  }
  
  @media (max-width: 480px) {
    padding: 0.9rem 1.2rem;
    font-size: 0.95rem;
    border-radius: 10px;
  }
`;

const ClearButton = styled.button`
  background: none;
  border: none;
  color: #6c757d;
  font-size: 0.9rem;
  cursor: pointer;
  margin-top: 1rem;

  &:hover {
    text-decoration: underline;
  }
`;

const SubmitButton = styled.button`
  background: #181a1b;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
  &:hover {
    background: #000;
  }
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const Options = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  justify-content: center;
`;

const OptionCard = styled.button<{ isSelected: boolean }>`
  background: #fff;
  border: 2px solid ${props => props.isSelected ? '#181a1b' : '#E5E5E5'};
  border-radius: 12px;
  padding: 1.5rem 1rem;
  margin-bottom: 1rem;
  cursor: pointer;
  outline: none;
  transition: border 0.2s, box-shadow 0.2s;
  &:hover, &:focus {
    border: 2px solid #181a1b;
    box-shadow: 0 4px 12px rgba(0,0,0,0.10);
  }
`;

const PersonaGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;
  width: 100%;
  max-width: 700px;
`;

const PersonaCard = styled.button<{ isSelected?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  background: ${props => props.isSelected ? 'linear-gradient(135deg, #f0f0f0 0%, #e8e8e8 100%)' : 'linear-gradient(135deg, #ffffff 0%, #fafbfc 100%)'};
  border: 2px solid ${props => props.isSelected ? '#181a1b' : '#E5E5E5'};
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  padding: 1.8rem 1.5rem;
  cursor: pointer;
  outline: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: ${props => props.isSelected ? 'linear-gradient(90deg, #181a1b, #4a4a4a)' : 'transparent'};
    border-radius: 16px 16px 0 0;
  }
  
  &:hover, &:focus {
    border: 2px solid #181a1b;
    background: linear-gradient(135deg, #f8f9fa 0%, #f1f3f4 100%);
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.12);
  }
`;

const Emoji = styled.div`
  font-size: 2.5rem;
  margin-bottom: 1rem;
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 50%;
  border: 2px solid #f1f3f4;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  ${PersonaCard}:hover & {
    transform: scale(1.1);
    background: linear-gradient(135deg, #e9ecef 0%, #dee2e6 100%);
    border-color: #ced4da;
  }
`;

const CardTitle = styled.h3`
  font-family: 'Audiowide', 'Courier New', monospace;
  font-weight: 400;
  font-size: 1.2rem;
  margin-bottom: 0.6rem;
  letter-spacing: -0.01em;
  color: var(--text-primary);
  font-display: swap;
`;

const CardDescription = styled.p`
  color: var(--text-secondary);
  font-size: 0.95rem;
  line-height: 1.4;
  text-align: center;
  font-weight: 400;
`;

const ProgressBarContainer = styled.div`
  width: 100%;
  max-width: 400px;
  height: 8px;
  background: #e5e5e5;
  border-radius: 4px;
  margin: 2rem auto 1.5rem auto;
  overflow: hidden;
`;

const ProgressBarFill = styled.div<{ percent: number }>`
  height: 100%;
  background: #181a1b;
  width: ${({ percent }) => percent}%;
  transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
`;

interface DescribeCustomerProps {
  onSubmit: (description: string | null) => void;
  initialValue?: string;
  onClear: () => void;
  businessContext?: {
    idea?: string;
    businessArea?: string;
    interests?: string;
  };
}

interface CustomerPersona {
  emoji: string;
  title: string;
  description: string;
}

export function DescribeCustomer({ onSubmit, initialValue = '', onClear, businessContext }: DescribeCustomerProps) {
  const [knowsCustomer, setKnowsCustomer] = useState<boolean | null>(null);
  const [description, setDescription] = useState(initialValue);
  const [isLoading, setIsLoading] = useState(false);
  const [improvedDescription, setImprovedDescription] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [promptForMoreInfo, setPromptForMoreInfo] = useState(false);
  const [customerPersonas, setCustomerPersonas] = useState<CustomerPersona[]>([]);
  const [isGeneratingPersonas, setIsGeneratingPersonas] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (initialValue) {
      setKnowsCustomer(true);
      setDescription(initialValue);
    }
  }, [initialValue]);

  // Generate customer personas based on business context
  useEffect(() => {
    if (knowsCustomer === false) {
      generateCustomerPersonas();
    }
  }, [knowsCustomer, businessContext]);

  async function generateCustomerPersonas() {
    setIsGeneratingPersonas(true);
    setProgress(0);
    
    // Animate progress bar to 90% while loading
    const progressInterval = setInterval(() => {
      setProgress(prev => (prev < 90 ? prev + 5 : 90));
    }, 200);
    
    const context = businessContext?.idea || businessContext?.businessArea || businessContext?.interests || 'a new business';
    
    const prompt = `Based on this business idea: "${context}", generate 6 different customer personas that would be most likely to use this product or service.

    For each persona, provide:
    - A relevant emoji
    - A descriptive title
    - A concise description (12-15 words)

    Consider different segments like:
    - Early adopters
    - Mainstream users
    - Different demographics
    - Different use cases
    - Different pain points
    - Niche users

    Return the response as a JSON array with this exact structure:
    [
      {
        "emoji": "relevant emoji",
        "title": "Persona Title",
        "description": "Concise 12-15 word description"
      }
    ]

    Make the personas specific to this business idea and diverse in their characteristics. Keep descriptions concise but informative, around 12-15 words.`;

    try {
      const response = await fetchChatGPT(prompt);
      let personas: CustomerPersona[] = [];

      if (typeof response === 'string') {
        try {
          personas = JSON.parse(response);
        } catch (e) {
          console.error("Failed to parse personas JSON:", e);
          // Fallback to generic personas
          personas = generateFallbackPersonas(context);
        }
      } else if (Array.isArray(response)) {
        personas = response;
      } else {
        personas = generateFallbackPersonas(context);
      }

      // Ensure we have exactly 6 personas
      if (personas.length > 6) {
        personas = personas.slice(0, 6);
      } else if (personas.length < 6) {
        const fallbackPersonas = generateFallbackPersonas(context);
        personas = [...personas, ...fallbackPersonas.slice(0, 6 - personas.length)];
      }

      setCustomerPersonas(personas);
      setProgress(100);
    } catch (error) {
      console.error("Failed to generate customer personas:", error);
      setCustomerPersonas(generateFallbackPersonas(context));
      setProgress(100);
    } finally {
      setIsGeneratingPersonas(false);
      clearInterval(progressInterval);
      setTimeout(() => setProgress(0), 800);
    }
  }

  function generateFallbackPersonas(context: string): CustomerPersona[] {
    // Generic personas as fallback
    return [
      {
        emoji: '👥',
        title: 'Early Adopter',
        description: 'Tech-savvy individuals who love trying new products and services',
      },
      {
        emoji: '💼',
        title: 'Professional User',
        description: 'Working professionals who need efficient solutions for their daily tasks',
      },
      {
        emoji: '🏠',
        title: 'Home User',
        description: 'Individuals who prefer convenient solutions for personal use',
      },
      {
        emoji: '🎯',
        title: 'Specific Need User',
        description: 'People with a particular problem that your solution addresses',
      },
      {
        emoji: '🌟',
        title: 'Premium User',
        description: 'Quality-conscious customers willing to pay for better solutions',
      },
      {
        emoji: '🎨',
        title: 'Creative User',
        description: 'Individuals who value unique and innovative solutions',
      },
    ];
  }

  async function assessCustomerDescription(customerDescription: string, isRetry = false) {
    const retryText = isRetry ? "Provide a different and unique improved version of this customer description." : "";
    const prompt = `You are an expert business consultant. Your task is to take a user's customer description and make it significantly more specific and actionable.
    A good customer description includes details about:
    - Demographics: Age, location, income.
    - Psychographics: Lifestyle, values, interests.
    - Behaviors: How they discover products, what media they consume.
    - Needs & Pains: The specific problem they face.

    Always provide an improved, more detailed version of the following customer description, even if the original is good. The improved version should be a drop-in replacement.
    
    Customer Description: "${customerDescription}"
    
    Example of a vague input: "people that like to drink"
    Example of a good, specific output: "Health-conscious millennials (25-35) in urban areas who enjoy social drinking but are looking for low-calorie, natural alcoholic beverage options. They are active on Instagram, follow fitness influencers, and prefer to buy brands that align with their wellness values."

    ${retryText}

    CRITICAL: Your suggestion MUST be limited to exactly 70 words or fewer. Be concise but comprehensive.

    IMPORTANT: Your response MUST be a JSON object with a single key: "suggestion". Do not add any other text or formatting.
    `;
    
    try {
      const response = await fetchChatGPT(prompt);
      let suggestion = null;

      // The response could be a pre-parsed JSON object or a string containing JSON.
      if (typeof response === 'object' && response !== null && response.suggestion) {
        suggestion = response.suggestion;
      } else if (typeof response === 'string') {
        const jsonMatch = response.match(/\{.*\}/s);
        if (jsonMatch) {
          try {
            suggestion = JSON.parse(jsonMatch[0]).suggestion;
          } catch (e) {
            console.error("Failed to parse JSON from string response:", e);
            return null;
          }
        }
      }

      // Final checks on the extracted suggestion
      if (!suggestion || suggestion.trim() === '' || suggestion.trim().toLowerCase() === customerDescription.trim().toLowerCase()) {
        console.warn("Suggestion is empty, same as input, or could not be extracted.", {suggestion, response});
        return null;
      }

      return suggestion;
    } catch (error) {
      console.error("An error occurred during suggestion assessment:", error);
      return null;
    }
  }

  async function generateSuggestion(isRetry = false) {
    if (!description.trim()) return;

    setIsLoading(true);
    if (!isRetry) {
      setImprovedDescription(null);
      setRetryCount(0);
      setPromptForMoreInfo(false);
    }

    const suggestion = await assessCustomerDescription(description, isRetry);
    
    if (suggestion) {
      setImprovedDescription(suggestion);
    } else {
      // If suggestion fails, and we have retries left, try again automatically.
      if (retryCount < 2) {
        setRetryCount(prev => prev + 1);
        // This creates a small delay before auto-retrying
        setTimeout(() => generateSuggestion(true), 500);
        return; // Exit to avoid setting loading to false too early
      } else {
        // No retries left, prompt for more info
        setPromptForMoreInfo(true);
        setImprovedDescription(null);
      }
    }
    
    setIsLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!description.trim()) {
      onSubmit(null);
      return;
    }
    await generateSuggestion();
  }

  function handleAcceptSuggestion() {
    if (improvedDescription) {
        onSubmit(improvedDescription);
    }
  }

  const handleRetry = async () => {
    if (retryCount >= 2) {
      setPromptForMoreInfo(true);
      setImprovedDescription(null);
      return;
    }
    
    setRetryCount(prev => prev + 1);
    await generateSuggestion(true);
  };

  function handleSelect(knows: boolean) {
    setKnowsCustomer(knows);
  }

  function handlePersonaSelect(persona: typeof customerPersonas[0]) {
    const personaDescription = `${persona.title}: ${persona.description}`;
    onSubmit(personaDescription);
  }

  return (
    <>
      <Title>Who is your customer?</Title>
      
      {knowsCustomer === null && (
        <>
          <Subtitle>Do you have a specific customer in mind?</Subtitle>
          <Container>
            <Options>
              <OptionCard isSelected={false} onClick={() => handleSelect(true)}>
                Yes, I do
              </OptionCard>
              <OptionCard isSelected={false} onClick={() => handleSelect(false)}>
                No, not really
              </OptionCard>
            </Options>
          </Container>
        </>
      )}

      {knowsCustomer === false && (
        <>
          <Subtitle>Select the type of customer you want to help</Subtitle>
          <Container>
            {isGeneratingPersonas ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <ProgressBarContainer>
                  <ProgressBarFill percent={progress} />
                </ProgressBarContainer>
              </div>
            ) : (
              <PersonaGrid>
                {customerPersonas.map((persona) => (
                  <PersonaCard key={persona.title} onClick={() => handlePersonaSelect(persona)}>
                    <Emoji>{persona.emoji}</Emoji>
                    <CardTitle>{persona.title}</CardTitle>
                    <CardDescription>{persona.description}</CardDescription>
                  </PersonaCard>
                ))}
              </PersonaGrid>
            )}
          </Container>
        </>
      )}

      {knowsCustomer === true && (
        <>
          <Subtitle>Describe your ideal customer in a few sentences.</Subtitle>
          <Container>
            <form onSubmit={handleSubmit}>
              <Textarea
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  if (promptForMoreInfo) {
                    setPromptForMoreInfo(false);
                  }
                }}
                placeholder="e.g., 'Freelance graphic designers who work from home and struggle with managing client invoices.'"
                aria-label="Customer Description"
              />
              <SubmitButton 
                type="submit" 
                disabled={!description.trim() || isLoading || promptForMoreInfo}
              >
                {isLoading && retryCount === 0 ? 'Assessing...' : 'Continue'}
              </SubmitButton>
            </form>
            <div style={{ marginTop: '1rem' }}>
              <SubmitButton onClick={() => window.location.reload()}>Refresh Page</SubmitButton>
            </div>

            {improvedDescription && !promptForMoreInfo && (
              <ImprovementContainer>
                <ImprovementHeader>Suggestion for a More Specific Customer</ImprovementHeader>
                <ImprovementText>{improvedDescription}</ImprovementText>
                <ButtonContainer>
                  <ImprovementButton onClick={handleAcceptSuggestion} accept>Accept & Continue</ImprovementButton>
                  <ImprovementButton onClick={handleRetry} disabled={isLoading}>
                    {isLoading ? 'Retrying...' : `Retry (${retryCount}/2)`}
                  </ImprovementButton>
                </ButtonContainer>
              </ImprovementContainer>
            )}

            {promptForMoreInfo && (
              <ImprovementContainer style={{backgroundColor: '#fffbe6', borderColor: '#ffe58f'}}>
                <ImprovementHeader style={{color: '#d46b08'}}>Please provide more detail</ImprovementHeader>
                <p>Add more specifics to your customer description above to help us generate a better suggestion.</p>
              </ImprovementContainer>
            )}
          </Container>
        </>
      )}
    </>
  );
} 