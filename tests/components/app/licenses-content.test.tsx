import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vitest";

import { LicensesContent } from "@/components/app/licenses-content";

vi.mock("virtual:license-notices", () => ({
  default: [
    {
      name: "mediabunny",
      version: "1.55.6",
      license: "MPL-2.0",
      text: "Mozilla Public License Version 2.0",
    },
    { name: "react", version: "19.2.8", license: "MIT" },
  ],
}));

test("lists bundled packages with version and license once loaded", async () => {
  render(<LicensesContent />);

  expect(await screen.findByRole("link", { name: "mediabunny" })).toHaveAttribute(
    "href",
    "https://www.npmjs.com/package/mediabunny/v/1.55.6",
  );
  expect(screen.getByText("1.55.6")).toBeInTheDocument();
  expect(screen.getByText("MPL-2.0")).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "react" })).toBeInTheDocument();
});

test("reveals the license text only after expanding the package", async () => {
  const user = userEvent.setup();
  render(<LicensesContent />);

  await screen.findByRole("link", { name: "mediabunny" });
  const text = screen.getByText("Mozilla Public License Version 2.0");
  expect(text).not.toBeVisible();

  await user.click(screen.getByText("MPL-2.0"));

  expect(text).toBeVisible();
});

test("renders packages without a license file as plain rows", async () => {
  render(<LicensesContent />);

  await screen.findByRole("link", { name: "react" });

  expect(screen.getAllByRole("group")).toHaveLength(1);
});
