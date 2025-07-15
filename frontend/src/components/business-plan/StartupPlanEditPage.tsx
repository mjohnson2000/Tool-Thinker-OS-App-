import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useParams, useNavigate } from 'react-router-dom';
import { FaMagic, FaSave, FaTimes } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import logo from '../../assets/logo.png';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const Logo = styled.img`
  position: fixed;
  top: 24px;
  left: 24px;
  height: 80px;
  width: 80px;
  margin-right: 1rem;
  cursor: pointer;
  user-select: none;
  z-index: 1101;
`;

const TopBar = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  width: 100vw;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 2.7rem 2rem 0 0;
  z-index: 1000;
`;

const AvatarButton = styled.button`
  background: none;
  border: none;
  padding: 0;
  margin-left: 1rem;
  cursor: pointer;
  border-radius: 50%;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: box-shadow 0.2s;
  &:hover {
    box-shadow: 0 2px 8px rgba(0,0,0,0.12);
  }
`;

const TopBarAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #007aff22;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  color: #007aff;
  font-weight: 700;
`;

const TopBarAvatarImg = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  background: #e5e5e5;
`;

const defaultAvatar = 'https://ui-avatars.com/api/?name=User&background=007AFF&color=fff&size=128';

const Container = styled.div`
  max-width: 700px;
  margin: 7.5rem auto 2rem auto;
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.08);
  padding: 2.5rem 2rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #181a1b;
  margin-bottom: 2rem;
`;

const Section = styled.div`
  margin-bottom: 2rem;
`;

const SectionLabel = styled.h2`
  font-size: 1.1rem;
  font-weight: 600;
  color: #181a1b;
  margin-bottom: 0.5rem;
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 80px;
  border-radius: 8px;
  border: 1.5px solid #e5e5e5;
  padding: 0.8rem;
  font-size: 1rem;
  color: #222;
  background: #f8f9fa;
  margin-bottom: 0.5rem;
  resize: vertical;
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  background: ${({ variant }) => (variant === 'primary' ? '#181a1b' : '#fff')};
  color: ${({ variant }) => (variant === 'primary' ? '#fff' : '#181a1b')};
  border: 2px solid #181a1b;
  border-radius: 8px;
  padding: 0.7rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: background 0.2s, color 0.2s;
  &:hover, &:focus {
    background: ${({ variant }) => (variant === 'primary' ? '#000' : '#f7f7f7')};
    color: #181a1b;
  }
`;

const ErrorMsg = styled.div`
  color: #dc3545;
  margin-bottom: 1rem;
`;

const LoadingMsg = styled.div`
  color: #181a1b;
  margin-bottom: 1rem;
`;

interface StartupPlan {
  _id: string;
  title: string;
  summary: string;
  sections: { [key: string]: string };
  status: string;
  version: number;
  category: string;
  tags: string[];
  progress: any;
  views: number;
  createdAt: string;
  updatedAt: string;
}

interface StartupPlanEditPageProps {
  setAppState?: (fn: (prev: any) => any) => void;
}

export default function StartupPlanEditPage({ setAppState }: StartupPlanEditPageProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [plan, setPlan] = useState<StartupPlan | null>(null);
  const [sections, setSections] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [improving, setImproving] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    async function fetchPlan() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_URL}/startup-plan/${id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (!res.ok) throw new Error('Failed to fetch business plan');
        const data = await res.json();
        setPlan(data);
        setSections(data.sections || {});
      } catch (err: any) {
        setError(err.message || 'Unknown error');
      } finally {
        setLoading(false);
      }
    }
    fetchPlan();
  }, [id]);

  const handleSectionChange = (key: string, value: string) => {
    setSections(prev => ({ ...prev, [key]: value }));
  };

  const handleImproveSection = async (key: string) => {
    setImproving(prev => ({ ...prev, [key]: true }));
    try {
      // Call AI improvement endpoint (replace with your actual endpoint)
      const res = await fetch(`${API_URL}/startup-plan/improve-section`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          planId: id,
          sectionKey: key,
          currentText: sections[key]
        })
      });
      if (!res.ok) throw new Error('Failed to improve section');
      const data = await res.json();
      setSections(prev => ({ ...prev, [key]: data.improvedText }));
    } catch (err) {
      // Optionally show error
    } finally {
      setImproving(prev => ({ ...prev, [key]: false }));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/startup-plan/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ sections })
      });
              if (!res.ok) throw new Error('Failed to save business plan');
      navigate('/plans');
    } catch (err: any) {
      setError(err.message || 'Unknown error');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/plans');
  };

        if (loading) return <Container><LoadingMsg>Loading business plan...</LoadingMsg></Container>;
  if (error) return <Container><ErrorMsg>{error}</ErrorMsg></Container>;
  if (!plan) return null;

  return (
    <>
      <Logo src={logo} alt="ToolThinker Logo" onClick={() => navigate('/')} />
      <TopBar>
        <AvatarButton onClick={() => setAppState && setAppState(prev => ({ ...prev, stepBeforeAuth: 'edit', currentStep: 'profile' }))} aria-label="Profile">
          {user && user.profilePic ? (
            <TopBarAvatarImg src={user.profilePic} alt="Profile" />
          ) : user && user.email ? (
            <TopBarAvatar>
              {user.email
                .split('@')[0]
                .split(/[._-]/)
                .map(part => part[0]?.toUpperCase())
                .join('')
                .slice(0, 2) || 'U'}
            </TopBarAvatar>
          ) : (
            <TopBarAvatarImg src={defaultAvatar} alt="Avatar" />
          )}
        </AvatarButton>
      </TopBar>
      <Container>
        <Title>Edit Business Plan</Title>
        {Object.entries(sections).map(([key, value]) => (
          <Section key={key}>
            <SectionLabel>{key}</SectionLabel>
            <TextArea
              value={value}
              onChange={e => handleSectionChange(key, e.target.value)}
              disabled={saving}
            />
            <Button
              type="button"
              variant="secondary"
              onClick={() => handleImproveSection(key)}
              disabled={improving[key] || saving}
              style={{ marginBottom: 8 }}
            >
              <FaMagic /> {improving[key] ? 'Improving...' : 'Improve with AI'}
            </Button>
          </Section>
        ))}
        <ButtonRow>
          <Button type="button" variant="primary" onClick={handleSave} disabled={saving}>
            <FaSave /> {saving ? 'Saving...' : 'Save'}
          </Button>
          <Button type="button" variant="secondary" onClick={handleCancel} disabled={saving}>
            <FaTimes /> Cancel
          </Button>
        </ButtonRow>
      </Container>
    </>
  );
} 