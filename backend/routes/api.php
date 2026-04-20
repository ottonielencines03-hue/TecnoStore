<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProductoController;
use App\Http\Controllers\StatsController;
use App\Http\Controllers\ProfileController;

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// Auth
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);
Route::post('/register-proveedor', [AuthController::class, 'registerProveedor']);
Route::post('/login-proveedor', [AuthController::class, 'loginProveedor']);

// ── NUEVA: proveedor por ID (para mostrar info en tarjetas) ──
Route::get('/proveedores/{id}', [AuthController::class, 'showProveedor']);

// Productos
Route::get('/productos', [ProductoController::class, 'index']);
Route::post('/productos', [ProductoController::class, 'store']);
Route::get('/productos/proveedor/{proveedor_id}', [ProductoController::class, 'byProveedor']);
Route::post('/productos/{id}', [ProductoController::class, 'update']);
Route::delete('/productos/{id}', [ProductoController::class, 'destroy']);

Route::get('/categorias', [ProductoController::class, 'getCategorias']);
Route::get('/stats', [StatsController::class, 'getStats']);
Route::get('/stats/proveedor/{id}', [StatsController::class, 'getProviderStats']);

// Carrito
use App\Http\Controllers\CarritoController;
Route::get('/carrito/{user_id}', [CarritoController::class, 'index']);
Route::post('/carrito', [CarritoController::class, 'store']);
Route::put('/carrito/{user_id}/{producto_id}', [CarritoController::class, 'update']);
Route::delete('/carrito/{user_id}/{producto_id}', [CarritoController::class, 'destroy']);
Route::delete('/carrito/{user_id}', [CarritoController::class, 'clear']);

// Perfil y Ajustes
Route::post('/perfil/cliente/{id}', [ProfileController::class, 'updateCliente']);
Route::post('/perfil/proveedor/{id}', [ProfileController::class, 'updateProveedor']);
