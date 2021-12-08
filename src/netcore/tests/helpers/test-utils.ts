import fs = require('fs');
import iconv = require('iconv-lite');
import xml2js = require('xml2js');

export class TestUtils {

    static getLine(stdout: string, start: string): string {
        const startIndex = stdout.indexOf(start);
        const endIndex = stdout.indexOf('\n', startIndex);
        return stdout.substring(startIndex, endIndex);
    }

    static getAssemblyInfoValue(filePath: string, propName: string): string {

        let value = '';

        const fileContent: string = iconv.decode(fs.readFileSync(filePath), 'utf-8');

        const parser = new xml2js.Parser();
        parser.parseString(fileContent, (err: any, result: any) => {

            for (const group of result.Project.PropertyGroup) {

                if (!group.TargetFramework && !group.TargetFrameworks) {
                    continue;
                }

                const propValue = Reflect.get(group, propName) as string[];

                if (propValue && propValue.length > 0) {
                    value = propValue[0];
                    break;
                }
            }
        });

        return value;
    }
}
