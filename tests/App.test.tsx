import { test } from "vitest";
import { App } from "@/App";
import { customRender } from "./util";

test("should render App component", () => {
  customRender(<App />);
});
