# aether-civic-command-center
Autonomous Smart City Incident &amp; Proof-of-Resolution Command Center (HackO'Ween Hackathon)
# AETHER-CIVIC: Autonomous Smart City Incident & Proof-of-Resolution Command Center

🌐 **Live Demo:** [https://aether-civic.ai.studio/](https://aether-civic.ai.studio/)

## 1. What Problem Does It Solve and For Whom?
Municipal grievance systems in growing NCR hubs like **Sonipat (Sector 14, NH-44 Murthal, Atlas Road)** suffer from duplicate citizen complaints, uncoordinated department dispatches, and fake contractor repair claims. **AETHER-CIVIC** solves this for:
- **Citizens:** Easy hazard reporting with bilingual accessibility (`🇮🇳 हिंदी / English`) and live status tracking.
- **Municipal Field Engineers:** Automated deduplication and dependency-ordered work queues.
- **Zonal Commissioners:** AI-audited proof-of-work verification before releasing public escrow funds.

## 2. Main Features & Architecture
- **Live Leaflet GIS Map & 200m Spatial Clustering:** Automatically merges duplicate reports within a 200m radius into a single master ticket.
- **4-Agent Autonomous Engine:**
  1. *Triage & Deduplication Agent:* Groups overlapping complaints.
  2. *Dependency Planner Agent:* Sequences multi-department tasks.
  3. *Multimodal Visual Auditor:* Cross-checks "Before/After" repair photos and GPS metadata to block fake or AI-generated repair claims.
  4. *SLA Watchdog Agent:* Automatically reopens breached tickets and penalizes contractor trust ratings.
- **Supabase Backend & RBAC:** Real-time PostgreSQL tables (`incidents`, `agent_logs`) and role-based authentication.

## 3. How to Run Locally
1. Clone the repository:
   ```bash
   git clone <your-repository-url>
   cd aether-civic
