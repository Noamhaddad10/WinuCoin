import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from '@/components/ui/Button'

describe('Button', () => {
  it('renders children text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument()
  })

  it('applies primary variant classes by default', () => {
    render(<Button>Primary</Button>)
    const btn = screen.getByRole('button')
    expect(btn.className).toContain('bg-indigo-600')
  })

  it('applies secondary variant classes', () => {
    render(<Button variant="secondary">Secondary</Button>)
    const btn = screen.getByRole('button')
    expect(btn.className).toContain('border-slate-200')
  })

  it('applies ghost variant classes', () => {
    render(<Button variant="ghost">Ghost</Button>)
    const btn = screen.getByRole('button')
    expect(btn.className).toContain('text-slate-700')
  })

  it('applies danger variant classes', () => {
    render(<Button variant="danger">Danger</Button>)
    const btn = screen.getByRole('button')
    expect(btn.className).toContain('bg-red-600')
  })

  it('applies small size classes', () => {
    render(<Button size="sm">Small</Button>)
    const btn = screen.getByRole('button')
    expect(btn.className).toContain('h-8')
  })

  it('applies medium size classes by default', () => {
    render(<Button>Medium</Button>)
    const btn = screen.getByRole('button')
    expect(btn.className).toContain('h-10')
  })

  it('applies large size classes', () => {
    render(<Button size="lg">Large</Button>)
    const btn = screen.getByRole('button')
    expect(btn.className).toContain('h-12')
  })

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('is disabled when loading is true', () => {
    render(<Button loading>Loading</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('shows spinner when loading', () => {
    render(<Button loading>Loading</Button>)
    const svg = screen.getByRole('button').querySelector('svg')
    expect(svg).toBeTruthy()
    expect(svg!.classList.contains('animate-spin')).toBe(true)
  })

  it('does not show spinner when not loading', () => {
    render(<Button>Not Loading</Button>)
    const svg = screen.getByRole('button').querySelector('svg')
    expect(svg).toBeNull()
  })

  it('calls onClick handler', async () => {
    const user = userEvent.setup()
    let clicked = false
    render(<Button onClick={() => { clicked = true }}>Click</Button>)
    await user.click(screen.getByRole('button'))
    expect(clicked).toBe(true)
  })

  it('does not call onClick when disabled', async () => {
    const user = userEvent.setup()
    let clicked = false
    render(<Button disabled onClick={() => { clicked = true }}>Click</Button>)
    await user.click(screen.getByRole('button'))
    expect(clicked).toBe(false)
  })

  it('applies custom className', () => {
    render(<Button className="my-custom-class">Custom</Button>)
    expect(screen.getByRole('button').className).toContain('my-custom-class')
  })

  it('forwards ref', () => {
    let ref: HTMLButtonElement | null = null
    render(<Button ref={(el) => { ref = el }}>Ref</Button>)
    expect(ref).toBeInstanceOf(HTMLButtonElement)
  })
})
