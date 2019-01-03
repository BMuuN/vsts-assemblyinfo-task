import chardet = require('chardet');
import moment = require('moment');

import models = require('../models');

export function setCopyright(model: models.AssemblyInfo, regExModel: models.RegEx): void {
    model.copyright = model.copyright.replace(regExModel.dateNew, (match: string, g1: any, g2: any): string => {
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

// export function getChardetResult(encoding: chardet.Result): string {

//     // switch(encoding) {
//     //     case '':
//     //         return 'utf8';
//     //     case '':
//     //         return 'utf-8';
//     //     case '':
//     //         return 'ucs2';
//     //     case '':
//     //         return 'ucs-2';
//     //     case '':
//     //         return 'utf16le';
//     //     case '':
//     //         return 'utf-16le';
//     //     case '':
//     //         return 'latin1';
//     //     case '':
//     //         return 'binary';
//     //     case '':
//     //         return 'base64';
//     //     case '':
//     //         return 'ascii';
//     //     case '':
//     //         return 'hex';
//     // }

//     if (!encoding) {
//         return 'utf8';
//     }

//     return encoding.toString().toLocaleLowerCase();
// }
