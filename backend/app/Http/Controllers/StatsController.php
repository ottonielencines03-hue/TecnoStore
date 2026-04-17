<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Producto;
use App\Models\Proveedor;
use App\Models\User;

class StatsController extends Controller
{
    /**
     * Get aggregate statistics for the landing page.
     */
    public function getStats()
    {
        return response()->json([
            'products' => \App\Models\Producto::count(),
            'providers' => \App\Models\Proveedor::count(),
            'customers' => \App\Models\User::count(),
            'satisfaction' => 99 
        ]);
    }

    /**
     * Get aggregate statistics for a specific provider.
     */
    public function getProviderStats($id)
    {
        $products = Producto::where('proveedor_id', $id)->get();
        
        $totalProducts = $products->count();
        $totalStock = $products->sum('stock');
        $uniqueCategories = $products->pluck('categoria')->unique()->count();
        
        // Group by category for charts
        $categoryData = $products->groupBy('categoria')->map(function ($items, $key) {
            return [
                'name' => $key ?: 'Sin categoría',
                'value' => $items->count()
            ];
        })->values();

        return response()->json([
            'total_products' => $totalProducts,
            'total_stock' => $totalStock,
            'total_categories' => $uniqueCategories,
            'category_distribution' => $categoryData,
            // Mocked sales data for the "modern" dashboard experience
            'activity_data' => [
                ['name' => 'Lun', 'ventas' => rand(1, 5)],
                ['name' => 'Mar', 'ventas' => rand(2, 8)],
                ['name' => 'Mie', 'ventas' => rand(3, 10)],
                ['name' => 'Jue', 'ventas' => rand(2, 6)],
                ['name' => 'Vie', 'ventas' => rand(5, 12)],
                ['name' => 'Sab', 'ventas' => rand(8, 15)],
                ['name' => 'Dom', 'ventas' => rand(4, 9)]
            ]
        ]);
    }
}
