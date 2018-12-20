export class RegEx {
    version: RegExp = /\d+\.\d+\.?\d*\**\.?\d*\**/;
    word: string = '.*';
    dateNew: RegExp = /\$\(date:(([\w.: +])*?)\)/g;
}
