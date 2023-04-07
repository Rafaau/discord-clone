declare const process: any;

export const environment = {
    production: true,
    title: 'Local Environment Heading',
    giphyApiKey: process.env["GIPHY_API_KEY"]
}