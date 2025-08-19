export function getRandomNumber(num: number): number {
    return Math.floor(Math.random() * num)
}

export function getRandomIndex<T>(arr: T[]): number {
    return Math.floor(Math.random() * arr.length)
}

export function getRandomItem<T>(arr: T[]): T | undefined {
    if (arr.length === 0) return undefined
    return arr[getRandomIndex(arr)]
}