'use client'

import { ReactNode } from 'react'

type ModalProps = {
  title: string
  children: ReactNode
  onClose: () => void
  actions: ReactNode
}

export default function Modal({ title, children, onClose, actions }: ModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg space-y-3 rounded-xl bg-white p-5 shadow"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="text-lg font-semibold">{title}</div>
        <div className="text-sm text-gray-700">{children}</div>
        <div className="flex justify-end gap-2">{actions}</div>
      </div>
    </div>
  )
}
