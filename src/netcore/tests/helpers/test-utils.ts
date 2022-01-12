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

        let _value = '';
        const fileContent: string = iconv.decode(fs.readFileSync(filePath), 'utf-8');
        const parser = new xml2js.Parser();
        
        parser.parseString(fileContent, (err: any, result: any) => {

            let group = this.getPropertyGroup(result.Project.PropertyGroup, propName);
            const propValue = Reflect.get(group, propName) as string[];

            if (propValue && propValue.length > 0) {
                _value = propValue[0];
            }
        });

        return _value;
    }

    static elementExists(filePath: string, propName: string): boolean {

        let _value = false;
        const fileContent: string = iconv.decode(fs.readFileSync(filePath), 'utf-8');
        const parser = new xml2js.Parser();
        
        parser.parseString(fileContent, (err: any, result: any) => {

            let group = this.getPropertyGroup(result.Project.PropertyGroup, propName);
            const propValue = Reflect.get(group, propName) as string[];

            if (propValue && propValue.length > 0) {
                _value = true;
            }
        });

        return _value;
    }

    private static getPropertyGroup(propertyGroups: any, name: string): any {
        for (const group of propertyGroups) {
            let keys = Object.keys(group);
            for (const key of keys) {
                if (key.toLowerCase() === name.toLowerCase()) {
                    return group;
                } 
            }
        }
    
        return propertyGroups[0];
    }
}
