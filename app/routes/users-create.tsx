/**
 * Create User Page
 * Página para crear un nuevo usuario
 */

import { useState } from "react";
import { useNavigate } from "react-router";
import { PageLayout } from "~/components/layout/PageLayout";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Checkbox } from "~/components/ui/checkbox";
import { useCreateUser } from "~/features/users/hooks/useUsers";

export default function CreateUserPage() {
  const navigate = useNavigate();
  const createUser = useCreateUser();
  const [formData, setFormData] = useState({
    email: "",
    full_name: "",
    password: "",
    confirm_password: "",
    is_active: true,
    roles: [] as string[]
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirm_password) {
      alert("Las contraseñas no coinciden");
      return;
    }

    try {
      await createUser.mutateAsync({
        email: formData.email,
        full_name: formData.full_name,
        password: formData.password,
        is_active: formData.is_active,
        roles: formData.roles
      });
      navigate("/users");
    } catch (error) {
      console.error("Error creating user:", error);
    }
  };

  const handleCancel = () => {
    navigate("/users");
  };

  const handleChange = (field: string, value: string | boolean | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <PageLayout title="Nuevo Usuario">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Crear Nuevo Usuario</CardTitle>
            <CardDescription>
              Agrega un nuevo usuario al sistema con los roles y permisos apropiados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Correo Electrónico</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    placeholder="usuario@ejemplo.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="full_name">Nombre Completo</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => handleChange("full_name", e.target.value)}
                    placeholder="Juan Pérez"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleChange("password", e.target.value)}
                    placeholder="Mínimo 8 caracteres"
                    required
                    minLength={8}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm_password">Confirmar Contraseña</Label>
                  <Input
                    id="confirm_password"
                    type="password"
                    value={formData.confirm_password}
                    onChange={(e) => handleChange("confirm_password", e.target.value)}
                    placeholder="Repite la contraseña"
                    required
                    minLength={8}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Roles</Label>
                <Select onValueChange={(value) => {
                  const newRoles = formData.roles.includes(value)
                    ? formData.roles.filter(r => r !== value)
                    : [...formData.roles, value];
                  handleChange("roles", newRoles);
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona roles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrador</SelectItem>
                    <SelectItem value="manager">Gerente</SelectItem>
                    <SelectItem value="staff">Personal</SelectItem>
                    <SelectItem value="viewer">Lector</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.roles.map(role => (
                    <span
                      key={role}
                      className="px-2 py-1 bg-primary/10 text-primary rounded-md text-sm"
                    >
                      {role}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => handleChange("is_active", checked)}
                />
                <Label htmlFor="is_active">Usuario activo</Label>
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={createUser.isPending}
                  className="flex-1"
                >
                  {createUser.isPending ? "Creando..." : "Crear Usuario"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={createUser.isPending}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}
