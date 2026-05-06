// Backward-compat bridge for setups/tools still resolving this filename.
// Canonical client instrumentation now lives in instrumentation-client.ts.
export { onRouterTransitionStart } from "./instrumentation-client"
import "./instrumentation-client"
