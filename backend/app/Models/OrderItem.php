<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderItem extends Model
{
    protected $fillable = ['product_id', 'product_name', 'unit_price', 'quantity'];

    protected $casts = ['unit_price' => 'decimal:2', 'quantity' => 'integer'];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    /** Current catalog product, kept even if soft-deleted (for display only, never for totals). */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class)->withTrashed();
    }

    public function lineTotalSatang(): int
    {
        return (int) round($this->unit_price * 100) * $this->quantity;
    }
}
