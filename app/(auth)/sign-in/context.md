# Sign In Route Context

## Route: `/sign-in`

### Metadata

- **Title:** Sign In — EventCraft AI
- **Description:** Sign in to EventCraft AI to create and discover events.

### Layout Chain

```
app/layout.tsx                          → Root (providers, Header)
  └── app/(auth)/layout.tsx             → AuthGuard(requireAuth=false)
        └── app/(auth)/sign-in/page.tsx
```

### Key Components

| Component   | File                          | Type   |
| ----------- | ----------------------------- | ------ |
| `LoginForm` | `features/auth/LoginForm.tsx` | Client |

### Auth Flow

1. User clicks "Sign in with GitHub"
2. BetterAuth redirects to GitHub OAuth
3. GitHub redirects back with code
4. BetterAuth creates session + user
5. Profile created on first login (`api.profiles.create`)
6. Redirect: onboarding complete → `/explore`, else → `/onboarding`

### Redirect Logic

- Authenticated + onboarding complete → `/explore`
- Authenticated + incomplete → `/onboarding`
- Not authenticated → show login form

### Auth Provider

- GitHub OAuth via BetterAuth

### Edge Cases

- Already logged in → redirect away
- OAuth fails → error toast
- Network error → redirect to onboarding (fail open)
