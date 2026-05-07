import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { SorokitProvider } from "@/context/SorokitProvider";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { initClient } from "@/lib/client";
import { createMockClient } from "@/lib/mock-client";

/**
 * Initialize sorokit-core client.
 *
 * When sorokit-core is published, replace createMockClient() with:
 *   import { createSorokitClient } from "sorokit-core"
 *   const client = createSorokitClient()
 */
const client = createMockClient();
initClient(client);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <SorokitProvider client={client}>
        <App />
      </SorokitProvider>
    </ErrorBoundary>
  </StrictMode>,
);
