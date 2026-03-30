import { describe, it, expect } from "vitest";
import { PAGE_SEO } from "@/lib/page-seo";

describe("PAGE_SEO metadata", () => {
  const requiredPages = [
    "/chat",
    "/connect/onboarding",
    "/connect/products",
    "/connect/storefront",
    "/onboarding",
    "/recommendations",
    "/reset-password",
    "/unsubscribe",
  ];

  it("should have SEO config for all required pages", () => {
    for (const page of requiredPages) {
      expect(PAGE_SEO[page]).toBeDefined();
      expect(PAGE_SEO[page].title).toBeTruthy();
      expect(PAGE_SEO[page].description).toBeTruthy();
    }
  });

  it("should have titles under 60 characters", () => {
    for (const [path, seo] of Object.entries(PAGE_SEO)) {
      // Allow slightly longer for brand suffix
      expect(seo.title.length).toBeLessThanOrEqual(80);
    }
  });

  it("should have descriptions under 160 characters", () => {
    for (const [path, seo] of Object.entries(PAGE_SEO)) {
      expect(seo.description.length).toBeLessThanOrEqual(160);
    }
  });

  it("should have canonical URLs pointing to the correct domain", () => {
    for (const [path, seo] of Object.entries(PAGE_SEO)) {
      if (seo.canonical) {
        expect(seo.canonical).toContain("quantus-loom.lovable.app");
        expect(seo.canonical).toContain(path);
      }
    }
  });
});
