import { screen } from "@testing-library/react";
import { customRender } from "tests/util";
import { test, expect } from "vitest";

import { AboutContent } from "@/components/app/about-content";

test("links to the generated third-party license file", async () => {
  await customRender(<AboutContent />);

  expect(screen.getByRole("link", { name: "Third-party licenses" })).toHaveAttribute(
    "href",
    `${import.meta.env.BASE_URL}licenses.md`,
  );
});
