<?php

// Thai messages for the validation rules this API uses; other rules fall back to English.
return [
    'array' => ':attribute ต้องเป็นรายการ',
    'decimal' => ':attribute ต้องมีทศนิยมไม่เกิน :decimal ตำแหน่ง',
    'distinct' => 'เลือก:attributeซ้ำกันในคำสั่งซื้อเดียวไม่ได้',
    'exists' => ':attribute ไม่มีอยู่ในระบบหรือถูกลบไปแล้ว',
    'integer' => ':attribute ต้องเป็นจำนวนเต็ม',
    'max' => [
        'numeric' => ':attribute ต้องไม่เกิน :max',
        'string' => ':attribute ต้องยาวไม่เกิน :max ตัวอักษร',
    ],
    'min' => [
        'array' => 'ต้องมี:attributeอย่างน้อย :min รายการ',
        'numeric' => ':attribute ต้องไม่น้อยกว่า :min',
    ],
    'numeric' => ':attribute ต้องเป็นตัวเลข',
    'required' => 'กรุณากรอก:attribute',
    'string' => ':attribute ต้องเป็นข้อความ',

    'attributes' => [
        'name' => 'ชื่อสินค้า',
        'price' => 'ราคา',
        'customer_name' => 'ชื่อลูกค้า',
        'items' => 'รายการสินค้า',
        'items.*.product_id' => 'สินค้า',
        'items.*.quantity' => 'จำนวน',
    ],
];
