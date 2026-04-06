import type { ReactNode } from 'react'

import { PrivateRouteLayout } from '@/components/private-route-layout'

type HistoryLayoutProps = {
  children: ReactNode
}

export default function HistoryLayout({ children }: HistoryLayoutProps) {
  return <PrivateRouteLayout>{children}</PrivateRouteLayout>
}
