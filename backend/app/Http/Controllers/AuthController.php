<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Proveedor;

class AuthController extends Controller
{
    // Registro usuario normal
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required',
            'email' => 'required|email|unique:users',
            'password' => 'required|min:6',
        ]);

        $user = User::create([
            'name' => trim($request->name),
            'email' => trim($request->email),
            'password' => Hash::make(trim($request->password))
        ]);

        return response()->json([
            'message' => 'Usuario registrado correctamente',
            'user' => $user
        ], 201);
    }

    // Registro proveedor
    public function registerProveedor(Request $request)
    {
        $request->validate([
            'name' => 'required',
            'email' => 'required|email|unique:proveedores,email',
            'password' => 'required|min:6',
            'empresa' => 'required',
            'telefono' => 'required',
            'direccion' => 'nullable'
        ]);

        $proveedor = Proveedor::create([
            'name' => trim($request->name),
            'email' => trim($request->email),
            'password' => Hash::make(trim($request->password)),
            'empresa' => trim($request->empresa),
            'telefono' => trim($request->telefono),
            'direccion' => $request->direccion ? trim($request->direccion) : null
        ]);

        return response()->json([
            'message' => 'Proveedor registrado correctamente',
            'proveedor' => $proveedor
        ], 201);
    }

    // Login usuario (CLIENTE)
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $email = trim($request->email);
        $password = trim($request->password);

        $user = User::where('email', $email)->first();

        if (!$user) {
            return response()->json([
                'message' => 'Usuario no encontrado'
            ], 404);
        }

        if (!Hash::check($password, $user->password)) {
            return response()->json([
                'message' => 'Contraseña incorrecta'
            ], 401);
        }

        return response()->json([
            'message' => 'Login correcto',
            'user' => $user
        ], 200);
    }

    // Login proveedor
    public function loginProveedor(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $email = trim($request->email);
        $password = trim($request->password);

        $proveedor = Proveedor::where('email', $email)->first();

        if (!$proveedor) {
            return response()->json([
                'message' => 'Proveedor no encontrado'
            ], 404);
        }

        if (!Hash::check($password, $proveedor->password)) {
            return response()->json([
                'message' => 'Contraseña incorrecta'
            ], 401);
        }

        return response()->json([
            'message' => 'Login proveedor correcto',
            'proveedor' => $proveedor
        ], 200);
    }

    // ── NUEVO: Obtener proveedor por ID (para las tarjetas de productos) ──
    public function showProveedor($id)
    {
        $proveedor = Proveedor::select('id', 'name', 'empresa', 'email', 'telefono', 'direccion', 'facebook', 'instagram', 'tiktok', 'whatsapp')
            ->find($id);

        if (!$proveedor) {
            return response()->json(['message' => 'Proveedor no encontrado'], 404);
        }

        return response()->json($proveedor);
    }
}