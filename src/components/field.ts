/** iOS-style filled text field, shared by RSVP, GuestbookForm and EntryCard. */
export const FIELD_SURFACE = 'bg-[rgb(47_107_79/0.05)] shadow-[inset_0_0_0_1px_rgb(54_66_59/0.12)]'
export const FIELD_INVALID_RING = 'shadow-[inset_0_0_0_1.5px_var(--color-accent)]'
export const FIELD =
  'w-full rounded-[12px] border-0 px-4 text-[1rem] text-ink placeholder:text-ink-muted caret-accent ' +
  FIELD_SURFACE +
  ' transition-[background-color,box-shadow] duration-150 ease-out focus:bg-bg-elevated focus:shadow-[inset_0_0_0_2px_var(--color-accent)] focus:outline-none aria-invalid:shadow-[inset_0_0_0_1.5px_var(--color-accent)] disabled:opacity-50'
