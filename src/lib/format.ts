// "tank_storage_terminal" -> "Tank Storage Terminal"
export function formatBusinessUnitName(name: string) {
  return name
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}
