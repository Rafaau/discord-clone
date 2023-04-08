declare const process: any;

export const environment = {
    production: true,
    title: 'Local Environment Heading',
    giphyApiKey: process.env.NG_APP_GIPHY_API_KEY,
    apiUrl: process.env.NG_APP_API_URL
}