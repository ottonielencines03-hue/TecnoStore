<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Proveedor extends Model
{

    use HasFactory;

    protected $table = 'proveedores';
    protected $fillable = [
        'name',
        'email',
        'password',
        'empresa',
        'telefono',
        'direccion',
        'facebook',
        'instagram',
        'tiktok',
        'whatsapp'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
