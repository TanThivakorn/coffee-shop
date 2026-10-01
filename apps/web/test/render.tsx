import { render } from "@testing-library/react";
import type { ReactElement } from "react";
import { QueryProvider } from "@/components/query-provider";

// Each render gets a fresh client; the provider disables automatic query retries.
export function renderWithQuery(ui: ReactElement) {
  return render(ui, { wrapper: QueryProvider });
}
