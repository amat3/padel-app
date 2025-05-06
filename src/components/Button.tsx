'use client';

import styled from '@emotion/styled';

interface ButtonProps {
  label?: string;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
  icon?: React.ReactNode;
  type?: 'button' | 'submit' | 'reset';
}

export function Button({
  label,
  onClick,
  disabled = false,
  variant = 'primary',
  icon,
  type = 'button',
}: ButtonProps) {
  return (
    <StyledButton
      onClick={onClick}
      disabled={disabled}
      variant={variant}
      type={type}
    >
      {icon && <IconWrapper>{icon}</IconWrapper>}
      {label}
    </StyledButton>
  );
}

const StyledButton = styled.button<ButtonProps>`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s;

  background-color: ${({ variant }) =>
    variant === 'primary' ? '#5a67d8' : '#edf2f7'};
  color: ${({ variant }) =>
    variant === 'primary' ? '#fff' : '#4a5568'};
  border: ${({ variant }) =>
    variant === 'primary' ? 'none' : '1px solid #cbd5e0'};

  &:hover {
    background-color: ${({ variant }) =>
      variant === 'primary' ? '#4c51bf' : '#e2e8f0'};
    transform: scale(1.05);
  }

  &:disabled {
    background-color: #e2e8f0;
    color: #a0aec0;
    cursor: not-allowed;
    transform: none;
  }
`;

const IconWrapper = styled.span`
  margin-right: 0.5rem;
  display: flex;
  align-items: center;
`;
