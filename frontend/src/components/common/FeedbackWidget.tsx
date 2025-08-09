import React from 'react';
import styled from 'styled-components';

const Fab = styled.button`
  position: fixed;
  right: 16px;
  bottom: 16px;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 1px solid rgba(0,0,0,0.08);
  background: rgba(24,26,27,0.9);
  color: #fff;
  box-shadow: 0 8px 20px rgba(0,0,0,0.2);
  opacity: 0.6;
  transition: opacity .2s ease, transform .2s ease;
  z-index: 1100;
  &:hover { opacity: 1; transform: translateY(-1px); }
`;

const Sheet = styled.div<{open:boolean}>`
  position: fixed;
  right: 16px;
  bottom: 72px;
  width: 360px;
  max-width: calc(100vw - 24px);
  background: #fff;
  border: 1px solid #e5e5e5;
  border-radius: 12px;
  box-shadow: 0 12px 30px rgba(0,0,0,0.15);
  padding: 12px;
  display: ${p=>p.open?'block':'none'};
  z-index: 1100;
`;

const Row = styled.div`
  display: flex;
  gap: 8px;
  margin: 8px 0;
`;

const Thumb = styled.button<{active?:boolean}>`
  flex: 1;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid #e5e5e5;
  background: ${p=>p.active?'#f0fdf4':'#fff'};
  color: ${p=>p.active?'#14532d':'#111'};
`;

const Text = styled.textarea`
  width: 100%;
  border: 1px solid #e5e5e5;
  border-radius: 10px;
  padding: 8px;
  min-height: 80px;
`;

interface Props { route?: string }

export const FeedbackWidget: React.FC<Props> = ({ route }) => {
  const [open, setOpen] = React.useState(false);
  const [thumb, setThumb] = React.useState<null|number>(null);
  const [comment, setComment] = React.useState('');

  function sessionId() {
    const k = 'ttos_session_id';
    let v = localStorage.getItem(k);
    if (!v) { v = crypto.randomUUID(); localStorage.setItem(k, v); }
    return v;
  }

  async function submit() {
    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: sessionId(),
          route: route || window.location.pathname,
          action: 'fab_feedback',
          ratingType: 'thumbs',
          rating: thumb ?? undefined,
          comment: comment || undefined,
          meta: { ua: navigator.userAgent, vp: [window.innerWidth, window.innerHeight] }
        })
      });
      setOpen(false); setThumb(null); setComment('');
      localStorage.setItem('ttos_feedback_last', String(Date.now()));
    } catch (e) { console.error(e); }
  }

  React.useEffect(() => {
    const last = Number(localStorage.getItem('ttos_feedback_last')||'0');
    const day = 24*60*60*1000;
    if (Date.now() - last < day) return; // cooldown
    const t = setTimeout(()=> setOpen(false), 0);
    return ()=> clearTimeout(t);
  }, []);

  return (
    <>
      <Fab aria-label="Feedback" onClick={()=> setOpen(v=>!v)}>💬</Fab>
      <Sheet open={open}>
        <div style={{fontWeight:700, marginBottom:6}}>Feedback</div>
        <Row>
          <Thumb active={thumb===1} onClick={()=> setThumb(1)}>👍 Helpful</Thumb>
          <Thumb active={thumb===0} onClick={()=> setThumb(0)}>👎 Needs work</Thumb>
        </Row>
        <Text placeholder="Optional: Tell us more" value={comment} onChange={e=> setComment(e.target.value)} />
        <Row>
          <button onClick={()=> setOpen(false)} style={{flex:1}}>Cancel</button>
          <button onClick={submit} style={{flex:1}}>Send</button>
        </Row>
      </Sheet>
    </>
  );
}; 