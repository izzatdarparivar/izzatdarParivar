import { describe, it, expect } from "vitest";
import { validateShortlistAction } from "./shortlist";


describe("shortlist", () => {
  it("allows adding a different user to shortlist", () => {
    const result = validateShortlistAction("user1", "user2");
    expect(result.valid).toBe(true);
  });


  it("rejects adding self to shortlist", () => {
    const result = validateShortlistAction("user1", "user1");
    expect(result.valid).toBe(false);
    expect(result.error).toBe("Cannot shortlist yourself");
  });


  it("rejects empty user IDs", () => {
    const result = validateShortlistAction("", "user2");
    expect(result.valid).toBe(false);
  });
});

