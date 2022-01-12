import { AssemblyInfo } from './';

export class NetCore extends AssemblyInfo {
    generateDocumentationFile: string = '';
    generatePackageOnBuild: string = '';
    requireLicenseAcceptance: string = '';

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
