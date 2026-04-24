<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);

$request = Illuminate\Http\Request::create('/api/ordenes', 'POST', [
    'user_id' => 1,
    'total' => 1500,
    'paypal_id' => 'PAYID-1234567890',
    'metodo_pago' => 'paypal',
    'items' => [
        [
            'producto_id' => 1,
            'cantidad' => 1,
            'precio_unitario' => 1500,
        ]
    ]
]);

$response = $kernel->handle($request);

echo $response->getStatusCode() . "\n";
echo $response->getContent() . "\n";
