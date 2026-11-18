<?php

namespace App\Http\Controllers;

use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class OrderController extends Controller
{
    public function index()
    {
        return OrderResource::collection(Order::with('items')->latest('id')->get());
    }

    public function store(Request $request)
    {
        // Only product_id + quantity are accepted; any price sent by the client is ignored.
        $data = $request->validate([
            'customer_name' => ['required', 'string', 'max:255'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => [
                'required', 'integer', 'distinct',
                Rule::exists('products', 'id')->whereNull('deleted_at'),
            ],
            'items.*.quantity' => ['required', 'integer', 'min:1', 'max:10000'],
        ]);

        $order = DB::transaction(function () use ($data) {
            $products = Product::findMany(array_column($data['items'], 'product_id'))->keyBy('id');

            $order = Order::create([
                'customer_name' => $data['customer_name'],
                'status' => Order::STATUS_CONFIRMED,
            ]);

            foreach ($data['items'] as $line) {
                $product = $products[$line['product_id']];
                $order->items()->create([
                    'product_id' => $product->id,
                    'product_name' => $product->name, // snapshot
                    'unit_price' => $product->price,  // snapshot
                    'quantity' => $line['quantity'],
                ]);
            }

            return $order;
        });

        return (new OrderResource($order->load('items.product')))->response()->setStatusCode(201);
    }

    public function show(Order $order)
    {
        return new OrderResource($order->load('items.product'));
    }

    public function cancel(Order $order)
    {
        if ($order->status === Order::STATUS_CANCELLED) {
            return response()->json(['message' => 'คำสั่งซื้อนี้ถูกยกเลิกไปแล้ว'], 422);
        }

        $order->update(['status' => Order::STATUS_CANCELLED]);

        return new OrderResource($order->load('items.product'));
    }
}
