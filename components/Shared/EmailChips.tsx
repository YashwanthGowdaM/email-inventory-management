
import React, { useState, KeyboardEvent } from 'react';
import { Icon } from './Icon';

interface EmailChipsProps {
  label: string;
  emails: string[];
  onChange: (emails: string[]) => void;
  placeholder?: string;
  // Added className to support custom layout styling from parent components (e.g. grid spanning)
  className?: string;
}

export const EmailChips: React.FC<EmailChipsProps> = ({ label, emails, onChange, placeholder, className = '' }) => {
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const addEmail = () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    if (!validateEmail(trimmed)) {
      setError('Invalid email format');
      return;
    }

    if (emails.includes(trimmed)) {
      setError('Email already exists in this field');
      return;
    }

    onChange([...emails, trimmed]);
    setInput('');
    setError(null);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',' || e.key === ';') {
      e.preventDefault();
      addEmail();
    } else if (e.key === 'Backspace' && !input && emails.length > 0) {
      removeEmail(emails.length - 1);
    }
  };

  const removeEmail = (index: number) => {
    onChange(emails.filter((_, i) => i !== index));
  };

  return (
    // Applied the className here to allow container-level layout control like grid column spanning
    <div className={`space-y-1.5 ${className}`}>
      <label className="block text-sm font-medium text-slate-700">{label}</label>
      <div className={`min-h-[42px] p-1.5 bg-white border rounded-lg transition-all flex flex-wrap gap-2 items-center focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 ${error ? 'border-red-300 bg-red-50' : 'border-slate-200'}`}>
        {emails.map((email, idx) => (
          <span key={idx} className="inline-flex items-center gap-1.5 px-2 py-1 bg-indigo-50 text-indigo-700 text-sm font-medium rounded-md border border-indigo-100">
            {email}
            <button type="button" onClick={() => removeEmail(idx)} className="hover:text-indigo-900">
              <Icon name="X" size={14} />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            if (error) setError(null);
          }}
          onBlur={addEmail}
          onKeyDown={handleKeyDown}
          placeholder={emails.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[120px] bg-transparent outline-none text-sm p-1 placeholder:text-slate-400"
        />
      </div>
      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
    </div>
  );
};
