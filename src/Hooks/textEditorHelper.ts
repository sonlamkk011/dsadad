export const removeAllTags = (value: any) => {
    return value?.replace(/<[^>]*>/g, '')
}