import { vi } from "vitest";

vi.mock("./src/utils/createKey", async () => {
  return { default: vi.fn().mockReturnValue("test-key") };
});
