# Profile Route Context

## Route: `/profile`

### Purpose

User profile management — update name, avatar, and view account info.

### Layout Chain

```
app/layout.tsx                          → Root (providers, Header)
  └── app/(protected)/layout.tsx        → AuthGuard(requireAuth=true, requireOnboardingComplete=true)
        └── app/(protected)/profile/page.tsx
```

### Key Components

| Component        | File                               | Type   |
| ---------------- | ---------------------------------- | ------ |
| `ProfileForm`    | `features/auth/ProfileForm.tsx`    | Client |
| `PasskeyManager` | `features/auth/PasskeyManager.tsx` | Client |
| `SessionManager` | `features/auth/SessionManager.tsx` | Client |

### Convex Functions Used

- `auth.getUserInfo` — BetterAuth query, returns current user info
- `auth.updateUser` — BetterAuth mutation, updates profile fields
- `auth.listUserSessions` — BetterAuth query, active sessions
- `auth.revokeUserSessions` — BetterAuth mutation, revoke sessions
- `auth.createPasskey` / `auth.deletePasskey` — BetterAuth mutations

### Features

- Edit name and avatar URL
- View email (read-only)
- Passkey management (register, delete)
- Session management (view active sessions, revoke)

### Edge Cases

- Session expired → redirect to sign-in
- Update fails → toast error
- Passkey not supported by browser → graceful message
