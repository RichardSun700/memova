export const PRODUCT_JOURNAL_ENTRY_STATE_KEY = "memovaProductJournalEntry";

export const productJournalEntryState = {
  [PRODUCT_JOURNAL_ENTRY_STATE_KEY]: true,
} as const;

export function wasProductJournalOpenedInApp(state: unknown) {
  if (!state || typeof state !== "object") return false;

  return (
    PRODUCT_JOURNAL_ENTRY_STATE_KEY in state &&
    state[PRODUCT_JOURNAL_ENTRY_STATE_KEY] === true
  );
}
