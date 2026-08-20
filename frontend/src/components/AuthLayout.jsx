/**
 * 로그인 / 회원가입 / 인증코드 화면의 공통 레이아웃.
 * 화면 가운데에 흰색 카드로 폼을 감싸서, 배경(paper)과 명확히 분리되게 함.
 */

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-paper px-6 py-12">
      <div className="w-full max-w-[380px]">
        <div className="flex items-baseline justify-center gap-2 mb-8">
          <span className="text-[18px] font-bold tracking-[-.02em] text-ink">수강신청</span>
          <span className="font-mono text-[13px] text-graphite">2026-2학기</span>
        </div>

        <div className="bg-white border border-chalk rounded-field shadow-sm px-8 py-9">
          {children}
        </div>
      </div>
    </div>
  )
}
