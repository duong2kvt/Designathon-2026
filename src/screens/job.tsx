import { useEffect, useRef, useState } from 'react';
import { useApp } from '../state';
import { Button, Header, HomeBar, Icon, OtpInput, Pic, Rows, Screen, Sheet, StatusBar, imgUrl } from '../ui';

/* ── 12 Lock screen with the WhatsApp notification ── */
export function LockScreen() {
  const { go } = useApp();
  return (
    <div className="screen lock" style={{ backgroundImage: `url("${imgUrl('lock-wallpaper.jpg')}")` }}>
      <p className="date">Sunday, 15 November</p>
      <p className="clock">08:42</p>
      <button className="notif" onClick={() => go('offer', 'fade')}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Pic name="whatsapp-notif" size={20} />
          <span className="t12 c49">WhatsApp · Việc Nhanh · now</span>
        </span>
        <span style={{ font: '600 15px/18px var(--sans)' }}>Spreewerk Verpackung picked you</span>
        <span style={{ font: '400 14px/17px var(--sans)' }}>Packing worker · €15.50/hr · starts 18/11. Reply by 14:00 today.</span>
      </button>
    </div>
  );
}

/* ── Signature pad ── */
function SignaturePad({ signed, onSigned, clearSignal }: { signed: boolean; onSigned: (v: boolean) => void; clearSignal: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const last = useRef<{ x: number; y: number } | null>(null);
  const length = useRef(0);

  useEffect(() => {
    const c = ref.current!;
    const ratio = Math.max(2, Math.min(4, (window.devicePixelRatio || 1) * 2));
    c.width = c.offsetWidth * ratio;
    c.height = c.offsetHeight * ratio;
    const ctx = c.getContext('2d')!;
    ctx.scale(ratio, ratio);
    ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.lineWidth = 2.2; ctx.strokeStyle = '#1e1e1e';
    length.current = 0;
  }, [clearSignal]);

  const point = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const c = ref.current!;
    const r = c.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * c.offsetWidth, y: ((e.clientY - r.top) / r.height) * c.offsetHeight };
  };
  return (
    <div className={`sigpad ${signed ? 'signed' : ''}`}>
      <canvas
        ref={ref} aria-label="Signature area"
        onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); last.current = point(e); }}
        onPointerMove={(e) => {
          if (!last.current) return;
          const p = point(e);
          const ctx = ref.current!.getContext('2d')!;
          ctx.beginPath(); ctx.moveTo(last.current.x, last.current.y); ctx.lineTo(p.x, p.y); ctx.stroke();
          length.current += Math.hypot(p.x - last.current.x, p.y - last.current.y);
          last.current = p;
          if (!signed && length.current > 40) onSigned(true);
        }}
        onPointerUp={() => { last.current = null; }}
        onPointerCancel={() => { last.current = null; }}
      />
      <span className="t16 muted">Sign here</span>
    </div>
  );
}

/* ── 13 Job offer + 14 Confirm signature ── */
const SectionTitle = ({ icon, children }: { icon: string; children: string }) => (
  <div className="ttl"><Icon name={icon} size={20} color="#0f73ff" />{children}</div>
);

export function JobOffer() {
  const { go, set, toast, data } = useApp();
  const [agree, setAgree] = useState(false);
  const [signed, setSigned] = useState(false);
  const [clearSignal, setClearSignal] = useState(0);
  const [confirm, setConfirm] = useState(false);
  const [code, setCode] = useState('');
  const ready = agree && signed;

  const finish = () => { set({ employed: true }); go('accepted'); };
  return (
    <Screen
      top={<><StatusBar /><Header title="Job offer" onBack={() => go('lock', 'back')} /></>}
      bottom={
        <div className="footer row" style={{ padding: '12px 24px 34px' }}>
          <Button variant="danger" onClick={() => { toast('Offer declined'); go('home', 'fade'); }}>Decline</Button>
          <Button disabled={!ready} onClick={() => { setCode(''); setConfirm(true); }}>Sign and accept</Button>
        </div>
      }
    >
      <div className="offer">
        <div style={{ display: 'flex', gap: 8 }}>
          <span className="pill-badge">A factory picked you</span>
          <span className="pill-badge">5 hours left to reply</span>
        </div>
        <h2 style={{ font: '400 32px/40px var(--display)', letterSpacing: '-0.5px' }}>Packing worker</h2>
        <p className="t14 muted">Spreewerk Verpackung GmbH · Ludwigsfelde</p>

        <section className="ocard">
          <SectionTitle icon="pay">Pay</SectionTitle>
          <Rows rows={[
            { k: 'Hourly rate (gross)', v: '€15.50' },
            { k: 'Hours per week', v: '35 hours' },
            { k: 'Weekly pay (gross)', v: '€542.50' },
            { k: 'Tax and insurance (estimate)', v: '−€157.30', tone: 'red' },
          ]} />
          <div className="highlight">
            <div>
              <span className="t14s" style={{ flex: 1 }}>Weekly take-home (estimate)</span>
              <span style={{ font: '600 18px/24px var(--sans)', letterSpacing: '-0.36px', color: 'var(--blue)' }}>≈ €385.20</span>
            </div>
          </div>
          <Rows rows={[
            { k: 'Payday', v: 'Every Friday' },
            { k: 'When the contract ends', v: 'Remaining hours and unused leave are paid with your final pay' },
          ]} />
        </section>

        <section className="ocard">
          <SectionTitle icon="schedule">Schedule</SectionTitle>
          <Rows rows={[
            { k: 'Start', v: 'Wednesday, 18/11/2026' },
            { k: 'End', v: '17/05/2027 (6 months)' },
            { k: 'Shifts', v: '7:00–14:30, Monday to Friday' },
            { k: 'Break', v: '30 minutes' },
          ]} />
        </section>

        <section className="early">
          <Icon name="shield-check" size={20} color="#46a758" />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
            <b style={{ font: '600 16px/19px var(--sans)' }}>If the factory ends early</b>
            <span className="t14" style={{ color: '#3f434d' }}>You stay employed by Việc Nhanh and keep getting paid while you wait for a new job.</span>
          </div>
        </section>

        <section className="ocard">
          <SectionTitle icon="parties">Parties</SectionTitle>
          <Rows rows={[
            { k: 'Paid by', v: 'Việc Nhanh Personaldienste GmbH' },
            { k: 'Licence', v: 'Temporary staffing, issued by the Federal Employment Agency' },
            { k: 'Workplace', v: 'Industriestraße 14, 14974 Ludwigsfelde' },
          ]} />
        </section>

        <button className="contract-link" onClick={() => toast('The full contract opens as a PDF')}>
          <Icon name="doc" size={20} color="#0f73ff" />
          <span className="t14s" style={{ flex: 1, color: 'var(--blue)' }}>Read the full contract (Vietnamese, German)</span>
          <Icon name="chevron" size={18} color="#0f73ff" />
        </button>

        <label className="agree">
          <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
          <Pic name={agree ? 'checkbox-on' : 'checkbox-off'} size={20} />
          <span className="t14">I have read and agree to the contract</span>
        </label>

        <p className="t14s">Your signature</p>
        <SignaturePad signed={signed} onSigned={setSigned} clearSignal={clearSignal} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ flex: 1, font: '400 13px/16px var(--sans)' }} className="muted">After signing, enter the code we send on WhatsApp to confirm.</span>
          <button className="link" onClick={() => { setSigned(false); setClearSignal((n) => n + 1); }}>Clear</button>
        </div>
      </div>

      <Sheet open={confirm} onClose={() => setConfirm(false)} tone="white" dark>
          <div style={{ padding: '14px 24px 34px', display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center' }}>
            <h2 style={{ font: '400 22px/28px var(--display)' }}>Confirm signature</h2>
            <p className="t16 muted center">Enter the 6-digit code we just sent via WhatsApp to +49 {data.phone.trim() || '151 2345 6789'}.</p>
            {confirm && <OtpInput value={code} onChange={setCode} autoFill="713904" boxW={46} boxH={54} fontSize={20} />}
            <Button variant="pill" height={52} disabled={code.length < 6} onClick={finish}>Confirm</Button>
            <Button variant="text" height={44} onClick={() => { setCode(''); toast('New code sent'); }}>Resend code</Button>
          </div>
      </Sheet>
    </Screen>
  );
}

/* ── 15 Job accepted ── */
function SetupRow({ badge, title, sub, action, onClick }: { badge: string; title: string; sub: string; action: string; onClick: () => void }) {
  return (
    <button className="setrow" onClick={onClick}>
      <Pic name={badge} size={40} />
      <span className="tx"><b>{title}</b><small>{sub}</small></span>
      <span className="link">{action}</span>
    </button>
  );
}

export function JobAccepted() {
  const { go, toast, data } = useApp();
  return (
    <div className="screen">
      <StatusBar />
      <div className="body" style={{ alignItems: 'center' }}>
        <img className="accepted-art" src={imgUrl('accepted.png')} alt="" />
        <div style={{ padding: '16px 16px 12px', display: 'flex', flexDirection: 'column', gap: 16, width: '100%' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, textAlign: 'center' }}>
            <h2 className="anton c86">Add your documents to get jobs</h2>
            <p className="t16 c49">In Germany, your employer must check that you're allowed to work before your first day, even for a one-day job.</p>
          </div>
          <div className="commit">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Pic name="warning" size={20} />
              <b style={{ font: '600 16px/19px var(--sans)' }}>The factory is counting on you</b>
            </div>
            <p className="t14 c49">If you can't make it, tell us at least 24 hours ahead. After 2 no-shows without notice, your account can't take jobs for 30 days.</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h3 className="t16s">Get ready for day one!</h3>
            <SetupRow badge="badge-pay" title="Payment details" sub="Bank account and tax ID (needed before day one)" action={data.paymentAdded ? 'Edit' : 'Add'} onClick={() => go('payment')} />
            <div className="divider" />
            <SetupRow badge="badge-bring" title="Bring" sub="Residence card, safety shoes" action="Add" onClick={() => toast('Added to your day-one checklist')} />
            <div className="divider" />
            <SetupRow badge="badge-health" title="Health insurance" sub="AOK Nordost" action="Change" onClick={() => toast('Health insurance can be changed in Profile')} />
          </div>
        </div>
      </div>
      <div className="footer" style={{ padding: '12px 16px 0', gap: 8 }}>
        <Button onClick={() => go('payment')}>Add payment details</Button>
        <Button variant="text" height={44} onClick={() => go('home', 'fade')}>Go to Home</Button>
        <HomeBar />
      </div>
    </div>
  );
}

/* ── 16 Payment details ── */
const formatIban = (v: string) => v.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 22).replace(/(.{4})/g, '$1 ').trim();

export function PaymentDetails() {
  const { go, back, set, toast, data } = useApp();
  const [iban, setIban] = useState('');
  const valid = /^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/.test(iban.replace(/\s/g, ''));
  return (
    <Screen
      top={<><StatusBar /><Header title="Getting paid" onBack={() => back(data.employed ? 'accepted' : 'home')} /></>}
      bottom={
        <div className="footer" style={{ padding: '12px 16px 34px' }}>
          <Button disabled={!valid} onClick={() => { set({ paymentAdded: true }); toast('Payment details saved'); go('home', 'fade'); }}>Save</Button>
        </div>
      }
    >
      <div style={{ padding: '12px 16px 16px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <h2 className="anton">Payment details</h2>
          <p className="t16 muted">So Việc Nhanh can pay you and cover your insurance. Needed before your first day.</p>
        </div>
        <label>
          <span className="field-label" style={{ font: '500 14px/17px var(--sans)' }}>Bank account (IBAN)</span>
          <span className="field">
            <input
              autoComplete="off" autoCapitalize="characters" spellCheck={false} placeholder="DE89 3704 0044 0532 0130 00"
              value={iban} onChange={(e) => setIban(formatIban(e.target.value))}
              onFocus={() => { if (!iban) setIban('DE89 3704 0044 0532 0130 00'); }}
            />
          </span>
        </label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <SetupRow badge="badge-pay" title="Tax ID" sub="11 digits, from your tax office letter" action="Where to find it?" onClick={() => toast('It is on the letter from your tax office')} />
          <div className="divider" />
          <SetupRow badge="badge-bring" title="Social security number" sub="Don't have one? Việc Nhanh registers it for you" action="Add" onClick={() => toast('We will register it for you')} />
          <div className="divider" />
          <SetupRow badge="badge-health" title="Health insurance" sub="AOK Nordost" action="Change" onClick={() => toast('Health insurance can be changed in Profile')} />
        </div>
      </div>
    </Screen>
  );
}
