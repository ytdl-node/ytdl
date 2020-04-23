import readline from 'readline';

/**
 * Prompts with `Enter the YouTube link: ` and returns a
 * Promise which resolves with the link entered by the user.
 */
export default async function getDownloadLink(): Promise<string> {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return new Promise((resolve) => {
        rl.question('Enter the YouTube link: ', (name: string) => {
            rl.close();
            resolve(name);
        });
    });
}
