<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Proveedor;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class ProfileController extends Controller
{
    /**
     * Update client (User) profile and settings
     */
    public function updateCliente(Request $request, $id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json(['message' => 'Usuario no encontrado'], 404);
        }

        return $this->updateProfileData($request, $user, 'cliente');
    }

    /**
     * Update provider (Proveedor) profile and settings
     */
    public function updateProveedor(Request $request, $id)
    {
        $proveedor = Proveedor::find($id);

        if (!$proveedor) {
            return response()->json(['message' => 'Proveedor no encontrado'], 404);
        }

        return $this->updateProfileData($request, $proveedor, 'proveedor');
    }

    /**
     * Common method to handle updates for both entities
     */
    private function updateProfileData(Request $request, $entity, $type)
    {
        try {
            // Update Basic Info
            if ($request->has('name')) {
                $entity->name = trim($request->name);
            }
            if ($request->has('email') && $request->email !== $entity->email) {
                // Must validate unique email based on type
                $table = $type === 'proveedor' ? 'proveedores' : 'users';
                $request->validate([
                    'email' => "email|unique:{$table},email"
                ]);
                $entity->email = trim($request->email);
            }

            // Update Password if provided
            if ($request->has('password') && !empty($request->password)) {
                $request->validate([
                    'password' => 'min:6'
                ]);
                $entity->password = Hash::make(trim($request->password));
            }

            // Additional Provider fields
            if ($type === 'proveedor') {
                if ($request->has('empresa')) {
                    $entity->empresa = trim($request->empresa);
                }
                if ($request->has('telefono')) {
                    $entity->telefono = trim($request->telefono);
                }
                if ($request->has('direccion')) {
                    $entity->direccion = trim($request->direccion);
                }
                if ($request->has('facebook')) {
                    $entity->facebook = trim($request->facebook);
                }
                if ($request->has('instagram')) {
                    $entity->instagram = trim($request->instagram);
                }
                if ($request->has('tiktok')) {
                    $entity->tiktok = trim($request->tiktok);
                }
                if ($request->has('whatsapp')) {
                    $entity->whatsapp = trim($request->whatsapp);
                }
            }

            // Handle Avatar Upload
            if ($request->hasFile('avatar')) {
                $file = $request->file('avatar');
                if ($file->isValid()) {
                    // Create avatars directory if it doesn't exist
                    $destinationPath = public_path('avatars');
                    if (!file_exists($destinationPath)) {
                        mkdir($destinationPath, 0777, true);
                    }

                    // Delete old avatar if exists
                    if ($entity->avatar && file_exists(public_path('avatars/' . $entity->avatar))) {
                        @unlink(public_path('avatars/' . $entity->avatar));
                    }

                    // Save new avatar
                    $fileName = time() . '_' . $file->getClientOriginalName();
                    $file->move($destinationPath, $fileName);
                    $entity->avatar = $fileName;
                }
            }

            // Handle Settings (ajustes) JSON
            if ($request->has('ajustes')) {
                $currentAjustes = $entity->ajustes ? json_decode($entity->ajustes, true) : [];
                $newAjustes = json_decode($request->ajustes, true);
                
                if (is_array($newAjustes)) {
                    $entity->ajustes = json_encode(array_merge($currentAjustes, $newAjustes));
                }
            }

            $entity->save();

            // Refresh the entity so it returns proper parsed JSON if defined in model casts, or just standard array format
            $entity->refresh();

            return response()->json([
                'message' => 'Perfil actualizado correctamente',
                'user' => $entity
            ], 200);

        } catch (\Exception $e) {
            Log::error('Error updating profile: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error al actualizar el perfil: ' . $e->getMessage()
            ], 500);
        }
    }
}
