import { test, expect } from "vitest";
import { renderHook, act, render, screen } from "@testing-library/react";
import { useRendererConfig } from "@/lib/renderers/use-renderer-config";
import { getDefaultRendererConfig } from "@/lib/renderers/renderer";
import userEvent from "@testing-library/user-event";
import { JSX } from "react";

test("returns initial state is equal to default config", () => {
  const { result } = renderHook(() => useRendererConfig());

  expect(result.current.rendererConfig).toEqual(getDefaultRendererConfig());
});

test("updates config with partial changes", () => {
  const { result } = renderHook(() => useRendererConfig());

  act(() => {
    result.current.onUpdateRendererConfig({
      backgroundColor: "#ffffff",
    });
  });
  expect(result.current.rendererConfig.backgroundColor).toBe("#ffffff");
});

test("deep merges nested config objects", () => {
  const { result } = renderHook(() => useRendererConfig());

  act(() => {
    result.current.onUpdateRendererConfig({
      pianoRollConfig: { noteMargin: 6 },
    });
  });
  const defaultConfig = getDefaultRendererConfig();
  expect(result.current.rendererConfig).toEqual({
    ...defaultConfig,
    pianoRollConfig: {
      ...defaultConfig.pianoRollConfig,
      noteMargin: 6,
    },
  });
});

test("should render", async () => {
  const { result } = renderHook(() => useRendererConfig());
  render(<Wrapper>{result.current.VisualizerStyle}</Wrapper>);
  expect(screen.getByText("Visualizer Style")).toBeInTheDocument();
  await userEvent.click(screen.getByRole("combobox", { name: "Style" }));
  await userEvent.click(screen.getByLabelText("Comet"));
  expect(result.current.rendererConfig.type).toBe("comet");
});

const Wrapper = ({ children }: { children: JSX.Element }) => {
  return <>{children}</>;
};
