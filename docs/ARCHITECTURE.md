# Architecture & Domain Design

## 1. Domain Modeling & Entities

The platform manages the end-to-end dealership expansion lifecycle for automotive showroom launches across Kerala.

```
+---------------+        1:N        +-----------------+
|     Brand     | ----------------> |     Project     |
+---------------+                   +-----------------+
        |                                    | 1:N
        |                                    v
+---------------+        1:N        +-----------------+
|   Location    | ----------------> |    Milestone    |
+---------------+                   +-----------------+
                                             | 1:N
                                             v
                                    +-----------------+
                                    |     Blocker     |
                                    +-----------------+
```

### Core Entities:
- **`Brand`**: Automotive brand (River EV, Nippon Toyota) with corporate branding attributes.
- **`Location`**: Geographic showroom site in Kerala (Pala, Aluva, Muvattupuzha, Thripunithura, Alappuzha, Kayamkulam, Cherthala, Nedumangad, Pattom).
- **`Project`**: The expansion track characterized by:
  - Facility Type (`Sales`, `Service`, `Stock Yard`, `Sales & Service`)
  - Current Status (`Commissioned`, `Ready for Handover`, `BOQ Approved / PO Pending`, `Pre-Construction`, `Commercial Negotiation`)
  - Schedule Health (`Completed`, `On Track`, `Watchlist`, `Delayed (>30d)`, `Action Needed`)
  - Timeline metrics: `elapsedDays`, `daysToTarget` (vs fixed target `2027-03-31`), `workPercentage`
- **`Milestone`**: 21 sequential checkpoints spanning 4 phases.
- **`Blocker`**: Bottleneck tracker categorized by Landlord, River OEM, Municipal/Legal, Civil Contractor, or Internal Management.
- **`AuditLog`**: Immutable activity trail recording timestamp, user role, and details of all changes.

---

## 2. The 4-Phase Dealership Lifecycle

Every showroom follows 21 lifecycle milestones:

### Phase 1: Property Identification & Agreement
1. `property_identified`: Site identified and geotagged.
2. `details_shared`: Property dossier sent to River OEM.
3. `viewed_by_river`: Physical site survey by River technical team.
4. `approved_by_river`: Formal site clearance from River.
5. `approved_by_mgmt`: Management commercial approval.
6. `agreement_signed`: Lease agreement executed with landlord.

### Phase 2: Design & GFC (Good for Construction)
7. `drawing_prepared`: Architectural drawings drafted.
8. `drawing_shared`: Drawings submitted to River OEM.
9. `base_layout`: River issues standardized dealership base layout.
10. `consent_gfc`: Discussion and mutual consent on site adjustments.
11. `gfc_approved`: River issues formal Good For Construction (GFC) signoff.

### Phase 3: BOQ & Procurement
12. `boq_prepared`: Bill of Quantities estimated.
13. `boq_submitted`: BOQ submitted for sanction.
14. `boq_approved`: Executive management approval of BOQ.
15. `po_released`: Purchase Orders and Work Orders issued to contractors.
16. `advance_released`: Mobilization advance released to contractor.

### Phase 4: Civil Execution, Handover & Launch
17. `work_started`: On-site civil / interior fitout commencement.
18. `documentation_done`: Statutory registrations & compliance completed.
19. `tc_received`: Trade Certificate (TC) received from RTO/authorities.
20. `facility_handover`: Fitout completion and key handover.
21. `operations_commenced`: Commercial dealership operations inaugurated.

---

## 3. SLA Benchmarks Engine

Historical project tracking establishes empirical benchmark durations per phase:
* **Property Approval**: Avg 12.4 days (Min 0d, Max 53d)
* **Agreement Signing**: Avg 62.1 days (Min 0d, Max 422d)
* **Design & GFC Approval**: Avg 49.0 days (Min 3d, Max 228d)
* **BOQ & PO Release**: Avg 121.8 days (Min 7d, Max 428d)
* **Site Execution**: Avg 175.7 days (Min 102d, Max 310d)
