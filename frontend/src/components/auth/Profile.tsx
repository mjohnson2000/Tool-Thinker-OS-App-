import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';

const Container = styled.div`
  max-width: 420px;
  margin: 2rem auto;
  padding: 2.5rem 2rem;
  background: #fff;
  border-radius: 24px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.18);
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
`;

const Avatar = styled.div`
  width: 80px;
  height: 80px;
  margin: 0 auto 1.2rem;
  border-radius: 50%;
  background: #e5e5e5;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  color: #222;
  font-weight: 700;
`;

const AvatarImg = styled.img`
  width: 80px;
  height: 80px;
  margin: 0 auto 1.2rem;
  border-radius: 50%;
  object-fit: cover;
  background: #e5e5e5;
`;

const Name = styled.div`
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.3rem;
  color: #222;
  width: 100%;
`;

const NameInput = styled.input`
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.3rem;
  color: #222;
  width: 100%;
  text-align: center;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  padding: 0.4rem 0.7rem;
  background: #fafbfc;
  &:focus {
    outline: 2px solid #007aff;
    border-color: #007aff;
  }
`;

const Email = styled.p`
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
  color: #444;
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
`;

const Button = styled.button`
  background: #000;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.7rem 1.5rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s, box-shadow 0.2s;
  outline: none;
  &:hover, &:focus {
    background: #222;
    box-shadow: 0 2px 8px rgba(0,0,0,0.10);
  }
`;

const SecondaryButton = styled(Button)`
  background: #f5f5f7;
  color: #000;
  border: 1.5px solid #e5e5e5;
  &:hover, &:focus {
    background: #e6e6e6;
    color: #222;
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
`;

const ModalButtonRow = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 1.5rem;
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
  margin-bottom: 1.2rem;
  background: #f3f4f6;
  color: #181a1b;
  font-size: 0.82rem;
  font-weight: 600;
  border-radius: 999px;
  border: 1.5px solid #181a1b;
  padding: 0.18rem 1.1rem 0.22rem 1.1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 48px;
  min-height: 22px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  letter-spacing: 0.01em;
  user-select: none;
`;

interface ProfileProps {
  setAppState: (fn: (prev: any) => any) => void;
  isTrackerVisible: boolean;
  onClose?: () => void;
}

export function Profile({ setAppState, isTrackerVisible, onClose }: ProfileProps) {
  const { user, isLoading, logout, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState(user?.name || '');
  const [profilePic, setProfilePic] = useState(user?.profilePic || '');
  const [picPreview, setPicPreview] = useState(user?.profilePic || '');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [subscribeError, setSubscribeError] = useState<string | null>(null);

  // Track changes to name and profile picture
  useEffect(() => {
    const nameChanged = name !== (user?.name || '');
    const picChanged = profilePic !== (user?.profilePic || '');
    setHasChanges(nameChanged || picChanged);
  }, [name, profilePic, user?.name, user?.profilePic]);

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
      const update: { name?: string; profilePic?: string } = {};
      if (name.trim()) update.name = name.trim();
      if (profilePic) update.profilePic = profilePic;
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
            Edit
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
                Edit
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
            {error && <div style={{ color: 'red', marginBottom: '0.5rem' }}>{error}</div>}
            {success && <div style={{ color: 'green', marginBottom: '0.5rem' }}>{success}</div>}
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
                      isTrackerVisible,
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