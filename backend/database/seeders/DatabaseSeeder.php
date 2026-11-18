<?php

namespace Database\Seeders;

use App\Models\Product;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /** Safe to run on every boot: only inserts sample products that never existed. */
    public function run(): void
    {
        $samples = [
            ['name' => 'ปากกาลูกลื่น', 'price' => 10],
            ['name' => 'สมุดโน้ต A5', 'price' => 25],
            ['name' => 'ดินสอ 2B', 'price' => 8],
            ['name' => 'ยางลบ', 'price' => 5],
            ['name' => 'แฟ้มเอกสาร', 'price' => 35],
        ];

        foreach ($samples as $sample) {
            Product::withTrashed()->firstOrCreate(['name' => $sample['name']], $sample);
        }
    }
}
