export const formatHashtag = (hashtag: string) => {
    // trim spaces, remove all spaces that are next to each other, replace all space with "_"
    const trimmedHashtag = hashtag.trim().replace(/\s+/g, ' ').replace(/\s/g, '_')
    // add # to hashtag if it doesn't have
    return trimmedHashtag.startsWith('#') ? trimmedHashtag : `#${trimmedHashtag}`
}

export const formatImageArray = (images: any = undefined) => {
    if (images) {
        return images.map((image: any) => {
            // if image is a string, it means it's a url, so return it as it is
            if (typeof image === 'string') {
                return image
            } else {
                if (image.url) {
                    return image.url
                } else {
                    return image.response.result.variants[0]
                }
            }
        })
    } else {
        return []
    }
}
