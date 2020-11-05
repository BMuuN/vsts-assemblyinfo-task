export abstract class AssemblyInfo {
    path: string = '';
    fileNames: string[] = [];
    insertAttributes: boolean = false;
    fileEncoding: string = '';
    detectedFileEncoding: string = '';
    writeBOM: boolean = false;

    product: string = '';
    description: string = '';
    company: string = '';
    copyright: string = '';
    culture: string = '';

    version: string = '';
    fileVersion: string = '';
    informationalVersion: string = '';
    verBuild: string = '';
    verRelease: string = '';

    logLevel: string = '';
    failOnWarning: boolean = false;
    ignoreNetFrameworkProjects: boolean = false;

    buildTag: string = '';
    buildNumber: string = '';
}
