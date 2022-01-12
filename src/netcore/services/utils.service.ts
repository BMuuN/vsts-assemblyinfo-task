import moment = require('moment');
import { LoggingLevel } from '../enums';
import * as sharedModels from '../models';

export class Utils {

    static isIgnored(value: string): boolean {
        
        if (!value) {
            return true;
        }

        return value.toLowerCase() === 'ignore';
    }

    static transformDates(value: string, regExModel: sharedModels.RegEx): string {
        return value.replace(regExModel.date, (match: string, g1: any, g2: any): string => {
            return moment().format(g1);
        });
    }
    
    static setWildcardVersionNumber(value: string, verBuild: string, verRelease: string) {
    
        if (!value || value === '') {
            return value;
        }
    
        if (value.includes('.*.*')) {
            value = value.replace('.*.*', `.${verBuild}.${verRelease}`);
        } else if (value.includes('.*')) {
            value = value.replace('.*', `.${verBuild}`);
        }
    
        return value;
    }
    
    static setVersionNumber(existingVersion: string, newVersion: string) {
    
        if (!existingVersion || existingVersion === '' || !newVersion.includes('#')) {
            return newVersion;
        }
    
        let existingVersionArray = existingVersion.split('.');
        let newVersionArray = newVersion.split('.');
    
        newVersionArray.forEach((value: string, index: number, array: string[]) => {
            if (!value.startsWith('#')) {
                existingVersionArray[index] = value;
            }
        });
    
        return existingVersionArray.join('.');
    }
    
    static formatFileNames(fileNames: string[]): string[] {
        const targetFiles: string[] = [];
        fileNames.forEach((x: string) => {
            if (x) {
                x.split(',').forEach((y: string) => {
                    if (y) {
                        targetFiles.push(y.trim());
                    }
                });
            }
        });
        return targetFiles;
    }
    
    static mapLogLevel(level: string): LoggingLevel {
        switch (level) {
            case 'normal':
                return LoggingLevel.Normal;
    
            case 'verbose':
                return LoggingLevel.Verbose;
    
            case 'off':
                return LoggingLevel.Off;
        }
    
        return LoggingLevel.Normal;
    }
}
