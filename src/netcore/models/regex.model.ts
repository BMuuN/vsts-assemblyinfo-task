export class RegEx {
    version: RegExp = /\d+\.\d+\.?\d*\**\.?\d*\**/;
    word: string = '.*';
    date: RegExp = /\$\(date:(([\w.: +])*?)\)/g;
}
