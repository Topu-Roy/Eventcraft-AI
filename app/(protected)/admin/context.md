# Admin Route Context

## Route: `/admin`

### Metadata

- **Title:** Admin — EventCraft AI
- **Description:** Manage users, roles, and administrative tasks.

### Layout Chain

```
app/layout.tsx
  └── app/(protected)/layout.tsx        → AuthGuard(requireAuth=true)
        └── app/(protected)/admin/page.tsx
```

### Key Components

| Component          | File                                  | Type   |
| ------------------ | ------------------------------------- | ------ |
| `UsersTable`       | `features/admin/UsersTable.tsx`       | Client |
| `CreateUserDialog` | `features/admin/CreateUserDialog.tsx` | Client |
| `EditUserDialog`   | `features/admin/EditUserDialog.tsx`   | Client |
| `UserRowActions`   | `features/admin/UserRowActions.tsx`   | Client |

### State (Jotai)

- `pageAtom` — current page
- `searchAtom` — search query
- `limitAtom` — rows per page

### Features

- Paginated user table + search
- Create user (role selection)
- Edit user
- Delete user (confirmation)
- Role badges

### Access

- Checked via `getUserInfo` → role === "admin"
- Non-admin → redirect
