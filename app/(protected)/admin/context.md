# Admin Route Context

## Route: `/admin`

### Purpose

Admin panel for user management. Protected by BetterAuth admin role.

### Layout Chain

```
app/layout.tsx                          → Root (providers, Header)
  └── app/(protected)/layout.tsx        → AuthGuard(requireAuth=true, requireOnboardingComplete=true)
        └── app/(protected)/admin/page.tsx
```

### Key Components

| Component          | File                                  | Type   |
| ------------------ | ------------------------------------- | ------ |
| `UsersTable`       | `features/admin/UsersTable.tsx`       | Client |
| `CreateUserDialog` | `features/admin/CreateUserDialog.tsx` | Client |
| `EditUserDialog`   | `features/admin/EditUserDialog.tsx`   | Client |
| `UserRowActions`   | `features/admin/UserRowActions.tsx`   | Client |

### State Management (Jotai Atoms)

- `pageAtom` — current page number
- `searchAtom` — search query
- `limitAtom` — rows per page

### Convex Functions Used

- `auth.getUserInfo` — BetterAuth query, returns user with role
- `auth.listPaginatedUsers` — BetterAuth query, paginated user list
- `auth.createUser` — BetterAuth mutation, creates user with role
- `auth.updateUser` — BetterAuth mutation, updates user fields
- `auth.deleteUser` — BetterAuth mutation, deletes user

### Admin Access

- Checked via `getUserInfo` — `user.role === "admin"`
- Non-admin users are redirected away in layout

### Features

- Paginated user table with search
- Create user dialog with role selection
- Edit user dialog
- Delete user with confirmation
- Role badges (admin, user)

### Edge Cases

- No admin access → redirect
- Search returns no results → empty state
- Network error → error toast
- Delete self → prevented
