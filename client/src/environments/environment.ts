declare const process: any;

export const environment = {
    production: false,
    title: 'Local Environment Heading',
    giphyApiKey: process.env["GIPHY_API_KEY"]
}