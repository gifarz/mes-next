export const replaceString = (string: string, command: RegExp): string => {
    const result = string.replace(command, "");

    return result
}