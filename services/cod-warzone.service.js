const axios = require('axios');

const URL_RAPID_API_WARZONE = 'https://call-of-duty-modern-warfare.p.rapidapi.com/warzone';
const XRapidApiKey = 'a2a1c1ca91mshabfb09e57a24fb8p1e5f1ajsn7e05e5c6591b';
const XRapidApiHost = 'call-of-duty-modern-warfare.p.rapidapi.com';

const battleRoyaleInformation = async (userTag, platform) => {
    const url = `${URL_RAPID_API_WARZONE}/${userTag}/${platform}`.replace('#', '%23');
    const config = {
        method: 'get',
        url: url,
        headers: {
            'X-RapidApi-Key': XRapidApiKey,
            'X-RapidApi-Host': XRapidApiHost,
        }
    }

    return axios(config);
}

const codWarzoneService = {
    battleRoyaleInformation,
}

module.exports = codWarzoneService