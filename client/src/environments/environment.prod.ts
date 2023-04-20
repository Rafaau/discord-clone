declare const process: any;

export const environment = {
    production: true,
    title: 'Local Environment Heading',
    giphyApiKey: process.env.NG_APP_GIPHY_API_KEY,
    apiUrl: process.env.NG_APP_API_URL,
    joinSoundSrc: 'assets/joinSound.m4a',
    leaveSoundSrc: 'assets/leaveSound.m4a',
    muteSoundSrc: '.assets/muteSound.m4a',
    unmuteSoundSrc: 'assets/unmuteSound.m4a',
}