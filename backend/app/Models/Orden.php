<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Orden extends Model
{
    use HasFactory;

    protected $table = 'ordenes';

    protected $fillable = [
        'user_id',
        'total',
        'paypal_id',
        'metodo_pago',
        'status'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function detalles()
    {
        return $this->hasMany(OrdenDetalle::class, 'orden_id');
    }
}
