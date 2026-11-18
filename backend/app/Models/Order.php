<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    public const STATUS_CONFIRMED = 'confirmed';
    public const STATUS_CANCELLED = 'cancelled';

    protected $fillable = ['customer_name', 'status'];

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    /** Total from the snapshot prices, computed in satang to avoid float rounding. */
    public function total(): string
    {
        $satang = $this->items->sum(fn (OrderItem $item) => $item->lineTotalSatang());

        return number_format($satang / 100, 2, '.', '');
    }
}
