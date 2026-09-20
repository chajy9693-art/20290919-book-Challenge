interface HeaderProps {
  title: string
  subtitle: string
}

export function Header({ title, subtitle }: HeaderProps) {
  return (
    <header className="py-8 text-center">
      <h1 className="text-2xl font-bold text-text sm:text-3xl">{title}</h1>
      <p className="mt-2 text-sm text-text-muted sm:text-base">{subtitle}</p>
    </header>
  )
}
