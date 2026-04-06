import type { ReactNode } from 'react'

import { AppNavigation } from '@/components/app-navigation'

type PrivateRouteLayoutProps = {
  children: ReactNode
}

export function PrivateRouteLayout({ children }: PrivateRouteLayoutProps) {
  return (
    <>
      <div className="mx-auto w-full max-w-5xl px-6 pt-6">
        <AppNavigation />
      </div>
      {children}
    </>
  )
}
