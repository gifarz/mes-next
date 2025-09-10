export function snakeCaseFormat(str: string): string {
    return str
        .trim()
        .toLowerCase()
        .split(/\s+/) // split by spaces
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}