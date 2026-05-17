# Installment Sales Management System - Database Architecture

## 1. Introduction
This document outlines the database design for a scalable, high-performance **Installment Sales Management System**. Built for PostgreSQL, it leverages UUIDs, standardized enums, and comprehensive constraints to ensure data integrity and security.

The full SQL script for implementation is available in `docs/database_schema.sql`.

## 2. Entity Relationship Overview (Architecture)

The system is fundamentally organized around **Merchants**, acting as a multi-tenant anchor.

*   `users` 1:1 `merchants`
*   `merchants` 1:N `customers`
*   `merchants` 1:N `products`
*   `customers` 1:N `installment_contracts`
*   `products` 1:N `installment_contracts`
*   `installment_contracts` 1:N `installments`
*   `installment_contracts` 1:N `payments`
*   `installments` 1:N `payments`

## 3. Key Design Decisions

### Scalability & Multi-Tenancy
*   **UUID Primary Keys**: Eliminates ID collision and enables horizontal scaling and safer API exposure (no sequential ID guessing).
*   **Foreign Key Indexing**: Almost all foreign keys have associated B-Tree indexes, drastically speeding up joined queries (e.g., getting all payments for a specific merchant).
*   **Archiving Logic**: Partial Indexes (e.g., `WHERE archived_at IS NULL`) are used to optimize active contract queries. Archived contracts do not bloat the daily operation queries but remain accessible for reporting.

### Data Security & Integrity
*   **Restrictive Deletes**: `ON DELETE RESTRICT` is used between Contracts & Customers/Products. You cannot delete a customer or a product if they are tied to a historical financial contract.
*   **Cascading Deletes**: `ON DELETE CASCADE` is used carefully for cleanup (e.g., if a merchant account is deleted, their system settings, products, and categories vanish).
*   **Mathematical Constraints**: 
    - `remaining_balance >= 0`
    - `total_amount > 0`
    - `installment_amount > 0`
    - Prevent negative stock or negative balances at the database level.
*   **Triggers**: `updated_at` timestamps are automatically calculated via PL/pgSQL triggers `update_timestamp()`.

## 4. Primary and Foreign Keys & Constraints

*   **Users**: Unified auth table. `email` (Unique), `phone_number` (Unique).
*   **Merchants**: FK `user_id` is marked `UNIQUE` to maintain a 1:1 bond.
*   **Installment Contracts**: Represents the core ledger. FKs to `merchant_id`, `customer_id`, `product_id`.
*   **Installments**: Pre-generated payment schedule rows.
*   **Payments**: Immutable ledger entries reflecting actual collected cash.

## 5. Recommended Indexes (Optimizations)

To ensure realtime performance on dashboards, specific composite and conditional indexes are created:

1.  **Overdue Checks**: 
    `CREATE INDEX idx_installments_status_date ON installments(installment_status, due_date);` (Extremely fast lookups for dashboard "Late/Overdue" queries).
2.  **Financial Reporting**:
    `CREATE INDEX idx_payments_merchant_date ON payments(merchant_id, payment_date);` (Enables fast monthly/daily cashflow reports without full table scans).
3.  **Active Contracts Filter**:
    `CREATE INDEX idx_contracts_status ON installment_contracts(contract_status) WHERE archived_at IS NULL;` (Keeps working memory footprint low for daily merchants).

## 6. Backup & Operations Recommendations

For a production environment hosting financial data:

1.  **WAL Archiving (Write-Ahead-Logs)**:
    - Enable continuous archiving using tools like **pgBackRest** or **WAL-G**.
    - This allows for **Point-in-Time Recovery (PITR)**. If a merchant accidentally mass-deletes, you can restore exactly to 2:05 PM before the incident.
2.  **Daily Snapshots**:
    - Take automated daily logical backups (`pg_dump`) to an encrypted S3 bucket.
3.  **Audit Logs Table Expansion**:
    - The `audit_logs` table accumulates rapidly. Implement **Table Partitioning** by date (`PARTITION BY RANGE (created_at)`) dropping/archiving partitions older than 1 year to preserve read performance.
4.  **Connection Pooling**:
    - Implement **PgBouncer** ahead of the database. The stateless nature of the React frontend/APIs will rapidly consume connections; PgBouncer multiplexes connections efficiently.
