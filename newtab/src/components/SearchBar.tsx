import { useState } from 'react';
import { IconArrowRight, IconSearch } from './icons';

// Privacy search — Enter redirects to DuckDuckGo.
export default function SearchBar() {
  const [q, setQ] = useState('');

  const go = () => {
    const query = q.trim();
    if (!query) return;
    window.location.href = `https://duckduckgo.com/?q=${encodeURIComponent(query)}`;
  };

  return (
    <div className="flex h-14 w-full items-center gap-3 rounded-full border border-[#2A2A2A] bg-[#111111] px-5">
      <span className="text-[#666]"><IconSearch size={18} /></span>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') go();
        }}
        placeholder="Search the web privately"
        className="flex-1 bg-transparent text-[15px] text-white placeholder-[#555] outline-none"
        aria-label="Search the web privately"
      />
      <button
        onClick={go}
        aria-label="Search"
        className="flex h-8 w-8 items-center justify-center rounded-full bg-[#E30613] text-white hover:bg-[#f31220]"
      >
        <IconArrowRight size={16} />
      </button>
    </div>
  );
}
