export class ReplaceResult {
    fileContent: string = '';
    value: string = '';

    constructor(fileContent: string, value: string) {
        this.fileContent = fileContent;
        this.value = value;
    }
}