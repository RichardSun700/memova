import { describe, expect, it } from "vitest";

import {
  PRODUCT_JOURNAL_ENTRY_STATE_KEY,
  productJournalEntryState,
  wasProductJournalOpenedInApp,
} from "./productJournalNavigation";

describe("Product Journal navigation state", () => {
  it("recognizes only an in-app Product Journal entry marker", () => {
    expect(productJournalEntryState).toEqual({
      [PRODUCT_JOURNAL_ENTRY_STATE_KEY]: true,
    });
    expect(wasProductJournalOpenedInApp(productJournalEntryState)).toBe(true);
    expect(wasProductJournalOpenedInApp(null)).toBe(false);
    expect(wasProductJournalOpenedInApp({})).toBe(false);
    expect(
      wasProductJournalOpenedInApp({
        [PRODUCT_JOURNAL_ENTRY_STATE_KEY]: false,
      })
    ).toBe(false);
  });
});
