import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';

const Container = styled.div`
  max-width: 600px;
  margin: 2rem auto;
  padding: 3rem 2.5rem;
  background: linear-gradient(135deg, #ffffff 0%, #fafbfc 100%);
  border-radius: 20px;
  box-shadow: 
    0 4px 20px rgba(0,0,0,0.08),
    0 1px 3px rgba(0,0,0,0.1);
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  border: 1px solid rgba(255,255,255,0.8);
  overflow: hidden;
  
  @media (max-width: 768px) {
    margin: 1rem auto;
    padding: 2rem 1.5rem;
    border-radius: 16px;
    max-width: 92%;
  }
  
  @media (max-width: 480px) {
    margin: 0.5rem auto;
    padding: 1.5rem 1rem;
    border-radius: 16px;
    max-width: 95%;
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, #181a1b, #4a4a4a, #181a1b);
    border-radius: 20px 20px 0 0;
    
    @media (max-width: 768px) {
      border-radius: 16px 16px 0 0;
    }
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
`;

const Avatar = styled.div`
  width: 90px;
  height: 90px;
  margin: 0 auto 1.5rem;
  border-radius: 50%;
  background: linear-gradient(135deg, #181a1b 0%, #4a4a4a 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.8rem;
  color: white;
  font-weight: 700;
  box-shadow: 
    0 8px 24px rgba(24, 26, 27, 0.3),
    0 4px 12px rgba(24, 26, 27, 0.2);
  border: 3px solid rgba(255,255,255,0.9);
  
  @media (max-width: 768px) {
    width: 80px;
    height: 80px;
    font-size: 2.5rem;
    margin: 0 auto 1.2rem;
  }
  
  @media (max-width: 480px) {
    width: 70px;
    height: 70px;
    font-size: 2.2rem;
    margin: 0 auto 1rem;
  }
`;

const AvatarImg = styled.img`
  width: 90px;
  height: 90px;
  margin: 0 auto 1.5rem;
  border-radius: 50%;
  object-fit: cover;
  background: linear-gradient(135deg, #181a1b 0%, #4a4a4a 100%);
  box-shadow: 
    0 8px 24px rgba(24, 26, 27, 0.3),
    0 4px 12px rgba(24, 26, 27, 0.2);
  border: 3px solid rgba(255,255,255,0.9);
  
  @media (max-width: 768px) {
    width: 80px;
    height: 80px;
    margin: 0 auto 1.2rem;
  }
  
  @media (max-width: 480px) {
    width: 70px;
    height: 70px;
    margin: 0 auto 1rem;
  }
`;

const Name = styled.div`
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.3rem;
  color: #222;
  width: 100%;
  
  @media (max-width: 768px) {
    font-size: 1.2rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1.1rem;
  }
`;

const NameInput = styled.input`
  font-size: 1.1rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: #181a1b;
  width: 100%;
  text-align: left;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 0.875rem 1rem;
  background: white;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  
  &:focus {
    outline: none;
    border-color: #181a1b;
    box-shadow: 
      0 0 0 3px rgba(24, 26, 27, 0.1),
      0 4px 12px rgba(0,0,0,0.1);
    transform: translateY(-1px);
  }
  
  &::placeholder {
    color: #9ca3af;
    font-weight: 400;
  }
  
  @media (max-width: 768px) {
    font-size: 1rem;
    padding: 0.75rem 0.875rem;
  }
  
  @media (max-width: 480px) {
    font-size: 0.95rem;
    padding: 0.7rem 0.8rem;
  }
`;

const Email = styled.p`
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
  color: #444;
  
  @media (max-width: 768px) {
    font-size: 1rem;
  }
  
  @media (max-width: 480px) {
    font-size: 0.95rem;
  }
`;

const Divider = styled.hr`
  border: none;
  border-top: 1px solid #e5e5e5;
  margin: 1.5rem 0 1.2rem 0;
  width: 100%;
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  font-size: 0.98rem;
  color: #666;
  margin-bottom: 0.5rem;
`;

const Actions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
  width: 100%;
  margin-top: 1.2rem;
  
  @media (max-width: 768px) {
    gap: 0.6rem;
    margin-top: 1rem;
  }
  
  @media (max-width: 480px) {
    gap: 0.5rem;
    margin-top: 0.8rem;
  }
`;

const Button = styled.button`
  background: linear-gradient(135deg, #181a1b 0%, #4a4a4a 100%);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 0.875rem 1.75rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  outline: none;
  box-shadow: 
    0 4px 16px rgba(24, 26, 27, 0.3),
    0 2px 8px rgba(24, 26, 27, 0.2);
  
  &:hover, &:focus {
    transform: translateY(-2px);
    box-shadow: 
      0 8px 24px rgba(24, 26, 27, 0.4),
      0 4px 12px rgba(24, 26, 27, 0.3);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
  
  @media (max-width: 768px) {
    padding: 0.8rem 1.5rem;
    font-size: 0.95rem;
  }
  
  @media (max-width: 480px) {
    padding: 0.75rem 1.3rem;
    font-size: 0.9rem;
  }
`;

const SecondaryButton = styled(Button)`
  background: white;
  color: #181a1b;
  border: 2px solid #e5e7eb;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  
  &:hover, &:focus {
    background: #f8fafc;
    color: #181a1b;
    border-color: #d1d5db;
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0,0,0,0.15);
  }
`;

const PicInput = styled.input`
  margin: 0.5rem 0 1rem 0;
`;

const SaveButton = styled(Button)`
  margin-top: 0.7rem;
`;

const HiddenPicInput = styled.input`
  display: none;
`;

const EditPicButton = styled.button`
  background: none;
  color: #007aff;
  border: none;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  margin-bottom: 0.7rem;
  text-decoration: underline;
  &:hover, &:focus {
    color: #0056b3;
    text-decoration: none;
  }
`;

const EditLink = styled.button`
  background: none;
  color: #111;
  border: none;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  margin-bottom: 0.7rem;
  text-decoration: underline;
  &:hover, &:focus {
    color: #222;
    text-decoration: none;
  }
`;

const ClearGreyButton = styled(Button)`
  background: #fff;
  color: #666;
  border: 2px solid #ccc;
  font-weight: 600;
  box-shadow: none;
  &:hover, &:focus {
    background: #f7f7f7;
    color: #222;
    border-color: #888;
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: #fff;
  border-radius: 12px;
  padding: 2rem 1.5rem 1.5rem 1.5rem;
  box-shadow: 0 4px 24px rgba(0,0,0,0.18);
  min-width: 320px;
  text-align: center;
  
  @media (max-width: 768px) {
    min-width: 280px;
    padding: 1.5rem 1.2rem 1.2rem 1.2rem;
    margin: 1rem;
  }
  
  @media (max-width: 480px) {
    min-width: 260px;
    padding: 1.2rem 1rem 1rem 1rem;
    margin: 0.5rem;
  }
`;

const ModalButtonRow = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 1.5rem;
  
  @media (max-width: 768px) {
    gap: 0.8rem;
    margin-top: 1.2rem;
  }
  
  @media (max-width: 480px) {
    gap: 0.6rem;
    margin-top: 1rem;
    flex-direction: column;
  }
`;

const BlurOverlay = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  z-index: 999;
  background: rgba(255,255,255,0.3);
  backdrop-filter: blur(6px);
  pointer-events: auto;
`;

const CardWrapper = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 18px;
  right: 18px;
  background: none;
  border: none;
  font-size: 1.7rem;
  color: #888;
  cursor: pointer;
  z-index: 1001;
  &:hover, &:focus {
    color: #222;
  }
`;

const PLAN_DISPLAY_NAMES: Record<string, string> = {
  free: 'Free',
  basic: 'Basic',
  pro: 'Pro',
  elite: 'Elite',
};

const PlanBadge = styled.div`
  margin-top: -0.2rem;
  margin-bottom: 1.5rem;
  background: linear-gradient(135deg, #181a1b 0%, #4a4a4a 100%);
  color: white;
  font-size: 0.85rem;
  font-weight: 700;
  border-radius: 20px;
  padding: 0.4rem 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 60px;
  min-height: 28px;
  box-shadow: 
    0 4px 16px rgba(24, 26, 27, 0.3),
    0 2px 8px rgba(24, 26, 27, 0.2);
  letter-spacing: 0.02em;
  user-select: none;
  text-transform: uppercase;
  font-size: 0.75rem;
`;

interface ProfileProps {
  setAppState: (fn: (prev: any) => any) => void;
  isTrackerCollapsed: boolean;
  onClose?: () => void;
}

export function Profile({ setAppState, isTrackerCollapsed, onClose }: ProfileProps) {
  const { user, isLoading, logout, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState(user?.name || '');
  const [profilePic, setProfilePic] = useState(user?.profilePic || '');
  const [picPreview, setPicPreview] = useState(user?.profilePic || '');
  const [location, setLocation] = useState({
    city: user?.location?.city || '',
    region: user?.location?.region || '',
    country: user?.location?.country || '',
    zipCode: user?.location?.zipCode || ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [subscribeError, setSubscribeError] = useState<string | null>(null);

  // Track changes to name, profile picture, and location
  useEffect(() => {
    const nameChanged = name !== (user?.name || '');
    const picChanged = profilePic !== (user?.profilePic || '');
    const locationChanged = 
      location.city !== (user?.location?.city || '') ||
      location.region !== (user?.location?.region || '') ||
      location.country !== (user?.location?.country || '') ||
      location.zipCode !== (user?.location?.zipCode || '');
    setHasChanges(nameChanged || picChanged || locationChanged);
  }, [name, profilePic, location, user?.name, user?.profilePic, user?.location]);

  if (isLoading) return <Container aria-busy="true">Loading profile...</Container>;
  if (!user) return <Container>No user found. Please log in.</Container>;
  const initials = user.email
    ? user.email
        .split('@')[0]
        .split(/[._-]/)
        .map(part => part[0]?.toUpperCase())
        .join('')
        .slice(0, 2)
    : 'U';

  function handlePicChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setPicPreview(reader.result as string);
      setProfilePic(reader.result as string); // For now, store as base64 URL
    };
    reader.readAsDataURL(file);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const update: { name?: string; profilePic?: string; location?: any } = {};
      if (name.trim()) update.name = name.trim();
      if (profilePic) update.profilePic = profilePic;
      if (location.city && location.region && location.country) {
        update.location = {
          city: location.city.trim(),
          region: location.region.trim(),
          country: location.country.trim(),
          zipCode: location.zipCode.trim()
        };
      }
      await updateProfile(update);
      setSuccess('Profile updated!');
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
      setTimeout(() => setSuccess(null), 2000);
    }
  }

  function handleCancel() {
    setAppState(prev => ({ ...prev, currentStep: prev.stepBeforeAuth || 'landing' }));
  }

  async function handleSubscribe() {
    if (!user || !user.email) {
      setSubscribeError('User email not found.');
      return;
    }
    setIsSubscribing(true);
    setSubscribeError(null);
    try {
      const res = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || 'Failed to create checkout session');
      window.location.href = data.url;
    } catch (err: any) {
      setSubscribeError(err.message || 'Failed to start subscription');
    } finally {
      setIsSubscribing(false);
    }
  }

  // Modal content to be portaled
  const modalContent = (
    <>
      <BlurOverlay />
      <CardWrapper>
        <Container role="main" aria-label="User profile" style={{ position: 'relative' }}>
          <CloseButton onClick={onClose || (() => setAppState(prev => ({ ...prev, currentStep: prev.stepBeforeAuth || 'landing' })))} aria-label="Close profile">×</CloseButton>
          {picPreview ? (
            <AvatarImg src={picPreview} alt="Profile" />
          ) : (
            <Avatar aria-label="User avatar">{initials}</Avatar>
          )}
          {/* Edit link just below avatar, with less margin */}
          <EditLink type="button" style={{ marginBottom: '0.3rem', marginTop: '-0.5rem' }} onClick={() => document.getElementById('profile-pic-upload')?.click()}>
            Edit Pic
          </EditLink>
          {/* PlanBadge below Edit link, with extra margin-bottom */}
          <PlanBadge>
            {!user?.isSubscribed
              ? PLAN_DISPLAY_NAMES['free']
              : PLAN_DISPLAY_NAMES[user?.subscriptionTier || 'basic']}
          </PlanBadge>
          <form onSubmit={handleSave} style={{ width: '100%' }}>
            <label htmlFor="profile-pic-upload" style={{ display: 'none' }}>
              <EditPicButton type="button" onClick={() => document.getElementById('profile-pic-upload')?.click()}>
                Edit Pic
              </EditPicButton>
            </label>
            <HiddenPicInput id="profile-pic-upload" type="file" accept="image/*" onChange={handlePicChange} aria-label="Upload profile picture" />
            <NameInput
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Your name"
              aria-label="Name"
              maxLength={64}
            />
            
            {error && (
              <div style={{ 
                color: '#dc2626', 
                marginBottom: '1rem',
                padding: '0.75rem 1rem',
                background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
                border: '1px solid #fecaca',
                borderRadius: '12px',
                fontSize: '0.9rem',
                fontWeight: '500'
              }}>
                ❌ {error}
              </div>
            )}
            {success && (
              <div style={{ 
                color: '#059669', 
                marginBottom: '1rem',
                padding: '0.75rem 1rem',
                background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                border: '1px solid #bbf7d0',
                borderRadius: '12px',
                fontSize: '0.9rem',
                fontWeight: '500'
              }}>
                ✅ {success}
              </div>
            )}
            {hasChanges && (
              <SaveButton type="submit" disabled={isSaving} aria-label="Save profile">
                {isSaving ? 'Saving...' : 'Save'}
              </SaveButton>
            )}
          </form>
          <Email><strong>Email:</strong> {user.email}</Email>
          <Divider />
          <InfoRow>
            <span>Account Created</span>
            <span>{user.createdAt ? new Date(user.createdAt).toLocaleString() : '—'}</span>
          </InfoRow>
          <InfoRow>
            <span>Last Login</span>
            <span>{user.lastLogin ? new Date(user.lastLogin).toLocaleString() : '—'}</span>
          </InfoRow>
          <Divider />
          
          {/* Location Fields */}
          <div style={{ 
            marginTop: '1rem',
            marginBottom: '1.5rem',
            textAlign: 'left', 
            width: '100%',
            padding: '1.5rem',
            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
            borderRadius: '16px',
            border: '1px solid rgba(24, 26, 27, 0.1)'
          }}>
            <div style={{ 
              fontSize: '1rem', 
              fontWeight: '700', 
              marginBottom: '1rem', 
              color: '#181a1b',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <span style={{ 
                width: '20px', 
                height: '20px', 
                background: 'linear-gradient(135deg, #181a1b 0%, #4a4a4a 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '0.75rem',
                fontWeight: 'bold'
              }}>
                📍
              </span>
              Location for Local Trending Ideas
            </div>
            <div style={{ 
              display: 'grid', 
              gap: '1rem', 
              marginBottom: '0.5rem'
            }}>
              <NameInput
                type="text"
                value={location.city}
                onChange={e => setLocation(prev => ({ ...prev, city: e.target.value }))}
                placeholder="City"
                aria-label="City"
                maxLength={100}
              />
              <NameInput
                type="text"
                value={location.region}
                onChange={e => setLocation(prev => ({ ...prev, region: e.target.value }))}
                placeholder="State/Region"
                aria-label="State or Region"
                maxLength={100}
              />
              <NameInput
                type="text"
                value={location.country}
                onChange={e => setLocation(prev => ({ ...prev, country: e.target.value }))}
                placeholder="Country"
                aria-label="Country"
                maxLength={100}
              />
              <NameInput
                type="text"
                value={location.zipCode}
                onChange={e => setLocation(prev => ({ ...prev, zipCode: e.target.value }))}
                placeholder="ZIP/Postal Code (optional)"
                aria-label="ZIP or Postal Code"
                maxLength={20}
              />
            </div>
          </div>
          
          <Actions>
            <Button onClick={() => {/* TODO: Wire up change password flow */}} aria-label="Change password">Change Password</Button>
            <SecondaryButton onClick={() => setShowLogoutModal(true)} aria-label="Log out">Log out</SecondaryButton>
          </Actions>
          {showLogoutModal && (
            <ModalOverlay>
              <ModalContent>
                <h3>Log out</h3>
                <p>Are you sure you want to log out?</p>
                <ModalButtonRow>
                  <Button type="button" onClick={() => {
                    logout();
                    setShowLogoutModal(false);
                    setAppState((prev: any) => ({ ...prev, ...{
                      currentStep: 'landing',
                      entryPoint: 'idea',
                      idea: { interests: '', area: null, existingIdeaText: '' },
                      customer: null,
                      job: null,
                      problemDescription: null,
                      solutionDescription: null,
                      competitionDescription: null,
                      isTrackerCollapsed,
                      stepBeforeAuth: null
                    }}));
                    navigate('/');
                  }}>Yes, log out</Button>
                  <SecondaryButton type="button" onClick={() => setShowLogoutModal(false)}>Cancel</SecondaryButton>
                </ModalButtonRow>
              </ModalContent>
            </ModalOverlay>
          )}
        </Container>
      </CardWrapper>
    </>
  );

  // Use portal to render modal at the root of the DOM
  return createPortal(modalContent, document.body);
} 