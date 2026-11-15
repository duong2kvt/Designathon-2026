import { useState } from 'react';
import { useApp } from '../state';
import { BottomNav, Icon, StatusBar, imgUrl } from '../ui';

const JOBS = [
  { id: 'fair', title: 'Trade fair clean-up', rate: '€15.00/hr', when: 'Today, 14:00–20:00 · 3 km away' },
  { id: 'load', title: 'Loading and unloading', rate: '€15.50/hr', when: 'Tomorrow, 7:00–13:00 · 6 km away' },
];

function JobCard({ job, wide }: { job: (typeof JOBS)[number]; wide?: boolean }) {
  const { toast } = useApp();
  const [accepted, setAccepted] = useState(false);
  return (
    <article className={`jobcard ${wide ? 'wide' : ''}`}>
      <div className="hd"><b>{job.title}</b><span className="rate">{job.rate}</span></div>
      <div className="dt">
        <div className="when"><Icon name="clock" size={18} color="#6b6f7a" />{job.when}</div>
        <hr />
        <div className="act">
          <span className="paidtag"><Icon name="bolt" size={12} color="#b07f00" />Paid same day</span>
          <button
            className={`accept ${accepted ? 'done' : ''}`}
            onClick={() => { setAccepted((a) => !a); if (!accepted) toast(`${job.title} accepted`); }}
          >
            {accepted ? 'Accepted' : 'Accept'}
          </button>
        </div>
      </div>
    </article>
  );
}

/** 11 Home (after sign-up) and 17 Home while working. */
export function Home() {
  const { data, set, go, toast } = useApp();
  const working = data.employed;
  return (
    <div className="screen">
      <StatusBar />
      <div className="body">
        <div className="home" style={working ? { gap: 12 } : undefined}>
          <div className="greeting">
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
              {working ? (
                <>
                  <h2 style={{ font: '700 22px/27px var(--sans)' }}>Hi An</h2>
                  <p style={{ font: '400 13px/16px var(--sans)' }} className="muted">Working at Spreewerk Verpackung</p>
                </>
              ) : (
                <>
                  <h2 className="anton">Hi An</h2>
                  <p className="t14 muted">Documents valid until 30/09/2027</p>
                </>
              )}
            </div>
            <img className="avatar" src={imgUrl('avatar.webp')} alt="An" />
          </div>

          {working ? (
            <section className="hero" style={{ padding: '6px 18px', gap: 3 }}>
              <img className="deco" src={imgUrl('card-deco.png')} alt="" />
              <p className="bvp">Next shift</p>
              <p className="t16s">Thursday, 20/11 · 7:00–14:30</p>
              <p className="bvp">Gate 2, Industriestraße 14, Ludwigsfelde<br />This week's pay (estimate)</p>
              <p className="center" style={{ font: '700 16px/19px var(--sans)' }}>€465.00</p>
            </section>
          ) : (
            <section className="hero">
              <img className="deco" src={imgUrl('card-deco.png')} alt="" />
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <p className="t16s" style={{ flex: 1 }}>Open to long-term jobs</p>
                <button
                  role="switch" aria-checked={data.openToLongTerm} aria-label="Open to long-term jobs"
                  className={`toggle ${data.openToLongTerm ? 'on' : ''}`} onClick={() => set({ openToLongTerm: !data.openToLongTerm })}
                ><i /></button>
              </div>
              <p className="bvp">
                {data.openToLongTerm ? "When a factory picks you, we'll message you on WhatsApp right away." : "You won't be offered long-term jobs while this is off."}
              </p>
            </section>
          )}

          {!working && !data.paymentAdded && (
            <button className="listrow" onClick={() => go('payment')}>
              <Icon name="credit-card" color="#111" />
              <span style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span className="t16s">Add payment details</span>
                <span className="t14 muted">Bank account and tax ID, so you get paid on time</span>
              </span>
              <span className="link">Add</span>
            </button>
          )}

          <div className="listhead">
            <h3 style={{ flex: 1, font: working ? '600 17px/21px var(--sans)' : '600 18px/24px var(--sans)', letterSpacing: working ? 0 : '-0.36px' }}>
              {working ? 'Extra day jobs' : 'Day jobs near you'}
            </h3>
            <button style={{ display: 'flex', alignItems: 'center', gap: 8, font: '500 14px/17px var(--sans)', color: 'var(--muted)' }} onClick={() => toast('All day jobs are shown')}>
              See all{!working && <Icon name="flip-forward" size={20} color="#6b6b6b" />}
            </button>
          </div>
          {working && <p style={{ font: '400 13px/16px var(--sans)' }} className="muted">Only shows jobs that don't clash with your shifts or exceed your legal hours.</p>}
          {JOBS.map((j) => <JobCard key={j.id} job={j} wide={working} />)}
        </div>
      </div>
      <BottomNav active="home" />
    </div>
  );
}
