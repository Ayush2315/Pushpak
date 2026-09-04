# PUSHPAK: Jury Preparation & Defense FAQ

This document prepares the team to handle difficult and technical jury questions during the Smart India Hackathon evaluation.

---

## 1. Questions Every Team Member Must Know

### Q1: "Are you scraping airline websites live right now? Isn't that illegal?"
- **Answer**: "No, sir/ma'am. We follow strict ethical data acquisition. In production, a government platform operates through authorized API feeds (e.g. GDS systems or official airline bilateral agreements). For our prototype, we designed a pluggable connector architecture that talks to permitted developer sandbox APIs, paired with a deterministic simulation engine. We never bypass CAPTCHAs, bot protections, or access controls."

### Q2: "Can you calculate your price index using the provided flightsdata.pdf file?"
- **Answer**: "No. We analyzed `flightsdata.pdf` and found that while it contains 47,000 domestic flight records, the numerical column represents flight duration, not ticket price. Therefore, we use it for what it is genuinely valuable for: building the master domestic Route & Flight Registry. Price observations are collected through our dedicated fare ingestion pipeline with full provenance."

### Q3: "Is your data live or fake?"
- **Answer**: "We are 100% honest: our prototype displays **deterministic demo simulation data** and **sandbox connector data**, which is visibly badged on every screen. We do not pretend simulated data is live. In our database, every observation has an explicit `data_mode` and `environment` tag so evaluators and officials can audit exactly where every rupee figure originated."

---

## 2. Technical & Architecture Questions (Technical Lead)

### Q4: "Why SQLite instead of PostgreSQL or MongoDB?"
- **Answer**: "For this prototype, zero external dependencies and guaranteed portability are vital. SQLite requires zero daemon configuration, lives in a single auditable file (`pushpak.db`), and by enabling **WAL (Write-Ahead Logging)** mode, we achieve non-blocking concurrent reads while our ingestion pipeline writes. In production, the schema is 100% ANSI SQL-compliant and can migrate to PostgreSQL with zero schema changes."

### Q5: "How does Pydantic v2 protect your pipeline?"
- **Answer**: "Dirty data is the biggest risk in automated airfare ingestion. Our `FareObservation` schema strictly rejects corrupt inputs: it validates 3-letter IATA airport codes, checks that route strings follow `ORIGIN-DEST`, enforces that total fare is never less than base fare plus taxes, and validates that advance booking windows are properly classified."

### Q6: "How do you ensure data integrity and detect tampering?"
- **Answer**: "Every raw ingestion payload is hashed using SHA-256 (`source_hash`). Stored records retain this cryptographic fingerprint, allowing auditing against upstream sources."

---

## 3. Methodology & Policy Questions (Data / Policy Lead)

### Q7: "Why use the Jevons Geometric Mean rather than a simple average?"
- **Answer**: "The IMF, ILO, and international statistical agencies explicitly reject simple arithmetic averages (the Carli index) for price indices because they exhibit an upward price bias when prices bounce. The Jevons Geometric Mean formula treats price increases and decreases symmetrically, satisfies the time-reversal test, and handles dynamic airline price volatility accurately."

### Q8: "How does this benefit the Ministry of Statistics (MoSPI) and CPI?"
- **Answer**: "Airfare is a component of the CPI Transport & Communication subgroup. Currently, official collection is periodic and often limited to fixed advance dates. PUSHPAK captures high-frequency pricing across five booking horizons ($T+1$ to $T+45$). Our Policy Sandbox enables MoSPI economists to test sensitivity scenarios—such as how a 15% festival airfare surge impacts the headline CPI."

---

## 4. Honest Prototype Limitations & Future Work

### Q9: "What are the limitations of what you have built today?"
- **Answer**: "We are transparent about our current scope:
  1. **Route Coverage**: We focused our prototype pipeline on India's top 3 trunk routes: `DEL-BOM`, `DEL-BLR`, and `BOM-BLR`.
  2. **Advance Windows**: We sample 5 representative booking windows ($T+1, T+7, T+15, T+30, T+45$) rather than all 365 calendar days.
  3. **Schedule Updates**: Flight schedules currently represent a static baseline rather than live ATC radar feeds.
  The architecture is modular, and expanding to all 100+ Indian routes requires simply updating the route configuration."

---

## 5. Speaker Role Assignment

| Topic Category | Primary Speaker | Backup Speaker |
| :--- | :--- | :--- |
| **Intro & Problem Vision** | Team Leader | All |
| **Ethics & Legal Ingestion** | Tech Lead | Team Leader |
| **Database, WAL & Schemas** | Tech Lead | Backend Developer |
| **Index Math (Jevons) & CPI** | Data / Policy Lead | Team Leader |
| **Demo Navigation & UI** | Frontend Presenter | Tech Lead |
| **Limitations & Roadmap** | All | Tech Lead |
