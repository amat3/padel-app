import styled from '@emotion/styled';

type InputProps = {
  label: string;
  id: string;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  autoComplete?: string;
  error?: string;
  disabled?: boolean;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  rightIcon?: React.ReactNode;
  onRightIconClick?: () => void;
};

export const Input: React.FC<InputProps> = ({
  label,
  id,
  type,
  value,
  onChange,
  autoComplete,
  error,
  disabled,
  onBlur,
  rightIcon,
  onRightIconClick,
}) => {
  return (
    <InputWrapper>
      <Label htmlFor={id}>{label}</Label>
      <InputContainer>
        <StyledInput
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          aria-invalid={!!error}
          disabled={disabled}
          hasError={!!error}
          onBlur={onBlur}
        />
        {rightIcon && (
          <IconButton type="button" onClick={onRightIconClick}>
            {rightIcon}
          </IconButton>
        )}
      </InputContainer>
      {error && <ErrorText>{error}</ErrorText>}
    </InputWrapper>
  );
};

// --- Estilos ---
const InputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const Label = styled.label`
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 0.25rem;
  color: #2d3748;
`;

const InputContainer = styled.div`
  position: relative;
  width: 100%;
`;

const StyledInput = styled.input<{ hasError?: boolean }>`
  width: 100%;
  padding: 0.5rem 0.75rem;
  font-size: 1rem;
  border: 1px solid ${({ hasError }) => (hasError ? '#e53e3e' : '#cbd5e0')};
  border-radius: 0.375rem;
  background-color: ${({ disabled }) => (disabled ? '#edf2f7' : 'white')};
  color: ${({ disabled }) => (disabled ? '#a0aec0' : '#2d3748')};
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: ${({ hasError }) => (hasError ? '#e53e3e' : '#5a67d8')};
    box-shadow: 0 0 0 2px
      ${({ hasError }) => (hasError ? 'rgba(229, 62, 62, 0.3)' : 'rgba(90, 103, 216, 0.3)')};
  }
`;

const IconButton = styled.button`
  position: absolute;
  top: 50%;
  right: 0.75rem;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: #4a5568;
  font-size: 1.2rem;

  &:hover {
    color: #2d3748;
  }
`;

const ErrorText = styled.span`
  margin-top: 0.25rem;
  font-size: 0.75rem;
  color: #e53e3e;
`;
