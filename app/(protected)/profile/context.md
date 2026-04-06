# Profile Route Context

## Route: `/profile`

### Metadata

- **Title:** Profile — EventCraft AI
- **Description:** Manage your account settings and preferences.

### Layout Chain

```
app/layout.tsx
  └── app/(protected)/layout.tsx        → AuthGuard(requireAuth=true)
        └── app/(protected)/profile/page.tsx
```

### Key Components

| Component        | File                               | Type   |
| ---------------- | ---------------------------------- | ------ |
| `ProfileForm`    | `features/auth/ProfileForm.tsx`    | Client |
| `PasskeyManager` | `features/auth/PasskeyManager.tsx` | Client |
| `SessionManager` | `features/auth/SessionManager.tsx` | Client |

### Features

- Edit name, avatar URL
- View email (read-only)
- Passkey management (register, delete)
- Session management (view, revoke)

### Edge Cases

- Session expired → redirect sign-in
- Update fails → toast error
- Passkey not supported → graceful message
