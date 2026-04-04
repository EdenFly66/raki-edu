import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { LoginPageView } from '@/app/login/page'

describe('LoginPageView', () => {
  it('renders the login form with email and password fields', () => {
    render(<LoginPageView />)

    expect(
      screen.getByRole('heading', { level: 1, name: 'Login' })
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument()
  })
})
