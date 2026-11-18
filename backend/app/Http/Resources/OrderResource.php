<?php

namespace App\Http\Resources;

use App\Models\OrderItem;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'customer_name' => $this->customer_name,
            'status' => $this->status,
            'created_at' => $this->created_at,
            'total' => $this->total(),
            'items' => $this->items->map(fn (OrderItem $item) => [
                'id' => $item->id,
                'product_id' => $item->product_id,
                'product_name' => $item->product_name,
                'unit_price' => $item->unit_price,
                'quantity' => $item->quantity,
                'line_total' => number_format($item->lineTotalSatang() / 100, 2, '.', ''),
                // Display only: today's catalog price, to show it differs from the snapshot
                'current_price' => $item->relationLoaded('product') ? $item->product?->price : null,
            ]),
        ];
    }
}
