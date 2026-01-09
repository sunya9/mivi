import { expect, test, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SettingsMenu } from "@/components/app/settings-menu";
import { customRender } from "tests/util";

const mockSetTheme = vi.fn();
let mockTheme = "light";

vi.mock("next-themes", () => ({
  useTheme: () => ({
    theme: mockTheme,
    systemTheme: "light",
    setTheme: mockSetTheme,
  }),
  ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
}));

beforeEach(() => {
  mockSetTheme.mockClear();
  mockTheme = "light";
});

test("should render settings button", () => {
  customRender(<SettingsMenu />);
  expect(screen.getByRole("button", { name: /Settings/ })).toBeInTheDocument();
});

test("should show theme submenu and keyboard shortcuts option when menu is opened", async () => {
  customRender(<SettingsMenu />);

  await userEvent.click(screen.getByRole("button", { name: /Settings/ }));

  expect(screen.getByText(/Theme/)).toBeInTheDocument();
  expect(screen.getByText(/Keyboard Shortcuts/)).toBeInTheDocument();
});

test("should show theme options in submenu", async () => {
  customRender(<SettingsMenu />);

  await userEvent.click(screen.getByRole("button", { name: /Settings/ }));
  await userEvent.click(screen.getByText(/Theme/));

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

test("should change theme when option is selected", async () => {
  customRender(<SettingsMenu />);

  await userEvent.click(screen.getByRole("button", { name: /Settings/ }));
  await userEvent.click(screen.getByText(/Theme/));
  await userEvent.click(screen.getByRole("menuitemradio", { name: /Dark/ }));

  expect(mockSetTheme).toHaveBeenCalledWith("dark");
});

test("should open keyboard shortcuts dialog when option is selected", async () => {
  customRender(<SettingsMenu />);

  await userEvent.click(screen.getByRole("button", { name: /Settings/ }));
  await userEvent.click(screen.getByText(/Keyboard Shortcuts/));

  expect(screen.getByRole("dialog")).toBeInTheDocument();
  expect(screen.getByText("Space")).toBeInTheDocument();
});
