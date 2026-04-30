import { mutation, query } from "./_generated/server"
import { authComponent } from "./betterAuth/auth"

const DEFAULT_CATEGORIES = [
  { name: "Technology", slug: "technology", iconName: "cpu", colorToken: "blue" },
  { name: "Music", slug: "music", iconName: "music", colorToken: "purple" },
  { name: "Art & Design", slug: "art-design", iconName: "palette", colorToken: "pink" },
  { name: "Sports", slug: "sports", iconName: "trophy", colorToken: "orange" },
  { name: "Food & Drink", slug: "food-drink", iconName: "utensils", colorToken: "amber" },
  { name: "Business", slug: "business", iconName: "briefcase", colorToken: "slate" },
  { name: "Health & Wellness", slug: "health-wellness", iconName: "heart", colorToken: "green" },
  { name: "Education", slug: "education", iconName: "book-open", colorToken: "indigo" },
  { name: "Social & Community", slug: "social-community", iconName: "users", colorToken: "teal" },
  { name: "Gaming", slug: "gaming", iconName: "gamepad-2", colorToken: "violet" },
]

const CITIES = [
  { name: "San Francisco", country: "USA", lat: 37.7749, lng: -122.4194 },
  { name: "New York", country: "USA", lat: 40.7128, lng: -74.006 },
  { name: "London", country: "UK", lat: 51.5074, lng: -0.1278 },
  { name: "Berlin", country: "Germany", lat: 52.52, lng: 13.405 },
  { name: "Tokyo", country: "Japan", lat: 35.6762, lng: 139.6503 },
]

const EVENT_TITLES: Record<string, string[]> = {
  technology: [
    "AI & Machine Learning Summit",
    "Tech Startup Mixer",
    "Web3 Developer Conference",
    "Cloud Computing Workshop",
    "Cybersecurity Bootcamp",
    "DevOps Days",
    "React & Next.js Meetup",
    "Tech Talk: Future of Tech",
    "Hackathon Championship",
    "Software Architecture Design",
  ],
  music: [
    "Jazz Night Live",
    "Electronic Music Festival",
    "Acoustic Sessions",
    "Music Production Workshop",
    "Open Mic Evening",
    "Classical Concert Series",
    "Indie Band Showcase",
    "DJ Masterclass",
    "Music Industry Panel",
    "Sound Engineering Basics",
  ],
  "art-design": [
    "Contemporary Art Exhibition",
    "UI/UX Design Workshop",
    "Graphic Design Summit",
    "Digital Art Showcase",
    "Photography Walk",
    "Pottery Class",
    "Illustration Masterclass",
    "Design Systems Talk",
    "Street Art Festival",
    "Fine Art Auction Preview",
  ],
  sports: [
    "Marathon Training Run",
    "Yoga in the Park",
    "Basketball Tournament",
    "Tennis Open",
    "CrossFit Challenge",
    "Soccer Friendly",
    "Rock Climbing Meetup",
    "Pilates Class",
    "Sports Recovery Workshop",
    "Ultimate Frisbee",
  ],
  "food-drink": [
    "Wine Tasting Evening",
    "Food Truck Festival",
    "Cooking Class: Italian",
    "Craft Beer Tour",
    "Street Food Market",
    "Sushi Making Workshop",
    "Coffee Brewing 101",
    "Pastry Masterclass",
    "Vineyard Tour",
    "Food Photography Walk",
  ],
  business: [
    "Startup Pitch Night",
    "Business Networking Mixer",
    "Leadership Summit",
    "Entrepreneur Workshop",
    "Marketing Strategy Talk",
    "VC Panel Discussion",
    "Sales Training",
    "Business Book Club",
    "Founders Dinner",
    "Investor Office Hours",
  ],
  "health-wellness": [
    "Meditation Retreat",
    "Wellness Expo",
    "Nutrition Workshop",
    "Mental Health Panel",
    "Holistic Health Fair",
    "Sleep Optimization Talk",
    "Wellness Coaching Session",
    "Stress Management Workshop",
    "Biohacking Meetup",
    "Mental Clarity Session",
  ],
  education: [
    "Tech Education Fair",
    "Language Exchange",
    "Coding Bootcamp Info",
    "Science Lecture Series",
    "Book Reading Club",
    "History Walk",
    "Philosophy Discussion",
    "Mathematics Workshop",
    "Research Symposium",
    "Lifelong Learning Expo",
  ],
  "social-community": [
    "Community Potluck",
    "Volunteer Day",
    "Neighborhood Meetup",
    "Cultural Festival",
    "Game Night",
    "Trivia Evening",
    "Singles Mingle",
    "Pet Owners Meetup",
    "Parents Support Group",
    "Friendship Circle",
  ],
  gaming: [
    "Gaming Tournament",
    "Board Game Night",
    "Esports Viewing Party",
    "VR Gaming Session",
    "Retro Gaming Club",
    "Game Dev Workshop",
    "Streaming Community Meetup",
    "Gaming Hardware Setup",
    "Speedrun Challenge",
    "Gaming Quiz Night",
  ],
}

const VENUES: Record<string, string[]> = {
  "San Francisco": [
    "The Midway",
    "Fort Mason Center",
    "The Exploratorium",
    "SF Arts Commission",
    "Public Library",
  ],
  "New York": ["Brooklyn Navy Yard", "The Meatpacking District", "Chelsea Market", "The Shed", "Prospect Park"],
  London: ["The O2", "Barbican Centre", "Tate Modern", "Brixton Academy", "Royal Festival Hall"],
  Berlin: ["Berghain", "Teufelsberg", "Kreuzberg", "Tempodrom", "Mercedes-Benz Arena"],
  Tokyo: ["Shibuya Sky", "TeamLab Planets", "Roppongi Hills", "Daikanyama", "Harajuku"],
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function generateSeedEvents() {
  const count = 1000
  const events: {
    organizerId: string
    title: string
    description: string
    category: string
    tags: string[]
    coverPhoto: undefined
    status: "published"
    venue: { name: string; address: string; city: string; country: string; lat: number; lng: number }
    startDatetime: number
    endDatetime: number
    capacity: number
    registrationCount: number
    isFeatured: boolean
    coOrganizers: unknown[]
    searchableText: string
    isSeed: true
  }[] = []

  let eventId = 0
  const eventsPerCategory = Math.floor(count / DEFAULT_CATEGORIES.length)

  for (const category of DEFAULT_CATEGORIES) {
    const titles = EVENT_TITLES[category.slug] || EVENT_TITLES.technology

    for (let i = 0; i < eventsPerCategory; i++) {
      const city = randomItem(CITIES)
      const venueName = randomItem(VENUES[city.name] || ["Community Center"])
      const title = `${randomItem(titles)} ${eventId + 1}`

      const now = Date.now()
      const daysAhead = randomInt(1, 180)
      const startHour = randomInt(9, 20)
      const startMinutes = randomInt(0, 3) * 15

      const startOfDay = new Date(now + daysAhead * 24 * 60 * 60 * 1000)
      startOfDay.setHours(startHour, startMinutes, 0, 0)

      const duration = randomInt(2, 6)
      const endOfDay = new Date(startOfDay.getTime() + duration * 60 * 60 * 1000)

      const tags = [category.slug, "community", "meetup", city.name.toLowerCase()]

      events.push({
        organizerId: "",
        title,
        description: `Join us for ${title.toLowerCase()}! This is a community event organized for ${category.name.toLowerCase()} enthusiasts. Connect with like-minded people, learn new skills, and have a great time. All skill levels welcome. Refreshments provided.`,
        category: category.slug,
        tags,
        coverPhoto: undefined,
        status: "published",
        venue: {
          name: venueName,
          address: `${randomInt(100, 999)} ${city.name} Street`,
          city: city.name,
          country: city.country,
          lat: city.lat + (Math.random() - 0.5) * 0.1,
          lng: city.lng + (Math.random() - 0.5) * 0.1,
        },
        startDatetime: startOfDay.getTime(),
        endDatetime: endOfDay.getTime(),
        capacity: randomInt(20, 200),
        registrationCount: 0,
        isFeatured: false,
        coOrganizers: [] as never[],
        searchableText: `${title} ${tags.join(" ")}`.toLowerCase(),
        isSeed: true,
      })
      eventId++
    }
  }

  return events
}

export const seedCategories = mutation({
  args: {},
  handler: async ctx => {
    const baUser = await authComponent.getAuthUser(ctx)
    if (baUser.role !== "admin") return { error: true, cause: "Admin access required" as const, data: null }

    const existing = await ctx.db.query("categories").collect()
    if (existing.length > 0) {
      return { error: null, cause: null, data: { skipped: existing.length, message: "Categories already exist" } }
    }

    let created = 0
    for (const cat of DEFAULT_CATEGORIES) {
      await ctx.db.insert("categories", { ...cat })
      created++
    }

    return { error: null, cause: null, data: { created, message: `Seeded ${created} categories` } }
  },
})

export const seedEvents = mutation({
  args: {},
  handler: async ctx => {
    const baUser = await authComponent.getAuthUser(ctx)
    if (baUser.role !== "admin") return { error: true, cause: "Admin access required" as const, data: null }

    const seedEvents = await ctx.db
      .query("events")
      .withIndex("by_isSeed", q => q.eq("isSeed", true))
      .collect()

    if (seedEvents.length > 0) {
      return { error: null, cause: null, data: { skipped: seedEvents.length, message: "Events already seeded" } }
    }

    const profiles = await ctx.db.query("profile").collect()
    if (profiles.length === 0) {
      return { error: true, cause: "No profiles found" as const, data: null }
    }

    const organizer = profiles[0]
    const eventsToSeed = generateSeedEvents()

    let created = 0
    for (const event of eventsToSeed) {
      const eventId = await ctx.db.insert("events", {
        ...event,
        organizerId: organizer._id,
        coOrganizers: event.coOrganizers as never[],
      } as never)
      await ctx.db.insert("eventAnalytics", {
        eventId,
        dailyCounts: {},
        totalRegistrations: 0,
        totalCheckedIn: 0,
      })
      created++
    }

    return { error: null, cause: null, data: { created, message: `Seeded ${created} events` } }
  },
})

export const clearSeedData = mutation({
  args: {},
  handler: async ctx => {
    const baUser = await authComponent.getAuthUser(ctx as never)
    if (baUser.role !== "admin") return { error: true, cause: "Admin access required" as const, data: null }

    const seedEvents = await ctx.db
      .query("events")
      .withIndex("by_isSeed", q => q.eq("isSeed", true))
      .collect()

    for (const event of seedEvents) {
      const analytics = await ctx.db
        .query("eventAnalytics")
        .withIndex("by_event", q => q.eq("eventId", event._id))
        .first()
      if (analytics) {
        await ctx.db.delete("eventAnalytics", analytics._id)
      }
      await ctx.db.delete("events", event._id)
    }

    return {
      error: null,
      cause: null,
      data: {
        deleted: {
          events: seedEvents.length,
        },
      },
    }
  },
})

export const getSeedStatus = query({
  args: {},
  handler: async ctx => {
    const seedEvents = await ctx.db
      .query("events")
      .withIndex("by_isSeed", q => q.eq("isSeed", true))
      .collect()

    return {
      eventsSeeded: seedEvents.length,
      hasSeedData: seedEvents.length > 0,
    }
  },
})

export const isAdmin = query({
  args: {},
  handler: async (ctx): Promise<boolean> => {
    try {
      const baUser = await authComponent.getAuthUser(ctx as never)
      return baUser.role === "admin"
    } catch {
      return false
    }
  },
})
