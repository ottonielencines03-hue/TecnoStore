<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrdenDetalle extends Model
{
    use HasFactory;

    protected $table = 'orden_detalles';

    protected $fillable = [
        'orden_id',
        'producto_id',
        'cantidad',
        'precio_unitario'
    ];

    public function orden()
    {
        return $this->belongsTo(Orden::class);
    }

    public function producto()
    {
        return $this->belongsTo(Productos::class, 'producto_id');
    }
}
