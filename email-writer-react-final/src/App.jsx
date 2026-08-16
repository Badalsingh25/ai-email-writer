import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const TONES = [
  { value: '', label: 'No tone', color: null },
  { value: 'professional', label: 'Professional', color: 'var(--tone-professional)' },
  { value: 'friendly', label: 'Friendly', color: 'var(--tone-friendly)' },
  { value: 'casual', label: 'Casual', color: 'var(--tone-casual)' },
  { value: 'formal', label: 'Formal', color: 'var(--tone-formal)' },
];


const BACKEND_URL = 'https://ai-email-writer-vamd.onrender.com/api/email/generate';
// const BACKEND_URL = 'http://localhost:8080/api/email/generate';

function MarkIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M3 7.5L12 13.5L21 7.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="3" y="5" width="18" height="14" rx="2.5" stroke="white" strokeWidth="1.8" />
    </svg>
  );
}

function PlaneIcon({ className }) {
  return (
    <svg className={className} width="17" height="17" viewBox="0 0 24 24" fill="none">
      <path d="M21 3L2 10.5L10.5 13.5M21 3L13.5 21L10.5 13.5M21 3L10.5 13.5" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <rect x="8" y="8" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <path d="M5 12.5L10 17.5L19 6.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function App() {
  const [emailContent, setEmailContent] = useState('');
  const [tone, setTone] = useState('');
  const [generatedReply, setGeneratedReply] = useState('');
  const [displayedReply, setDisplayedReply] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const typeTimer = useRef(null);

  // Reveal the generated reply with a typewriter effect (skipped entirely
  // if the user has requested reduced motion).
  useEffect(() => {
    if (!generatedReply) return;

    const prefersReducedMotion = window.matchMedia?.(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    if (prefersReducedMotion) {
      setDisplayedReply(generatedReply);
      setIsTyping(false);
      return;
    }

    setDisplayedReply('');
    setIsTyping(true);
    let i = 0;
    clearInterval(typeTimer.current);
    typeTimer.current = setInterval(() => {
      i += 3; // a few characters per tick keeps it snappy on longer replies
      setDisplayedReply(generatedReply.slice(0, i));
      if (i >= generatedReply.length) {
        clearInterval(typeTimer.current);
        setIsTyping(false);
      }
    }, 12);

    return () => clearInterval(typeTimer.current);
  }, [generatedReply]);

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    setGeneratedReply('');
    setCopied(false);
    try {
      const response = await axios.post(BACKEND_URL, { emailContent, tone });
      setGeneratedReply(
        typeof response.data === 'string' ? response.data : JSON.stringify(response.data)
      );
    } catch (err) {
      setError('Failed to generate email reply. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedReply);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="page">
      <div className="masthead">
        <div className="mark">
          <MarkIcon />
        </div>
        <span className="headline" style={{ fontSize: 'clamp(1.7rem, 4vw, 2.1rem)' }}>
          Reply
        </span>
      </div>
      <p className="eyebrow">AI Email Reply Generator</p>

      <h1
        className="headline"
        style={{
          fontSize: 'clamp(1.5rem, 3vw, 1.9rem)',
          fontWeight: 500,
          color: 'var(--text-muted)',
          marginBottom: 0,
        }}
      >
        Paste what landed in your inbox. Get a reply worth sending.
      </h1>

      <div className="letter-card">
        <label className="field-label" htmlFor="original-email">
          Original message
        </label>
        <div className="quote-rail">
          <textarea
            id="original-email"
            rows={7}
            placeholder="Paste the email message you received here..."
            value={emailContent}
            onChange={(e) => setEmailContent(e.target.value)}
            style={{
              width: '100%',
              resize: 'vertical',
              background: 'transparent',
              border: 'none',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-body)',
              fontSize: '15px',
              lineHeight: 1.6,
              outline: 'none',
            }}
          />
        </div>
        <div className="char-count">{emailContent.length} characters</div>

        <label className="field-label" style={{ marginTop: 22 }}>
          Tone
        </label>
        <div className="tone-row">
          {TONES.map((t) => (
            <button
              key={t.value}
              type="button"
              className={`tone-pill${tone === t.value ? ' selected' : ''}`}
              style={t.color ? { '--tone-color': t.color } : undefined}
              onClick={() => setTone(t.value)}
              aria-pressed={tone === t.value}
            >
              {t.color && <span className="dot" />}
              {t.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          className={`generate-btn${loading ? ' sending' : ''}`}
          onClick={handleSubmit}
          disabled={!emailContent || loading}
        >
          <PlaneIcon className="plane-icon" />
          {loading ? 'Sending to AI…' : 'Generate reply'}
        </button>

        {error && <div className="error-banner">{error}</div>}
      </div>

      {generatedReply && (
        <div className="reply-section">
          <div className="reply-header">
            <span className="reply-title">Generated reply</span>
          </div>
          <div className="reply-card">
            {displayedReply}
            {isTyping && <span className="typing-cursor" />}
          </div>
          <button
            type="button"
            className={`copy-btn${copied ? ' copied' : ''}`}
            onClick={handleCopy}
          >
            {copied ? <CheckIcon /> : <CopyIcon />}
            {copied ? 'Copied' : 'Copy to clipboard'}
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
