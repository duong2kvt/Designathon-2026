import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';

export type ScreenId =
  | 'splash' | 'intro' | 'phone' | 'otp' | 'prefs' | 'docs' | 'details' | 'home'
  | 'lock' | 'offer' | 'accepted' | 'payment'
  | 'qa' | 'answer' | 'help' | 'book' | 'sent';

export type Transition = 'push' | 'back' | 'fade' | 'none';
export type Channel = 'whatsapp' | 'sms' | 'call';

export type Flow = { id: 1 | 2 | 3; title: string; caption: string; steps: { screen: ScreenId; label: string }[] };

export const FLOWS: Flow[] = [
  {
    id: 1, title: 'Sign-up', caption: 'Splash to first Home',
    steps: [
      { screen: 'splash', label: 'Splash' },
      { screen: 'intro', label: 'Intro' },
      { screen: 'phone', label: 'Phone number' },
      { screen: 'otp', label: 'Verification code' },
      { screen: 'prefs', label: 'Preferences' },
      { screen: 'docs', label: 'Add documents' },
      { screen: 'details', label: 'Check your details' },
      { screen: 'home', label: 'Home' },
    ],
  },
  {
    id: 2, title: 'First job', caption: 'A factory picks you',
    steps: [
      { screen: 'lock', label: 'Notification' },
      { screen: 'offer', label: 'Job offer & signature' },
      { screen: 'accepted', label: 'Job accepted' },
      { screen: 'payment', label: 'Payment details' },
      { screen: 'home', label: 'Home while working' },
    ],
  },
  {
    id: 3, title: 'AI Q&A', caption: 'Ask, then get help',
    steps: [
      { screen: 'qa', label: 'Q&A' },
      { screen: 'answer', label: 'Answer' },
      { screen: 'help', label: 'Where to get help' },
      { screen: 'book', label: 'Book an interpreter' },
      { screen: 'sent', label: 'Request sent' },
    ],
  },
];

export type AppData = {
  phone: string;
  channel: Channel;
  employed: boolean;        // true once the job offer is signed (Home shows the working variant)
  paymentAdded: boolean;
  openToLongTerm: boolean;
  question: string | null;  // question asked in Q&A
  bookingCancelled: boolean;
};

const initialData: AppData = {
  phone: '151 2345 6789', channel: 'whatsapp', employed: false, paymentAdded: false,
  openToLongTerm: true, question: null, bookingCancelled: false,
};

type Nav = { screen: ScreenId; prev: ScreenId | null; transition: Transition; key: number; flow: 1 | 2 | 3 };

type Ctx = {
  nav: Nav;
  data: AppData;
  go: (screen: ScreenId, transition?: Transition) => void;
  back: (fallback: ScreenId) => void;
  set: (patch: Partial<AppData>) => void;
  startFlow: (flow: 1 | 2 | 3) => void;
  jump: (flow: 1 | 2 | 3, screen: ScreenId) => void;
  step: (delta: 1 | -1) => void;
  toast: (message: string) => void;
  toastMessage: string | null;
  clearPrev: () => void;
};

const AppCtx = createContext<Ctx | null>(null);
export const useApp = () => {
  const c = useContext(AppCtx);
  if (!c) throw new Error('useApp outside provider');
  return c;
};

const flowOf = (screen: ScreenId, employed: boolean, current: 1 | 2 | 3): 1 | 2 | 3 => {
  if (screen === 'home') return employed ? 2 : current === 3 ? 3 : 1;
  const hit = FLOWS.find((f) => f.steps.some((s) => s.screen === screen));
  return hit ? hit.id : current;
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [nav, setNav] = useState<Nav>({ screen: 'splash', prev: null, transition: 'none', key: 0, flow: 1 });
  const [data, setData] = useState<AppData>(initialData);
  const [toastMessage, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number>();
  const dataRef = useRef(data);
  dataRef.current = data;

  const go = useCallback((screen: ScreenId, transition: Transition = 'push') => {
    setNav((n) => ({
      screen, prev: transition === 'none' ? null : n.screen, transition, key: n.key + 1,
      flow: flowOf(screen, dataRef.current.employed, n.flow),
    }));
  }, []);

  const back = useCallback((fallback: ScreenId) => go(fallback, 'back'), [go]);
  const set = useCallback((patch: Partial<AppData>) => setData((d) => ({ ...d, ...patch })), []);
  const clearPrev = useCallback(() => setNav((n) => (n.prev ? { ...n, prev: null } : n)), []);

  const jump = useCallback((flow: 1 | 2 | 3, screen: ScreenId) => {
    // Put the app in the state that screen expects, so any step can be opened directly during a demo.
    const order = FLOWS[flow - 1].steps.map((s) => s.screen);
    const idx = order.indexOf(screen);
    setData((d) => {
      if (flow === 1) return { ...initialData, phone: d.phone, channel: d.channel };
      if (flow === 2) return { ...d, employed: idx >= 2, paymentAdded: idx >= 4, question: null };
      return { ...d, question: idx >= 1 ? d.question ?? QUESTIONS[0].title : null, bookingCancelled: false };
    });
    dataRef.current = { ...dataRef.current, employed: flow === 2 && idx >= 2 };
    setNav((n) => ({ screen, prev: n.screen, transition: 'fade', key: n.key + 1, flow }));
  }, []);

  const startFlow = useCallback((flow: 1 | 2 | 3) => jump(flow, FLOWS[flow - 1].steps[0].screen), [jump]);

  const step = useCallback((delta: 1 | -1) => {
    setNav((n) => {
      const order = FLOWS[n.flow - 1].steps.map((s) => s.screen);
      const i = order.indexOf(n.screen);
      const next = order[Math.min(order.length - 1, Math.max(0, i + delta))];
      if (!next || next === n.screen) return n;
      queueMicrotask(() => jump(n.flow, next));
      return n;
    });
  }, [jump]);

  const toast = useCallback((message: string) => {
    setToast(message);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2200);
  }, []);

  const value = useMemo(
    () => ({ nav, data, go, back, set, startFlow, jump, step, toast, toastMessage, clearPrev }),
    [nav, data, go, back, set, startFlow, jump, step, toast, toastMessage, clearPrev],
  );
  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}

export const QUESTIONS = [
  { icon: 'q-building', title: 'My residence permit is expiring. What do I do?', topic: 'Residence' },
  { icon: 'q-briefcase', title: 'Do I need to tell the immigration office if I change jobs?', topic: 'Work' },
  { icon: 'q-phone', title: 'What am I owed when a fixed-term contract ends?', topic: 'Contract' },
  { icon: 'q-doc', title: 'What is the extra sheet that comes with my card?', topic: 'Documents' },
  { icon: 'q-heart', title: "Who do I tell if I'm sick and can't work?", topic: 'Health' },
] as const;
