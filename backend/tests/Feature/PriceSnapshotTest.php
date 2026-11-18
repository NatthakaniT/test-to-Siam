<?php

namespace Tests\Feature;

use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PriceSnapshotTest extends TestCase
{
    use RefreshDatabase;

    public function test_order_keeps_its_price_after_the_product_price_changes(): void
    {
        $pen = Product::create(['name' => 'ปากกา', 'price' => 100]);

        $orderId = $this->postJson('/api/orders', [
            'customer_name' => 'สมชาย',
            'items' => [['product_id' => $pen->id, 'quantity' => 2]],
        ])->assertCreated()->json('id');

        $this->putJson("/api/products/{$pen->id}", ['name' => 'ปากการุ่นใหม่', 'price' => 150])->assertOk();

        $this->getJson("/api/orders/{$orderId}")
            ->assertOk()
            ->assertJsonPath('items.0.unit_price', '100.00')
            ->assertJsonPath('items.0.product_name', 'ปากกา')
            ->assertJsonPath('items.0.current_price', '150.00')
            ->assertJsonPath('total', '200.00');
    }

    public function test_order_with_many_items_totals_from_snapshot_prices(): void
    {
        $pen = Product::create(['name' => 'ปากกา', 'price' => 10]);
        $book = Product::create(['name' => 'สมุด', 'price' => 25.50]);

        $this->postJson('/api/orders', [
            'customer_name' => 'สมหญิง',
            'items' => [
                ['product_id' => $pen->id, 'quantity' => 3],
                ['product_id' => $book->id, 'quantity' => 2],
            ],
        ])->assertCreated()->assertJsonPath('total', '81.00')->assertJsonCount(2, 'items');
    }

    public function test_price_sent_by_client_is_ignored(): void
    {
        $pen = Product::create(['name' => 'ปากกา', 'price' => 100]);

        $this->postJson('/api/orders', [
            'customer_name' => 'แฮกเกอร์',
            'items' => [['product_id' => $pen->id, 'quantity' => 1, 'unit_price' => 1]],
        ])->assertCreated()->assertJsonPath('items.0.unit_price', '100.00');
    }

    public function test_order_survives_product_soft_delete_but_deleted_product_cannot_be_ordered(): void
    {
        $pen = Product::create(['name' => 'ปากกา', 'price' => 100]);
        $orderId = $this->postJson('/api/orders', [
            'customer_name' => 'สมชาย',
            'items' => [['product_id' => $pen->id, 'quantity' => 1]],
        ])->json('id');

        $this->deleteJson("/api/products/{$pen->id}")->assertNoContent();

        $this->getJson("/api/orders/{$orderId}")->assertOk()->assertJsonPath('items.0.product_name', 'ปากกา');
        $this->postJson('/api/orders', [
            'customer_name' => 'สมชาย',
            'items' => [['product_id' => $pen->id, 'quantity' => 1]],
        ])->assertUnprocessable()->assertJsonValidationErrors('items.0.product_id');
    }

    public function test_order_validation_rules(): void
    {
        $pen = Product::create(['name' => 'ปากกา', 'price' => 100]);

        $this->postJson('/api/orders', ['customer_name' => 'ก', 'items' => []])
            ->assertJsonValidationErrors('items');
        $this->postJson('/api/orders', [
            'customer_name' => 'ก',
            'items' => [['product_id' => $pen->id, 'quantity' => 0]],
        ])->assertJsonValidationErrors('items.0.quantity');
        $this->postJson('/api/orders', [
            'customer_name' => 'ก',
            'items' => [['product_id' => $pen->id, 'quantity' => 1], ['product_id' => $pen->id, 'quantity' => 1]],
        ])->assertJsonValidationErrors('items.0.product_id');
        $this->postJson('/api/products', ['name' => 'ติดลบ', 'price' => -1])
            ->assertJsonValidationErrors('price');
    }

    public function test_order_can_be_cancelled_only_once(): void
    {
        $pen = Product::create(['name' => 'ปากกา', 'price' => 100]);
        $orderId = $this->postJson('/api/orders', [
            'customer_name' => 'สมชาย',
            'items' => [['product_id' => $pen->id, 'quantity' => 1]],
        ])->json('id');

        $this->postJson("/api/orders/{$orderId}/cancel")->assertOk()->assertJsonPath('status', 'cancelled');
        $this->postJson("/api/orders/{$orderId}/cancel")->assertUnprocessable();
    }
}
