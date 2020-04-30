const { execSync } = require('child_process');

if (process.platform === 'linux') {
    let exitStatus;
    try {
        execSync('echo "#include <alsa/asoundlib.h>" | gcc -H -o /dev/null -x c - 2>&1 | head -n1').toString();
        exitStatus = 0;
    } catch (err) {
        exitStatus = err.status;
    }

    if (exitStatus !== 0) {
        console.error(`'alsa/asoundlib.h' is absent. For Ubuntu/Debian operating systems, install using the following command:
        \nsudo apt-get update && sudo apt-get install libasound2-dev\n`);
        process.exit(1);
    }
}
