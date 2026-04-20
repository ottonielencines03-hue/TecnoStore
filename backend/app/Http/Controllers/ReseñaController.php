<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Reseña;
use Illuminate\Support\Facades\Validator;

class ReseñaController extends Controller
{
    public function index($producto_id)
    {
        $reseñas = Reseña::where('producto_id', $producto_id)
            ->with('user:id,name,avatar')
            ->orderBy('created_at', 'desc')
            ->get();
        
        return response()->json($reseñas);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'user_id' => 'required|exists:users,id',
            'producto_id' => 'required|exists:productos,id',
            'estrellas' => 'required|integer|min:1|max:5',
            'comentario' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $reseña = Reseña::create($request->all());

        return response()->json([
            'message' => 'Reseña enviada correctamente',
            'reseña' => $reseña->load('user:id,name,avatar')
        ], 201);
    }
}
