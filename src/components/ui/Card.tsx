import { HTMLAttributes } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: boolean
}

function Card({ padding = true, className = '', children, ...props }: CardProps) {
  return (
    <div
      className={[
        'rounded-xl border border-slate-200 bg-white shadow-sm',
        'dark:border-zinc-800 dark:bg-zinc-900',
        padding ? 'p-6' : '',
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </div>
  )
}

function CardHeader({ className = '', children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={['mb-4', className].join(' ')} {...props}>
      {children}
    </div>
  )
}

function CardTitle({ className = '', children, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={[
        'text-lg font-semibold text-slate-900 dark:text-slate-100',
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </h3>
  )
}

function CardDescription({ className = '', children, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={['text-sm text-slate-500 dark:text-slate-400', className].join(' ')}
      {...props}
    >
      {children}
    </p>
  )
}

function CardContent({ className = '', children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={className} {...props}>
      {children}
    </div>
  )
}

function CardFooter({ className = '', children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={['mt-4 flex items-center', className].join(' ')}
      {...props}
    >
      {children}
    </div>
  )
}

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter }
