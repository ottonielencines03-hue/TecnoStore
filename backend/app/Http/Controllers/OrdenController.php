<?php

namespace App\Http\Controllers;

use App\Models\Orden;
use App\Models\OrdenDetalle;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class OrdenController extends Controller
{
    public function store(Request $request)
    {
        try {
            $request->validate([
                'user_id' => 'required|exists:users,id',
                'total' => 'required|numeric',
                'paypal_id' => 'required|string',
                'metodo_pago' => 'string',
                'items' => 'required|array',
                'items.*.producto_id' => 'required|exists:productos,id',
                'items.*.cantidad' => 'required|integer|min:1',
                'items.*.precio_unitario' => 'required|numeric',
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Validation failed in OrdenController: ' . json_encode($e->errors()) . ' Request data: ' . json_encode($request->all()));
            throw $e;
        }

        try {
            DB::beginTransaction();

            $orden = Orden::create([
                'user_id' => $request->user_id,
                'total' => $request->total,
                'paypal_id' => $request->paypal_id,
                'metodo_pago' => $request->metodo_pago ?? 'PayPal',
                'status' => 'completado',
            ]);

            foreach ($request->items as $item) {
                OrdenDetalle::create([
                    'orden_id' => $orden->id,
                    'producto_id' => $item['producto_id'],
                    'cantidad' => $item['cantidad'],
                    'precio_unitario' => $item['precio_unitario'],
                ]);

                // Descontar stock
                $producto = \App\Models\Producto::find($item['producto_id']);
                if ($producto) {
                    $producto->stock -= $item['cantidad'];
                    if ($producto->stock < 0) {
                        $producto->stock = 0;
                    }
                    $producto->save();
                }
            }

            DB::commit();
            Log::info('Orden creada exitosamente: ID ' . $orden->id . ' para el usuario ' . $orden->user_id);

            return response()->json([
                'status' => 'success',
                'message' => 'Orden creada exitosamente',
                'orden' => $orden->load('detalles.producto'),
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error al crear la orden: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Hubo un error al procesar la orden',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        $orden = Orden::with('detalles.producto', 'user')->find($id);

        if (!$orden) {
            return response()->json([
                'status' => 'error',
                'message' => 'Orden no encontrada'
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'orden' => $orden
        ]);
    }

    public function indexByUser($user_id)
    {
        $ordenes = Orden::with('detalles.producto')
            ->where('user_id', $user_id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'status' => 'success',
            'ordenes' => $ordenes
        ]);
    }
}
