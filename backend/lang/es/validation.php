<?php

return [
    'required' => 'El campo :attribute es obligatorio.',
    'email' => 'El campo :attribute debe ser una dirección de correo válida.',
    'unique' => 'El :attribute ya ha sido registrado.',
    
    'min' => [
        'string' => 'El campo :attribute debe contener al menos :min caracteres.',
        'numeric' => 'El campo :attribute debe ser al menos :min.',
        'file' => 'El campo :attribute debe ser de al menos :min kilobytes.',
        'array' => 'El campo :attribute debe tener al menos :min elementos.',
    ],

    'attributes' => [
        'name' => 'nombre',
        'email' => 'correo electrónico',
        'password' => 'contraseña',
        'empresa' => 'empresa',
        'telefono' => 'teléfono',
        'direccion' => 'dirección',
    ],
];
