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
        $avg_rating = \App\Models\Reseña::avg('estrellas') ?: 5.0;
        
        return response()->json([
            'products' => \App\Models\Producto::count(),
            'providers' => \App\Models\Proveedor::count(),
            'customers' => \App\Models\User::count(),
            'avg_rating' => round($avg_rating, 1),
            'satisfaction' => round(($avg_rating / 5) * 100) 
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

        $productsIds = $products->pluck('id');
        
        $activity_data = [];
        $dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        
        for ($i = 6; $i >= 0; $i--) {
            $date = \Carbon\Carbon::now()->subDays($i);
            $dayName = $dias[$date->dayOfWeek];
            
            // Count total items added to carritos in this day
            // We use 'sum' to reflect the quantity of products requested
            $pedidos = \App\Models\Carrito::whereIn('producto_id', $productsIds)
                ->whereDate('created_at', $date->toDateString())
                ->sum('cantidad');
                
            $activity_data[] = [
                'name' => $dayName,
                'ventas' => (int) $pedidos
            ];
        }

        return response()->json([
            'total_products' => $totalProducts,
            'total_stock' => $totalStock,
            'total_categories' => $uniqueCategories,
            'category_distribution' => $categoryData,
            'activity_data' => $activity_data
        ]);
    }
}
