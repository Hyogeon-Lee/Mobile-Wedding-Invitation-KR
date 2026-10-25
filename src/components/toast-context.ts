import { createContext, useContext } from 'react'

export interface ToastCtx {
  show: (message: string) => void
}

export const ToastContext = createContext<ToastCtx>({ show: () => {} })

export function useToast() {
  return useContext(ToastContext)
}
