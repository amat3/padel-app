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
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void; // Añadido onBlur
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
}) => {
  return (
    <InputWrapper>
      <Label htmlFor={id}>{label}</Label>
      <StyledInput
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        aria-invalid={!!error}
        disabled={disabled}
        hasError={!!error}
        onBlur={onBlur} // Usamos el onBlur aquí
      />
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

const ErrorText = styled.span`
  margin-top: 0.25rem;
  font-size: 0.75rem;
  color: #e53e3e;
`;
