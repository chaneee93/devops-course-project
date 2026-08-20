/**
 * 공통 UI 컴포넌트.
 * 수강신청 화면 등 다른 페이지에서도 이 컴포넌트를 그대로 사용하면 톤이 맞습니다.
 */

/* ── Button ─────────────────────────────────────────── */

const buttonVariants = {
  primary: 'bg-cobalt text-white hover:bg-cobalt-deep',
  secondary: 'border border-chalk bg-white text-ink hover:bg-chalk/40',
  danger: 'bg-signal text-white hover:brightness-95',
}

export function Button({
  variant = 'primary',
  full = false,
  className = '',
  disabled,
  children,
  ...props
}) {
  return (
    <button
      disabled={disabled}
      className={[
        'h-12 rounded-field px-5 text-[15px] font-semibold transition-colors',
        'disabled:cursor-not-allowed disabled:opacity-40',
        buttonVariants[variant],
        full ? 'w-full' : '',
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </button>
  )
}

/* ── Field (label + input + 도움말/에러) ────────────── */

export function Field({ label, htmlFor, hint, error, action, children }) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <label htmlFor={htmlFor} className="block text-[13px] font-semibold text-ink">
          {label}
        </label>
        {action}
      </div>

      <div className="mt-2">{children}</div>

      {error ? (
        <p className="mt-1.5 text-[12px] font-medium text-signal">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-[12px] text-graphite">{hint}</p>
      ) : null}
    </div>
  )
}

/* ── Input ──────────────────────────────────────────── */

export function Input({ invalid = false, mono = false, className = '', ...props }) {
  return (
    <input
      aria-invalid={invalid || undefined}
      className={[
        'h-12 w-full rounded-field border bg-white px-3.5 text-[15px] text-ink',
        'placeholder:text-graphite/45',
        invalid ? 'border-signal' : 'border-chalk',
        mono ? 'font-mono' : '',
        className,
      ].join(' ')}
      {...props}
    />
  )
}

/* ── TextLink ───────────────────────────────────────── */

export function TextLink({ as: Tag = 'button', className = '', children, ...props }) {
  return (
    <Tag
      className={['rounded font-semibold text-cobalt underline underline-offset-2', className].join(' ')}
      {...props}
    >
      {children}
    </Tag>
  )
}
