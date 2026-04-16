import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Input } from '@/components/ui/Input'

describe('Input', () => {
  it('renders with label', () => {
    render(<Input label="Email" />)
    expect(screen.getByText('Email')).toBeInTheDocument()
  })

  it('renders input element', () => {
    render(<Input label="Email" type="email" />)
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('applies placeholder', () => {
    render(<Input label="Email" placeholder="you@example.com" />)
    expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument()
  })

  it('shows error message', () => {
    render(<Input label="Email" error="Invalid email" />)
    expect(screen.getByText('Invalid email')).toBeInTheDocument()
  })

  it('handles value changes', async () => {
    const user = userEvent.setup()
    let value = ''
    render(<Input label="Name" onChange={(e) => { value = e.target.value }} />)
    await user.type(screen.getByRole('textbox'), 'John')
    expect(value).toBe('John')
  })

  it('can be disabled', () => {
    render(<Input label="Email" disabled />)
    expect(screen.getByRole('textbox')).toBeDisabled()
  })
})
