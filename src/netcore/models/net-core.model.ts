import { AssemblyInfo } from './';

export class NetCore extends AssemblyInfo {
    generateDocumentationFile: boolean = false;
    generatePackageOnBuild: boolean = false;
    requireLicenseAcceptance: boolean = false;

    packageId: string = '';
    packageVersion: string = '';
    authors: string = '';
    licenseFile: string = '';
    licenseExpression: string = '';
    projectUrl: string = '';
    packageIcon: string = '';
    repositoryUrl: string = '';
    repositoryType: string = '';
    tags: string = '';
    releaseNotes: string = '';
}
