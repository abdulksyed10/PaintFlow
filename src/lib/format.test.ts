import { describe, expect, it } from "vitest";

import { formatCurrency } from "@/lib/format";

describe("formatCurrency", () => {
  it("formats INR in Indian numbering style", () => {
    expect(formatCurrency(1234567.89)).toBe("₹12,34,567.89");
  });
});
