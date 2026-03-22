import { describe, it, expect } from "vitest";
import {
  APPLICATION_STATUSES,
  STATUS_LABELS,
  type ApplicationStatus,
} from "@/types";

describe("APPLICATION_STATUSES", () => {
  it("6つのステータスを含む", () => {
    expect(APPLICATION_STATUSES).toHaveLength(6);
  });

  it("すべてのステータスが STATUS_LABELS に対応している", () => {
    APPLICATION_STATUSES.forEach((status) => {
      expect(STATUS_LABELS[status]).toBeDefined();
      expect(typeof STATUS_LABELS[status]).toBe("string");
    });
  });

  it("期待するステータス値を含む", () => {
    const expected: ApplicationStatus[] = [
      "interest",
      "applied",
      "document_passed",
      "interviewing",
      "offer",
      "rejected",
    ];
    expected.forEach((s) => {
      expect(APPLICATION_STATUSES).toContain(s);
    });
  });
});
