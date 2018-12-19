export class RegEx {
    version: string = '\d+\.\d+\.?\d*\.?\d*';
    word: string = '.*';
    dateNew: RegExp = /\$\(date:(([\w.: +])*?)\)/g;
}
