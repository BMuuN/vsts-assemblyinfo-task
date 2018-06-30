
abstract class AssemblyInfo {
    path: string = '';
    fileNames: string[] = [];
    insertAttributes: boolean = false;
    fileEncoding: string = '';
    writeBOM: boolean = false;

    title: string = '';
    product: string = '';
    description: string = '';
    company: string = '';
    culture: string = '';

    version: string = '';
    fileVersion: string = '';
    informationalVersion: string = '';
    verBuild: string = '';
    verRelease: string = '';
}

export class NetFramework extends AssemblyInfo {
    copyright: string = '';
    trademark: string = '';
    configuration: string = '';    
}

export class NetCore extends AssemblyInfo {
    authors: string = '';
    packageLicenseUrl: string = '';
    packageProjectUrl: string = '';
    packageIconUrl: string = '';
    repositoryUrl: string = '';
    generatePackageOnBuild: string = '';
    repositoryType: string = '';
    packageTags: string = '';
    packageReleaseNotes: string = '';
}

export class RegEx {
    version: string = '\d+\.\d+\.?\d*\.?\d*';
    word: string = '.*';
    date: string = '(([\w.: +])*?)';
}