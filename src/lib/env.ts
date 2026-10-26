/** Resolve a path under public/ against Vite's base URL. */
export function asset(path: string): string {
  const base = import.meta.env.BASE_URL.endsWith('/') ? import.meta.env.BASE_URL : `${import.meta.env.BASE_URL}/`
  return `${base}${path.replace(/^\//, '')}`
}
