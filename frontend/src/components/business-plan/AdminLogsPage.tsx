import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useAuth } from '../../contexts/AuthContext';

const Container = styled.div`
  max-width: 900px;
  margin: 6rem auto 2rem auto;
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.08);
  padding: 2.5rem 2rem;
  
  @media (max-width: 768px) {
    margin: 4rem auto 1rem auto;
    padding: 1.5rem 1rem;
    border-radius: 12px;
    max-width: 95%;
  }
  
  @media (max-width: 480px) {
    margin: 3rem auto 0.5rem auto;
    padding: 1rem 0.5rem;
    border-radius: 8px;
  }
`;
const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #181a1b;
  margin-bottom: 1.2rem;
  
  @media (max-width: 768px) {
    font-size: 1.8rem;
    margin-bottom: 1rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1.6rem;
    margin-bottom: 0.8rem;
  }
`;
const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 1.5rem;
  
  @media (max-width: 768px) {
    margin-top: 1rem;
    font-size: 0.9rem;
  }
  
  @media (max-width: 480px) {
    margin-top: 0.8rem;
    font-size: 0.8rem;
  }
`;
const Th = styled.th`
  background: #f8f9fa;
  color: #181a1b;
  font-weight: 600;
  padding: 0.7rem 0.5rem;
  border-bottom: 2px solid #e5e5e5;
  
  @media (max-width: 768px) {
    padding: 0.5rem 0.3rem;
  }
  
  @media (max-width: 480px) {
    padding: 0.4rem 0.2rem;
  }
`;
const Td = styled.td`
  padding: 0.6rem 0.5rem;
  border-bottom: 1px solid #e5e5e5;
  font-size: 0.97rem;
  color: #222;
  
  @media (max-width: 768px) {
    padding: 0.4rem 0.3rem;
    font-size: 0.9rem;
  }
  
  @media (max-width: 480px) {
    padding: 0.3rem 0.2rem;
    font-size: 0.8rem;
  }
`;

export default function AdminLogsPage() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLogs() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/log');
        if (!res.ok) throw new Error('Failed to fetch logs');
        const data = await res.json();
        setLogs(data.logs || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchLogs();
  }, []);

  return (
    <Container>
      <Title>System Logs</Title>
      {loading ? <div>Loading logs...</div> : error ? <div style={{ color: '#dc3545' }}>{error}</div> : (
        <Table>
          <thead>
            <tr>
              <Th>Timestamp</Th>
              <Th>User ID</Th>
              <Th>Event</Th>
              <Th>Details</Th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log, i) => (
              <tr key={log._id || i}>
                <Td>{new Date(log.timestamp).toLocaleString()}</Td>
                <Td>{log.userId || 'anonymous'}</Td>
                <Td>{log.event}</Td>
                <Td><pre style={{ margin: 0, fontSize: '0.92rem', whiteSpace: 'pre-wrap' }}>{JSON.stringify(log.details, null, 2)}</pre></Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
} 