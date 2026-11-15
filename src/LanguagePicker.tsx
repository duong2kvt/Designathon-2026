import { useEffect, useRef, useState } from 'react';
import globe from './assets/icons/language-globe.svg';
import chevron from './assets/icons/language-chevron.svg';

const languages = [
  { code: 'en', label: 'English' },
  { code: 'vi', label: 'Vietnamese' },
  { code: 'de', label: 'German' },
];

export function LanguagePicker({ compact = false }: { compact?: boolean }) {
  const [selected, setSelected] = useState(() => {
    try { return languages.find((language) => language.code === localStorage.getItem('viecnhanh-language')) ?? languages[0]; }
    catch { return languages[0]; }
  });
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const options = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    if (!open) return;
    options.current[languages.indexOf(selected)]?.focus();
    const closeOutside = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', closeOutside);
    return () => document.removeEventListener('pointerdown', closeOutside);
  }, [open, selected]);

  return (
    <div className={`language-picker${compact ? ' compact' : ''}`} ref={root}
      onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false); }}
      onKeyDown={(event) => {
        if (event.key === 'Escape') { event.stopPropagation(); setOpen(false); trigger.current?.focus(); }
        if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
          event.preventDefault(); event.stopPropagation();
          if (!open) { setOpen(true); return; }
          const current = options.current.indexOf(document.activeElement as HTMLButtonElement);
          const next = event.key === 'Home' ? 0 : event.key === 'End' ? languages.length - 1
            : (current + (event.key === 'ArrowDown' ? 1 : -1) + languages.length) % languages.length;
          options.current[next]?.focus();
        }
      }}>
      <button ref={trigger} className="language-chip" aria-label={`Language: ${selected.label}`}
        aria-haspopup="menu" aria-expanded={open} aria-controls="intro-language-menu" onClick={() => setOpen(!open)}>
        <img src={globe} width="16" height="16" alt="" />
        <span>{selected.label}</span>
        <img className={open ? 'expanded' : ''} src={chevron} width="12" height="12" alt="" />
      </button>
      {open && <div className="language-menu" id="intro-language-menu" role="menu" aria-label="Choose language">
        {languages.map((language, index) => (
          <button key={language.code} ref={(element) => { options.current[index] = element; }}
            role="menuitemradio" aria-checked={selected.code === language.code} lang={language.code}
            onClick={() => {
              setSelected(language); setOpen(false);
              try { localStorage.setItem('viecnhanh-language', language.code); } catch { /* Selection still works without storage. */ }
              trigger.current?.focus();
            }}>
            <span>{language.label}</span><span aria-hidden="true">{selected.code === language.code ? '✓' : ''}</span>
          </button>
        ))}
      </div>}
    </div>
  );
}
