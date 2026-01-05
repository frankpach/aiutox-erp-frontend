import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

describe("theme CSS aliases", () => {
  it("should map theme variables to design tokens", () => {
    const cssPath = join(process.cwd(), "app", "app.css");
    const css = readFileSync(cssPath, "utf8");

    expect(css).toContain("--primary: var(--color-primary)");
    expect(css).toContain("--secondary: var(--color-secondary)");
    expect(css).toContain("--accent: var(--color-accent)");
    expect(css).toContain("--background: var(--color-background)");
    expect(css).toContain("--card: var(--color-surface)");
    expect(css).toContain("--foreground: var(--color-text-primary)");
    expect(css).toContain("--muted-foreground: var(--color-text-secondary)");
    expect(css).toContain("--sidebar: var(--sidebar-bg)");
    expect(css).toContain("--destructive: var(--color-error)");
  });
});
