import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import AuthForm from '../components/AuthForm/AuthForm.jsx';

/**
 * Register page — "/register"
 * Validates passwords match client-side, then creates the account and auto-logs in.
 */
export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState(null);

  const handleSubmit = async () => {
    setError(null);

    // Client-side validation
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setIsLoading(true);
    try {
      await register(username, email, password);
      navigate('/', { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.error || 'Registration failed. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthForm
      title="Create account"
      subtitle="Join VexChat — anonymous by default"
      fields={[
        {
          id: 'username',
          label: 'Username',
          type: 'text',
          placeholder: 'coolstranger',
          value: username,
          onChange: (e) => setUsername(e.target.value),
        },
        {
          id: 'email',
          label: 'Email',
          type: 'email',
          placeholder: 'you@example.com',
          value: email,
          onChange: (e) => setEmail(e.target.value),
        },
        {
          id: 'password',
          label: 'Password',
          type: 'password',
          placeholder: 'Min. 8 characters',
          value: password,
          onChange: (e) => setPassword(e.target.value),
        },
        {
          id: 'confirm',
          label: 'Confirm Password',
          type: 'password',
          placeholder: '••••••••',
          value: confirm,
          onChange: (e) => setConfirm(e.target.value),
        },
      ]}
      submitLabel="Create Account"
      onSubmit={handleSubmit}
      isLoading={isLoading}
      error={error}
      footerText="Already have an account?"
      footerLinkTo="/login"
      footerLinkText="Sign in"
    />
  );
}
