import fs = require('fs');
import iconv = require('iconv-lite');

export class TestUtils {

    static getLine(stdout: string, start: string): string {
        const startIndex = stdout.indexOf(start);
        const endIndex = stdout.indexOf('\n', startIndex);
        return stdout.substring(startIndex, endIndex);
    }

    static getAssemblyInfoValue(filePath: string, propertyName: string): string {

        let value = '';

        const fileContent: string = iconv.decode(fs.readFileSync(filePath), 'utf-8');

        let result = fileContent.match(new RegExp(`${propertyName}(Attribute)?\\s*\\w*\\(".*"\\)`, 'gi')) as RegExpMatchArray;

        if (!result) {
            return value;
        }

        if (result.length === 1) {
            return this.getValue(result[0]);
        }

        return this.getValue(result[result.length - 1]);
    }

    private static getValue(property: string) {
        return property.substring(property.indexOf('("') + 2, property.indexOf('")'));
    }
}
