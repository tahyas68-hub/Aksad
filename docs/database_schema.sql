-- ==============================================================================
-- DATABASE SCHEMA: Installment Sales Management System
-- DIALECT: PostgreSQL
-- ==============================================================================

-- 1. EXTENSIONS & FUNCTIONS
-- ==============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = CURRENT_TIMESTAMP;
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. ENUMS
-- ==============================================================================
CREATE TYPE user_role AS ENUM ('merchant', 'customer', 'admin');
CREATE TYPE customer_status AS ENUM ('active', 'inactive', 'blacklisted');
CREATE TYPE contract_status AS ENUM ('active', 'completed', 'archived', 'cancelled', 'defaulted');
CREATE TYPE installment_type AS ENUM ('daily', 'weekly', 'monthly');
CREATE TYPE installment_status AS ENUM ('pending', 'paid', 'late', 'partially_paid');
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
CREATE TYPE notification_type AS ENUM ('upcoming_payment', 'overdue_payment', 'payment_received', 'contract_completed', 'system');
CREATE TYPE import_export_status AS ENUM ('pending', 'processing', 'completed', 'failed');
CREATE TYPE product_status AS ENUM ('available', 'out_of_stock', 'discontinued');

-- 3. TABLES
-- ==============================================================================

-- USERS TABLE
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'merchant',
    profile_image TEXT,
    language VARCHAR(10) DEFAULT 'ar',
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- MERCHANTS TABLE
CREATE TABLE merchants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    business_name VARCHAR(255) NOT NULL,
    business_address TEXT,
    tax_number VARCHAR(100),
    currency VARCHAR(10) DEFAULT 'IQD',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id)
);

-- CUSTOMERS TABLE
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(50) NOT NULL,
    address TEXT,
    national_id VARCHAR(100),
    customer_status customer_status DEFAULT 'active',
    credit_score INTEGER DEFAULT 100 CHECK (credit_score >= 0 AND credit_score <= 1000),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (merchant_id, phone_number) -- A merchant shouldn't have duplicate phone numbers
);

-- PRODUCT CATEGORIES TABLE
CREATE TABLE product_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    category_name VARCHAR(150) NOT NULL,
    category_image TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (merchant_id, category_name)
);

-- PRODUCTS TABLE
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    category_id UUID REFERENCES product_categories(id) ON DELETE SET NULL,
    product_name VARCHAR(255) NOT NULL,
    description TEXT,
    product_image TEXT,
    barcode VARCHAR(100),
    purchase_price DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    selling_price DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    stock_quantity INTEGER NOT NULL DEFAULT 0,
    minimum_stock_alert INTEGER DEFAULT 5,
    availability_status product_status DEFAULT 'available',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CHECK (purchase_price >= 0),
    CHECK (selling_price >= 0),
    CHECK (stock_quantity >= 0)
);

-- INSTALLMENT CONTRACTS TABLE
CREATE TABLE installment_contracts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    product_id UUID REFERENCES products(id) ON DELETE RESTRICT,
    contract_number VARCHAR(100) NOT NULL,
    contract_status contract_status DEFAULT 'active',
    installment_type installment_type NOT NULL,
    total_amount DECIMAL(15, 2) NOT NULL CHECK (total_amount > 0),
    down_payment DECIMAL(15, 2) DEFAULT 0 CHECK (down_payment >= 0),
    remaining_balance DECIMAL(15, 2) NOT NULL CHECK (remaining_balance >= 0),
    installment_count INTEGER NOT NULL CHECK (installment_count > 0),
    installment_amount DECIMAL(15, 2) NOT NULL CHECK (installment_amount > 0),
    late_fee DECIMAL(15, 2) DEFAULT 0 CHECK (late_fee >= 0),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    archived_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (merchant_id, contract_number)
);

-- INSTALLMENTS TABLE
CREATE TABLE installments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contract_id UUID NOT NULL REFERENCES installment_contracts(id) ON DELETE CASCADE,
    installment_number INTEGER NOT NULL CHECK (installment_number > 0),
    due_date DATE NOT NULL,
    installment_amount DECIMAL(15, 2) NOT NULL CHECK (installment_amount > 0),
    paid_amount DECIMAL(15, 2) DEFAULT 0 CHECK (paid_amount >= 0),
    remaining_amount DECIMAL(15, 2) NOT NULL CHECK (remaining_amount >= 0),
    installment_status installment_status DEFAULT 'pending',
    paid_at TIMESTAMP WITH TIME ZONE,
    days_late INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (contract_id, installment_number)
);

-- PAYMENTS TABLE
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    installment_id UUID REFERENCES installments(id) ON DELETE SET NULL,
    contract_id UUID NOT NULL REFERENCES installment_contracts(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    payment_reference VARCHAR(100),
    payment_method VARCHAR(50) DEFAULT 'cash',
    payment_amount DECIMAL(15, 2) NOT NULL CHECK (payment_amount > 0),
    payment_status payment_status DEFAULT 'completed',
    payment_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    receipt_number VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- NOTIFICATIONS TABLE
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    notification_type notification_type NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    related_contract_id UUID REFERENCES installment_contracts(id) ON DELETE CASCADE,
    related_installment_id UUID REFERENCES installments(id) ON DELETE CASCADE,
    is_read BOOLEAN DEFAULT false,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- EXCEL IMPORT LOGS TABLE
CREATE TABLE excel_import_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    import_type VARCHAR(50) NOT NULL, -- e.g., 'customers', 'products', 'payments'
    file_name VARCHAR(255) NOT NULL,
    total_rows INTEGER DEFAULT 0,
    successful_rows INTEGER DEFAULT 0,
    failed_rows INTEGER DEFAULT 0,
    import_status import_export_status DEFAULT 'pending',
    imported_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- EXCEL EXPORT LOGS TABLE
CREATE TABLE excel_export_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    export_type VARCHAR(50) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    export_status import_export_status DEFAULT 'pending',
    exported_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- AUDIT LOGS TABLE
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
    action_type VARCHAR(100) NOT NULL, -- e.g., 'CREATE', 'UPDATE', 'DELETE'
    entity_name VARCHAR(100) NOT NULL, -- e.g., 'contract', 'payment'
    entity_id UUID NOT NULL,
    action_description TEXT,
    ip_address INET,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- SETTINGS TABLE
CREATE TABLE settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    default_installment_type installment_type DEFAULT 'monthly',
    default_currency VARCHAR(10) DEFAULT 'IQD',
    dark_mode_enabled BOOLEAN DEFAULT false,
    notification_enabled BOOLEAN DEFAULT true,
    language VARCHAR(10) DEFAULT 'ar',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (merchant_id)
);

-- 4. TRIGGERS (UPDATED_AT)
-- ==============================================================================

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE PROCEDURE update_timestamp();
CREATE TRIGGER update_merchants_updated_at BEFORE UPDATE ON merchants FOR EACH ROW EXECUTE PROCEDURE update_timestamp();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE PROCEDURE update_timestamp();
CREATE TRIGGER update_product_categories_updated_at BEFORE UPDATE ON product_categories FOR EACH ROW EXECUTE PROCEDURE update_timestamp();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE PROCEDURE update_timestamp();
CREATE TRIGGER update_contracts_updated_at BEFORE UPDATE ON installment_contracts FOR EACH ROW EXECUTE PROCEDURE update_timestamp();
CREATE TRIGGER update_installments_updated_at BEFORE UPDATE ON installments FOR EACH ROW EXECUTE PROCEDURE update_timestamp();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE PROCEDURE update_timestamp();
CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON notifications FOR EACH ROW EXECUTE PROCEDURE update_timestamp();
CREATE TRIGGER update_import_logs_updated_at BEFORE UPDATE ON excel_import_logs FOR EACH ROW EXECUTE PROCEDURE update_timestamp();
CREATE TRIGGER update_export_logs_updated_at BEFORE UPDATE ON excel_export_logs FOR EACH ROW EXECUTE PROCEDURE update_timestamp();
CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

-- 5. INDEXES (PERFORMANCE OPTIMIZATION)
-- ==============================================================================

-- Customer queries (Search, lookup)
CREATE INDEX idx_customers_merchant ON customers(merchant_id);
CREATE INDEX idx_customers_phone ON customers(phone_number);
CREATE INDEX idx_customers_status ON customers(customer_status);

-- Products & Inventory
CREATE INDEX idx_products_merchant_category ON products(merchant_id, category_id);
CREATE INDEX idx_products_barcode ON products(barcode);
CREATE INDEX idx_products_status ON products(availability_status);

-- Contracts (heavy reads and filtering)
CREATE INDEX idx_contracts_merchant ON installment_contracts(merchant_id);
CREATE INDEX idx_contracts_customer ON installment_contracts(customer_id);
CREATE INDEX idx_contracts_status ON installment_contracts(contract_status) WHERE archived_at IS NULL;
CREATE INDEX idx_contracts_archived ON installment_contracts(contract_status) WHERE archived_at IS NOT NULL;

-- Installments (Crucial for due dates, late checks)
CREATE INDEX idx_installments_contract ON installments(contract_id);
CREATE INDEX idx_installments_status ON installments(installment_status);
CREATE INDEX idx_installments_due_date ON installments(due_date);
CREATE INDEX idx_installments_status_date ON installments(installment_status, due_date);

-- Payments (Reporting & analytics)
CREATE INDEX idx_payments_merchant_date ON payments(merchant_id, payment_date);
CREATE INDEX idx_payments_contract ON payments(contract_id);
CREATE INDEX idx_payments_customer ON payments(customer_id);

-- Notifications
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read) WHERE is_read = false;

-- Audit Logs (Partitioning recommended in massive scale)
CREATE INDEX idx_audit_logs_user_date ON audit_logs(user_id, created_at);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_name, entity_id);
