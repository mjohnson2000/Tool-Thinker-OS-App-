import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { fetchChatGPT } from '../../utils/chatgpt';

const Container = styled.div`
  max-width: 600px;
  margin: 2rem auto;
  padding: 2rem;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  text-align: center;
`;

const Title = styled.h1`
  font-size: 1.8rem;
  color: #333;
  margin-bottom: 1rem;
`;

const Subtitle = styled.p`
  font-size: 1rem;
  color: #666;
  margin-bottom: 2rem;
`;

const Textarea = styled.textarea`
  width: 100%;
  min-height: 120px;
  padding: 0.8rem;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  resize: vertical;
  margin-bottom: 1.5rem;
`;

const ImprovementContainer = styled.div`
  background: #fff;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.06);
  padding: 1.5rem 1.2rem;
  margin-top: 1.5rem;
  width: 100%;
  text-align: left;
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
`;

const ImprovementButton = styled.button<{ accept?: boolean }>`
  padding: 0.7rem 1.5rem;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  background: ${props => props.accept ? '#181a1b' : '#f5f5f7'};
  color: ${props => props.accept ? '#fff' : '#181a1b'};
  box-shadow: 0 2px 8px rgba(24,26,27,0.08);
  transition: background 0.2s, color 0.2s, box-shadow 0.2s;
  &:hover, &:focus {
    background: ${props => props.accept ? '#000' : '#e5e5e5'};
    color: ${props => props.accept ? '#fff' : '#181a1b'};
    box-shadow: 0 4px 16px rgba(24,26,27,0.12);
  }
  &:disabled {
    background: #e5e5e5;
    color: #aaa;
    cursor: not-allowed;
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
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  margin-top: 2rem;
`;

const PersonaCard = styled.div`
  background-color: #f8f9fa;
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
  border: 2px solid #e5e5e5;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #181a1b;
    transform: translateY(-5px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  }
`;

const Emoji = styled.div`
  font-size: 2.5rem;
  margin-bottom: 1rem;
`;

const CardTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 0.5rem;
`;

const CardDescription = styled.p`
  font-size: 0.9rem;
  color: #666;
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
    
    const context = businessContext?.idea || businessContext?.businessArea || businessContext?.interests || 'a new business';
    
    const prompt = `Based on this business idea: "${context}", generate 5 different customer personas that would be most likely to use this product or service.

    For each persona, provide:
    - A relevant emoji
    - A descriptive title
    - A brief description of their characteristics and needs

    Consider different segments like:
    - Early adopters
    - Mainstream users
    - Different demographics
    - Different use cases
    - Different pain points

    Return the response as a JSON array with this exact structure:
    [
      {
        "emoji": "relevant emoji",
        "title": "Persona Title",
        "description": "Brief description of this customer type"
      }
    ]

    Make the personas specific to this business idea and diverse in their characteristics.`;

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

      // Ensure we have exactly 5 personas
      if (personas.length > 5) {
        personas = personas.slice(0, 5);
      } else if (personas.length < 5) {
        const fallbackPersonas = generateFallbackPersonas(context);
        personas = [...personas, ...fallbackPersonas.slice(0, 5 - personas.length)];
      }

      setCustomerPersonas(personas);
    } catch (error) {
      console.error("Failed to generate customer personas:", error);
      setCustomerPersonas(generateFallbackPersonas(context));
    } finally {
      setIsGeneratingPersonas(false);
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
    <Container>
      <Title>Who is your customer?</Title>
      
      {knowsCustomer === null && (
        <>
          <Subtitle>Do you have a specific customer in mind?</Subtitle>
          <Options>
            <OptionCard isSelected={false} onClick={() => handleSelect(true)}>
              Yes, I do
            </OptionCard>
            <OptionCard isSelected={false} onClick={() => handleSelect(false)}>
              No, not really
            </OptionCard>
          </Options>
        </>
      )}

      {knowsCustomer === false && (
        <>
          <Subtitle>Select the type of customer you want to help</Subtitle>
          {isGeneratingPersonas ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🤔</div>
              <p>Generating customer personas based on your business idea...</p>
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
        </>
      )}

      {knowsCustomer === true && (
        <>
          <Subtitle>Describe your ideal customer in a few sentences.</Subtitle>
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
          <SubmitButton onClick={onClear}>Clear and restart this step</SubmitButton>

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
        </>
      )}
    </Container>
  );
} 