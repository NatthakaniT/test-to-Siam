# แผนงาน: ระบบขายสินค้าและคำสั่งซื้อ

> โจทย์ทดสอบเข้าบริษัท · เวลา 3 ชั่วโมง · ต้องใช้ Next.js + PHP · ต้อง deploy

## หัวใจของโจทย์

**ราคาที่บันทึกในคำสั่งซื้อเดิมต้องคงเดิม แม้ราคาในทะเบียนสินค้าเปลี่ยน**

- ตอนสร้างคำสั่งซื้อ ให้คัดลอก `unit_price` และ `product_name` ลงใน `order_items`
- frontend ส่งมาแค่ `product_id` กับ `quantity` แล้ว **backend อ่านราคาจาก DB เอง** ห้ามเชื่อราคาที่ client ส่งมา
- กับดัก: ถ้า JOIN ไปเอาราคาจาก `products` ตอนแสดงผล จะไม่ผ่านเงื่อนไขนี้

## Stack และที่ deploy

| ส่วน | ใช้อะไร | Deploy ที่ | โฟลเดอร์ |
|---|---|---|---|
| Frontend | Next.js + Tailwind (responsive) | Vercel | `frontend/` |
| Backend | Laravel (API อย่างเดียว, `php artisan install:api`) | Render (Docker) | `backend/` |
| Database | Supabase Postgres ต่อผ่าน **Session pooler** | Supabase | — |
| Tests | PHPUnit + SQLite in-memory (`RefreshDatabase`) | รันบนเครื่อง | `backend/tests/` |

- Repo เดียว (public บน GitHub) และมี README หลักไฟล์เดียว
- ฝั่ง Next.js ใช้ `fetch` จาก Client Component ไปที่ `NEXT_PUBLIC_API_URL`
- เฉพาะ PHP เท่านั้นที่ต่อ Supabase ส่วน frontend ไม่ยุ่งกับ DB โดยตรง

### ค่าที่ต้องตั้งให้ต่อกันได้

| ตั้งที่ | ค่า | ชี้ไปที่ |
|---|---|---|
| Vercel | `NEXT_PUBLIC_API_URL` | ลิงก์ของ Render + `/api` |
| Render | `DB_*` / `DB_URL`, `APP_KEY` | Supabase |
| Render | CORS allowed origins | ลิงก์ของ Vercel, `http://localhost:3000` |
| Render | Pre-deploy command | `php artisan migrate --force` |

- Seed สินค้าตัวอย่าง 5 ชิ้น **ครั้งเดียวด้วยมือ** ไม่ต้องรันทุกครั้งที่ deploy
- `.env` ต้องอยู่ใน `.gitignore` ตั้งแต่ commit แรก และใน repo มีแค่ `.env.example`

## Database schema

| ตาราง | คอลัมน์ |
|---|---|
| `products` | id, name, price `NUMERIC(10,2)`, `deleted_at` (SoftDeletes), timestamps |
| `orders` | id, customer_name, status (`confirmed` / `cancelled`), timestamps |
| `order_items` | id, order_id (FK), product_id (FK), **product_name**, **unit_price** `NUMERIC(10,2)`, quantity |

- คอลัมน์ตัวหนา = ค่าที่ snapshot ไว้ตอนสั่งซื้อ
- ไม่เก็บยอดรวม แต่คำนวณจาก `SUM(quantity × unit_price)` ของ `order_items` ทุกครั้ง
- ห้ามใช้ `FLOAT` เก็บเงิน

## API

| Method | Path | หมายเหตุ |
|---|---|---|
| GET / POST | `/api/products` | |
| GET / PUT / DELETE | `/api/products/{id}` | DELETE = soft delete |
| GET / POST | `/api/orders` | POST รับ `customer_name`, `items[{product_id, quantity}]` |
| GET | `/api/orders/{id}` | ส่งราคาที่ snapshot ไว้ + ราคาปัจจุบัน + ยอดรวม |
| POST | `/api/orders/{id}/cancel` | |
| GET | `/api/health` | ใช้เช็กตอน deploy โครงเปล่า |

- สร้างคำสั่งซื้อทั้งใบใน **transaction เดียว** ถ้าบรรทัดไหนพัง ให้ rollback ทั้งใบ

### Validation

- ราคา ≥ 0 และจำนวนเป็นจำนวนเต็ม ≥ 1
- คำสั่งซื้อต้องมีอย่างน้อย 1 รายการ
- ห้ามมีสินค้าซ้ำในใบเดียว (ตอบ 422)
- ห้ามสั่งสินค้าที่ถูก soft delete ไปแล้ว
- ห้ามยกเลิกคำสั่งซื้อที่ยกเลิกไปแล้ว

## หน้าเว็บ (5 หน้า)

1. รายการสินค้า (มีปุ่มเพิ่ม แก้ไข ลบ)
2. ฟอร์มสินค้า (ใช้ทั้งตอนสร้างและแก้ไข)
3. สร้างคำสั่งซื้อ (เลือกสินค้าได้หลายตัว ใส่จำนวน และเลือกสินค้าซ้ำไม่ได้)
4. รายการคำสั่งซื้อ
5. รายละเอียดคำสั่งซื้อ แสดง `ปากกา × 2 @ 10 บาท (ราคาตอนนี้ 15)` และมีปุ่มยกเลิก

- ไม่มีหน้า login หรือ dashboard
- มีข้อความ "กำลังโหลด…" ขึ้นระหว่างรอ (เพราะ Render ที่หลับอยู่จะเปิดครั้งแรกช้า)

## เทสต์หลัก (ห้ามตัด)

`PriceSnapshotTest`: สร้างสินค้าราคา 100 → สั่งซื้อ 2 ชิ้น → แก้ราคาสินค้าเป็น 150 → ดึงคำสั่งซื้อมาเช็กว่า `unit_price` = 100 และยอดรวม = 200

## สิ่งที่ตัดสินใจไม่ทำ (ให้เขียนลง README ด้วย)

- สต็อกสินค้า: โจทย์ไม่ได้ขอ
- ระบบ login และตารางลูกค้า: ใช้ช่อง `customer_name` แทน
- การแก้ไขคำสั่งซื้อหลังสร้าง: ทำได้แค่ยกเลิก
- ประวัติราคา (price history): ใช้ snapshot ใน `order_items` ก็พอ

## แบ่งเวลา 3 ชั่วโมง

| ช่วง | งาน | เวลา |
|---|---|---|
| 0 | สร้างโปรเจกต์ทั้งสองฝั่ง + Dockerfile + **deploy โครงเปล่า** (`/api/health`) | 35 นาที |
| 1 | Migration + API + **PriceSnapshotTest** | 1 ชม. |
| 2 | หน้าเว็บ 5 หน้า | 1 ชม. |
| 3 | README + ภาพหน้าจอมือถือ + ทดสอบบนเว็บจริง | 20 นาที |
| — | เผื่อเวลาฉุกเฉิน | 5 นาที |

- ถ้าเวลาไม่พอ ให้ตัด "ราคาปัจจุบัน" ในหน้า 5 ออกก่อน
- Commit ทีละเรื่อง ไม่ commit ก้อนเดียวตอนท้าย

## ต้องทำก่อนเริ่มจับเวลา

- [ ] ติดตั้ง Laravel Herd (Windows) แล้วเช็กว่าคำสั่ง `php -v` กับ `composer -V` ใช้ได้
- [ ] สมัครบัญชี GitHub, Vercel, Render, Supabase และเช็กเงื่อนไขแพ็กเกจฟรี
- [ ] สร้าง Supabase project แล้วคัดลอก connection string ของ Session pooler เก็บไว้

## ต้องอธิบายให้ได้ตอนสัมภาษณ์

- ทำไมต้อง snapshot ราคาลงใน `order_items`
- ทำไม backend ต้องอ่านราคาจาก DB เอง ไม่ใช้ราคาที่ client ส่งมา
- ทำไมใช้ `NUMERIC` เก็บเงิน ไม่ใช้ `FLOAT`
- ทำไมต้องใช้ transaction ตอนสร้างคำสั่งซื้อ

## ข้อควรระวัง

- Supabase แพ็กเกจฟรีจะพัก project เองถ้าไม่มีคนใช้ราว 1 สัปดาห์ ช่วงรอผลให้เข้าไปเปิดไว้เป็นระยะ
- Render แพ็กเกจฟรี เครื่องจะหลับเมื่อไม่มีคนใช้ เปิดครั้งแรกต้องรอราว 1 นาที ให้เขียนไว้ใน README
- ถ้าเผลอ commit `.env` ขึ้นไปแล้ว ให้เปลี่ยนรหัสผ่าน DB ใหม่ทันที เพราะรหัสยังค้างอยู่ใน git history
