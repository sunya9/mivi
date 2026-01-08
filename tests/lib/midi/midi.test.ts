import { describe, it, expect } from "vitest";
import { getDefaultTrackConfig } from "@/lib/midi/midi";

describe("getDefaultTrackConfig", () => {
  it("should return default track config with provided name", () => {
    const config = getDefaultTrackConfig("Test Track");

    expect(config).toEqual({
      visible: true,
      color: "#ffffff",
      opacity: 1,
      name: "Test Track",
      scale: 1,
      staccato: false,
    });
  });

  it("should use provided color when specified", () => {
    const config = getDefaultTrackConfig("Test Track", "#ff0000");

    expect(config.color).toBe("#ff0000");
    expect(config.name).toBe("Test Track");
  });

  it("should use default color when not specified", () => {
    const config = getDefaultTrackConfig("Track Name");

    expect(config.color).toBe("#ffffff");
  });

  it("should always have visible set to true", () => {
    const config = getDefaultTrackConfig("Any Track", "#123456");

    expect(config.visible).toBe(true);
  });

  it("should always have opacity set to 1", () => {
    const config = getDefaultTrackConfig("Track");

    expect(config.opacity).toBe(1);
  });

  it("should always have scale set to 1", () => {
    const config = getDefaultTrackConfig("Track");

    expect(config.scale).toBe(1);
  });

  it("should always have staccato set to false", () => {
    const config = getDefaultTrackConfig("Track");

    expect(config.staccato).toBe(false);
  });
});
