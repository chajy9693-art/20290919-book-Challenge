import { useMemo, useState } from 'react'
import { matchesNameQuery } from '../lib/chosung'
import type { Participant } from '../types'

interface NameComboboxProps {
  participants: Participant[]
  pid: string | null
  onSelect: (pid: string) => void
}

export function NameCombobox({ participants, pid, onSelect }: NameComboboxProps) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)

  const selected = participants.find((p) => p.id === pid) ?? null

  const filtered = useMemo(
    () => participants.filter((p) => p.active && matchesNameQuery(p.name, query)),
    [participants, query],
  )

  return (
    <div className="relative">
      <label htmlFor="name-combobox" className="mb-1 block text-sm font-medium text-text">
        이름 선택
      </label>
      <input
        id="name-combobox"
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-controls="name-combobox-list"
        autoComplete="off"
        placeholder="이름 또는 초성(예: ㅊㄱㅈ)으로 검색"
        className="w-full rounded-lg border border-border bg-card-accent px-4 py-3 text-sm text-text placeholder:text-text-muted"
        value={open ? query : (selected?.displayName ?? '')}
        onFocus={() => {
          setQuery('')
          setOpen(true)
        }}
        onChange={(e) => setQuery(e.target.value)}
        onBlur={() => setTimeout(() => setOpen(false), 100)}
      />

      {open && (
        <ul
          id="name-combobox-list"
          role="listbox"
          className="absolute z-10 mt-2 max-h-60 w-full overflow-y-auto rounded-lg border border-border bg-card-accent shadow-lg"
        >
          {filtered.length === 0 && <li className="px-4 py-3 text-sm text-text-muted">검색 결과가 없어요.</li>}
          {filtered.map((p) => (
            <li key={p.id}>
              <button
                type="button"
                role="option"
                aria-selected={p.id === pid}
                className="w-full px-4 py-3 text-left text-sm text-text hover:bg-bg"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onSelect(p.id)
                  setOpen(false)
                }}
              >
                {p.displayName}
              </button>
            </li>
          ))}
        </ul>
      )}

      {selected && !open && (
        <p className="mt-2 text-sm text-success">✓ {selected.displayName} 님으로 선택되었습니다.</p>
      )}
    </div>
  )
}
