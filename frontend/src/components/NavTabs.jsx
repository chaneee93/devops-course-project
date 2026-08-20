import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { getToken, signOut } from '../auth';

const tabs = [
  { to: '/courses', label: '강의목록' },
  { to: '/my-enrollments', label: '내 신청목록' },
  { to: '/timetable', label: '시간표' },
];

// JWT(idToken)는 점(.)으로 나뉜 세 부분 중 가운데가 실제 정보(claim)를 담고 있음.
// 이미 회원가입 때 'name' 속성을 넣어뒀으니, 서버에 다시 물어볼 필요 없이
// 갖고 있는 토큰을 그 자리에서 디코딩해서 이름만 꺼내 쓰면 됨.
function decodeToken(token) {
  try {
    const payload = token.split('.')[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decodeURIComponent(escape(decoded)));
  } catch {
    return null;
  }
}

export default function NavTabs() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');

  useEffect(() => {
    getToken().then((token) => {
      if (!token) return;
      const claims = decodeToken(token);
      setUserName(claims?.name || claims?.email || '');
    });
  }, []);

  function handleLogout() {
    signOut();
    navigate('/login');
  }

  return (
    <nav className="border-b border-chalk mb-6">
      <div className="max-w-4xl mx-auto px-6 flex items-center justify-between">
        <div className="flex gap-1">
          {tabs.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              className={({ isActive }) =>
                `px-4 py-3 text-[14px] font-semibold border-b-2 -mb-px transition-colors ${
                  isActive
                    ? 'border-cobalt text-cobalt'
                    : 'border-transparent text-graphite hover:text-ink'
                }`
              }
            >
              {tab.label}
            </NavLink>
          ))}
        </div>

        <div className="flex items-center gap-3 text-[13px]">
          {userName && <span className="text-graphite">{userName}님</span>}
          <button
            onClick={handleLogout}
            className="text-graphite hover:text-signal underline underline-offset-2"
          >
            로그아웃
          </button>
        </div>
      </div>
    </nav>
  );
}
