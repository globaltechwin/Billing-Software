// @vitest-environment node
import { describe, it, expect } from "vitest";
import {
  formatFileSize,
  getBackupFilePath,
} from "./backup-utils";

describe("formatFileSize", () => {
  it("formats 0 bytes", () => {
    expect(formatFileSize(0)).toBe("0 B");
  });

  it("formats bytes", () => {
    expect(formatFileSize(512)).toBe("512 B");
  });

  it("formats kilobytes", () => {
    expect(formatFileSize(1024)).toBe("1 KB");
    expect(formatFileSize(1536)).toBe("1.5 KB");
  });

  it("formats megabytes", () => {
    expect(formatFileSize(1048576)).toBe("1 MB");
    expect(formatFileSize(2621440)).toBe("2.5 MB");
  });

  it("formats gigabytes", () => {
    expect(formatFileSize(1073741824)).toBe("1 GB");
  });
});

describe("getBackupFilePath", () => {
  it("builds correct path", () => {
    const result = getBackupFilePath(6, "backup.sql");
    expect(result).toContain("storage/backups/6/backup.sql");
  });

  it("handles different company IDs", () => {
    const result = getBackupFilePath(99, "test.sql.gz");
    expect(result).toContain("99/test.sql.gz");
  });
});
