<div align="center">

# Blindwoods Cabin

**The app at [app.blindwoods.app](https://app.blindwoods.app): ask with blind tickets, check the enclave yourself, keep everything on your device.**

[![Next.js](https://img.shields.io/badge/Next.js-16.4.3-1E3A2F)](package.json)
[![CSP](https://img.shields.io/badge/CSP-same%20origin%20only-E8A33D?labelColor=1E3A2F)](next.config.ts)
[![Third parties](https://img.shields.io/badge/third--party%20scripts-0-F3F1EA?labelColor=1E3A2F)](next.config.ts)

</div>

---

## About

A cabin in the woods: a small place where nobody follows you in.

Blindwoods is a private AI on Robinhood Chain where paying and asking never meet. This repository is the face of it: the screens people use, and the rules the page lives by. The wallet is allowed on exactly one screen. The chat never sees it.

---

## Features

### Screens

| Screen | What it does | Wallet code |
|---|---|---|
| **Chat** | Ask with tickets. Shows the ticket count and the verified mark; the composer stays locked until the enclave passes every check | none |
| **Tickets** | Open the wallet door by signature, buy USDG packs, draw up to 200 blind tickets, move tickets to another device, see the holder allowance | yes, only here |
| **Verify** | Runs and shows the five attestation checks; download the raw result | none |
| **Meter** | Public hourly totals and contract balances, each linked to its source | none |
| **Settings** | Export or wipe the conversation history kept in this browser | none |

### Privacy by design

| Feature | Detail |
|---|---|
| **No account** | No email, no username, no avatar. There is no "you" on any screen |
| **Tickets on the device** | Stored in the browser, soonest-to-expire spent first, expired ones dropped, no wallet field |
| **Sealed asking** | Tickets in `Authorization: PrivateToken`; the question is encrypted to the attested enclave |
| **Honest cost** | The ticket count is always visible; a long conversation costs one more ticket per 2,000 tokens, never more than 8 |
| **Refunds** | If the gate spends nothing, or returns the tickets, they go back on the device |
| **Verified before sent** | A failed or missing attestation check blocks the composer; nothing is sent |
| **Locked page** | Same-origin CSP, no frames, HSTS, no referrer, and `no-transform` so a CDN edge cannot inject a script |
| **Local history** | Conversations never leave the browser |

### Look and feel

- Pine green and pale cream. Amber only for the one action on a screen.
- The ticket count is always visible; nothing hides what a message costs before it is sent.
- Every claim on a page links to the check behind it.
- Zero third-party fonts, scripts, pixels or embeds.

---

<div align="center">
<sub>Blindwoods is a community project, not affiliated with Robinhood Markets, the launchpad, any model provider or any hardware vendor. $BLIND gives access to tickets and features inside the product, nothing more, and can lose all of its value. Blind tickets cannot protect what you type, your device, or a network you do not control.</sub>
</div>
