import { useQuery } from "@tanstack/react-query"
import { authClient } from "@/lib/auth-client"

export function useListCurrentSessionQuery() {
  return useQuery({
    queryKey: ["current-session"],
    queryFn: () => authClient.getSession(),
  })
}

export function useListAllSessionsQuery() {
  return useQuery({
    queryKey: ["sessions"],
    queryFn: () => authClient.listSessions(),
  })
}

export function useListPaginatedUsersQuery({
  limit,
  page,
  search,
}: {
  limit: number
  page: number
  search: string
}) {
  return useQuery({
    queryKey: ["users", limit, page, search],
    queryFn: () =>
      authClient.admin.listUsers({
        query: {
          limit,
          offset: (page - 1) * limit,
          searchField: "email",
          searchValue: search,
        },
      }),
  })
}
