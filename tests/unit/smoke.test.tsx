import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

describe('test setup', () => {
  it('renders React components with Testing Library', () => {
    render(<main>Raki Edu</main>)

    expect(screen.getByRole('main')).toHaveTextContent('Raki Edu')
  })
})
