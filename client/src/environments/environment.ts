declare const process: any;

export const environment = {
    production: false,
    title: 'Local Environment Heading',
    giphyApiKey: process.env.NG_APP_GIPHY_API_KEY
}