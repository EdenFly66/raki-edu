import type { ReactNode } from 'react'

import { PrivateRouteLayout } from '@/components/private-route-layout'

type GeneratorLayoutProps = {
  children: ReactNode
}

export default function GeneratorLayout({ children }: GeneratorLayoutProps) {
  return <PrivateRouteLayout>{children}</PrivateRouteLayout>
}
