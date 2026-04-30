"use client"

import { api } from "@/convex/_generated/api"
import { useQuery } from "convex/react"
import { useRouter, useSearchParams } from "next/navigation"

export function CategoryTabs() {
  const categories = useQuery(api.categories.list)
  const router = useRouter()
  const searchParams = useSearchParams()
  const activeCategory = searchParams.get("category") ?? ""

  function selectCategory(slug: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (slug) {
      params.set("category", slug)
    } else {
      params.delete("category")
    }
    router.push(`?${params.toString()}`, { scroll: false })
  }

  if (!categories?.length) return null

  return (
    <div className="space-y-4">
      <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-2">
        <button
          type="button"
          onClick={() => selectCategory("")}
          className="min-h-9 shrink-0 rounded-full border bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent"
        >
          All
        </button>
        {categories.map((cat: { _id: string; slug: string; name: string }) => (
          <button
            key={cat._id}
            type="button"
            onClick={() => selectCategory(cat.slug)}
            className={`min-h-9 shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
              activeCategory === cat.slug
                ? "border-primary bg-primary text-primary-foreground"
                : "bg-background hover:bg-accent"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>
    </div>
  )
}
