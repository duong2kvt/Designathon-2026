import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { AppProvider, FLOWS, useApp, type ScreenId } from './state';
import { Icon } from './ui';
import { Splash, Intro, PhoneNumber, VerifyCode, Preferences, AddDocuments, CheckDetails } from './screens/onboarding';
import { Home } from './screens/home';
import { LockScreen, JobOffer, JobAccepted, PaymentDetails } from './screens/job';
import { QaHome, QaAnswer, GetHelp, BookInterpreter, RequestSent } from './screens/qa';

const SCREENS: Record<ScreenId, () => JSX.Element> = {
  splash: Splash, intro: Intro, phone: PhoneNumber, otp: VerifyCode, prefs: Preferences, docs: AddDocuments, details: CheckDetails,
  home: Home, lock: LockScreen, offer: JobOffer, accepted: JobAccepted, payment: PaymentDetails,
  qa: QaHome, answer: QaAnswer, help: GetHelp, book: BookInterpreter, sent: RequestSent,
};

const DESIGN_W = 402;
const DESIGN_H = 874;
const BEZEL = 11;

type Layout = { mobile: boolean; scale: number; vh: number };

/** Fit the 402×874 design to any window: bare app on phones, framed device that scales up to TV sizes elsewhere. */
function computeLayout(): Layout {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const mobile = w < 620 || (w < 900 && h > w * 1.25);
  if (mobile) {
    const scale = w / DESIGN_W;
    return { mobile, scale, vh: Math.max(560, h / scale) };
  }
  const outerW = DESIGN_W + BEZEL * 2;
  const outerH = DESIGN_H + BEZEL * 2;
  const scale = Math.min((h * 0.94) / outerH, (w * 0.46) / outerW);
  return { mobile, scale, vh: DESIGN_H };
}

function Viewport() {
  const { nav, clearPrev, toastMessage } = useApp();
  useEffect(() => {
    if (!nav.prev) return;
    const t = window.setTimeout(clearPrev, 460);
    return () => window.clearTimeout(t);
  }, [nav.key, nav.prev, clearPrev]);

  const Current = SCREENS[nav.screen];
  const Prev = nav.prev ? SCREENS[nav.prev] : null;
  return (
    <>
      {Prev && (
        <div key={`p${nav.key - 1}`} className={`layer leave-${nav.transition}`} aria-hidden style={{ pointerEvents: 'none' }}>
          <Prev />
        </div>
      )}
      <div key={`c${nav.key}`} className={`layer ${nav.prev ? `enter-${nav.transition}` : ''}`}>
        <Current />
      </div>
      {toastMessage && <div className="toast" role="status" key={toastMessage}>{toastMessage}</div>}
    </>
  );
}

function usePanels({ clean, onClean }: { clean: boolean; onClean: () => void }) {
  const { nav, startFlow, jump } = useApp();
  const flow = FLOWS[nav.flow - 1];
  const idx = flow.steps.findIndex((s) => s.screen === nav.screen);
  return {
    left: (
      <aside className="panel left" aria-hidden={clean}>
        <div className="brand"><Icon name="logo-mark" color="#4f9bff" />Việc Nhanh</div>
        <h2>Work in Germany, made simple.</h2>
        <p className="lede">Interactive build of the four demo flows. Pick a flow, then use the phone like the real app.</p>
        <div className="flows">
          {FLOWS.map((f) => (
            <button key={f.id} className={`flow ${f.id === nav.flow ? 'on' : ''}`} onClick={() => startFlow(f.id)}>
              <span className="num">{f.id}</span>
              <span><b>{f.title}</b><small>{f.caption}</small></span>
            </button>
          ))}
        </div>
        <div className="controls">
          <button onClick={() => startFlow(nav.flow)}>Restart flow</button>
          <button onClick={onClean}>Hide panels</button>
        </div>
      </aside>
    ),
    right: (
      <aside className="panel right" aria-hidden={clean}>
        <div className="eyebrow">Flow {flow.id} · {flow.title}</div>
        <div className="steps">
          {flow.steps.map((s, i) => (
            <button key={s.screen} className={i === idx ? 'on' : i < idx ? 'done' : ''} onClick={() => jump(flow.id, s.screen)}>
              <i>{i + 1}</i>{s.label}
            </button>
          ))}
        </div>
        <div className="eyebrow">Keyboard</div>
        <div className="keys">
          <span><kbd>1</kbd><kbd>2</kbd><kbd>3</kbd><kbd>4</kbd> switch flow</span>
          <span><kbd>←</kbd><kbd>→</kbd> previous / next screen</span>
          <span><kbd>R</kbd> restart flow</span>
          <span><kbd>H</kbd> hide panels · <kbd>F</kbd> full screen</span>
        </div>
      </aside>
    ),
  };
}

function Stage() {
  const { nav, startFlow, step } = useApp();
  const [layout, setLayout] = useState<Layout>(computeLayout);
  const [clean, setClean] = useState(false);
  const flowRef = useRef(nav.flow);
  flowRef.current = nav.flow;

  useLayoutEffect(() => {
    const on = () => setLayout(computeLayout());
    window.addEventListener('resize', on);
    window.addEventListener('orientationchange', on);
    return () => { window.removeEventListener('resize', on); window.removeEventListener('orientationchange', on); };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA')) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const k = e.key.toLowerCase();
      if (k === '1' || k === '2' || k === '3' || k === '4') startFlow(Number(k) as 1 | 2 | 3 | 4);
      else if (k === 'arrowright') step(1);
      else if (k === 'arrowleft') step(-1);
      else if (k === 'r') startFlow(flowRef.current);
      else if (k === 'h') setClean((c) => !c);
      else if (k === 'f') {
        if (document.fullscreenElement) void document.exitFullscreen();
        else void document.documentElement.requestFullscreen?.();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [startFlow, step]);

  const bz = layout.mobile ? 0 : BEZEL;
  const vars = {
    '--s': layout.scale, '--bz': `${bz}px`, '--vh': layout.vh,
    '--dw': DESIGN_W + bz * 2, '--dh': layout.vh + bz * 2,
  } as CSSProperties;
  const panels = usePanels({ clean, onClean: () => setClean(true) });

  return (
    <div className={`stage ${layout.mobile ? 'mobile' : ''} ${clean ? 'clean' : ''}`} style={vars}>
      {!layout.mobile && panels.left}
      <div className="device-slot">
        <div className="device">
          <div className="bezel" />
          <div className="viewport"><Viewport /></div>
        </div>
      </div>
      {!layout.mobile && panels.right}
    </div>
  );
}

export function App() {
  return (
    <AppProvider>
      <Stage />
    </AppProvider>
  );
}
