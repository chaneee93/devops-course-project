import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated } from '../auth';

// isAuthenticated()가 Promise라서, 확인 끝날 때까지 "확인 중" 화면을 잠깐 보여줌
export default function ProtectedRoute({ children }) {
  const [status, setStatus] = useState('checking');

  useEffect(() => {
    isAuthenticated().then((ok) => setStatus(ok ? 'authed' : 'anon'));
  }, []);

  if (status === 'checking') {
    return <p className="text-center py-16 font-mono text-graphite">확인 중</p>;
  }
  return status === 'authed' ? children : <Navigate to="/login" replace />;
}
