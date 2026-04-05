# Sign In Route Context

## Route: `/sign-in`

### Purpose

Authentication entry point. GitHub OAuth via BetterAuth.

### Layout Chain

```
app/layout.tsx                          → Root (providers, Header)
  └── app/(auth)/layout.tsx             → AuthGuard(requireAuth=false, requireOnboardingComplete=false)
        └── app/(auth)/sign-in/page.tsx
```

### Key Components

| Component   | File                          | Type   |
| ----------- | ----------------------------- | ------ |
| `LoginForm` | `features/auth/LoginForm.tsx` | Client |

### Auth Flow

1. User clicks "Sign In with GitHub"
2. BetterAuth redirects to GitHub OAuth
3. GitHub redirects back with code
4. BetterAuth creates session + user in BetterAuth user table
5. Profile created on first login (via `api.profiles.create`)
6. Redirect: if profile has `onboardingComplete` → `/explore`, else → `/onboarding`

### Convex Functions Used

- `api.profiles.getCurrent` — query, checks if profile exists and onboarding status

### Redirect Logic

- Already authenticated + onboarding complete → `/explore`
- Already authenticated + onboarding incomplete → `/onboarding`
- Not authenticated → show login form

### Auth Provider

- GitHub OAuth only
- Client ID/Secret configured via Convex env vars

### Edge Cases

- Already logged in → redirect away from sign-in
- OAuth fails → error toast
- Network error during profile check → redirect to onboarding (fail open)
