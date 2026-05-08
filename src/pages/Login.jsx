import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import AuthForm from '../components/AuthForm/AuthForm.jsx';

/**
 * Login page — "/login"
 * On success redirects to the page the user originally wanted (or "/").
 */
export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState(null);

  const handleSubmit = async () => {
    setError(null);
    setIsLoading(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.error || 'Login failed. Please check your credentials.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthForm
      title="Welcome back"
      subtitle="Sign in to your VexChat account"
      fields={[
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
          placeholder: '••••••••',
          value: password,
          onChange: (e) => setPassword(e.target.value),
        },
      ]}
      submitLabel="Sign In"
      onSubmit={handleSubmit}
      isLoading={isLoading}
      error={error}
      footerText="Don't have an account?"
      footerLinkTo="/register"
      footerLinkText="Create one"
    />
  );
}
