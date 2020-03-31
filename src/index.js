const getFilename = require('./getFilename');
const sendRequest = require('./sendRequest');

async function runner() {
    const filename = await getFilename();
    await sendRequest(filename);
}

runner();
