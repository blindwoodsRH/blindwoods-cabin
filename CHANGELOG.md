# Changelog

All notable changes to `blindwoods-cabin` are recorded here. Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), versioning: [SemVer](https://semver.org/).

## [Unreleased]

## [0.1.0] - 2026-10-26

### Added
- Next.js 16.4.3 app shell with five tabs: Chat, Tickets, Verify, Meter, Settings.
- Chat screen: ticket count, verified mark, ticket-paid sealed asking, streaming answers, refunds for unspent tickets.
- IndexedDB ticket store with no wallet field.
- Enclave client that refuses to send unless every attestation check passes.
- Same-origin Content-Security-Policy and security headers, including `no-transform` against edge-injected scripts.
