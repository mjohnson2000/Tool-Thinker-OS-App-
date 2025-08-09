import React from 'react';
import styled from 'styled-components';

const Bar = styled.div<{visible:boolean}>`
  display: ${p=>p.visible?'flex':'none'};
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border: 1px solid #e5e5e5;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 8px 20px rgba(0,0,0,0.06);
`;

const Thumb = styled.button<{active?:boolean}>`
  padding: 8px 10px;
  border-radius: 10px;
  border: 1px solid #e5e5e5;
  background: ${p=>p.active?'#f0fdf4':'#fff'};
  color: ${p=>p.active?'#14532d':'#111'};
`;

const Text = styled.input`
  flex: 1;
  border: 1px solid #e5e5e5;
  border-radius: 10px;
  padding: 8px;
`;

interface Props { context: string; className?: string }

export const FeedbackBar: React.FC<Props> = ({ context, className }) => {
  const [visible, setVisible] = React.useState(false);
  const [thumb, setThumb] = React.useState<null|number>(null);
  const [note, setNote] = React.useState('');

  React.useEffect(() => {
    const key = `ttos_fbbar_${context}`;
    const last = Number(localStorage.getItem(key)||'0');
    // 7-day cooldown
    if (Date.now() - last > 7*24*60*60*1000) setVisible(true);
  }, [context]);

  function sessionId() {
    const k = 'ttos_session_id';
    let v = localStorage.getItem(k);
    if (!v) { v = crypto.randomUUID(); localStorage.setItem(k, v); }
    return v;
  }

  async function submit() {
    try {
      await fetch('/api/feedback', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: sessionId(), route: window.location.pathname,
          action: `bar:${context}`, ratingType: 'thumbs', rating: thumb ?? undefined, comment: note || undefined
        })
      });
    } catch(e) { console.error(e); }
    finally {
      localStorage.setItem(`ttos_fbbar_${context}`, String(Date.now()));
      setVisible(false);
    }
  }

  if (!visible) return null;
  return (
    <Bar visible={visible} className={className} role="region" aria-label="Feedback">
      <span style={{fontWeight:600}}>Was this helpful?</span>
      <Thumb active={thumb===1} onClick={()=> setThumb(1)}>👍</Thumb>
      <Thumb active={thumb===0} onClick={()=> setThumb(0)}>👎</Thumb>
      <Text placeholder="Optional" value={note} onChange={e=> setNote(e.target.value)} />
      <button onClick={()=> setVisible(false)} aria-label="Dismiss">✕</button>
      <button onClick={submit} disabled={thumb===null && !note}>Send</button>
    </Bar>
  );
}; 