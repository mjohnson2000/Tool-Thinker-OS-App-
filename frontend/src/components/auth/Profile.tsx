import React, { useState } from 'react';
import styled from 'styled-components';
import { useAuth } from '../../contexts/AuthContext';

const Container = styled.div`
  max-width: 420px;
  margin: 2rem auto;
  padding: 2.5rem 2rem;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.10);
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Avatar = styled.div`
  width: 80px;
  height: 80px;
  margin: 0 auto 1.2rem;
  border-radius: 50%;
  background: #007aff22;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  color: #007aff;
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

const Status = styled.p<{verified: boolean}>`
  font-size: 1rem;
  color: ${props => props.verified ? '#28a745' : '#dc3545'};
  margin-bottom: 1.2rem;
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
  background: #007aff;
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
    background: #0056b3;
    box-shadow: 0 2px 8px rgba(0,122,255,0.10);
  }
`;

const SecondaryButton = styled(Button)`
  background: #f5f5f7;
  color: #007aff;
  border: 1.5px solid #e5e5e5;
  &:hover, &:focus {
    background: #e6f0ff;
    color: #0056b3;
  }
`;

const PicInput = styled.input`
  margin: 0.5rem 0 1rem 0;
`;

const SaveButton = styled(Button)`
  margin-top: 0.7rem;
`;

export function Profile() {
  const { user, isLoading, logout, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [profilePic, setProfilePic] = useState(user?.profilePic || '');
  const [picPreview, setPicPreview] = useState(user?.profilePic || '');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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

  return (
    <Container role="main" aria-label="User profile">
      {picPreview ? (
        <AvatarImg src={picPreview} alt="Profile" />
      ) : (
        <Avatar aria-label="User avatar">{initials}</Avatar>
      )}
      <form onSubmit={handleSave} style={{ width: '100%' }}>
        <PicInput type="file" accept="image/*" onChange={handlePicChange} aria-label="Upload profile picture" />
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
        <SaveButton type="submit" disabled={isSaving} aria-label="Save profile">
          {isSaving ? 'Saving...' : 'Save'}
        </SaveButton>
      </form>
      <Email><strong>Email:</strong> {user.email}</Email>
      <Status verified={user.isVerified} aria-live="polite">
        {user.isVerified ? 'Verified' : 'Not Verified'}
      </Status>
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
        {!user.isVerified && (
          <SecondaryButton onClick={() => {/* TODO: Wire up resend verification */}} aria-label="Resend verification email">
            Resend Verification Email
          </SecondaryButton>
        )}
        <SecondaryButton onClick={logout} aria-label="Log out">Log out</SecondaryButton>
      </Actions>
    </Container>
  );
} 