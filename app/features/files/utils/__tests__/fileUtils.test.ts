/**
 * Tests for fileUtils functions
 */

import { describe, it, expect } from "vitest";
import {
  formatFileSize,
  getFileExtension,
  isImageFile,
  isPdfFile,
  isMarkdownFile,
  isTextFile,
  isCsvFile,
  isJsonFile,
  isCodeFile,
  canPreviewFile,
  getPreviewType,
} from "../fileUtils";

describe("fileUtils", () => {
  describe("formatFileSize", () => {
    it("should format bytes correctly", () => {
      expect(formatFileSize(0)).toBe("0 Bytes");
      expect(formatFileSize(1024)).toBe("1 KB");
      expect(formatFileSize(1024 * 1024)).toBe("1 MB");
      expect(formatFileSize(1024 * 1024 * 1024)).toBe("1 GB");
      expect(formatFileSize(500)).toBe("500 Bytes");
      expect(formatFileSize(1536)).toBe("1.5 KB");
    });
  });

  describe("getFileExtension", () => {
    it("should extract file extension correctly", () => {
      expect(getFileExtension("test.pdf")).toBe("pdf");
      expect(getFileExtension("test.PDF")).toBe("pdf");
      expect(getFileExtension("file.name.txt")).toBe("txt");
      expect(getFileExtension("noextension")).toBe("");
      expect(getFileExtension("")).toBe("");
    });
  });

  describe("isImageFile", () => {
    it("should detect image files correctly", () => {
      expect(isImageFile("image/png")).toBe(true);
      expect(isImageFile("image/jpeg")).toBe(true);
      expect(isImageFile("image/gif")).toBe(true);
      expect(isImageFile("application/pdf")).toBe(false);
      expect(isImageFile("text/plain")).toBe(false);
    });
  });

  describe("isPdfFile", () => {
    it("should detect PDF files correctly", () => {
      expect(isPdfFile("application/pdf")).toBe(true);
      expect(isPdfFile("image/png")).toBe(false);
      expect(isPdfFile("text/plain")).toBe(false);
    });
  });

  describe("isMarkdownFile", () => {
    it("should detect Markdown files correctly", () => {
      expect(isMarkdownFile("text/markdown")).toBe(true);
      expect(isMarkdownFile("text/x-markdown")).toBe(true);
      expect(isMarkdownFile("text/plain", "test.md")).toBe(true);
      expect(isMarkdownFile("text/plain", "test.MARKDOWN")).toBe(true);
      expect(isMarkdownFile("text/plain", "test.txt")).toBe(false);
      expect(isMarkdownFile("text/plain")).toBe(false);
    });
  });

  describe("isTextFile", () => {
    it("should detect text files correctly", () => {
      expect(isTextFile("text/plain")).toBe(true);
      expect(isTextFile("text/html")).toBe(true);
      expect(isTextFile("text/markdown")).toBe(false);
      expect(isTextFile("text/x-markdown")).toBe(false);
      expect(isTextFile("application/json")).toBe(false);
    });
  });

  describe("isCsvFile", () => {
    it("should detect CSV files correctly", () => {
      expect(isCsvFile("text/csv")).toBe(true);
      expect(isCsvFile("application/csv")).toBe(true);
      expect(isCsvFile("text/plain", "test.csv")).toBe(true);
      expect(isCsvFile("text/plain", "test.CSV")).toBe(true);
      expect(isCsvFile("text/plain", "test.txt")).toBe(false);
      expect(isCsvFile("text/plain")).toBe(false);
    });
  });

  describe("isJsonFile", () => {
    it("should detect JSON files correctly", () => {
      expect(isJsonFile("application/json")).toBe(true);
      expect(isJsonFile("text/json")).toBe(true);
      expect(isJsonFile("text/plain", "test.json")).toBe(true);
      expect(isJsonFile("text/plain", "test.JSON")).toBe(true);
      expect(isJsonFile("text/plain", "test.txt")).toBe(false);
      expect(isJsonFile("text/plain")).toBe(false);
    });
  });

  describe("isCodeFile", () => {
    it("should detect code files correctly", () => {
      expect(isCodeFile("text/javascript")).toBe(true);
      expect(isCodeFile("text/x-python")).toBe(true);
      expect(isCodeFile("text/plain", "test.js")).toBe(true);
      expect(isCodeFile("text/plain", "test.py")).toBe(true);
      expect(isCodeFile("text/plain", "test.ts")).toBe(true);
      expect(isCodeFile("text/plain", "test.txt")).toBe(false);
      expect(isCodeFile("text/plain")).toBe(false);
    });
  });

  describe("canPreviewFile", () => {
    it("should return true for previewable files", () => {
      expect(canPreviewFile("image/png")).toBe(true);
      expect(canPreviewFile("application/pdf")).toBe(true);
      expect(canPreviewFile("text/markdown", "test.md")).toBe(true);
      expect(canPreviewFile("text/plain")).toBe(true);
      expect(canPreviewFile("text/csv", "test.csv")).toBe(true);
      expect(canPreviewFile("application/json", "test.json")).toBe(true);
      expect(canPreviewFile("text/javascript", "test.js")).toBe(true);
    });

    it("should return false for non-previewable files", () => {
      expect(canPreviewFile("application/octet-stream")).toBe(false);
      expect(canPreviewFile("application/zip")).toBe(false);
      expect(canPreviewFile("video/mp4")).toBe(false);
    });
  });

  describe("getPreviewType", () => {
    it("should return correct preview type for images", () => {
      expect(getPreviewType("image/png")).toBe("image");
      expect(getPreviewType("image/jpeg")).toBe("image");
    });

    it("should return correct preview type for PDFs", () => {
      expect(getPreviewType("application/pdf")).toBe("pdf");
    });

    it("should return correct preview type for Markdown", () => {
      expect(getPreviewType("text/markdown", "test.md")).toBe("markdown");
    });

    it("should return correct preview type for CSV", () => {
      expect(getPreviewType("text/csv", "test.csv")).toBe("csv");
    });

    it("should return correct preview type for JSON", () => {
      expect(getPreviewType("application/json", "test.json")).toBe("json");
    });

    it("should return correct preview type for code files", () => {
      expect(getPreviewType("text/javascript", "test.js")).toBe("code");
      expect(getPreviewType("text/x-python", "test.py")).toBe("code");
    });

    it("should return correct preview type for text files", () => {
      expect(getPreviewType("text/plain", "test.txt")).toBe("text");
    });

    it("should return unsupported for non-previewable files", () => {
      expect(getPreviewType("application/octet-stream")).toBe("unsupported");
      expect(getPreviewType("application/zip")).toBe("unsupported");
    });
  });
});


