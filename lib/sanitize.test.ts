import { describe, it, expect } from "vitest";
import {
  sanitizeStrict,
  sanitizeBasic,
  sanitizeDisplayName,
  sanitizePhoneNumber,
  sanitizeProfileData,
  sanitizeBio,
} from "./sanitize";


describe("sanitize", () => {
  describe("sanitizeStrict", () => {
    it("strips all HTML tags", () => {
      expect(sanitizeStrict('<script>alert("xss")</script>Hello')).toBe("Hello");
      expect(sanitizeStrict("<b>bold</b>")).toBe("bold");
    });


    it("preserves plain text", () => {
      expect(sanitizeStrict("Hello World")).toBe("Hello World");
    });
  });


  describe("sanitizeBasic", () => {
    it("allows simple formatting tags", () => {
      expect(sanitizeBasic("<b>bold</b>")).toBe("<b>bold</b>");
      expect(sanitizeBasic("<em>italic</em>")).toBe("<em>italic</em>");
    });


    it("strips dangerous tags", () => {
      expect(sanitizeBasic('<script>alert("xss")</script>')).toBe("");
    });
  });


  describe("sanitizeDisplayName", () => {
    it("removes special characters", () => {
      expect(sanitizeDisplayName("John<script>")).toBe("John");
    });


    it("limits to 50 characters", () => {
      const longName = "A".repeat(100);
      expect(sanitizeDisplayName(longName).length).toBe(50);
    });
  });


  describe("sanitizePhoneNumber", () => {
    it("only allows digits and +", () => {
      expect(sanitizePhoneNumber("+91-9876-543-210")).toBe("+919876543210");
    });


    it("limits to 15 characters", () => {
      expect(sanitizePhoneNumber("+1234567890123456789").length).toBe(15);
    });
  });


  describe("sanitizeBio", () => {
    it("allows basic HTML and limits length", () => {
      expect(sanitizeBio("<b>Hello</b>")).toBe("<b>Hello</b>");
      const longBio = "A".repeat(600);
      expect(sanitizeBio(longBio).length).toBe(500);
    });
  });


  describe("sanitizeProfileData", () => {
    it("recursively sanitizes nested objects", () => {
      const data = {
        name: '<script>alert("x")</script>John',
        location: { city: "<b>Mumbai</b>", state: "Maharashtra" },
        hobbies: ["<img src=x>Reading", "Cooking"],
        age: 25,
      };
      const result = sanitizeProfileData(data);
      expect(result.name).toBe("John");
      expect((result.location as any).city).toBe("Mumbai");
      expect((result.hobbies as any)[0]).toBe("Reading");
      expect(result.age).toBe(25);
    });
  });
});



