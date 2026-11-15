import { useEffect, useRef, useState, type ReactNode } from 'react';
import { QUESTIONS, useApp } from '../state';
import { BottomNav, Button, Header, Icon, Pic, Rows, Screen, StatusBar } from '../ui';

const PERMIT_QUESTION = 'My residence permit expires in January 2027. What do I need to do to renew it?';
const isPermit = (q: string) => /residen|permit|aufenthalt|renew|expir/i.test(q);

function Composer({ onSend }: { onSend: (text: string) => void }) {
  const [text, setText] = useState('');
  const submit = () => { const t = text.trim(); if (!t) return; onSend(t); setText(''); };
  return (
    <form className="composer" onSubmit={(e) => { e.preventDefault(); submit(); }}>
      <div className="in"><input value={text} onChange={(e) => setText(e.target.value)} placeholder="Type your question" aria-label="Type your question" enterKeyHint="send" /></div>
      <button className="send" type="submit" aria-label="Send"><Icon name="send" size={20} color="#fff" /></button>
    </form>
  );
}

/* ── Q1 Q&A ── */
export function QaHome() {
  const { go, set } = useApp();
  const ask = (q: string) => { set({ question: q }); go('answer'); };
  return (
    <div className="screen">
      <StatusBar />
      <div className="body">
        <div className="qa">
          <h2 className="anton">Q&amp;A</h2>
          <p className="t16 muted">Ask about documents, contracts, pay and insurance in Germany. Answers in your language, with sources.</p>
          <div className="infobox">
            <Icon name="user-circle" size={20} color="#111" />
            <p className="t14" style={{ flex: 1 }}>This is general information, not a substitute for a lawyer's advice. You don't need to add documents to ask.</p>
          </div>
          <h3 className="t16s">Common questions</h3>
          <div>
            {QUESTIONS.map((q, i) => (
              <button key={q.title} className="qrow" onClick={() => ask(i === 0 ? PERMIT_QUESTION : q.title)}>
                <span className="tile"><Icon name={q.icon} color="#0f73ff" /></span>
                <span style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <span className="t16s">{q.title}</span>
                  <span className="t14 muted">{q.topic}</span>
                </span>
                <span style={{ font: '600 14px/17px var(--sans)' }}>›</span>
              </button>
            ))}
          </div>
        </div>
      </div>
      <Composer onSend={ask} />
      <BottomNav active="qa" />
    </div>
  );
}

/* ── Q2 Answer (the assistant reply is revealed step by step, like a streamed response) ── */
const POINTS = [
  "Apply for renewal at the immigration office where you're registered, before your permit expires. Book early, as appointments fill up fast.",
  'If you apply before it expires, your current permit stays valid until a decision is made. You can keep working as before.',
  'Usually needed: passport, biometric photo, employment contract, proof of health insurance, residence registration. The exact list depends on your permit type.',
];
const FOLLOW_UPS: Record<string, string> = {
  'Where do I book?': 'Book with the immigration office (Ausländerbehörde) of the city where you are registered. An adviser can help you find the right appointment type.',
  "What's a biometric photo?": 'A recent passport-style photo that meets the official size and background rules. Photo shops and many drugstores take them on the spot.',
};

type Msg = { id: number; role: 'user'; text: string } | { id: number; role: 'ai'; kind: 'permit' | 'note'; text?: string };

function AiHead({ children }: { children: ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span className="ai-dot"><Icon name="sparkle" size={16} color="#fff" /></span>
      <b style={{ flex: 1, font: '600 16px/22px var(--sans)' }}>{children}</b>
    </div>
  );
}

function PermitAnswer({ instant, onStep, onHelp, onAsk }: { instant: boolean; onStep: () => void; onHelp: () => void; onAsk: (q: string) => void }) {
  const total = 7; // title, 3 points, source, disclaimer, follow-ups + help
  const [n, setN] = useState(instant ? total : 0);
  useEffect(() => {
    if (n >= total) return;
    const t = window.setTimeout(() => setN((v) => v + 1), n === 0 ? 1100 : 420);
    return () => window.clearTimeout(t);
  }, [n]);
  useEffect(() => { onStep(); }, [n, onStep]);

  if (n === 0) {
    return (
      <div className="answer typing" style={{ flexDirection: 'row', alignSelf: 'flex-start' }} aria-label="Việc Nhanh is writing">
        <span className="ai-dot"><Icon name="sparkle" size={16} color="#fff" /></span>
        <span className="d"><i /><i /><i /></span>
      </div>
    );
  }
  return (
    <>
      <div className="answer" aria-live="polite">
        <AiHead>Renewing a residence permit: the basics</AiHead>
        {POINTS.slice(0, Math.max(0, n - 1)).map((p, i) => (
          <div key={i} style={{ display: 'flex', gap: 10 }}>
            <span className="num">{i + 1}</span>
            <span className="t14" style={{ flex: 1 }}>{p}</span>
          </div>
        ))}
        {n >= 5 && (
          <button className="source" onClick={() => window.open('https://www.gesetze-im-internet.de/aufenthg_2004/__81.html', '_blank', 'noopener')}>
            <Icon name="doc" size={16} color="#0f73ff" />
            <span style={{ flex: 1 }}>Source: German Residence Act (AufenthG), Section 81(4) ›</span>
          </button>
        )}
        {n >= 6 && <p className="t13 muted">Your situation may differ, for example if your permit has already expired or you want a different type. In that case, talk to an adviser.</p>}
      </div>
      {n >= 7 && (
        <>
          <div className="sugg reveal">
            {Object.keys(FOLLOW_UPS).map((q) => <button key={q} onClick={() => onAsk(q)}>{q}</button>)}
          </div>
          <div className="helpcard reveal" style={{ animationDelay: '0.12s' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Icon name="users" size={22} color="#0f73ff" />
              <b style={{ font: '600 16px/19px var(--sans)' }}>Want someone to help in person?</b>
            </div>
            <p className="t14" style={{ color: '#3f434d' }}>Free advice, an interpreter who comes with you, or a Vietnamese-speaking lawyer.</p>
            <Button onClick={onHelp}>See where to get help</Button>
          </div>
        </>
      )}
    </>
  );
}

export function QaAnswer() {
  const { go, back, data } = useApp();
  const first = data.question ?? PERMIT_QUESTION;
  const [msgs, setMsgs] = useState<Msg[]>(() => [
    { id: 1, role: 'user', text: first },
    isPermit(first)
      ? { id: 2, role: 'ai', kind: 'permit' }
      : { id: 2, role: 'ai', kind: 'note', text: 'This preview includes one complete answer so far: renewing a residence permit. Ask about that to see the steps, the legal source and where to get help in person.' },
  ]);
  const body = useRef<HTMLDivElement>(null);
  const scrollDown = useRef(() => {
    const el = body.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }).current;
  useEffect(() => { scrollDown(); }, [msgs, scrollDown]);

  const ask = (q: string) => {
    setMsgs((m) => {
      const id = m.length + 1;
      const reply: Msg = FOLLOW_UPS[q]
        ? { id: id + 1, role: 'ai', kind: 'note', text: FOLLOW_UPS[q] }
        : isPermit(q) && !m.some((x) => x.role === 'ai' && x.kind === 'permit')
          ? { id: id + 1, role: 'ai', kind: 'permit' }
          : { id: id + 1, role: 'ai', kind: 'note', text: 'I can only answer the residence permit question in this preview. For anything else, an adviser can help you in person.' };
      return [...m, { id, role: 'user', text: q }, reply];
    });
  };

  return (
    <Screen top={<><StatusBar /><Header title="Q&A" onBack={() => back('qa')} compact /></>} bottom={<Composer onSend={ask} />} bodyRef={body}>
      <div className="convo">
        {msgs.map((m) =>
          m.role === 'user' ? (
            <p key={m.id} className="bubble">{m.text}</p>
          ) : m.kind === 'permit' ? (
            <PermitAnswer key={m.id} instant={false} onStep={scrollDown} onHelp={() => go('help')} onAsk={ask} />
          ) : (
            <NoteAnswer key={m.id} text={m.text!} onStep={scrollDown} onPermit={msgs.some((x) => x.role === 'ai' && x.kind === 'permit') ? undefined : () => ask(PERMIT_QUESTION)} />
          ),
        )}
      </div>
    </Screen>
  );
}

function NoteAnswer({ text, onStep, onPermit }: { text: string; onStep: () => void; onPermit?: () => void }) {
  const [ready, setReady] = useState(false);
  useEffect(() => { const t = window.setTimeout(() => setReady(true), 900); return () => window.clearTimeout(t); }, []);
  useEffect(() => { onStep(); }, [ready, onStep]);
  if (!ready) {
    return (
      <div className="answer typing" style={{ flexDirection: 'row', alignSelf: 'flex-start' }}>
        <span className="ai-dot"><Icon name="sparkle" size={16} color="#fff" /></span>
        <span className="d"><i /><i /><i /></span>
      </div>
    );
  }
  return (
    <>
      <div className="answer">
        <div style={{ display: 'flex', gap: 8 }}>
          <span className="ai-dot"><Icon name="sparkle" size={16} color="#fff" /></span>
          <span className="t14" style={{ flex: 1, paddingTop: 4 }}>{text}</span>
        </div>
      </div>
      {onPermit && <div className="sugg reveal"><button onClick={onPermit}>Residence permit renewal</button></div>}
    </>
  );
}

/* ── Q3 Where to get help ── */
const PARTNERS = [
  { id: 'interpreter', icon: 'users', title: 'Interpreter for your immigration office visit', price: '€45', who: 'Mai Anh · Vietnamese – German', meta: '2 hours · available from Tuesday, 18/11' },
  { id: 'translation', icon: 'doc', title: 'Certified document translation', price: 'from €35', who: 'Hồng Hà Translation Office · Berlin', meta: 'Per page · ready in 3 days' },
  { id: 'lawyer', icon: 'scales', title: 'Vietnamese-speaking immigration lawyer', price: 'from €90', who: 'Trần & Partner Law Office · Berlin', meta: 'First consultation · for complex cases' },
];

export function GetHelp() {
  const { go, back, toast } = useApp();
  const [selected, setSelected] = useState('interpreter');
  return (
    <Screen top={<><StatusBar /><Header title="Get help" onBack={() => back('answer')} compact /></>}>
      <div style={{ padding: '12px 24px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <h2 className="anton" style={{ lineHeight: '38px', letterSpacing: 0 }}>Residence permit renewal</h2>
          <p className="t16 muted">Choose what suits you. You can keep asking in Q&amp;A.</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <span className="tag green">Free</span>
          <div className="svc" style={{ flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span className="tile36 green"><Icon name="shield-check" size={20} color="#17845a" /></span>
              <b style={{ flex: 1, font: '600 16px/22px var(--sans)' }}>Migration advice for adults (MBE)</b>
            </div>
            <p className="t14 muted">Funded by the German government. Free, confidential advice on documents and residence.</p>
            <button style={{ display: 'flex', alignItems: 'center', gap: 4, paddingTop: 4, font: '600 14px/17px var(--sans)', color: 'var(--blue)', alignSelf: 'flex-start' }} onClick={() => toast('Opens the map of advice centres near you')}>
              <Icon name="pin" size={16} color="#0f73ff" />See locations near you ›
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingTop: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <b style={{ font: '600 16px/19px var(--sans)' }}>Partner services</b>
            <span className="tag amber">Paid</span>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Icon name="info" size={16} color="#6b6b6b" />
            <p className="t13 muted" style={{ flex: 1 }}>Việc Nhanh receives a referral fee from these partners. Your price stays the same.</p>
          </div>
          {PARTNERS.map((p) => (
            <button
              key={p.id} className={`svc ${selected === p.id ? 'on' : ''}`}
              onClick={() => {
                setSelected(p.id);
                if (p.id === 'interpreter') go('book');
                else toast('Booking for this partner opens soon');
              }}
            >
              <span className="tile36"><Icon name={p.icon} size={20} color="#0f73ff" /></span>
              <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{ display: 'flex', gap: 8 }}>
                  <b style={{ flex: 1, font: '600 16px/22px var(--sans)' }}>{p.title}</b>
                  <b style={{ font: '600 16px/19px var(--sans)', color: 'var(--blue)', whiteSpace: 'nowrap' }}>{p.price}</b>
                </span>
                <span className="t14" style={{ color: '#3f434d' }}>{p.who}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, font: '400 13px/16px var(--sans)' }} className="muted">
                  <Icon name="clock-14" size={14} color="#6b6b6b" />{p.meta}
                </span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </Screen>
  );
}

/* ── Q4 Book an interpreter ── */
export function BookInterpreter() {
  const { go, back, toast, set } = useApp();
  const [consent, setConsent] = useState(true);
  return (
    <Screen
      top={<><StatusBar /><Header title="Interpreter" onBack={() => back('help')} compact /></>}
      bottom={
        <div className="footer" style={{ padding: '12px 24px 24px', gap: 4 }}>
          <Button disabled={!consent} onClick={() => { set({ bookingCancelled: false }); go('sent'); }}>Send booking request</Button>
          <Button variant="text" height={43} onClick={() => toast('Chat with Mai Anh opens in WhatsApp')}>Message first</Button>
        </div>
      }
    >
      <div style={{ padding: '12px 24px 24px', display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ width: 64, height: 64, borderRadius: 32, background: '#e7f1ff', display: 'grid', placeItems: 'center', font: '700 20px/24px var(--sans)', color: 'var(--blue)', flex: 'none' }}>MA</span>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
            <h2 className="anton" style={{ lineHeight: '38px', letterSpacing: 0 }}>Mai Anh</h2>
            <p className="t14 muted">Vietnamese – German interpreter in Berlin</p>
            <span className="tag blue"><Icon name="partner-check" size={12} color="#0f73ff" />Việc Nhanh partner</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <b style={{ font: '600 16px/19px var(--sans)' }}>Included</b>
          <div className="inc"><i><Icon name="check-line" size={14} color="#17845a" /></i><span className="t14" style={{ flex: 1 }}>Comes with you to your immigration office appointment</span></div>
          <div className="inc"><i><Icon name="check-line" size={14} color="#17845a" /></i><span className="t14" style={{ flex: 1 }}>Interprets for the officer and for you</span></div>
          <div className="inc no"><i><Icon name="minus" size={14} color="#8a8e99" /></i><span className="t14 muted" style={{ flex: 1 }}>Does not include legal advice</span></div>
        </div>

        <div className="kvbox">
          <Rows tight rows={[
            { k: 'Price', v: '€45 for 2 hours', tone: 'blue' },
            { k: 'Extra time', v: '€20 per hour' },
            { k: 'Payment', v: 'Pay the interpreter after the appointment' },
          ]} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <b style={{ font: '600 16px/19px var(--sans)' }}>Your appointment</b>
          <div>
            <span className="field-label t16s">Date and time</span>
            <button className="field c49" onClick={() => toast('Mai Anh is available on this date')}>Thursday, 04/12/2026 · 9:30</button>
          </div>
          <div>
            <span className="field-label t16s">Location</span>
            <button className="field c49" onClick={() => toast('Keplerstraße 2, 10589 Berlin')}>Berlin Immigration Office (LEA)</button>
          </div>
        </div>

        <label className="checkbox blue" style={{ alignItems: 'flex-start', gap: 10 }}>
          <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
          <span className={`box ${consent ? 'on' : ''}`} style={{ width: 20, height: 20 }}>{consent && <Icon name="check-14" size={14} color="#fff" />}</span>
          <span className="t14" style={{ flex: 1 }}>Share my name, phone number and appointment date with the interpreter. My documents are not shared.</span>
        </label>
      </div>
    </Screen>
  );
}

/* ── Q5 Request sent ── */
export function RequestSent() {
  const { go, set, toast } = useApp();
  return (
    <div className="screen">
      <StatusBar />
      <div className="body">
        <div style={{ padding: '48px 24px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, textAlign: 'center' }}>
            <span className="success-dot"><Icon name="check-big" size={30} color="#fff" /></span>
            <h2 style={{ font: '400 28px/42px var(--display)' }}>Request sent to Mai Anh</h2>
            <p className="t14 muted">Mai Anh will confirm on WhatsApp within 24 hours. You don't pay anything now.</p>
          </div>
          <div className="kvbox">
            <Rows tight rows={[
              { k: 'Service', v: 'Interpreter' },
              { k: 'Date', v: 'Thursday, 04/12 · 9:30' },
              { k: 'Location', v: 'Berlin Immigration Office' },
              { k: 'Estimated price', v: '€45', tone: 'blue' },
            ]} />
          </div>
          <div className="reminder">
            <Pic name="warning" size={20} />
            <p className="t14" style={{ flex: 1, color: '#3f434d' }}>Remember to bring your passport, biometric photo and current residence permit.</p>
          </div>
        </div>
      </div>
      <div className="footer" style={{ padding: '12px 24px 24px', gap: 4 }}>
        <Button onClick={() => { set({ question: null }); go('qa', 'fade'); }}>Back to Q&amp;A</Button>
        <Button variant="text" height={43} onClick={() => { set({ bookingCancelled: true, question: null }); toast('Booking request cancelled'); go('qa', 'fade'); }}>Cancel request</Button>
      </div>
    </div>
  );
}
