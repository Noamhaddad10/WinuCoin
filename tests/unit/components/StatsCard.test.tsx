import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StatsCard } from '@/components/ui/StatsCard'

describe('StatsCard', () => {
  it('renders label and value', () => {
    render(<StatsCard label="Total Users" value={150} />)
    expect(screen.getByText('Total Users')).toBeInTheDocument()
    expect(screen.getByText('150')).toBeInTheDocument()
  })

  it('renders string value', () => {
    render(<StatsCard label="Revenue" value="$5,000" />)
    expect(screen.getByText('$5,000')).toBeInTheDocument()
  })

  it('renders icon when provided', () => {
    render(<StatsCard label="Users" value={10} icon={<span data-testid="icon">*</span>} />)
    expect(screen.getByTestId('icon')).toBeInTheDocument()
  })

  it('renders sub text when provided', () => {
    render(<StatsCard label="Users" value={10} sub="+5 this week" />)
    expect(screen.getByText('+5 this week')).toBeInTheDocument()
  })

  it('does not render sub when not provided', () => {
    const { container } = render(<StatsCard label="Users" value={10} />)
    const subElements = container.querySelectorAll('.text-xs.text-slate-400')
    expect(subElements.length).toBe(0)
  })
})
