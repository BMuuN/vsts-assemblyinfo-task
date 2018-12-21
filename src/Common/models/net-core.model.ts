import { AssemblyInfo } from './assembly-info.model';

export class NetCore extends AssemblyInfo {
    generatePackageOnBuild: boolean = false;
    requireLicenseAcceptance: boolean = false;

    packageId: string = '';
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
