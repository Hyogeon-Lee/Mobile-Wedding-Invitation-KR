/**
 * Client for the Google Apps Script backend (google-apps-script/Code.gs).
 *
 * Transport: POST with Content-Type text/plain and a JSON body. Apps Script web apps
 * do not answer CORS preflight, and text/plain is a "simple" request so no preflight is sent.
 *
 * Preview mode: when VITE_APPS_SCRIPT_URL is empty (Google login not set up yet), every call
 * is served from localStorage so the UI can be exercised end to end.
 */
export interface GuestbookEntry {
  id: string
  ts: string
  name: string
  message: string
}

export interface RsvpInput {
  side: 'groom' | 'bride'
  name: string
  attending: boolean
  count: number
  meal: 'yes' | 'no' | ''
  note?: string
}

type Result<T> = { ok: true } & T
type Failure = { ok: false; error: string }

export const appsScriptUrl = import.meta.env.VITE_APPS_SCRIPT_URL ?? ''
export const isPreviewBackend = !appsScriptUrl

const LS_KEY = 'wedding.preview.guestbook'

function previewRead(): (GuestbookEntry & { password: string })[] {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) ?? '[]')
  } catch {
    return []
  }
}
function previewWrite(entries: (GuestbookEntry & { password: string })[]) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(entries))
  } catch {
    // storage unavailable (private mode); ignore
  }
}

async function post<T>(body: Record<string, unknown>): Promise<Result<T> | Failure> {
  try {
    const res = await fetch(appsScriptUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(body),
      redirect: 'follow',
    })
    return (await res.json()) as Result<T> | Failure
  } catch {
    return { ok: false, error: '네트워크 오류가 발생했습니다.' }
  }
}

export async function listGuestbook(): Promise<GuestbookEntry[]> {
  if (isPreviewBackend) {
    return previewRead().map(({ password: _p, ...e }) => e)
  }
  try {
    const res = await fetch(`${appsScriptUrl}?action=list`, { redirect: 'follow' })
    const data = (await res.json()) as { ok: boolean; entries?: GuestbookEntry[] }
    return data.ok && data.entries ? data.entries : []
  } catch {
    return []
  }
}

export async function addGuestbook(input: {
  name: string
  message: string
  password: string
}): Promise<Result<{ entry: GuestbookEntry }> | Failure> {
  if (isPreviewBackend) {
    const entry: GuestbookEntry & { password: string } = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      ts: new Date().toISOString(),
      name: input.name.trim().slice(0, 20),
      message: input.message.trim().slice(0, 300),
      password: input.password,
    }
    previewWrite([entry, ...previewRead()])
    const { password: _p, ...publicEntry } = entry
    return { ok: true, entry: publicEntry }
  }
  return post<{ entry: GuestbookEntry }>({ action: 'guestbook.add', ...input })
}

export async function deleteGuestbook(id: string, password: string): Promise<Result<object> | Failure> {
  if (isPreviewBackend) {
    const entries = previewRead()
    const target = entries.find((e) => e.id === id)
    if (!target) return { ok: false, error: '항목을 찾을 수 없습니다.' }
    if (target.password !== password) return { ok: false, error: '비밀번호가 일치하지 않습니다.' }
    previewWrite(entries.filter((e) => e.id !== id))
    return { ok: true }
  }
  return post<object>({ action: 'guestbook.delete', id, password })
}

export async function addRsvp(input: RsvpInput): Promise<Result<object> | Failure> {
  if (isPreviewBackend) {
    return { ok: true }
  }
  return post<object>({ action: 'rsvp.add', ...input })
}
