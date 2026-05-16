import { describe, it, expect } from "vitest";
import { validateInterestAction } from "./interests";


describe("interests", () => {
  describe("validateInterestAction", () => {
    it("allows sending interest to a different user", () => {
      const result = validateInterestAction("user1", "user2", "send");
      expect(result.valid).toBe(true);
    });


    it("rejects sending interest to self", () => {
      const result = validateInterestAction("user1", "user1", "send");
      expect(result.valid).toBe(false);
      expect(result.error).toBe("Cannot send interest to yourself");
    });


    it("validates accept action", () => {
      const result = validateInterestAction("user1", "user2", "accept");
      expect(result.valid).toBe(true);
    });


    it("validates decline action", () => {
      const result = validateInterestAction("user1", "user2", "decline");
      expect(result.valid).toBe(true);
    });


    it("rejects invalid action type", () => {
      const result = validateInterestAction("user1", "user2", "invalid" as any);
      expect(result.valid).toBe(false);
    });
  });
});

