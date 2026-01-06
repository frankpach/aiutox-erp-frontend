# Page snapshot

```yaml
- generic [ref=e3]:
  - generic [ref=e4]:
    - link "AiutoX ERP" [ref=e5] [cursor=pointer]:
      - /url: /login
      - img "AiutoX ERP" [ref=e6]
    - heading "Iniciar Sesión" [level=2] [ref=e7]
  - generic [ref=e9]:
    - generic [ref=e10]:
      - text: Email
      - textbox "Email" [ref=e11]:
        - /placeholder: tu@email.com
    - generic [ref=e12]:
      - text: Contraseña
      - textbox "Contraseña" [ref=e13]:
        - /placeholder: ••••••••
    - generic [ref=e14]:
      - checkbox "Recordarme" [ref=e15]
      - checkbox
      - generic [ref=e16] [cursor=pointer]: Recordarme
    - link "¿Olvidaste tu contraseña?" [ref=e18] [cursor=pointer]:
      - /url: /forgot-password
    - button "Iniciar Sesión" [ref=e19]
  - link "Volver al inicio" [ref=e21] [cursor=pointer]:
    - /url: /login
```