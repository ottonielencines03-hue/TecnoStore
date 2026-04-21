<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Producto;

class ProductoController extends Controller
{
    // Listar todos los productos
    public function index()
    {
        return response()->json(Producto::with('proveedor')->get());
    }

    // Productos por proveedor
    public function byProveedor($proveedor_id)
    {
        return response()->json(Producto::where('proveedor_id', $proveedor_id)->get());
    }

    // Crear un producto nuevo
    public function store(Request $request)
    {
        try {
            $request->validate([
                'nombre'       => 'required|string|max:255',
                'categoria'    => 'required|string',
                'marca'        => 'nullable|string',
                'modelo'       => 'nullable|string',
                'precio'       => 'required|numeric',
                'descuento'    => 'nullable|integer|min:0|max:100',
                'stock'        => 'nullable|integer',
                'descripcion'  => 'nullable|string',
                'imagen'       => 'nullable|image|max:5120',
                'proveedor_id' => 'required|integer|exists:proveedores,id',
                'tarjeta_pago' => 'nullable|string',
            ]);

            $producto = new Producto();
            $producto->nombre      = $request->nombre;
            $producto->categoria   = $request->categoria;
            $producto->marca       = $request->marca;
            $producto->modelo      = $request->modelo;
            $producto->precio      = $request->precio;
            $producto->descuento   = $request->descuento ?? 0;
            $producto->stock       = $request->stock ?? 0;
            $producto->descripcion = $request->descripcion;
            $producto->proveedor_id = $request->proveedor_id;
            $producto->tarjeta_pago = $request->tarjeta_pago;

            if ($request->hasFile('imagen')) {
                $file     = $request->file('imagen');
                $filename = time() . '.' . $file->getClientOriginalExtension();
                $file->move(public_path('productos'), $filename);
                $producto->imagen = $filename;
            }

            $producto->save();

            return response()->json([
                'message'  => 'Producto creado correctamente',
                'producto' => $producto
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'error'    => 'Error de validación',
                'messages' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'error'   => 'Error al crear el producto',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    // Actualizar producto (acepta POST con _method=PUT para compatibilidad con FormData)
    public function update(Request $request, $id)
    {
        try {
            $producto = Producto::findOrFail($id);

            $request->validate([
                'nombre'      => 'required|string|max:255',
                'categoria'   => 'required|string',
                'marca'       => 'nullable|string',
                'modelo'      => 'nullable|string',
                'precio'      => 'required|numeric',
                'descuento'   => 'nullable|integer|min:0|max:100',
                'stock'       => 'nullable|integer',
                'descripcion' => 'nullable|string',
                'imagen'      => 'nullable|image|max:5120',
                'tarjeta_pago'=> 'nullable|string',
            ]);

            $producto->nombre      = $request->nombre;
            $producto->categoria   = $request->categoria;
            $producto->marca       = $request->marca;
            $producto->modelo      = $request->modelo;
            $producto->precio      = $request->precio;
            $producto->descuento   = $request->descuento ?? 0;
            $producto->stock       = $request->stock ?? 0;
            $producto->descripcion = $request->descripcion;
            $producto->tarjeta_pago= $request->tarjeta_pago;

            if ($request->hasFile('imagen')) {
                // Eliminar imagen anterior si existe
                if ($producto->imagen) {
                    $oldPath = public_path('productos/' . $producto->imagen);
                    if (file_exists($oldPath)) unlink($oldPath);
                }
                $file     = $request->file('imagen');
                $filename = time() . '.' . $file->getClientOriginalExtension();
                $file->move(public_path('productos'), $filename);
                $producto->imagen = $filename;
            }

            $producto->save();

            return response()->json([
                'message'  => 'Producto actualizado correctamente',
                'producto' => $producto
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'error'    => 'Error de validación',
                'messages' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'error'   => 'Error al actualizar el producto',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    // Eliminar producto
    public function destroy($id)
    {
        try {
            $producto = Producto::findOrFail($id);

            // Eliminar imagen del disco si existe
            if ($producto->imagen) {
                $path = public_path('productos/' . $producto->imagen);
                if (file_exists($path)) unlink($path);
            }

            $producto->delete();

            return response()->json(['message' => 'Producto eliminado correctamente']);

        } catch (\Exception $e) {
            return response()->json([
                'error'   => 'Error al eliminar el producto',
                'message' => $e->getMessage()
            ], 500);
        }
    }
    // Get distinct categories
    public function getCategorias()
    {
        return response()->json(
            Producto::whereNotNull('categoria')
                ->distinct()
                ->pluck('categoria')
        );
    }
}