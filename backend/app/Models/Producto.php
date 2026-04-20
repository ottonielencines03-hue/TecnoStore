<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Producto extends Model
{
    use HasFactory;

    protected $fillable = [
        'nombre', 'categoria', 'marca', 'modelo', 'precio', 'descuento', 'stock', 'descripcion', 'imagen', 'proveedor_id'
    ];

    public function proveedor()
    {
        return $this->belongsTo(Proveedor::class);
    }
}