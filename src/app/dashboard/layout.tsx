import type { ReactNode } from 'react'

import { PrivateRouteLayout } from '@/components/private-route-layout'

type DashboardLayoutProps = {
  children: ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return <PrivateRouteLayout>{children}</PrivateRouteLayout>
}
