import { test } from "vitest";
import { App } from "@/app";
import { customRender } from "./util";

test("should render App component", () => {
  customRender(<App />);
});
