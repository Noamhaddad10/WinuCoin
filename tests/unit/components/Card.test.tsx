import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card'

describe('Card', () => {
  it('renders children', () => {
    render(<Card>Card content</Card>)
    expect(screen.getByText('Card content')).toBeInTheDocument()
  })

  it('applies padding by default', () => {
    const { container } = render(<Card>Content</Card>)
    expect(container.firstChild).toHaveClass('p-6')
  })

  it('removes padding when padding=false', () => {
    const { container } = render(<Card padding={false}>Content</Card>)
    expect(container.firstChild).not.toHaveClass('p-6')
  })

  it('applies rounded border and background', () => {
    const { container } = render(<Card>Content</Card>)
    expect(container.firstChild).toHaveClass('rounded-xl')
    expect(container.firstChild).toHaveClass('bg-white')
  })

  it('applies custom className', () => {
    const { container } = render(<Card className="my-class">Content</Card>)
    expect(container.firstChild).toHaveClass('my-class')
  })
})

describe('CardHeader', () => {
  it('renders children', () => {
    render(<CardHeader>Header</CardHeader>)
    expect(screen.getByText('Header')).toBeInTheDocument()
  })

  it('applies bottom margin', () => {
    const { container } = render(<CardHeader>Header</CardHeader>)
    expect(container.firstChild).toHaveClass('mb-4')
  })
})

describe('CardTitle', () => {
  it('renders as h3 element', () => {
    render(<CardTitle>Title</CardTitle>)
    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Title')
  })

  it('applies text styling', () => {
    render(<CardTitle>Title</CardTitle>)
    const heading = screen.getByRole('heading')
    expect(heading).toHaveClass('text-lg', 'font-semibold')
  })
})

describe('CardDescription', () => {
  it('renders paragraph', () => {
    render(<CardDescription>Description text</CardDescription>)
    expect(screen.getByText('Description text')).toBeInTheDocument()
  })

  it('applies muted text styling', () => {
    render(<CardDescription>Description</CardDescription>)
    expect(screen.getByText('Description')).toHaveClass('text-sm', 'text-slate-500')
  })
})

describe('CardContent', () => {
  it('renders children', () => {
    render(<CardContent>Body content</CardContent>)
    expect(screen.getByText('Body content')).toBeInTheDocument()
  })
})

describe('CardFooter', () => {
  it('renders children', () => {
    render(<CardFooter>Footer content</CardFooter>)
    expect(screen.getByText('Footer content')).toBeInTheDocument()
  })

  it('applies flex styling', () => {
    const { container } = render(<CardFooter>Footer</CardFooter>)
    expect(container.firstChild).toHaveClass('flex', 'items-center')
  })
})
