/**
 * Helper to convert an incoming ISO date string
 * (e.g. "2025-01-21T11:00:00.000Z" or "2025-02-13")
 * into "YYYY-MM-DD" for storing in MySQL.
 */
function parseDateForMySQL(isoString) {
  if (!isoString) return null
  const dateObj = new Date(isoString)
  if (isNaN(dateObj.getTime())) {
    return null
  }
  const yyyy = dateObj.getUTCFullYear()
  const mm = String(dateObj.getUTCMonth() + 1).padStart(2, '0')
  const dd = String(dateObj.getUTCDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}` // e.g. "2025-01-21"
}
