declare const process: any;

export const environment = {
    production: false,
    title: 'Local Environment Heading',
    giphyApiKey: process.env.NG_APP_GIPHY_API_KEY,
    apiUrl: process.env.NG_APP_API_URL || 'http://localhost:3000/api',
    joinSoundSrc: '../../../assets/joinSound.m4a',
    leaveSoundSrc: '../../../assets/leaveSound.m4a',
    muteSoundSrc: '../../../assets/muteSound.m4a',
    unmuteSoundSrc: '../../../assets/unmuteSound.m4a',
}