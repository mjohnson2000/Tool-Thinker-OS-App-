import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FiSearch, FiStar, FiClock, FiDollarSign, FiUsers, FiPlay, FiBook, FiAward } from 'react-icons/fi';
import logo from '../../assets/logo.png';

interface Course {
  _id: string;
  title: string;
  description: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  duration: number;
  price: number;
  rating: number;
  totalStudents: number;
  thumbnail?: string;
  tags: string[];
  instructor: {
    _id: string;
    name: string;
    bio: string;
    rating: number;
    totalReviews: number;
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

const CoursesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
`;

const CourseCard = styled.div`
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.12);
  }
`;

const CourseThumbnail = styled.div`
  height: 200px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 3rem;
`;

const CourseThumbnailImg = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
`;

const CourseContent = styled.div`
  padding: 1.5rem;
`;

const CourseHeader = styled.div`
  margin-bottom: 1rem;
`;

const CourseTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  color: #181a1b;
  margin-bottom: 0.5rem;
  line-height: 1.3;
`;

const CourseInstructor = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #6c757d;
  margin-bottom: 0.5rem;
`;

const CourseRating = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #6c757d;
`;

const CourseDescription = styled.p`
  color: #6c757d;
  line-height: 1.5;
  margin-bottom: 1rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const CourseTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const Tag = styled.span`
  background: #f8f9fa;
  color: #495057;
  padding: 0.25rem 0.75rem;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 500;
`;

const LevelBadge = styled.span<{ level: string }>`
  background: ${props => {
    switch (props.level) {
      case 'beginner': return '#d4edda';
      case 'intermediate': return '#fff3cd';
      case 'advanced': return '#f8d7da';
      default: return '#f8f9fa';
    }
  }};
  color: ${props => {
    switch (props.level) {
      case 'beginner': return '#155724';
      case 'intermediate': return '#856404';
      case 'advanced': return '#721c24';
      default: return '#495057';
    }
  }};
  padding: 0.25rem 0.75rem;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 500;
`;

const CourseStats = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
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

const EnrollButton = styled.button`
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

export function CourseLibrary() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedLevel, setSelectedLevel] = useState<string>('');

  const categories = [
    'Business Strategy',
    'Marketing',
    'Sales',
    'Product Development',
    'Finance',
    'Operations'
  ];

  const levels = [
    { label: 'All Levels', value: '' },
    { label: 'Beginner', value: 'beginner' },
    { label: 'Intermediate', value: 'intermediate' },
    { label: 'Advanced', value: 'advanced' }
  ];

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await fetch('/api/courses');
      const data = await response.json();
      setCourses(data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.instructor.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || course.category === selectedCategory;
    const matchesLevel = !selectedLevel || course.level === selectedLevel;
    
    return matchesSearch && matchesCategory && matchesLevel;
  });

  const handleCourseClick = (courseId: string) => {
    navigate(`/courses/${courseId}`);
  };

  const handleEnroll = async (courseId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const response = await fetch(`/api/courses/${courseId}/enroll`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        navigate(`/courses/${courseId}`);
      } else {
        console.error('Failed to enroll');
      }
    } catch (error) {
      console.error('Error enrolling:', error);
    }
  };

  if (!user?.isSubscribed) {
    return (
      <PageBackground>
        <Container>
          <EmptyState>
            <h2>Premium Feature</h2>
            <p>Course access is available for subscribed users only.</p>
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
          <Title>Learn from the Best</Title>
          <Subtitle>
            Master business skills with expert-led courses designed for entrepreneurs
          </Subtitle>
        </Header>

        <SearchSection>
          <SearchBar>
            <SearchInput
              type="text"
              placeholder="Search courses, instructors, or topics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </SearchBar>
          
          <FilterSection>
            <FilterButton
              active={!selectedCategory}
              onClick={() => setSelectedCategory('')}
            >
              All Categories
            </FilterButton>
            {categories.map(category => (
              <FilterButton
                key={category}
                active={selectedCategory === category}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </FilterButton>
            ))}
          </FilterSection>
          
          <FilterSection>
            {levels.map(level => (
              <FilterButton
                key={level.value}
                active={selectedLevel === level.value}
                onClick={() => setSelectedLevel(level.value)}
              >
                {level.label}
              </FilterButton>
            ))}
          </FilterSection>
        </SearchSection>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem' }}>
            Loading courses...
          </div>
        ) : (
          <CoursesGrid>
            {filteredCourses.map(course => (
              <CourseCard key={course._id} onClick={() => handleCourseClick(course._id)}>
                {course.thumbnail ? (
                  <CourseThumbnailImg src={course.thumbnail} alt={course.title} />
                ) : (
                  <CourseThumbnail>
                    <FiBook />
                  </CourseThumbnail>
                )}
                
                <CourseContent>
                  <CourseHeader>
                    <CourseTitle>{course.title}</CourseTitle>
                    <CourseInstructor>
                      by {course.instructor.name}
                    </CourseInstructor>
                    <CourseRating>
                      <FiStar style={{ color: '#ffc107' }} />
                      {course.rating.toFixed(1)} ({course.totalStudents} students)
                    </CourseRating>
                  </CourseHeader>
                  
                  <CourseDescription>{course.description}</CourseDescription>
                  
                  <CourseTags>
                    <LevelBadge level={course.level}>
                      {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
                    </LevelBadge>
                    {course.tags.slice(0, 2).map(tag => (
                      <Tag key={tag}>{tag}</Tag>
                    ))}
                  </CourseTags>
                  
                  <CourseStats>
                    <Stat>
                      <FiClock />
                      {course.duration}h
                    </Stat>
                    <Stat>
                      <FiUsers />
                      {course.totalStudents} enrolled
                    </Stat>
                    <Price>
                      <FiDollarSign />
                      {course.price}
                    </Price>
                  </CourseStats>
                  
                  <EnrollButton onClick={(e) => handleEnroll(course._id, e)}>
                    Enroll Now
                  </EnrollButton>
                </CourseContent>
              </CourseCard>
            ))}
          </CoursesGrid>
        )}

        {!loading && filteredCourses.length === 0 && (
          <EmptyState>
            <h3>No courses found</h3>
            <p>Try adjusting your search criteria or filters.</p>
          </EmptyState>
        )}
      </Container>
    </PageBackground>
  );
} 