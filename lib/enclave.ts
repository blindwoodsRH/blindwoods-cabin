// The enclave, from the page's side. Before anything is sent, the client library checks the enclave's attestation in
// this browser: the published release, its signature and transparency-log entry, the hardware report, the
// measurements, and that the encryption key is bound inside that report. Every request body is then encrypted to that
// key, so the gate in between only passes ciphertext along. The bundle comes through this app's own origin.

import type { SecureClient } from "tinfoil";

let ready: Promise<SecureClient> | null = null;

export function enclave(): Promise<SecureClient> {
  if (ready) return ready;
  ready = (async () => {
    const { SecureClient } = await import("tinfoil");
    const client = new SecureClient({ baseURL: `${location.origin}/v1/`, attestationBundleURL: location.origin });
    await client.ready();
    // A failed or missing check is a failure, never a warning: nothing is sent.
    if (!client.getVerificationDocument().securityVerified) throw new Error("The enclave did not pass every check.");
    return client;
  })();
  ready.catch(() => {
    ready = null;
  });
  return ready;
}
