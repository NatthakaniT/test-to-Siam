-- =====================================================================
-- ระบบขายสินค้าและคำสั่งซื้อ: Database script (PostgreSQL)
--
-- โครงสร้างเดียวกับ Laravel migrations ใน backend/database/migrations/
-- (บน production ตารางถูกสร้างด้วย `php artisan migrate` ตอน deploy)
-- ไฟล์นี้มีไว้ให้อ่านหรือรันเองได้ใน PostgreSQL / Supabase SQL Editor
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1) products: ทะเบียนสินค้า (ราคาในตารางนี้คือ "ราคาปัจจุบัน")
-- ---------------------------------------------------------------------
CREATE TABLE products (
    id          BIGSERIAL       PRIMARY KEY,
    name        VARCHAR(255)    NOT NULL,
    price       DECIMAL(10, 2)  NOT NULL,          -- ใช้ DECIMAL ไม่ใช้ FLOAT เพื่อให้เงินไม่เพี้ยน
    deleted_at  TIMESTAMP(0)    NULL,              -- soft delete: ลบแล้วแถวยังอยู่ คำสั่งซื้อเก่ายังอ้างถึงได้
    created_at  TIMESTAMP(0)    NULL,
    updated_at  TIMESTAMP(0)    NULL
);

-- ---------------------------------------------------------------------
-- 2) orders: หัวคำสั่งซื้อ (ไม่เก็บยอดรวม คำนวณจาก order_items)
-- ---------------------------------------------------------------------
CREATE TABLE orders (
    id             BIGSERIAL     PRIMARY KEY,
    customer_name  VARCHAR(255)  NOT NULL,
    status         VARCHAR(255)  NOT NULL DEFAULT 'confirmed',  -- confirmed | cancelled
    created_at     TIMESTAMP(0)  NULL,
    updated_at     TIMESTAMP(0)  NULL
);

-- ---------------------------------------------------------------------
-- 3) order_items: รายการสินค้าในคำสั่งซื้อ
--    product_name และ unit_price คือค่าที่ "snapshot" ไว้ตอนสั่งซื้อ
--    จึงไม่เปลี่ยนตาม เมื่อราคาใน products ถูกแก้ภายหลัง
-- ---------------------------------------------------------------------
CREATE TABLE order_items (
    id            BIGSERIAL       PRIMARY KEY,
    order_id      BIGINT          NOT NULL REFERENCES orders (id) ON DELETE CASCADE,
    product_id    BIGINT          NOT NULL REFERENCES products (id),
    product_name  VARCHAR(255)    NOT NULL,        -- snapshot ชื่อสินค้า
    unit_price    DECIMAL(10, 2)  NOT NULL,        -- snapshot ราคาต่อหน่วย
    quantity      INTEGER         NOT NULL,
    created_at    TIMESTAMP(0)    NULL,
    updated_at    TIMESTAMP(0)    NULL
);

-- =====================================================================
-- ข้อมูลตัวอย่าง (เหมือน backend/database/seeders/DatabaseSeeder.php)
-- =====================================================================
INSERT INTO products (name, price, created_at, updated_at) VALUES
    ('ปากกาลูกลื่น', 10.00, NOW(), NOW()),
    ('สมุดโน้ต A5',  25.00, NOW(), NOW()),
    ('ดินสอ 2B',      8.00, NOW(), NOW()),
    ('ยางลบ',         5.00, NOW(), NOW()),
    ('แฟ้มเอกสาร',   35.00, NOW(), NOW());

-- =====================================================================
-- ตัวอย่าง query: พิสูจน์ว่าราคาในคำสั่งซื้อเดิมคงเดิม
-- =====================================================================

-- ยอดรวมของแต่ละคำสั่งซื้อ คิดจากราคาที่ snapshot ไว้เท่านั้น
-- SELECT o.id, o.customer_name, o.status,
--        SUM(oi.quantity * oi.unit_price) AS total
-- FROM orders o
-- JOIN order_items oi ON oi.order_id = o.id
-- GROUP BY o.id, o.customer_name, o.status
-- ORDER BY o.id;

-- เทียบราคาตอนสั่ง (unit_price) กับราคาปัจจุบัน (products.price)
-- SELECT oi.order_id, oi.product_name,
--        oi.unit_price AS price_at_order,
--        p.price       AS price_now
-- FROM order_items oi
-- JOIN products p ON p.id = oi.product_id
-- ORDER BY oi.order_id, oi.id;
