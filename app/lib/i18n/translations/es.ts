/**
 * Spanish translations for SavedFilters and Users modules
 */

export const translations = {
  // SavedFilters - General
  savedFilters: {
    title: "Filtros Guardados",
    manage: "Gestionar Filtros Guardados",
    loading: "Cargando filtros...",
    noFilters: "No hay filtros guardados. Crea tu primer filtro desde el editor.",
    apply: "Aplicar",
    clear: "Limpiar",
    save: "Guardar",
    saveCurrent: "Guardar filtro actual",
    edit: "Editar",
    delete: "Eliminar",
    share: "Compartir",
    unshare: "Dejar de compartir",
    default: "Filtro por Defecto",
    myFilters: "Mis Filtros",
    sharedFilters: "Filtros Compartidos",
    sharedByTeam: "Compartido por el equipo",
    deleteOnlyAdmins: "Eliminar (solo admins)",
    confirmDelete: "¿Eliminar filtro?",
    confirmDeleteDescription: "Esta acción no se puede deshacer. El filtro será eliminado permanentemente.",
    cancel: "Cancelar",
    close: "Cerrar",
    applying: "Aplicando filtro...",
    errorLoading: "Error al cargar filtros:",
    shared: "Compartidos",
    newFilter: "Nuevo filtro",
  },

  // Filter Editor
  filterEditor: {
    create: "Crear Nuevo Filtro",
    edit: "Editar Filtro",
    name: "Nombre del Filtro *",
    namePlaceholder: "Ej: Usuarios Activos",
    description: "Descripción (opcional)",
    isDefault: "Filtro por defecto",
    isShared: "Compartir con el equipo",
    save: "Guardar",
    saving: "Guardando...",
    update: "Actualizar",
    visual: "Visual",
    json: "JSON",
    preview: "Vista Previa del Filtro",
    previewDescription: "Este filtro mostrará registros donde:",
    noConditions: "No hay condiciones definidas. Este filtro mostrará todos los registros.",
    tip: "💡 Tip: Puedes guardar este filtro para usarlo más tarde o compartirlo con tu equipo.",
    estimatedResults: "Resultados estimados:",
    records: "registros",
  },

  // Users List
  users: {
    title: "Usuarios",
    loading: "Cargando usuarios...",
    error: "Error",
    retry: "Reintentar",
    noUsers: "No hay usuarios registrados",
    noUsersWithFilter: "No se encontraron usuarios con el filtro aplicado",
    showing: "Mostrando",
    of: "de",
    users: "usuarios",
    page: "Página",
    previous: "Anterior",
    next: "Siguiente",
    email: "Email",
    name: "Nombre",
    status: "Estado",
    created: "Creado",
    active: "Activo",
    inactive: "Inactivo",
  },

  // Filter Utils
  filterUtils: {
    noConditions: "Sin condiciones",
    and: "Y",
    isEqualTo: "es igual a",
    isNotEqualTo: "no es igual a",
    isGreaterThan: "es mayor que",
    isGreaterOrEqual: "es mayor o igual que",
    isLessThan: "es menor que",
    isLessOrEqual: "es menor o igual que",
    isIn: "está en",
    isNotIn: "no está en",
    isBetween: "está entre",
    contains: "contiene",
    startsWith: "comienza con",
    endsWith: "termina con",
    isNull: "es nulo",
    isNotNull: "no es nulo",
  },

  // Common
  common: {
    selectField: "Seleccionar campo",
    selectOperator: "Seleccionar operador",
    selectValue: "Seleccionar valor",
  },
} as const;

export type TranslationKey = keyof typeof translations;

