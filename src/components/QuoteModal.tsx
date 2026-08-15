import { useState } from 'react';
import { Sparkles, X, Check, RefreshCw, Quote, Heart, Filter } from 'lucide-react';
import { BirthdayQuote } from '../types';
import { MOTHER_DAUGHTER_QUOTES, fetchOnlineBirthdayQuotes } from '../data/quotes';

interface QuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectQuote: (quote: BirthdayQuote) => void;
  currentQuoteText?: string;
}

export function QuoteModal({ isOpen, onClose, onSelectQuote, currentQuoteText }: QuoteModalProps) {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [quotes, setQuotes] = useState<BirthdayQuote[]>(MOTHER_DAUGHTER_QUOTES);
  const [isFetching, setIsFetching] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const categories = [
    { id: 'all', label: 'All Quotes' },
    { id: 'shared-birthday', label: 'Shared Birthday Bond' },
    { id: 'mother-love', label: "Mother's Heart" },
    { id: 'daughter-light', label: "Daughter's Light" },
    { id: 'growing-together', label: 'Growing Together' },
    { id: 'wishes', label: 'Birthday Wishes' },
  ];

  const filteredQuotes = quotes.filter((q) => {
    if (activeCategory === 'all') return true;
    return q.category === activeCategory;
  });

  const handleFetchMore = async () => {
    setIsFetching(true);
    try {
      const freshQuotes = await fetchOnlineBirthdayQuotes();
      setQuotes((prev) => [...freshQuotes, ...prev]);
    } finally {
      setIsFetching(false);
    }
  };

  const handleCopy = (quote: BirthdayQuote) => {
    navigator.clipboard?.writeText(quote.text);
    setCopiedId(quote.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="quote-modal-panel" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-area">
            <span className="eyebrow"><Heart size={13} className="inline-icon" /> Mother & Daughter Shared Birthday</span>
            <h2>Curated Quotes & Inspirations</h2>
            <p>Every quote honors the extraordinary bond of sharing the same birthday.</p>
          </div>
          <button className="glass-icon-button" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        <div className="category-chips">
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={`chip ${activeCategory === cat.id ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat.id)}
            >
              {cat.label}
            </button>
          ))}
          <button
            className="chip fetch-button"
            onClick={handleFetchMore}
            disabled={isFetching}
            title="Fetch new quotes from web anthology"
          >
            <RefreshCw size={14} className={isFetching ? 'spin' : ''} />
            {isFetching ? 'Fetching online...' : 'Fetch Online Quotes'}
          </button>
        </div>

        <div className="quotes-grid">
          {filteredQuotes.map((quote) => {
            const isSelected = currentQuoteText === quote.text;
            return (
              <div
                key={quote.id}
                className={`quote-card-item ${isSelected ? 'is-selected' : ''} ${quote.isOriginal ? 'is-original' : ''}`}
              >
                {quote.isOriginal && <span className="original-badge">Original Quote</span>}
                <Quote size={20} className="quote-glyph" />
                <p className="quote-body">{quote.text}</p>
                {quote.author && <span className="quote-author-tag">— {quote.author}</span>}

                <div className="card-actions">
                  <button
                    className="action-btn-secondary"
                    onClick={() => handleCopy(quote)}
                  >
                    {copiedId === quote.id ? <Check size={14} /> : 'Copy'}
                  </button>
                  <button
                    className="action-btn-primary"
                    onClick={() => {
                      onSelectQuote(quote);
                      onClose();
                    }}
                  >
                    Use in Scene
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
