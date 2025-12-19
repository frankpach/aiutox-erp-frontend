import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("/login", "routes/login.tsx"),
  route("/forgot-password", "routes/forgot-password.tsx"),
  route("/reset-password", "routes/reset-password.tsx"),
  route("/verify-email", "routes/verify-email.tsx"),
  route("/maintenance", "routes/maintenance.tsx"),
  route("/unauthorized", "routes/unauthorized.tsx"),
  route("/users", "routes/users.tsx"),
  route("/users/:id", "routes/users.$id.tsx"),
  route("/users/:id/roles", "routes/users.$id.roles.tsx"),
  route("/users/:id/permissions", "routes/users.$id.permissions.tsx"),
  route("*", "routes/not-found.tsx"), // Catch-all para 404
] satisfies RouteConfig;
