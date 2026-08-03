# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

The primary users are internal BPDDIY developers, QA engineers, and integration teams. They use Fleetime Labs while preparing and validating integrations, especially before connecting billing flows to production systems.

## Product Purpose

Fleetime Labs is an internal web workspace for several technical testing modules. It helps teams configure simulated billing behavior, exercise network protocols, inspect runtime behavior, and use common developer utilities without depending on production systems for routine development and QA work.

Success means a team can model, run, inspect, and refine an integration scenario in a controlled environment before production connectivity is required.

## Positioning

Fleetime Labs is an umbrella workspace, not a single-purpose API mocker. Its modules have distinct purposes:

- **Biller Simulator** models billers, endpoints, response templates, and billing interactions.
- **Socket Test** exercises TCP client, TCP server, and UDP workflows.
- **SOCKS Relay** supports authorized inspection of REST API and ISO 8583 relay activity.
- **Developer Tools** provides focused conversion, validation, parsing, and inspection utilities.

Internal integration teams can move between these related but separate jobs in one authenticated interface.

## Operating Context

Fleetime Labs is an authenticated frontend connected to a separate Biller Simulator backend. Users work from a dashboard with `ADMIN` or `USER` permissions. Some operational controls, including SOCKS Relay, are restricted to administrators.

The application supports local Bun development, containerized deployment, the BPDDIY office Harbor environment, and Vercel. Backend connectivity is required for simulator data and authenticated workflows.

Within the Biller Simulator domain, a **Biller** is a billing service represented in the simulator. A biller owns zero or more **Endpoints**. An **Endpoint** is a simulated API operation belonging to exactly one biller; use "endpoint," not "route," as the domain term.

## Capabilities and Constraints

- Configure and organize simulated billing endpoints by biller.
- Create and manage response templates and active response behavior.
- Inspect endpoint status, metrics, recent activity, and traffic logs.
- Export endpoint configurations for integration workflows.
- Test TCP client, TCP server, and UDP behavior.
- Inspect authorized SOCKS relay activity for REST API and ISO 8583 traffic.
- Use developer utilities for JSON/YAML conversion, JSON Schema validation, JWT inspection, cron parsing, number-base conversion, date conversion, and related integration tasks.
- Inspect NFC reader data through the local NFC bridge tooling.
- Preserve role-based access and the distinction between `ADMIN` and `USER` capabilities.
- Treat each module as a distinct tool within Fleetime Labs rather than presenting every capability as part of the Biller Simulator module.

## Brand Commitments

**Fleetime Labs** is the canonical product name. **Biller Simulator** is the name of the billing-simulation module inside Fleetime Labs. Future product copy and navigation should standardize on this hierarchy and should not use BPDDIY DevTools or Biller Simulator as the name of the whole product.

Existing Fleetime Labs logo and wordmark assets live under `public/`, including light and dark variants.

## Evidence on Hand

- A runnable React application implements the authenticated dashboard and product modules.
- The repository includes working feature flows, automated tests, domain terminology in `CONTEXT.md`, deployment documentation in `DEPLOYMENT.md`, and Fleetime Labs logo assets under `public/`.
- The application includes interactive endpoint management, analytics, protocol tools, relay inspection, and developer utilities that can be demonstrated directly.
- No approved testimonials, customer claims, performance benchmarks, press coverage, or public product claims have been established. Future work must not fabricate them.

## Product Principles

1. Use one Fleetime Labs identity while preserving the distinct purpose of each module.
2. Help internal teams validate integrations safely before production connectivity is required.
3. Make technical behavior inspectable: configuration, state, responses, traffic, and permissions should remain clear.
4. Preserve precise domain language, especially the Biller and Endpoint relationship.
5. Respect operational boundaries through authentication and role-based access.
