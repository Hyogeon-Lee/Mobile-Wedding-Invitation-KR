/**
 * Phone numbers and bank accounts are injected at build time from VITE_CONTACTS / VITE_ACCOUNTS
 * (JSON strings) so they never enter git history. Missing or malformed values fall back to
 * clearly fake samples so the draft still renders.
 */
export interface Contacts {
  groom: string
  bride: string
  groomFather?: string
  groomMother?: string
  brideFather?: string
  brideMother?: string
}

export interface Account {
  holder: string
  bank: string
  number: string
  /** Optional deep links generated in each app */
  kakaopayUrl?: string
  tossUrl?: string
}

export interface Accounts {
  groom: Account[]
  bride: Account[]
}

const SAMPLE_CONTACTS: Contacts = {
  groom: '010-0000-0000',
  bride: '010-0000-0000',
  groomFather: '010-0000-0000',
  groomMother: '010-0000-0000',
  brideFather: '010-0000-0000',
  brideMother: '010-0000-0000',
}

const SAMPLE_ACCOUNTS: Accounts = {
  groom: [
    { holder: '이OO', bank: 'OO은행', number: '000-000-000000' },
    { holder: '이OO (아버지)', bank: 'OO은행', number: '000-000-000000' },
    { holder: '김OO (어머니)', bank: 'OO은행', number: '000-000-000000' },
  ],
  bride: [
    { holder: '박OO', bank: 'OO은행', number: '000-000-000000' },
    { holder: '박OO (아버지)', bank: 'OO은행', number: '000-000-000000' },
    { holder: '최OO (어머니)', bank: 'OO은행', number: '000-000-000000' },
  ],
}

function parseJson<T>(raw: string | undefined, fallback: T): { value: T; isSample: boolean } {
  if (!raw) return { value: fallback, isSample: true }
  try {
    return { value: JSON.parse(raw) as T, isSample: false }
  } catch {
    console.warn('[private] invalid JSON in env; using sample values')
    return { value: fallback, isSample: true }
  }
}

const contactsParsed = parseJson<Contacts>(import.meta.env.VITE_CONTACTS, SAMPLE_CONTACTS)
const accountsParsed = parseJson<Accounts>(import.meta.env.VITE_ACCOUNTS, SAMPLE_ACCOUNTS)

export const contacts: Contacts = contactsParsed.value
export const accounts: Accounts = accountsParsed.value
/** true when any private value is a sample; the UI can show a small "예시" badge */
export const isSampleData = contactsParsed.isSample || accountsParsed.isSample
