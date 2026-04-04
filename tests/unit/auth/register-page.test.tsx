import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { RegisterPageView } from '@/app/register/page'

describe('RegisterPageView', () => {
  it('renders the registration form with email and password fields', () => {
    render(<RegisterPageView />)

    expect(
      screen.getByRole('heading', { level: 1, name: 'Create account' })
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sign up' })).toBeInTheDocument()
  })
})
