export default function between(data: string, left: string, right: string): string {
    let modifiedData = data;

    let pos = modifiedData.indexOf(left);
    if (pos === -1) { return ''; }
    modifiedData = modifiedData.slice(pos + left.length);

    pos = modifiedData.indexOf(right);
    if (pos === -1) { return ''; }
    modifiedData = modifiedData.slice(0, pos);

    return modifiedData;
}
