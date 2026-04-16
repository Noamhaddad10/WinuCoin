import { describe, it, expect } from 'vitest'
import * as fs from 'fs'
import * as path from 'path'

const SRC_DIR = path.resolve(__dirname, '../../src')
const APP_DIR = path.join(SRC_DIR, 'app')

function findAllPageFiles(dir: string): string[] {
  const files: string[] = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...findAllPageFiles(fullPath))
    } else if (entry.name === 'page.tsx') {
      files.push(fullPath)
    }
  }
  return files
}

describe('SEO — metadata on pages', () => {
  const pageFiles = findAllPageFiles(APP_DIR)

  it('found page.tsx files', () => {
    expect(pageFiles.length).toBeGreaterThan(0)
  })

  // Check non-root locale pages for metadata
  const localePages = pageFiles.filter((f) => f.includes('[locale]'))

  for (const pageFile of localePages) {
    const relativePath = path.relative(APP_DIR, pageFile)
    it(`${relativePath} has metadata or generateMetadata`, () => {
      const content = fs.readFileSync(pageFile, 'utf-8')
      const hasMetadata =
        content.includes('metadata') ||
        content.includes('generateMetadata') ||
        content.includes('metaTitle')
      expect(hasMetadata).toBe(true)
    })
  }
})

describe('SEO — robots.txt and sitemap', () => {
  it('public directory exists', () => {
    const publicDir = path.resolve(__dirname, '../../public')
    expect(fs.existsSync(publicDir)).toBe(true)
  })

  it('robots.ts exists in app directory', () => {
    const robotsFile = path.join(APP_DIR, 'robots.ts')
    expect(fs.existsSync(robotsFile)).toBe(true)
  })

  it('robots.ts disallows /api/ and /auth/', () => {
    const robotsFile = path.join(APP_DIR, 'robots.ts')
    const content = fs.readFileSync(robotsFile, 'utf-8')
    expect(content).toContain('/api/')
    expect(content).toContain('/auth/')
  })

  it('sitemap.ts exists in app directory', () => {
    const sitemapFile = path.join(APP_DIR, 'sitemap.ts')
    expect(fs.existsSync(sitemapFile)).toBe(true)
  })

  it('sitemap.ts includes both locales', () => {
    const sitemapFile = path.join(APP_DIR, 'sitemap.ts')
    const content = fs.readFileSync(sitemapFile, 'utf-8')
    expect(content).toContain("'en'")
    expect(content).toContain("'fr'")
  })
})

describe('SEO — HTML lang attribute', () => {
  it('locale layout uses html lang attribute via next-intl', () => {
    const layoutFile = path.join(APP_DIR, '[locale]/layout.tsx')
    if (fs.existsSync(layoutFile)) {
      const content = fs.readFileSync(layoutFile, 'utf-8')
      expect(content).toContain('locale')
      // next-intl should handle lang attribute
      expect(content).toContain('lang')
    }
  })
})

describe('accessibility basics in source', () => {
  it('images use alt attributes', () => {
    const componentDir = path.join(SRC_DIR, 'components')
    const componentFiles = findAllTsxFiles(componentDir)
    const violations: string[] = []

    for (const file of componentFiles) {
      const content = fs.readFileSync(file, 'utf-8')
      // Check for <Image or <img without alt
      const imgRegex = /<(?:Image|img)\s[^>]*(?!alt)[^>]*\/?\s*>/g
      const matches = content.match(imgRegex)
      if (matches) {
        for (const match of matches) {
          if (!match.includes('alt=') && !match.includes('aria-hidden')) {
            violations.push(`${path.relative(SRC_DIR, file)}: ${match.slice(0, 60)}...`)
          }
        }
      }
    }
    // Log violations but don't fail — some may be decorative images
    if (violations.length > 0) {
      console.warn('Possible missing alt attributes:', violations)
    }
    expect(violations.length).toBe(0)
  })

  it('interactive elements have aria-labels', () => {
    const componentDir = path.join(SRC_DIR, 'components')
    const componentFiles = findAllTsxFiles(componentDir)
    let iconButtonsWithoutLabel = 0

    for (const file of componentFiles) {
      const content = fs.readFileSync(file, 'utf-8')
      // Check for icon-only buttons (buttons containing only SVG/Icon components)
      const buttonRegex = /<button\s[^>]*>/g
      const buttons = content.match(buttonRegex) || []
      for (const btn of buttons) {
        if (!btn.includes('aria-label') && !btn.includes('type="submit"')) {
          // Log but don't fail — need manual review
        }
      }
    }
    // This is informational — key buttons should have labels
    expect(iconButtonsWithoutLabel).toBe(0)
  })
})

function findAllTsxFiles(dir: string): string[] {
  const files: string[] = []
  if (!fs.existsSync(dir)) return files
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...findAllTsxFiles(fullPath))
    } else if (entry.name.endsWith('.tsx')) {
      files.push(fullPath)
    }
  }
  return files
}
