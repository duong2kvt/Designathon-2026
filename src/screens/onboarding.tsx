import { useEffect, useRef, useState } from 'react';
import { useApp, type Channel } from '../state';
import { Button, Checkbox, Chip, Header, HomeBar, Icon, OtpInput, Pic, Progress, Screen, Sheet, StatusBar, imgUrl } from '../ui';
import splashVideo from '../assets/splash.mp4';
import { LanguagePicker } from '../LanguagePicker';

export const Logo = ({ scale = 1 }: { scale?: number }) => (
  <span className="logo" style={scale !== 1 ? { fontSize: 16 * scale, lineHeight: `${24 * scale}px`, gap: 4 * scale } : undefined}>
    <Icon name="logo-mark" color="#0f73ff" style={{ width: 22 * scale, height: 18.7 * scale }} />
    ViecNhanh
  </span>
);

/* ── Splash: plays the supplied badge-to-logo animation, then moves on ── */
export function Splash() {
  const { go } = useApp();
  const done = useRef(false);
  const next = () => {
    if (done.current) return;
    done.current = true;
    go('intro', 'fade');
  };
  useEffect(() => {
    const t = window.setTimeout(next, 6000); // safety net if the video cannot play
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div className="screen splash" onClick={next} role="img" aria-label="Việc Nhanh">
      <video src={splashVideo} autoPlay muted playsInline preload="auto" onEnded={() => window.setTimeout(next, 250)} />
    </div>
  );
}

/* ── Intro carousel ── */
const SLIDES = [
  { title: 'Goods delivery is now easier', body: 'Now, managing goods delivery has become simpler than ever.' },
  { title: 'We keep an eye on your documents', body: 'Scan your card once. Việc Nhanh reminds you before your documents expire.' },
  { title: 'Businesses pick you. You just tap Accept', body: 'Paid weekly. If a factory ends early, you still get paid while you wait.' },
];

export function Intro() {
  const { go } = useApp();
  const [i, setI] = useState(0);
  const [drag, setDrag] = useState<number | null>(null);
  const start = useRef<{ x: number; id: number } | null>(null);
  const paused = useRef(false);

  useEffect(() => {
    const t = window.setInterval(() => { if (!paused.current) setI((v) => (v + 1) % SLIDES.length); }, 4500);
    return () => window.clearInterval(t);
  }, []);

  const scaleOf = (el: HTMLElement) => el.getBoundingClientRect().width / el.offsetWidth || 1;
  return (
    <Screen
      top={<><StatusBar /><div className="topbar"><Logo /><LanguagePicker /></div></>}
      bottom={
        <div className="footer">
          <div style={{ padding: '12px 16px' }}><Button onClick={() => go('phone')}>Sign up</Button></div>
          <p className="terms">
            By Login or Register, you agree to our <a href="#terms" onClick={(e) => e.preventDefault()}>Terms of service</a> and{' '}
            <a href="#terms" onClick={(e) => e.preventDefault()}>Terms</a> and <a href="#privacy" onClick={(e) => e.preventDefault()}>Privacy and policy</a>.
          </p>
          <HomeBar />
        </div>
      }
    >
      <div
        className={`intro-track ${drag !== null ? 'dragging' : ''}`}
        style={{ transform: `translateX(${-i * 402 + (drag ?? 0)}px)` }}
        onPointerDown={(e) => { start.current = { x: e.clientX, id: e.pointerId }; paused.current = true; e.currentTarget.setPointerCapture(e.pointerId); }}
        onPointerMove={(e) => {
          if (!start.current) return;
          const dx = (e.clientX - start.current.x) / scaleOf(e.currentTarget);
          const edge = (i === 0 && dx > 0) || (i === SLIDES.length - 1 && dx < 0);
          setDrag(edge ? dx / 3 : dx);
        }}
        onPointerUp={() => {
          if (drag !== null && Math.abs(drag) > 50) setI((v) => Math.min(SLIDES.length - 1, Math.max(0, v + (drag < 0 ? 1 : -1))));
          start.current = null; setDrag(null); paused.current = false;
        }}
        onPointerCancel={() => { start.current = null; setDrag(null); paused.current = false; }}
      >
        {SLIDES.map((s, k) => (
          <section className="slide" key={s.title} aria-hidden={k !== i}>
            <div className="art">
              {k === 0 && <img src={imgUrl('intro1-hand.webp')} alt="" style={{ left: 0, top: 16, width: 367, height: 336 }} />}
              {k === 1 && <img src={imgUrl('intro2-hand.webp')} alt="" style={{ left: 78, top: 16, width: 262, height: 336 }} />}
              {k === 2 && <img src={imgUrl('intro3-pocket.webp')} alt="" style={{ left: 0, top: 0, width: 402, height: 352 }} />}
              <div className="fade-b" />
              {k === 2 && <div className="fade-t" />}
              {k === 1 && (
                <div style={{ position: 'absolute', left: 93, top: 64, width: 217, height: 138 }}>
                  <img src={imgUrl('intro2-card.png')} alt="" style={{ left: 0, top: 0, width: 217, height: 138 }} />
                </div>
              )}
            </div>
            <div className="copy">
              <h2>{s.title}</h2>
              <p className="t16 c49">{s.body}</p>
            </div>
            <div className="dots" role="tablist" aria-label="Intro slides" onPointerDown={(e) => e.stopPropagation()}>
              {SLIDES.map((d, j) => (
                <button key={d.title} role="tab" aria-selected={j === k} aria-label={`Slide ${j + 1}`} className={j === k ? 'on' : ''} tabIndex={k === i ? 0 : -1} onClick={() => setI(j)} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </Screen>
  );
}

/* ── 05 Phone number ── */
const CHANNELS: { id: Channel; title: string; desc: string; icon: JSX.Element }[] = [
  { id: 'whatsapp', title: 'WhatsApp', desc: 'Fastest if you have WhatsApp', icon: <Pic name="whatsapp" size={20} /> },
  { id: 'sms', title: 'Text message (SMS)', desc: 'Works with any phone number', icon: <Icon name="message" size={20} color="#111" /> },
  { id: 'call', title: 'Phone call', desc: 'An automated call reads the code to you', icon: <Icon name="phone-line" size={20} color="#111" /> },
];
export const channelLabel = (c: Channel) => (c === 'whatsapp' ? 'via WhatsApp' : c === 'sms' ? 'by text message' : 'by phone call');

export function PhoneNumber() {
  const { go, back, data, set } = useApp();
  const [agree, setAgree] = useState(true);
  const digits = data.phone.replace(/\D/g, '');
  const valid = digits.length >= 7 && digits.length <= 13 && agree;
  return (
    <Screen
      top={<><StatusBar /><Header title="Sign up" right="Step 1/3" onBack={() => back('intro')} /></>}
      bottom={<div className="footer" style={{ padding: '12px 24px 34px' }}><Button variant="pill" disabled={!valid} onClick={() => go('otp')}>Send code</Button></div>}
      bodyClass="pad24"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Progress value={114 / 354} />
        <h2 className="anton">Your phone number</h2>
        <label>
          <span className="field-label t16s">Phone number</span>
          <span className="field">
            <span className="c49">+49</span>
            <input
              type="tel" inputMode="tel" autoComplete="tel-national" placeholder="151 2345 6789" value={data.phone}
              onChange={(e) => set({ phone: e.target.value.replace(/[^\d ]/g, '').slice(0, 16) })}
            />
          </span>
        </label>
        <p className="t16s">Send verification code by</p>
        <div role="radiogroup" aria-label="Send verification code by" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {CHANNELS.map((c) => {
            const on = data.channel === c.id;
            return (
              <button key={c.id} role="radio" aria-checked={on} className={`option ${on ? 'on' : ''}`} onClick={() => set({ channel: c.id })}>
                <span className="txt">
                  <span className="ttl">{c.title}{c.icon}</span>
                  <span className="t14 c49">{c.desc}</span>
                </span>
                <span className="radio"><i /></span>
              </button>
            );
          })}
        </div>
        <Checkbox checked={agree} onChange={setAgree}><span className="t16">I agree to the Việc Nhanh Privacy Policy</span></Checkbox>
      </div>
    </Screen>
  );
}

/* ── 06 Verification code ── */
export function VerifyCode() {
  const { go, back, data, toast, set } = useApp();
  const [code, setCode] = useState('');
  const [left, setLeft] = useState(45);
  useEffect(() => {
    const t = window.setInterval(() => setLeft((v) => Math.max(0, v - 1)), 1000);
    return () => window.clearInterval(t);
  }, []);
  const resend = (channel: Channel, message: string) => { set({ channel }); setLeft(45); setCode(''); toast(message); };
  return (
    <Screen
      top={<><StatusBar /><Header title="Sign up" right="Step 1/3" onBack={() => back('phone')} /></>}
      bottom={<div className="footer" style={{ padding: '12px 24px 34px' }}><Button variant="pill" disabled={code.length < 6} onClick={() => go('prefs')}>Confirm</Button></div>}
      bodyClass="pad24"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Progress value={114 / 354} />
        <h2 className="anton">Enter verification code</h2>
        <p className="t16 muted">We sent a 6-digit code {channelLabel(data.channel)} to +49 {data.phone.trim() || '151 2345 6789'}.</p>
        <OtpInput value={code} onChange={setCode} autoFill="482913" />
        {left > 0 ? (
          <p className="t16 muted">Resend code in 0:{String(left).padStart(2, '0')}</p>
        ) : (
          <button className="t16s" style={{ color: 'var(--blue)', alignSelf: 'flex-start' }} onClick={() => resend(data.channel, 'New code sent')}>Resend code</button>
        )}
        <p className="t16s">Didn't get the code?</p>
        <div className="chips">
          <Chip onClick={() => resend('sms', 'Code sent by text message')}>Send by SMS</Chip>
          <Chip onClick={() => resend('call', 'We are calling you now')}>Call me</Chip>
          <Chip onClick={() => back('phone')}>Change number</Chip>
        </div>
        <img src={imgUrl('paper-airplanes.png')} alt="" width={200} height={200} draggable={false} style={{ margin: '5px 0 0 76px' }} />
      </div>
    </Screen>
  );
}

/* ── 07 Preferences ── */
const JOB_TYPES = ['Factory', 'Warehouse', 'Packing', 'Day jobs'];
const SHIFTS = ['Morning', 'Afternoon', 'Night', 'Weekend'];

export function Preferences() {
  const { go, back, toast } = useApp();
  const [jobs, setJobs] = useState<string[]>(['Factory']);
  const [shifts, setShifts] = useState<string[]>(['Morning']);
  const toggle = (list: string[], v: string) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);
  return (
    <Screen
      top={<><StatusBar /><Header title="Preferences" right="Step 2/3" onBack={() => back('otp')} /></>}
      bottom={
        <div className="footer" style={{ padding: '12px 24px 34px' }}>
          <Button variant="pill" disabled={jobs.length === 0 || shifts.length === 0} onClick={() => go('docs')}>Continue</Button>
        </div>
      }
      bodyClass="pad24"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Progress value={228 / 354} />
        <h2 className="anton">What work are you looking for?</h2>
        <p className="t16 muted">Pick as many as you like. You can change them anytime.</p>
        <p className="t14">Job type</p>
        <div className="chips">{JOB_TYPES.map((j) => <Chip key={j} selected={jobs.includes(j)} onClick={() => setJobs((l) => toggle(l, j))}>{j}</Chip>)}</div>
        <p className="t14">Shifts</p>
        <div className="chips">{SHIFTS.map((j) => <Chip key={j} selected={shifts.includes(j)} onClick={() => setShifts((l) => toggle(l, j))}>{j}</Chip>)}</div>
        <p className="t16s">Work area</p>
        <div className="workarea">
          <img src={imgUrl('work-area.webp')} alt="" />
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span className="t16s">Around Frankfurter Allee, Berlin</span>
            <span className="t14 muted">Up to 25 km away</span>
          </div>
          <button className="link" onClick={() => toast('Work area can be changed in Profile')}>Change</button>
        </div>
        <div>
          <span className="field-label t16s">Available to start from</span>
          <button className="field" style={{ color: '#8a8a8a' }} onClick={() => toast('Earliest start: Monday, 17/11/2026')}>Monday, 17/11/2026</button>
        </div>
      </div>
    </Screen>
  );
}

/* ── 08 Add documents + 09 card reader sheet ── */
const TRUST = [
  'Việc Nhanh GmbH, registered in Berlin (HRB 251843 B).',
  'Licensed for temporary staffing by the Federal Employment Agency. You can check with the agency yourself.',
  "Your card is read with Germany's official eID function. Before you enter your PIN, you see Việc Nhanh's name and exactly what will be read.",
  "Pay follows the sector's collective agreement, never below the sector minimum.",
];

export function AddDocuments() {
  const { go, toast } = useApp();
  const [scanning, setScanning] = useState(false);
  useEffect(() => {
    if (!scanning) return;
    const t = window.setTimeout(() => go('details'), 3000);
    return () => window.clearTimeout(t);
  }, [scanning, go]);
  return (
    <div className="screen">
      <StatusBar />
      <div className="topbar"><Progress value={68.4 / 370} track="#dedbce" /></div>
      <div className="body">
        <div style={{ padding: '8px 16px 12px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <h2 className="anton c86">Add your documents to get jobs</h2>
            <p className="t16 c49">In Germany, your employer must check your identity before your first day, even for a one-day job. If you're not an EU citizen, they also check that you're allowed to work.</p>
          </div>
          <div className="trust">
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'center' }}><Logo /></div>
              {TRUST.map((t) => (
                <div className="item" key={t}>
                  <Icon name="check-line" size={16} color="#1a8a3c" />
                  <span className="t14 c86" style={{ flex: 1 }}>{t}</span>
                </div>
              ))}
              <Pic name="badge-shield" size={40} style={{ position: 'absolute', right: 6.5, bottom: 6.5 }} />
            </div>
          </div>
        </div>
        <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
          <Button onClick={() => setScanning(true)}>Hold card to phone</Button>
          <Button variant="secondary" onClick={() => toast('Camera capture is not part of this demo')}>Photograph documents</Button>
          <Button variant="text" onClick={() => go('home')}>Skip for now</Button>
        </div>
        <HomeBar />
      </div>
      <Sheet open={scanning} onClose={() => setScanning(false)}>
        <div style={{ padding: '20px 20px 0' }}>
          <div className="idscan">
            <img src={imgUrl('id-card.png')} alt="" />
            <div className="scanline" />
          </div>
          <div style={{ padding: '20px 16px 8px', display: 'flex', flexDirection: 'column', gap: 8, textAlign: 'center' }}>
            <h2 style={{ font: '400 22px/28px var(--display)', color: '#121212' }}>Ready to read card</h2>
            <p className="t16 c49">Hold the back of your card against the back of your phone. Keep still until it's done.</p>
          </div>
        </div>
        <div style={{ padding: '32px 16px 12px' }}><Button variant="secondary" onClick={() => setScanning(false)}>Cancel</Button></div>
        <HomeBar />
      </Sheet>
    </div>
  );
}

/* ── 10 Check your details ── */
const DETAILS = [
  ['Full name', 'NGUYEN VAN AN'],
  ['Address', 'Frankfurter Allee 120, 10365 Berlin'],
  ['Card type', 'Residence permit · family reunification'],
  ['Valid until', '30/09/2027'],
  ['Allowed to work', 'Any type of work'],
];

export function CheckDetails() {
  const { go, back, toast } = useApp();
  return (
    <div className="screen">
      <StatusBar />
      <Header title="Documents" right="Step 3/3" onBack={() => back('docs')} compact />
      <div style={{ height: 40, flex: 'none', display: 'flex', alignItems: 'center', padding: '8px 16px' }}><Progress value={1} track="#dedbce" /></div>
      <div className="body">
        <div style={{ padding: '8px 20px 12px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <h2 className="anton c86">Check your details</h2>
            <p className="t16 c49">Read from the chip on your card.</p>
          </div>
          <div className="detail-card">
            {DETAILS.map(([k, v], i) => (
              <div key={k} style={{ animationDelay: `${0.25 + i * 0.07}s` }}>
                <span className="t14 c49">{k}</span>
                <span className="t16s c86">{v}</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Button variant="secondary" icon={<Icon name="plus" color="#0e121b" />} onClick={() => toast('You can add more documents later in Profile')}>Add other documents</Button>
            <p className="t14 c49 center">For example: truck licence, forklift certificate. Optional.</p>
          </div>
        </div>
        <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 12, marginTop: 'auto' }}>
          <Button onClick={() => go('home')}>Confirm</Button>
          <Button variant="secondary" onClick={() => back('docs')}>Scan again</Button>
        </div>
        <HomeBar />
      </div>
    </div>
  );
}
