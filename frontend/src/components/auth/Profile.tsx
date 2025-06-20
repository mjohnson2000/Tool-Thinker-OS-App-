import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { useAuth } from '../../contexts/AuthContext';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 400px;
  margin: 3rem auto;
  padding: 2.5rem 2rem;
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 6px 32px rgba(0,0,0,0.10);
`;

const Title = styled.h2`
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  text-align: center;
`;

const Info = styled.div`
  font-size: 1.1rem;
  margin-bottom: 1rem;
  color: #333;
`;

const Button = styled.button`
  background: #007AFF;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
  margin: 0.5rem 0.5rem 0 0;
  &:hover {
    background: #0056b3;
  }
`;

const Avatar = styled.img`
  width: 96px;
  height: 96px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 1rem;
  border: 2px solid #007AFF;
`;

const AvatarInput = styled.input`
  display: none;
`;

const AvatarLabel = styled.label`
  cursor: pointer;
  color: #007AFF;
  font-weight: 500;
  margin-bottom: 1rem;
  &:hover {
    text-decoration: underline;
  }
`;

const Field = styled.div`
  margin-bottom: 1rem;
  width: 100%;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #E5E5E5;
  border-radius: 8px;
  font-size: 1rem;
  &:focus {
    outline: none;
    border-color: #007AFF;
  }
`;

const defaultAvatar = 'https://ui-avatars.com/api/?name=User&background=007AFF&color=fff&size=128';

export function Profile() {
  const { user, logout } = useAuth();
  const [editing, setEditing] = useState(false);
  const [email, setEmail] = useState(user?.email || '');
  const [avatar, setAvatar] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [showSaved, setShowSaved] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!user) return null;

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAvatarFile(e.target.files[0]);
      setAvatar(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleSave = async () => {
    // TODO: Implement backend update for email/avatar
    setEditing(false);
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 2000);
  };

  const handleCancel = () => {
    setEditing(false);
    setEmail(user.email);
    setAvatar('');
    setAvatarFile(null);
  };

  const handleChangePassword = () => {
    // TODO: Implement change password flow/modal
    alert('Change password flow coming soon!');
  };

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    setShowLogoutConfirm(false);
    logout();
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  return (
    <Container>
      <Title>Your Profile</Title>
      <Avatar src={avatar || defaultAvatar} alt="Avatar" />
      {showSaved && <div style={{ color: '#28a745', marginBottom: 12, fontWeight: 500 }}>Profile saved!</div>}
      {editing ? (
        <>
          <AvatarLabel htmlFor="avatar-upload">Change Avatar</AvatarLabel>
          <AvatarInput
            id="avatar-upload"
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleAvatarChange}
          />
          <Field>
            <Input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Email"
            />
          </Field>
          <div>
            <Button onClick={handleSave}>Save</Button>
            <Button onClick={handleCancel} style={{ background: '#6c757d' }}>Cancel</Button>
          </div>
        </>
      ) : (
        <>
          <Info><strong>Email:</strong> {user.email}</Info>
          <Info><strong>Email Verified:</strong> {user.isVerified ? 'Yes' : 'No'}</Info>
          <div>
            <Button onClick={() => setEditing(true)}>Edit Profile</Button>
            <Button onClick={handleChangePassword} style={{ background: '#f5f5f7', color: '#007AFF', border: '1.5px solid #007AFF', marginLeft: 0 }}>Change Password</Button>
            <Button onClick={handleLogout} style={{ background: '#6c757d' }}>Log Out</Button>
          </div>
        </>
      )}
      {showLogoutConfirm && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.18)', zIndex: 2000,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.12)', padding: '2rem 2.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 18 }}>Are you sure you want to log out?</div>
            <Button onClick={confirmLogout} style={{ background: '#6c757d', marginRight: 12 }}>Log Out</Button>
            <Button onClick={cancelLogout} style={{ background: '#6c757d' }}>Cancel</Button>
          </div>
        </div>
      )}
    </Container>
  );
} 