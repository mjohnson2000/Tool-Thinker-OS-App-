import React, { useEffect } from 'react';
import styled from 'styled-components';
import { FiX, FiAlertCircle } from 'react-icons/fi';

interface ErrorNotificationProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
  type?: 'error' | 'warning' | 'info';
}

const NotificationOverlay = styled.div<{ isVisible: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  opacity: ${({ isVisible }) => (isVisible ? 1 : 0)};
  visibility: ${({ isVisible }) => (isVisible ? 'visible' : 'hidden')};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
`;

const NotificationCard = styled.div<{ type: string }>`
  background: linear-gradient(135deg, #ffffff 0%, #fafbfc 100%);
  border-radius: 20px;
  padding: 2rem;
  max-width: 400px;
  width: 90%;
  box-shadow: 
    0 20px 60px rgba(24,26,27,0.15),
    0 8px 24px rgba(24,26,27,0.1);
  border: 1px solid rgba(255,255,255,0.8);
  position: relative;
  overflow: hidden;
  transform: ${({ type }) => (type === 'error' ? 'scale(1)' : 'scale(0.95)')};
  animation: ${({ type }) => (type === 'error' ? 'slideIn 0.3s ease-out' : 'fadeIn 0.3s ease-out')};
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${({ type }) => {
      switch (type) {
        case 'error': return 'linear-gradient(90deg, #dc3545, #c82333)';
        case 'warning': return 'linear-gradient(90deg, #ffc107, #e0a800)';
        case 'info': return 'linear-gradient(90deg, #17a2b8, #138496)';
        default: return 'linear-gradient(90deg, #dc3545, #c82333)';
      }
    }};
    border-radius: 20px 20px 0 0;
  }
  
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(-20px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
  
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
`;

const IconContainer = styled.div<{ type: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  margin: 0 auto 1.5rem auto;
  background: ${({ type }) => {
    switch (type) {
      case 'error': return 'linear-gradient(135deg, rgba(220, 53, 69, 0.1) 0%, rgba(220, 53, 69, 0.05) 100%)';
      case 'warning': return 'linear-gradient(135deg, rgba(255, 193, 7, 0.1) 0%, rgba(255, 193, 7, 0.05) 100%)';
      case 'info': return 'linear-gradient(135deg, rgba(23, 162, 184, 0.1) 0%, rgba(23, 162, 184, 0.05) 100%)';
      default: return 'linear-gradient(135deg, rgba(220, 53, 69, 0.1) 0%, rgba(220, 53, 69, 0.05) 100%)';
    }
  }};
  border: 2px solid ${({ type }) => {
    switch (type) {
      case 'error': return 'rgba(220, 53, 69, 0.2)';
      case 'warning': return 'rgba(255, 193, 7, 0.2)';
      case 'info': return 'rgba(23, 162, 184, 0.2)';
      default: return 'rgba(220, 53, 69, 0.2)';
    }
  }};
`;

const Icon = styled.div<{ type: string }>`
  font-size: 1.5rem;
  color: ${({ type }) => {
    switch (type) {
      case 'error': return '#dc3545';
      case 'warning': return '#ffc107';
      case 'info': return '#17a2b8';
      default: return '#dc3545';
    }
  }};
`;

const Title = styled.h2<{ type: string }>`
  font-size: 1.3rem;
  font-weight: 700;
  color: #181a1b;
  margin-bottom: 1rem;
  text-align: center;
  letter-spacing: -0.02em;
`;

const Message = styled.p`
  font-size: 1rem;
  color: var(--text-secondary);
  text-align: center;
  line-height: 1.5;
  margin-bottom: 2rem;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
`;

const Button = styled.button<{ variant: 'primary' | 'secondary' }>`
  padding: 0.8rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: none;
  
  ${({ variant }) => variant === 'primary' ? `
    background: linear-gradient(135deg, #181a1b 0%, #2d2d2d 100%);
    color: #ffffff;
    box-shadow: 0 4px 12px rgba(24,26,27,0.15);
    
    &:hover {
      background: linear-gradient(135deg, #000 0%, #181a1b 100%);
      transform: translateY(-1px);
      box-shadow: 0 6px 16px rgba(24,26,27,0.25);
    }
  ` : `
    background: linear-gradient(135deg, #ffffff 0%, #fafbfc 100%);
    color: #181a1b;
    border: 2px solid rgba(24, 26, 27, 0.1);
    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
    
    &:hover {
      background: linear-gradient(135deg, #f8f9fa 0%, #f1f3f4 100%);
      border-color: rgba(24, 26, 27, 0.2);
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.08);
    }
  `}
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(24, 26, 27, 0.05);
    color: #6b7280;
  }
`;

export function ErrorNotification({ message, isVisible, onClose, type = 'error' }: ErrorNotificationProps) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000); // Auto-close after 5 seconds
      
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'error': return 'Error';
      case 'warning': return 'Warning';
      case 'info': return 'Information';
      default: return 'Error';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'error': return <FiAlertCircle />;
      case 'warning': return <FiAlertCircle />;
      case 'info': return <FiAlertCircle />;
      default: return <FiAlertCircle />;
    }
  };

  return (
    <NotificationOverlay isVisible={isVisible} onClick={handleOverlayClick}>
      <NotificationCard type={type}>
        <CloseButton onClick={onClose}>
          <FiX size={20} />
        </CloseButton>
        
        <IconContainer type={type}>
          <Icon type={type}>
            {getIcon()}
          </Icon>
        </IconContainer>
        
        <Title type={type}>{getTitle()}</Title>
        <Message>{message}</Message>
        
        <ButtonContainer>
          <Button variant="primary" onClick={onClose}>
            OK
          </Button>
        </ButtonContainer>
      </NotificationCard>
    </NotificationOverlay>
  );
} 