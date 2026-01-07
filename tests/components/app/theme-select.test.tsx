import { expect, test, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeSelect } from "@/components/app/theme-select";
import { customRender } from "tests/util";

const mockSetTheme = vi.fn();
let mockTheme = "light";
let mockSystemTheme = "light";

vi.mock("next-themes", () => ({
  useTheme: () => ({
    theme: mockTheme,
    systemTheme: mockSystemTheme,
    setTheme: mockSetTheme,
  }),
  ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
}));

beforeEach(() => {
  mockSetTheme.mockClear();
  mockTheme = "light";
  mockSystemTheme = "light";
});

test("should render theme button", () => {
  customRender(<ThemeSelect />);
  expect(screen.getByRole("button", { name: /Theme/ })).toBeInTheDocument();
});

test("should show all theme options when opened", async () => {
  customRender(<ThemeSelect />);
  const trigger = screen.getByRole("button", { name: /Theme/ });
  await userEvent.click(trigger);

  expect(
    screen.getByRole("menuitemradio", { name: /Light/ }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("menuitemradio", { name: /Dark/ }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("menuitemradio", { name: /System/ }),
  ).toBeInTheDocument();
});

test("should call setTheme when dark theme is selected", async () => {
  customRender(<ThemeSelect />);
  const trigger = screen.getByRole("button", { name: /Theme/ });
  await userEvent.click(trigger);

  const darkOption = screen.getByRole("menuitemradio", { name: /Dark/ });
  await userEvent.click(darkOption);

  expect(mockSetTheme).toHaveBeenCalledWith("dark");
});

test("should call setTheme when system theme is selected", async () => {
  customRender(<ThemeSelect />);
  const trigger = screen.getByRole("button", { name: /Theme/ });
  await userEvent.click(trigger);

  const systemOption = screen.getByRole("menuitemradio", { name: /System/ });
  await userEvent.click(systemOption);

  expect(mockSetTheme).toHaveBeenCalledWith("system");
});

test("should call setTheme when light theme is selected from dark", async () => {
  mockTheme = "dark";
  customRender(<ThemeSelect />);
  const trigger = screen.getByRole("button", { name: /Theme/ });
  await userEvent.click(trigger);

  const lightOption = screen.getByRole("menuitemradio", { name: /Light/ });
  await userEvent.click(lightOption);

  expect(mockSetTheme).toHaveBeenCalledWith("light");
});
