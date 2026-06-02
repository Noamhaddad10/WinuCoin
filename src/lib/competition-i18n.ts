interface LocalizableFields {
  title?: string | null
  title_fr?: string | null
  title_en?: string | null
  description?: string | null
  description_fr?: string | null
  description_en?: string | null
}

/**
 * Pick the title and description for the active locale, with explicit fallbacks.
 *
 * Resolution order for title:
 *   `title_${locale}` → `title_en` → `title_fr` → legacy `title` → ''
 *
 * Resolution order for description (nullable):
 *   `description_${locale}` → `description_en` → `description_fr` → legacy `description` → null
 */
export function localizeCompetition(
  comp: LocalizableFields,
  locale: string,
): { title: string; description: string | null } {
  const want = locale === 'fr' ? 'fr' : 'en'
  const other = want === 'fr' ? 'en' : 'fr'

  const title =
    (want === 'fr' ? comp.title_fr : comp.title_en) ??
    (other === 'fr' ? comp.title_fr : comp.title_en) ??
    comp.title ??
    ''

  const description =
    (want === 'fr' ? comp.description_fr : comp.description_en) ??
    (other === 'fr' ? comp.description_fr : comp.description_en) ??
    comp.description ??
    null

  return { title, description }
}
