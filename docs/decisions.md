# Architectural Decisions (ADR) - AETHER-CIVIC

## 1. Client-Side Event-Driven Multi-Agent Orchestrator
- **Decision:** Execute Triage, Dependency Planning, Visual Auditing, and SLA Watchdog loops directly within a deterministic TypeScript orchestrator synced with Supabase.
- **Why:** Eliminates third-party webhook bottlenecks and guarantees zero-latency execution during live municipal emergency triage.

## 2. OpenStreetMap + Leaflet Spatial Engine
- **Decision:** Use keyless OpenStreetMap tiles with 200m Haversine spatial clustering.
- **Why:** Prevents API billing lockouts while grouping duplicate citizen reports in high-density zones like Sector 14 Sonipat and NH-44 Murthal.

## 3. Supabase PostgreSQL & Role-Based Authentication
- **Decision:** Utilize Supabase Auth and real-time tables (`incidents`, `agent_logs`).
- **Why:** Provides production-grade role separation for Citizens, Field Engineers, and Zonal Commissioners.
