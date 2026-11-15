import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { useApp, type ScreenId } from './state';

const iconUrls = import.meta.glob('./assets/icons/*.png', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;
const imgUrls = import.meta.glob('./assets/img/*.{png,webp,jpg}', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;

export const iconUrl = (name: string) => iconUrls[`./assets/icons/${name}.png`];
export const imgUrl = (file: string) => imgUrls[`./assets/img/${file}`];

/** Single-colour icon, tinted with `color` (defaults to currentColor). */
export function Icon({ name, size = 24, color, style }: { name: string; size?: number; color?: string; style?: CSSProperties }) {
  const url = `url("${iconUrl(name)}")`;
  return (
    <span
      aria-hidden
      className="icon"
      style={{ width: size, height: size, backgroundColor: color ?? 'currentColor', WebkitMaskImage: url, maskImage: url, ...style }}
    />
  );
}

/** Multi-colour icon / illustration rendered as-is. */
export function Pic({ name, size, width, height, style, alt = '' }: { name: string; size?: number; width?: number; height?: number; style?: CSSProperties; alt?: string }) {
  return <img className="pic" src={iconUrl(name)} alt={alt} draggable={false} style={{ width: width ?? size, height: height ?? size, ...style }} />;
}

export function StatusBar({ tone = 'dark' }: { tone?: 'dark' | 'light' }) {
  return (
    <div className={`statusbar ${tone}`}>
      <span className="time">9:41</span>
      {tone === 'dark' ? (
        <img className="right" src={iconUrl('status-right')} alt="" draggable={false} />
      ) : (
        <Icon name="status-right" style={{ width: 71, height: 13 }} color="#fff" />
      )}
    </div>
  );
}

export const HomeBar = ({ tone = 'dark' }: { tone?: 'dark' | 'light' }) => (
  <div className="homebar"><i style={tone === 'light' ? { background: '#fff' } : undefined} /></div>
);

export function Header({ title, right, onBack, compact }: { title: string; right?: string; onBack: () => void; compact?: boolean }) {
  return (
    <header className="header">
      <button className="iconbtn" aria-label="Back" onClick={onBack}><Icon name="back" color="#1e1e1e" /></button>
      <h1 className={compact ? 'compact' : ''}>{title}</h1>
      {right && <span className="step">{right}</span>}
    </header>
  );
}

type BtnProps = {
  children: ReactNode; onClick?: () => void; disabled?: boolean; icon?: ReactNode;
  variant?: 'main' | 'pill' | 'secondary' | 'text' | 'danger';
  height?: number; style?: CSSProperties;
};
export function Button({ children, onClick, disabled, icon, variant = 'main', height, style }: BtnProps) {
  return (
    <button className={`btn ${variant}`} onClick={onClick} disabled={disabled} style={{ height, ...style }}>
      {icon}
      <span>{children}</span>
    </button>
  );
}

export const Progress = ({ value, track = '#e6e6e6' }: { value: number; track?: string }) => (
  <div className="progress" style={{ background: track }}><i style={{ width: `${value * 100}%` }} /></div>
);

export function Chip({ children, selected, onClick }: { children: ReactNode; selected?: boolean; onClick?: () => void }) {
  return <button className={`chip ${selected ? 'on' : ''}`} aria-pressed={selected} onClick={onClick}>{children}</button>;
}

export function Checkbox({ checked, onChange, children, size = 22 }: { checked: boolean; onChange: (v: boolean) => void; children: ReactNode; size?: number }) {
  return (
    <label className="checkbox">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className={`box ${checked ? 'on' : ''}`} style={{ width: size, height: size }}>
        {checked && <Icon name="check-14" size={14} color="#fff" />}
      </span>
      <span className="label">{children}</span>
    </label>
  );
}

/** Six-digit code entry. Typing works with a real keyboard; `autoFill` simulates the code arriving from the messaging app. */
export function OtpInput({ value, onChange, autoFill, boxW = 48, boxH = 56, fontSize = 18 }: {
  value: string; onChange: (v: string) => void; autoFill?: string; boxW?: number; boxH?: number; fontSize?: number;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const touched = useRef(false);
  const [focused, setFocused] = useState(false);
  const valueRef = useRef(value);
  valueRef.current = value;

  useEffect(() => {
    if (!autoFill) return;
    let i = 0;
    let timer: number;
    const tick = () => {
      if (touched.current || i >= autoFill.length) return;
      i += 1;
      onChange(autoFill.slice(0, i));
      timer = window.setTimeout(tick, 260);
    };
    timer = window.setTimeout(tick, 1100);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoFill]);

  const active = Math.min(value.length, 5);
  return (
    <div className="otp" onClick={() => ref.current?.focus()}>
      <input
        ref={ref} inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={value} aria-label="Verification code"
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        onChange={(e) => { touched.current = true; onChange(e.target.value.replace(/\D/g, '').slice(0, 6)); }}
      />
      {Array.from({ length: 6 }, (_, i) => {
        const filled = i < value.length;
        const isActive = i === active && value.length < 6 && (focused || !touched.current);
        return (
          <span key={i} className={`cell ${filled ? 'filled' : ''} ${isActive ? 'active' : ''}`} style={{ width: boxW, height: boxH, fontSize }}>
            {value[i] ?? ''}
          </span>
        );
      })}
    </div>
  );
}

export function Sheet({ open, onClose, children, tone = 'grey', dark }: { open: boolean; onClose?: () => void; children: ReactNode; tone?: 'grey' | 'white'; dark?: boolean }) {
  const [mounted, setMounted] = useState(open);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    if (open) {
      setMounted(true);
      const r = requestAnimationFrame(() => requestAnimationFrame(() => setShown(true)));
      return () => cancelAnimationFrame(r);
    }
    setShown(false);
    const t = window.setTimeout(() => setMounted(false), 320);
    return () => window.clearTimeout(t);
  }, [open]);
  if (!mounted) return null;
  return (
    <div className={`sheet-layer ${shown ? 'shown' : ''} ${dark ? 'dark' : ''}`}>
      <div className="scrim" onClick={onClose} />
      <div className={`sheet ${tone}`} role="dialog" aria-modal>
        <div className="grabber" />
        {children}
      </div>
    </div>
  );
}

export function BottomNav({ active }: { active: 'home' | 'qa' | 'profile' }) {
  const { go, toast, set } = useApp();
  const items: { id: 'home' | 'qa' | 'profile'; label: string; icon: string; to?: ScreenId }[] = [
    { id: 'home', label: 'Home', icon: 'nav-home', to: 'home' },
    { id: 'qa', label: 'Q&A', icon: 'nav-qa', to: 'qa' },
    { id: 'profile', label: 'Profile', icon: 'nav-profile' },
  ];
  return (
    <nav className="bottomnav">
      <div className="items">
        {items.map((it) => {
          const on = it.id === active;
          return (
            <button
              key={it.id} className={on ? 'on' : ''} aria-current={on ? 'page' : undefined}
              onClick={() => {
                if (on) return;
                if (!it.to) return toast('Profile is coming soon');
                if (it.to === 'qa') set({ question: null });
                go(it.to, 'fade');
              }}
            >
              <Icon name={on ? `${it.icon}-active` : it.icon} color={on ? '#0f73ff' : 'rgba(1,1,1,.45)'} />
              <span>{it.label}</span>
            </button>
          );
        })}
      </div>
      <HomeBar />
    </nav>
  );
}

export const Rows = ({ rows, tight }: { rows: { k: string; v: ReactNode; tone?: 'blue' | 'red' }[]; tight?: boolean }) => (
  <>
    {rows.map((r, i) => (
      <div key={r.k} className={`kv ${i > 0 ? 'line' : ''} ${tight ? 'tight' : ''}`}>
        <span className="k">{r.k}</span>
        <span className={`v ${r.tone ?? ''}`}>{r.v}</span>
      </div>
    ))}
  </>
);

/** Screen scaffold: fixed chrome on top/bottom, scrollable body in between. */
export function Screen({ top, bottom, children, className = '', bodyClass = '', bodyRef }: {
  top?: ReactNode; bottom?: ReactNode; children: ReactNode; className?: string; bodyClass?: string; bodyRef?: React.Ref<HTMLDivElement>;
}) {
  return (
    <div className={`screen ${className}`}>
      {top}
      <div className={`body ${bodyClass}`} ref={bodyRef}>{children}</div>
      {bottom}
    </div>
  );
}
