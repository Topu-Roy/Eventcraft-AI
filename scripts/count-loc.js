/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs")
const path = require("path")

const EXCLUDED_DIRS = [
  "node_modules",
  ".next",
  "dist",
  "build",
  ".git",
  "assets",
  "components/ui",
  "convex/_generated",
  "convex/betterAuth/_generated",
  "bun.lock",
  "package-lock.json",
  "package.json",
  "tsconfig.json",
  "tsconfig.tsbuildinfo",
  "next.config.ts",
  "postcss.config.mjs",
  "eslint.config.mjs",
  "components.json",
  ".prettierrc",
  "next-env.d.ts",
  ".env.local",
  "README.md",
  ".gitignore",
  "seed.ts",
  ".opencode",
]

const INCLUDED_EXTS = [".ts", ".tsx", ".js", ".jsx"]

function shouldExclude(filePath) {
  const normalized = filePath.replace(/\\/g, "/")
  return EXCLUDED_DIRS.some(dir => {
    const d = dir.replace(/\\/g, "/")
    return (
      normalized === d || // exact match (e.g. "node_modules")
      normalized.startsWith(`${d}/`) || // top-level dir prefix (e.g. "node_modules/foo")
      normalized.includes(`/${d}/`) || // nested dir
      normalized.endsWith(`/${d}`) // nested exact match
    )
  })
}

function countLines(filePath) {
  const content = fs.readFileSync(filePath, "utf8")
  const lines = content.split("\n")
  let total = lines.length
  let blank = 0
  let comment = 0
  lines.forEach(line => {
    const trimmed = line.trim()
    if (trimmed === "") blank++
    else if (trimmed.startsWith("//") || trimmed.startsWith("/*") || trimmed.startsWith("*")) {
      comment++
    }
  })
  return { total, blank, comment, code: total - blank - comment }
}

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(file => {
    const fullPath = path.join(dir, file)
    const stat = fs.statSync(fullPath)
    if (stat.isDirectory() && !shouldExclude(fullPath)) {
      walkDir(fullPath, callback)
    } else if (stat.isFile() && !shouldExclude(fullPath)) {
      const ext = path.extname(fullPath)
      if (INCLUDED_EXTS.includes(ext)) {
        callback(fullPath)
      }
    }
  })
}

// Run
let totals = { total: 0, blank: 0, comment: 0, code: 0 }
let fileCount = 0

walkDir(".", file => {
  const counts = countLines(file)
  totals.total += counts.total
  totals.blank += counts.blank
  totals.comment += counts.comment
  totals.code += counts.code
  fileCount++
})

console.log("\n📊 Next.js + Convex LOC Report")
console.log("================================")
console.log(`Files analyzed: ${fileCount}`)
console.log(`Total lines:    ${totals.total}`)
console.log(`Code lines:     ${totals.code}`)
console.log(`Comments:       ${totals.comment}`)
console.log(`Blank lines:    ${totals.blank}`)
console.log("================================")
