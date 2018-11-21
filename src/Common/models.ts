
abstract class AssemblyInfo {
    path: string = '';
    fileNames: string[] = [];
    insertAttributes: boolean = false;
    fileEncoding: string = '';
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
}

export class NetFramework extends AssemblyInfo {
    title: string = '';
    trademark: string = '';
    configuration: string = '';    
}

export class NetCore extends AssemblyInfo {
    generatePackageOnBuild: boolean = false;
    requireLicenseAcceptance: boolean = false;

    packageId: string = ''
    packageVersion: string = '';
    authors: string = '';
    licenseUrl: string = '';
    projectUrl: string = '';
    iconUrl: string = '';
    repositoryUrl: string = '';
    repositoryType: string = '';
    tags: string = '';
    releaseNotes: string = '';
}

export class RegEx {
    version: string = '\d+\.\d+\.?\d*\.?\d*';
    word: string = '.*';
    date: string = '(([\w.: +])*?)';
}