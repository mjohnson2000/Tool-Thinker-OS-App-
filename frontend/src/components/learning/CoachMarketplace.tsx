import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FiSearch, FiStar, FiClock, FiDollarSign, FiUsers, FiFilter, FiCalendar, FiMapPin } from 'react-icons/fi';
import logo from '../../assets/logo.png';

interface Coach {
  _id: string;
  name: string;
  bio: string;
  expertise: string[];
  experience: number;
  hourlyRate: number;
  rating: number;
  totalReviews: number;
  profilePic?: string;
  availability: {
    days: string[];
    timeSlots: string[];
  };
}

const PageBackground = styled.div`
  min-height: 100vh;
  background: #f5f5f7;
  padding: 2rem 1rem;
`;



const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding-top: 100px;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 3rem;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: #181a1b;
  margin-bottom: 1rem;
`;

const Subtitle = styled.p`
  font-size: 1.1rem;
  color: #6c757d;
  max-width: 600px;
  margin: 0 auto;
`;

const SearchSection = styled.div`
  background: white;
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
`;

const SearchBar = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 1rem 1.5rem;
  border: 1px solid #e5e5e5;
  border-radius: 12px;
  font-size: 1rem;
  background: #f8f9fa;
  
  &:focus {
    outline: none;
    border-color: #007AFF;
    background: white;
  }
`;

const FilterSection = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
`;

const FilterButton = styled.button<{ active?: boolean }>`
  padding: 0.5rem 1rem;
  border: 1px solid ${props => props.active ? '#007AFF' : '#e5e5e5'};
  border-radius: 8px;
  background: ${props => props.active ? '#007AFF' : 'white'};
  color: ${props => props.active ? 'white' : '#6c757d'};
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    border-color: #007AFF;
    color: #007AFF;
  }
`;

const CoachesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
`;

const CoachCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.12);
  }
`;

const CoachHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const CoachAvatar = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 700;
  color: #007AFF;
`;

const CoachAvatarImg = styled.img`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
`;

const CoachInfo = styled.div`
  flex: 1;
`;

const CoachName = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  color: #181a1b;
  margin-bottom: 0.25rem;
`;

const CoachRating = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #6c757d;
`;

const CoachBio = styled.p`
  color: #6c757d;
  line-height: 1.5;
  margin-bottom: 1.5rem;
`;

const CoachExpertise = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const ExpertiseTag = styled.span`
  background: #f8f9fa;
  color: #495057;
  padding: 0.25rem 0.75rem;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 500;
`;

const CoachStats = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const Stat = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #6c757d;
`;

const Price = styled.div`
  font-size: 1.1rem;
  font-weight: 600;
  color: #181a1b;
`;

const BookButton = styled.button`
  width: 100%;
  background: #007AFF;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.75rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  
  &:hover {
    background: #0056b3;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: #6c757d;
`;

export function CoachMarketplace() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedExpertise, setSelectedExpertise] = useState<string>('');
  const [priceRange, setPriceRange] = useState<string>('');

  const expertiseOptions = [
    'Business Strategy',
    'Marketing',
    'Sales',
    'Product Development',
    'Finance',
    'Operations',
    'Leadership',
    'Startup Growth'
  ];

  const priceRanges = [
    { label: 'Any Price', value: '' },
    { label: 'Under $50/hr', value: '50' },
    { label: 'Under $100/hr', value: '100' },
    { label: 'Under $200/hr', value: '200' }
  ];

  useEffect(() => {
    fetchCoaches();
  }, []);

  const fetchCoaches = async () => {
    try {
      const response = await fetch('/api/coaches');
      const data = await response.json();
      setCoaches(data);
    } catch (error) {
      console.error('Error fetching coaches:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCoaches = coaches.filter(coach => {
    const matchesSearch = coach.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         coach.bio.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesExpertise = !selectedExpertise || coach.expertise.includes(selectedExpertise);
    const matchesPrice = !priceRange || coach.hourlyRate <= parseInt(priceRange);
    
    return matchesSearch && matchesExpertise && matchesPrice;
  });

  const handleCoachClick = (coachId: string) => {
    navigate(`/coaches/${coachId}`);
  };

  if (!user?.isSubscribed) {
    return (
      <PageBackground>
        <Container>
          <EmptyState>
            <h2>Premium Feature</h2>
            <p>Coach access is available for subscribed users only.</p>
            <button onClick={() => navigate('/subscription')}>
              Upgrade to Premium
            </button>
          </EmptyState>
        </Container>
      </PageBackground>
    );
  }

  return (
    <PageBackground>
      <Container>
        <Header>
          <Title>Find Your Perfect Coach</Title>
          <Subtitle>
            Connect with experienced business coaches to accelerate your success
          </Subtitle>
        </Header>

        <SearchSection>
          <SearchBar>
            <SearchInput
              type="text"
              placeholder="Search coaches by name or expertise..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </SearchBar>
          
          <FilterSection>
            <FilterButton
              active={!selectedExpertise}
              onClick={() => setSelectedExpertise('')}
            >
              All Expertise
            </FilterButton>
            {expertiseOptions.map(expertise => (
              <FilterButton
                key={expertise}
                active={selectedExpertise === expertise}
                onClick={() => setSelectedExpertise(expertise)}
              >
                {expertise}
              </FilterButton>
            ))}
          </FilterSection>
          
          <FilterSection>
            {priceRanges.map(range => (
              <FilterButton
                key={range.value}
                active={priceRange === range.value}
                onClick={() => setPriceRange(range.value)}
              >
                {range.label}
              </FilterButton>
            ))}
          </FilterSection>
        </SearchSection>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem' }}>
            Loading coaches...
          </div>
        ) : (
          <CoachesGrid>
            {filteredCoaches.map(coach => (
              <CoachCard key={coach._id} onClick={() => handleCoachClick(coach._id)}>
                <CoachHeader>
                  {coach.profilePic ? (
                    <CoachAvatarImg src={coach.profilePic} alt={coach.name} />
                  ) : (
                    <CoachAvatar>
                      {coach.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </CoachAvatar>
                  )}
                  <CoachInfo>
                    <CoachName>{coach.name}</CoachName>
                    <CoachRating>
                      <FiStar style={{ color: '#ffc107' }} />
                      {coach.rating.toFixed(1)} ({coach.totalReviews} reviews)
                    </CoachRating>
                  </CoachInfo>
                </CoachHeader>
                
                <CoachBio>{coach.bio}</CoachBio>
                
                <CoachExpertise>
                  {coach.expertise.slice(0, 3).map(expertise => (
                    <ExpertiseTag key={expertise}>{expertise}</ExpertiseTag>
                  ))}
                  {coach.expertise.length > 3 && (
                    <ExpertiseTag>+{coach.expertise.length - 3} more</ExpertiseTag>
                  )}
                </CoachExpertise>
                
                <CoachStats>
                  <Stat>
                    <FiClock />
                    {coach.experience} years
                  </Stat>
                  <Stat>
                    <FiUsers />
                    {coach.totalReviews} sessions
                  </Stat>
                  <Price>
                    <FiDollarSign />
                    {coach.hourlyRate}/hr
                  </Price>
                </CoachStats>
                
                <BookButton>View Profile & Book</BookButton>
              </CoachCard>
            ))}
          </CoachesGrid>
        )}

        {!loading && filteredCoaches.length === 0 && (
          <EmptyState>
            <h3>No coaches found</h3>
            <p>Try adjusting your search criteria or filters.</p>
          </EmptyState>
        )}
      </Container>
    </PageBackground>
  );
} 