import moment = require('moment');
import { LoggingLevel } from '../enums';
import * as models from '../models';

export function transformDates(value: string, regExModel: models.RegEx): string {
    return value.replace(regExModel.date, (match: string, g1: any, g2: any): string => {
        return moment().format(g1);
    });
}

export function setWildcardVersionNumber(value: string, verBuild: string, verRelease: string) {

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

export function formatFileNames(fileNames: string[]): string[] {
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

export function mapLogLevel(level: string): LoggingLevel {
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
