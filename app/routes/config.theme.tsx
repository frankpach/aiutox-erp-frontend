import { useState } from "react";
import { useThemeConfig } from "~/hooks/useThemeConfig";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Card } from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";

export default function ThemeConfigPage() {
  const { theme, isLoading, isUpdating, updateTheme, error } = useThemeConfig();
  const [editedTheme, setEditedTheme] = useState(theme);

  // Update local state when theme loads
  if (theme && !editedTheme) {
    setEditedTheme(theme);
  }

  const handleColorChange = (key: string, value: string) => {
    setEditedTheme((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = () => {
    if (editedTheme) {
      updateTheme(editedTheme);
    }
  };

  const handleReset = () => {
    setEditedTheme(theme);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p>Cargando configuración del tema...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tema y Apariencia</h1>
          <p className="text-muted-foreground mt-1">
            Personaliza los colores, logos y estilos de tu aplicación
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset} disabled={isUpdating}>
            Restablecer
          </Button>
          <Button onClick={handleSave} disabled={isUpdating}>
            {isUpdating ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">Error al cargar el tema: {error.toString()}</p>
        </div>
      )}

      <Tabs defaultValue="colors" className="w-full">
        <TabsList>
          <TabsTrigger value="colors">Colores</TabsTrigger>
          <TabsTrigger value="logos">Logos</TabsTrigger>
          <TabsTrigger value="typography">Tipografía</TabsTrigger>
          <TabsTrigger value="components">Componentes</TabsTrigger>
        </TabsList>

        <TabsContent value="colors" className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Colores Principales</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <ColorInput
                label="Color Primario"
                value={editedTheme?.primary_color || "#1976D2"}
                onChange={(value) => handleColorChange("primary_color", value)}
              />
              <ColorInput
                label="Color Secundario"
                value={editedTheme?.secondary_color || "#DC004E"}
                onChange={(value) => handleColorChange("secondary_color", value)}
              />
              <ColorInput
                label="Color de Acento"
                value={editedTheme?.accent_color || "#FFC107"}
                onChange={(value) => handleColorChange("accent_color", value)}
              />
              <ColorInput
                label="Fondo"
                value={editedTheme?.background_color || "#FFFFFF"}
                onChange={(value) => handleColorChange("background_color", value)}
              />
              <ColorInput
                label="Superficie"
                value={editedTheme?.surface_color || "#F5F5F5"}
                onChange={(value) => handleColorChange("surface_color", value)}
              />
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Colores de Estado</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <ColorInput
                label="Error"
                value={editedTheme?.error_color || "#F44336"}
                onChange={(value) => handleColorChange("error_color", value)}
              />
              <ColorInput
                label="Advertencia"
                value={editedTheme?.warning_color || "#FF9800"}
                onChange={(value) => handleColorChange("warning_color", value)}
              />
              <ColorInput
                label="Éxito"
                value={editedTheme?.success_color || "#4CAF50"}
                onChange={(value) => handleColorChange("success_color", value)}
              />
              <ColorInput
                label="Información"
                value={editedTheme?.info_color || "#2196F3"}
                onChange={(value) => handleColorChange("info_color", value)}
              />
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Colores de Texto</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <ColorInput
                label="Texto Principal"
                value={editedTheme?.text_primary || "#212121"}
                onChange={(value) => handleColorChange("text_primary", value)}
              />
              <ColorInput
                label="Texto Secundario"
                value={editedTheme?.text_secondary || "#757575"}
                onChange={(value) => handleColorChange("text_secondary", value)}
              />
              <ColorInput
                label="Texto Deshabilitado"
                value={editedTheme?.text_disabled || "#BDBDBD"}
                onChange={(value) => handleColorChange("text_disabled", value)}
              />
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Colores de Componentes</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ColorInput
                label="Fondo Sidebar"
                value={editedTheme?.sidebar_bg || "#2C3E50"}
                onChange={(value) => handleColorChange("sidebar_bg", value)}
              />
              <ColorInput
                label="Texto Sidebar"
                value={editedTheme?.sidebar_text || "#ECF0F1"}
                onChange={(value) => handleColorChange("sidebar_text", value)}
              />
              <ColorInput
                label="Fondo Navbar"
                value={editedTheme?.navbar_bg || "#34495E"}
                onChange={(value) => handleColorChange("navbar_bg", value)}
              />
              <ColorInput
                label="Texto Navbar"
                value={editedTheme?.navbar_text || "#FFFFFF"}
                onChange={(value) => handleColorChange("navbar_text", value)}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="logos" className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Logos y Recursos</h2>
            <div className="space-y-4">
              <TextInput
                label="Logo Principal"
                value={editedTheme?.logo_primary || "/assets/logos/logo.png"}
                onChange={(value) => handleColorChange("logo_primary", value)}
                placeholder="/assets/logos/logo.png"
              />
              <TextInput
                label="Logo Blanco"
                value={editedTheme?.logo_white || "/assets/logos/logo-white.png"}
                onChange={(value) => handleColorChange("logo_white", value)}
                placeholder="/assets/logos/logo-white.png"
              />
              <TextInput
                label="Logo Pequeño"
                value={editedTheme?.logo_small || "/assets/logos/logo-sm.png"}
                onChange={(value) => handleColorChange("logo_small", value)}
                placeholder="/assets/logos/logo-sm.png"
              />
              <TextInput
                label="Favicon"
                value={editedTheme?.favicon || "/assets/logos/favicon.ico"}
                onChange={(value) => handleColorChange("favicon", value)}
                placeholder="/assets/logos/favicon.ico"
              />
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="typography" className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Tipografía</h2>
            <div className="space-y-4">
              <TextInput
                label="Fuente Principal"
                value={editedTheme?.font_family_primary || "Roboto"}
                onChange={(value) => handleColorChange("font_family_primary", value)}
                placeholder="Roboto"
              />
              <TextInput
                label="Fuente Secundaria"
                value={editedTheme?.font_family_secondary || "Arial"}
                onChange={(value) => handleColorChange("font_family_secondary", value)}
                placeholder="Arial"
              />
              <TextInput
                label="Tamaño Base"
                value={editedTheme?.font_size_base || "14px"}
                onChange={(value) => handleColorChange("font_size_base", value)}
                placeholder="14px"
              />
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="components" className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Estilos de Componentes</h2>
            <div className="space-y-4">
              <TextInput
                label="Radio de Botones"
                value={editedTheme?.button_radius || "4px"}
                onChange={(value) => handleColorChange("button_radius", value)}
                placeholder="4px"
              />
              <TextInput
                label="Radio de Tarjetas"
                value={editedTheme?.card_radius || "8px"}
                onChange={(value) => handleColorChange("card_radius", value)}
                placeholder="8px"
              />
              <TextInput
                label="Radio de Inputs"
                value={editedTheme?.input_radius || "4px"}
                onChange={(value) => handleColorChange("input_radius", value)}
                placeholder="4px"
              />
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Helper component for color inputs
function ColorInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-2">
        <Input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-20 h-10 p-1 cursor-pointer"
        />
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#000000"
          pattern="^#[0-9A-Fa-f]{6}$"
          className="flex-1"
        />
      </div>
    </div>
  );
}

// Helper component for text inputs
function TextInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}

