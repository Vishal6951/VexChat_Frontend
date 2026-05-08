import PropTypes from 'prop-types';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

/**
 * AuthForm — shared dark glassmorphism form used by both Login and Register pages.
 *
 * @param {{
 *   title: string,
 *   subtitle: string,
 *   fields: Array<{ id: string, label: string, type: string, placeholder: string, value: string, onChange: Function }>,
 *   submitLabel: string,
 *   onSubmit: Function,
 *   isLoading: boolean,
 *   error: string|null,
 *   footerText: string,
 *   footerLinkTo: string,
 *   footerLinkText: string,
 * }} props
 */
export default function AuthForm({
  title,
  subtitle,
  fields,
  submitLabel,
  onSubmit,
  isLoading,
  error,
  footerText,
  footerLinkTo,
  footerLinkText,
}) {
  const [showPasswords, setShowPasswords] = useState({});

  const toggleShow = (id) =>
    setShowPasswords((prev) => ({ ...prev, [id]: !prev[id] }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <div className="min-h-screen bg-void-950 flex flex-col items-center justify-center px-4 animate-fade-in">
      {/* Radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[400px] bg-purple-600/5 rounded-full blur-3xl pointer-events-none" />

      {/* Card */}
      <div className="relative w-full max-w-md glass-purple rounded-2xl p-8 shadow-[0_0_60px_rgba(124,58,237,0.1)]">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-8">
          <div className="w-5 h-5 rounded-full bg-purple-600 shadow-[0_0_10px_rgba(124,58,237,0.8)]" />
          <span className="font-bold text-gray-200 tracking-tight">VexChat</span>
        </div>

        {/* Heading */}
        <h1 className="text-2xl font-bold text-gray-100 mb-1">{title}</h1>
        <p className="text-sm text-gray-500 mb-6">{subtitle}</p>

        {/* Error banner */}
        {error && (
          <div className="flex items-start gap-2 mb-5 px-3 py-2.5 rounded-xl bg-red-500/10 border border-red-500/30 animate-slide-up">
            <AlertCircle size={15} className="text-red-400 mt-0.5 shrink-0" />
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          {fields.map((field) => {
            const isPassword = field.type === 'password';
            const shown = showPasswords[field.id];
            const inputType = isPassword ? (shown ? 'text' : 'password') : field.type;

            return (
              <div key={field.id} className="flex flex-col gap-1.5">
                <label htmlFor={field.id} className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                  {field.label}
                </label>
                <div className="relative">
                  <input
                    id={field.id}
                    type={inputType}
                    placeholder={field.placeholder}
                    value={field.value}
                    onChange={field.onChange}
                    required
                    autoComplete={isPassword ? 'current-password' : field.id}
                    className="w-full bg-void-800/60 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-gray-200 placeholder:text-gray-600 input-focus transition-colors duration-150 focus:border-purple-500/50 focus:bg-void-800/80 pr-10"
                  />
                  {isPassword && (
                    <button
                      type="button"
                      onClick={() => toggleShow(field.id)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400 transition-colors"
                      aria-label={shown ? 'Hide password' : 'Show password'}
                    >
                      {shown ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="mt-2 w-full py-3 rounded-xl bg-purple-600 text-white font-semibold text-sm
                       hover:bg-purple-500 transition-all duration-200
                       shadow-[0_0_20px_rgba(124,58,237,0.3)] hover:shadow-[0_0_30px_rgba(124,58,237,0.5)]
                       disabled:opacity-50 disabled:cursor-not-allowed glow-btn"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Please wait…
              </span>
            ) : (
              submitLabel
            )}
          </button>
        </form>

        {/* Footer link */}
        <p className="mt-6 text-center text-sm text-gray-600">
          {footerText}{' '}
          <Link to={footerLinkTo} className="text-purple-400 hover:text-purple-300 transition-colors font-medium">
            {footerLinkText}
          </Link>
        </p>
      </div>
    </div>
  );
}

AuthForm.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string.isRequired,
  fields: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      type: PropTypes.string.isRequired,
      placeholder: PropTypes.string.isRequired,
      value: PropTypes.string.isRequired,
      onChange: PropTypes.func.isRequired,
    })
  ).isRequired,
  submitLabel: PropTypes.string.isRequired,
  onSubmit: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
  error: PropTypes.string,
  footerText: PropTypes.string.isRequired,
  footerLinkTo: PropTypes.string.isRequired,
  footerLinkText: PropTypes.string.isRequired,
};
