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

### Q7: "Why choose FastAPI over Flask or Django for this platform?"
- **Answer**: "FastAPI provides native asynchronous ASGI performance, strict type enforcement via Pydantic v2, and automatic generation of standards-compliant OpenAPI/Swagger documentation (`/docs` and `/redoc`). In a government data pipeline with high-concurrency read queries from dashboards and external statistical systems, FastAPI is both high-throughput and self-documenting."

### Q8: "How does your API ensure external consumers do not mistake your prototype data for real-time ATC flight schedules?"
- **Answer**: "Through strict API schema design. Every registry endpoint labels flight frequencies as `observed_flight_records` and injects explicit `metric_note` fields stating that counts reflect dataset observations, not daily schedules. Departure times are preserved as categorical bands (`Morning`, `Evening`) rather than fabricated exact timestamps. Furthermore, all fare endpoints return `data_mode` (`demo_simulation`) and `environment` (`offline`) badges."

---

## 3. Methodology & Policy Questions (Data / Policy Lead)

### Q9: "Why use the Jevons Geometric Mean rather than a simple average?"
- **Answer**: "The IMF, ILO, and international statistical agencies explicitly reject simple arithmetic averages (the Carli index) for price indices because they exhibit an upward price bias when prices bounce. The Jevons Geometric Mean formula treats price increases and decreases symmetrically, satisfies the time-reversal test, and handles dynamic airline price volatility accurately."

### Q10: "How does this benefit the Ministry of Statistics (MoSPI) and CPI?"
- **Answer**: "Airfare is a component of the CPI Transport & Communication subgroup. Currently, official collection is periodic and often limited to fixed advance dates. PUSHPAK captures high-frequency pricing across five booking horizons ($T+1$ to $T+45$). Our Policy Sandbox enables MoSPI economists to test sensitivity scenarios—such as how a 15% festival airfare surge impacts the headline CPI."

### Q11: "Why did PUSHPAK not use Machine Learning / LLMs for route insights and classifications?"
- **Answer**: "In official government statistics and economic policy, transparency, 100% reproducibility, and auditability are non-negotiable. Black-box neural networks and probabilistic LLMs can hallucinate numbers or provide non-reproducible summaries. PUSHPAK uses deterministic, rule-based mathematical logic: Coefficient of Variation ($CV$) for volatility classification and rule trees for textual insights. Every single metric can be audited against raw database records."

### Q12: "How does this architecture scale when transitioning from prototype to live government data feeds?"
- **Answer**: "The intelligence layer is decoupled from the ingestion layer. When transitioning from prototype simulation to live MoCA/DGCA GDS feeds or bilateral airline APIs, zero changes are required in `fare_analytics.py` or the REST API. The analytics engine queries the normalized ANSI SQL `fare_observations` table regardless of whether the rows were populated by sandbox connectors, live feeds, or official statistical surveys."

### Q13: "Is PUSHPAK an official CPI?"
- **Answer**: "No. PUSHPAK produces a prototype analytical index. It is engineered to demonstrate high-frequency methodology and transparently augment the CPI Transport subgroup, but it is not an official MoSPI statutory release. All API responses explicitly carry disclaimers stating that weights and observations are analytical prototypes."

### Q14: "How is the PUSHPAK Index calculated?"
- **Answer**: "We establish a base value of 100.00 at the T+45 advance purchase baseline. For each corridor, we compute the price relative $R_i = \text{Current Fare} / \text{Base Fare}$. We then compute a weighted composite index $I = \sum w_i R_i \times 100$, where weights $w_i$ reflect corridor traffic volume from our 50,000-record flight registry and sum strictly to 1.0000. PUSHPAK Headline covers all horizons ($T+1$ to $T+45$), while PUSHPAK Core excludes short-term walk-up volatility ($T+1, T+7$) to measure underlying capacity costs."

### Q15: "Why is the index transparent?"
- **Answer**: "There are zero black-box formulas, zero neural networks, and zero hidden adjustments. Every route contribution, weight, baseline fare, and current average is exposed directly via the `/api/v1/index/methodology` and `/api/v1/index/summary` APIs. Any economist or judge can inspect raw database records and reproduce our exact index numbers with basic arithmetic."

### Q16: "How would this integrate with MoSPI methodology in production?"
- **Answer**: "In production, MoSPI economists can replace our prototype volume weights with official Household Consumer Expenditure Survey (HCES) item weights. High-frequency automated scrapers or GDS feeds feed into our existing normalized schema, and our Core Index feeds directly into MoSPI's monthly CPI aggregation engine as an empirical transport price indicator."

---

## 4. Honest Prototype Limitations & Future Work

### Q17: "What are the limitations of what you have built today?"
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
