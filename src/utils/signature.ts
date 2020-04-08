/* eslint-disable no-bitwise */
// const url = require('url');
// const miniget = require('miniget');
// const querystring = require('querystring');


// A shared cache to keep track of html5player.js tokens.
exports.cache = new Map();


const jsVarStr = '[a-zA-Z_\\$][a-zA-Z_0-9]*';
const jsSingleQuoteStr = '\'[^\'\\\\]*(:?\\\\[\\s\\S][^\'\\\\]*)*\'';
const jsDoubleQuoteStr = '"[^"\\\\]*(:?\\\\[\\s\\S][^"\\\\]*)*"';
const jsQuoteStr = `(?:${jsSingleQuoteStr}|${jsDoubleQuoteStr})`;
const jsKeyStr = `(?:${jsVarStr}|${jsQuoteStr})`;
const jsPropStr = `(?:\\.${jsVarStr}|\\[${jsQuoteStr}\\])`;
const jsEmptyStr = '(?:\'\'|"")';
const reverseStr = ':function\\(a\\)\\{'
    + '(?:return )?a\\.reverse\\(\\)'
    + '\\}';
const sliceStr = ':function\\(a,b\\)\\{'
    + 'return a\\.slice\\(b\\)'
    + '\\}';
const spliceStr = ':function\\(a,b\\)\\{'
    + 'a\\.splice\\(0,b\\)'
    + '\\}';
const swapStr = ':function\\(a,b\\)\\{'
    + 'var c=a\\[0\\];a\\[0\\]=a\\[b(?:%a\\.length)?\\];a\\[b(?:%a\\.length)?\\]=c(?:;return a)?'
    + '\\}';
const actionsObjRegexp = new RegExp(
    `var (${jsVarStr})=\\{((?:(?:${
        jsKeyStr}${reverseStr}|${
        jsKeyStr}${sliceStr}|${
        jsKeyStr}${spliceStr}|${
        jsKeyStr}${swapStr
    }),?\\r?\\n?)+)\\};`,
);
const actionsFuncRegexp = new RegExp(`${`function(?: ${jsVarStr})?\\(a\\)\\{`
    + `a=a\\.split\\(${jsEmptyStr}\\);\\s*`
    + `((?:(?:a=)?${jsVarStr}`}${
    jsPropStr
}\\(a,\\d+\\);)+)`
    + `return a\\.join\\(${jsEmptyStr}\\)`
    + '\\}');
const reverseRegexp = new RegExp(`(?:^|,)(${jsKeyStr})${reverseStr}`, 'm');
const sliceRegexp = new RegExp(`(?:^|,)(${jsKeyStr})${sliceStr}`, 'm');
const spliceRegexp = new RegExp(`(?:^|,)(${jsKeyStr})${spliceStr}`, 'm');
const swapRegexp = new RegExp(`(?:^|,)(${jsKeyStr})${swapStr}`, 'm');


/**
 * Swaps the first element of an array with one of given position.
 *
 * @param {Array.<Object>} arr
 * @param {number} position
 * @return {Array.<Object>}
 */
const swapHeadAndPosition = (arr: string[], position: number) => {
    const result = arr;
    const first = result[0];
    result[0] = result[position % result.length];
    result[position] = first;
    return result;
};


/**
 * Decipher a signature based on action tokens.
 *
 * @param {Array.<string>} tokens
 * @param {string} sig
 * @return {string}
 */
export function decipher(tokens: string[], sig: string) {
    let sigChars = sig.split('');
    for (let i = 0, len = tokens.length; i < len; i += 1) {
        const token = tokens[i]; let
            pos;
        switch (token[0]) {
            case 'r':
                sigChars = sigChars.reverse();
                break;
            case 'w':
                pos = ~~token.slice(1);
                sigChars = swapHeadAndPosition(sigChars, pos);
                break;
            case 's':
                pos = ~~token.slice(1);
                sigChars = sigChars.slice(pos);
                break;
            case 'p':
                pos = ~~token.slice(1);
                sigChars.splice(0, pos);
                break;
            default: break;
        }
    }
    return sigChars.join('');
}


/**
 * Extracts the actions that should be taken to decipher a signature.
 *
 * This searches for a function that performs string manipulations on
 * the signature. We already know what the 3 possible changes to a signature
 * are in order to decipher it. There is
 *
 * * Reversing the string.
 * * Removing a number of characters from the beginning.
 * * Swapping the first character with another position.
 *
 * Note, `Array#slice()` used to be used instead of `Array#splice()`,
 * it's kept in case we encounter any older html5player files.
 *
 * After retrieving the function that does this, we can see what actions
 * it takes on a signature.
 *
 * @param {string} body
 * @return {Array.<string>}
 */
export default function extractActions(body: string) {
    const objResult = actionsObjRegexp.exec(body);
    const funcResult = actionsFuncRegexp.exec(body);
    if (!objResult || !funcResult) { return null; }

    const obj = objResult[1].replace(/\$/g, '\\$');
    const objBody = objResult[2].replace(/\$/g, '\\$');
    const funcBody = funcResult[1].replace(/\$/g, '\\$');

    let result = reverseRegexp.exec(objBody);
    const reverseKey = result && result[1]
        .replace(/\$/g, '\\$')
        .replace(/\$|^'|^"|'$|"$/g, '');
    result = sliceRegexp.exec(objBody);
    const sliceKey = result && result[1]
        .replace(/\$/g, '\\$')
        .replace(/\$|^'|^"|'$|"$/g, '');
    result = spliceRegexp.exec(objBody);
    const spliceKey = result && result[1]
        .replace(/\$/g, '\\$')
        .replace(/\$|^'|^"|'$|"$/g, '');
    result = swapRegexp.exec(objBody);
    const swapKey = result && result[1]
        .replace(/\$/g, '\\$')
        .replace(/\$|^'|^"|'$|"$/g, '');

    const keys = `(${[reverseKey, sliceKey, spliceKey, swapKey].join('|')})`;
    const myreg = `(?:a=)?${obj
    }(?:\\.${keys}|\\['${keys}'\\]|\\["${keys}"\\])`
        + '\\(a,(\\d+)\\)';
    const tokenizeRegexp = new RegExp(myreg, 'g');
    const tokens = [];

    result = tokenizeRegexp.exec(funcBody);
    while (result !== null) {
        const key = result[1] || result[2] || result[3];
        switch (key) {
            case swapKey:
                tokens.push(`w${result[4]}`);
                break;
            case reverseKey:
                tokens.push('r');
                break;
            case sliceKey:
                tokens.push(`s${result[4]}`);
                break;
            case spliceKey:
                tokens.push(`p${result[4]}`);
                break;
            default: break;
        }
        result = tokenizeRegexp.exec(funcBody);
    }
    return tokens;
}


/**
 * @param {Object} format
 * @param {string} sig
 * @param {boolean} debug
 */
// export function setDownloadURL(format, sig, debug) {
//     let decodedUrl;
//     if (format.url) {
//         decodedUrl = format.url;
//     } else {
//         if (debug) {
//             console.warn(`Download url not found for itag ${format.itag}`);
//         }
//         return;
//     }

//     try {
//         decodedUrl = decodeURIComponent(decodedUrl);
//     } catch (err) {
//         if (debug) {
//             console.warn(`Could not decode url: ${err.message}`);
//         }
//         return;
//     }

//     // Make some adjustments to the final url.
//     const parsedUrl = url.parse(decodedUrl, true);

//     // Deleting the `search` part is necessary otherwise changes to
//     // `query` won't reflect when running `url.format()`
//     delete parsedUrl.search;

//     const { query } = parsedUrl;

//     // This is needed for a speedier download.
//     // See https://github.com/fent/node-ytdl-core/issues/127
//     query.ratebypass = 'yes';
//     if (sig) {
//         // When YouTube provides a `sp` parameter the signature `sig` must go
//         // into the parameter it specifies.
//         // See https://github.com/fent/node-ytdl-core/issues/417
//         if (format.sp) {
//             query[format.sp] = sig;
//         } else {
//             query.signature = sig;
//         }
//     }

//     format.url = url.format(parsedUrl);
// }


/**
 * Applies `sig.decipher()` to all format URL's.
 *
 * @param {Array.<Object>} formats
 * @param {Array.<string>} tokens
 * @param {boolean} debug
 */
// export function decipherFormats(formats, tokens, debug) {
//     formats.forEach((format) => {
//         if (format.cipher) {
//             Object.assign(format, querystring.parse(format.cipher));
//             delete format.cipher;
//         }
//         const sig = tokens && format.s ? exports.decipher(tokens, format.s) : null;
//         exports.setDownloadURL(format, sig, debug);
//     });
// }
