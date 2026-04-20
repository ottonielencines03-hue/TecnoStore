<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Carrito;
use App\Models\Producto;
use Illuminate\Support\Facades\Validator;

class CarritoController extends Controller
{
    /**
     * Listar productos en el carrito del usuario.
     */
    public function index($user_id)
    {
        $items = Carrito::where('user_id', $user_id)
            ->with('producto')
            ->get();

        // Transformar para que el frontend reciba una estructura plana similar a la que ya usa
        return response()->json($items->map(function ($item) {
            return [
                'id' => $item->producto->id,
                'nombre' => $item->producto->nombre,
                'precio' => $item->producto->precio,
                'descuento' => $item->producto->descuento ?? 0,
                'imagen' => $item->producto->imagen,
                'marca' => $item->producto->marca,
                'cantidad' => $item->cantidad,
                'stock_disponible' => $item->producto->stock,
                'cart_item_id' => $item->id
            ];
        }));
    }

    /**
     * Añadir o actualizar producto en el carrito.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'user_id' => 'required|exists:users,id',
            'producto_id' => 'required|exists:productos,id',
            'cantidad' => 'required|integer|min:1'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $producto = Producto::find($request->producto_id);

        // 1. Verificar si el producto aún existe y tiene stock
        if (!$producto) {
            return response()->json(['message' => 'El producto ya no existe.'], 404);
        }

        if ($producto->stock < $request->cantidad) {
            return response()->json([
                'message' => 'Stock insuficiente.',
                'disponible' => $producto->stock
            ], 422);
        }

        // 2. Buscar si ya existe en el carrito
        $item = Carrito::where('user_id', $request->user_id)
            ->where('producto_id', $request->producto_id)
            ->first();

        if ($item) {
            // Verificar si la nueva cantidad total excede el stock
            $nuevaCantidad = $item->cantidad + $request->cantidad;
            if ($producto->stock < $nuevaCantidad) {
                return response()->json([
                    'message' => 'No puedes añadir más, stock agotado.',
                    'disponible' => $producto->stock
                ], 422);
            }
            $item->cantidad = $nuevaCantidad;
            $item->save();
        } else {
            $item = Carrito::create($request->all());
        }

        return response()->json([
            'message' => 'Producto añadido al carrito.',
            'item' => $item
        ]);
    }

    /**
     * Actualizar cantidad directamente.
     */
    public function update(Request $request, $user_id, $producto_id)
    {
        $item = Carrito::where('user_id', $user_id)
            ->where('producto_id', $producto_id)
            ->firstOrFail();

        $producto = $item->producto;

        if ($producto->stock < $request->cantidad) {
            return response()->json([
                'message' => 'Stock insuficiente para esta cantidad.',
                'disponible' => $producto->stock
            ], 422);
        }

        $item->cantidad = $request->cantidad;
        $item->save();

        return response()->json(['message' => 'Cantidad actualizada.']);
    }

    /**
     * Eliminar un producto del carrito.
     */
    public function destroy($user_id, $producto_id)
    {
        Carrito::where('user_id', $user_id)
            ->where('producto_id', $producto_id)
            ->delete();

        return response()->json(['message' => 'Producto eliminado del carrito.']);
    }

    /**
     * Vaciar el carrito.
     */
    public function clear($user_id)
    {
        Carrito::where('user_id', $user_id)->delete();
        return response()->json(['message' => 'Carrito vaciado.']);
    }
}
