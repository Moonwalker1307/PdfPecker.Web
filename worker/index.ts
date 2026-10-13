// The Cloudflare Worker in front of the site. Cloudflare serves the static page (wwwroot) itself, so it loads at once
// even while the container sleeps; every other request (the API, /health) goes to the ASP.NET Core app in a container.
import { Container, getContainer } from "@cloudflare/containers";

export class PdfPeckerWeb extends Container {
  defaultPort = 8080;
  pingEndpoint = "container/health";
  // Memory is paid for while the container runs, so it sleeps when nobody has converted anything for a while.
  sleepAfter = "10m";
  // The converter never fetches anything, so documents get no way to reach the internet (or anything else) from here.
  enableInternet = false;
  envVars = {
    // Only this Worker can reach the container, and it sets X-Forwarded-For to the visitor's address below, so the
    // header is believed from any address and the rate limit applies per visitor.
    TrustedProxies: "0.0.0.0/0,::/0",
    // The instance is a small VM rather than a cgroup with a memory limit, so give the .NET heap the 2 GB the app is
    // tuned for: it sizes its conversion slots to it, and a document that needs more fails instead of the VM.
    DOTNET_GCHeapHardLimit: "0x80000000",
  };
}

interface Env {
  WEB: DurableObjectNamespace<PdfPeckerWeb>;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Replace whatever the visitor sent: the app takes the last address in X-Forwarded-For as the client.
    const headers = new Headers(request.headers);
    headers.set("X-Forwarded-For", request.headers.get("CF-Connecting-IP") ?? "");
    headers.set("X-Forwarded-Proto", "https");
    // One instance, so the in-memory rate limit sees every request.
    return getContainer(env.WEB).fetch(new Request(request, { headers }));
  },
} satisfies ExportedHandler<Env>;
