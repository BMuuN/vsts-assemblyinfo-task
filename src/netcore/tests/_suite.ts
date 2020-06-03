import * as assert from 'assert';
import * as ttm from 'azure-pipelines-task-lib/mock-test';
import * as path from 'path';
import * as testUtils from './helpers/test-utils';

describe('Net Core Task Tests', function() {

    let testDir: string = '';
    let projectDir: string = '';

    before(() => {
        // Uncomment on errors to diagnose
        // process.env['TASK_TEST_TRACE'] = '1';

        // testDir = path.join(__dirname, '../dist/tests/runners', 'success.js');
        testDir = 'C:\\DEV\\GIT\\vsts-assemblyinfo-task\\src\\netcore\\dist\\tests\\task-runners';
        projectDir = 'C:\\DEV\\GIT\\vsts-assemblyinfo-task\\tests\\projects';
    });

    after(() => {

    });

    it('should succeed and update assembly info data', (done: MochaDone) => {
        this.timeout(1000);

        const tp = path.join(testDir, 'success.js');
        const tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

        tr.run();

        console.log(tr.stdout);

        assert.equal(tr.succeeded, true, 'should have succeeded');
        assert.equal(tr.invokedToolCount, 0, 'should not invoke any tooling');
        assert.equal(tr.warningIssues.length, 0, 'should have no warnings');
        assert.equal(tr.errorIssues.length, 0, 'should have no errors');

        const netCoreLibProject = path.join(projectDir, '\\NetCoreLib\\NetCoreLib.csproj');

        const generatePackageOnBuild = testUtils.TestUtils.getAssemblyInfoValue(netCoreLibProject, 'GeneratePackageOnBuild');
        assert.equal(generatePackageOnBuild, 'true', 'GeneratePackageOnBuild is set');

        const packageRequireLicenseAcceptance = testUtils.TestUtils.getAssemblyInfoValue(netCoreLibProject, 'PackageRequireLicenseAcceptance');
        assert.equal(packageRequireLicenseAcceptance, 'true', 'PackageRequireLicenseAcceptance is set');

        const packageId = testUtils.TestUtils.getAssemblyInfoValue(netCoreLibProject, 'PackageId');
        assert.equal(packageId, 'vsts-assemblyinfo-task', 'PackageId is set');

        const version = testUtils.TestUtils.getAssemblyInfoValue(netCoreLibProject, 'Version');
        assert.equal(version, '9.8.7-beta65', 'Version is set');

        const authors = testUtils.TestUtils.getAssemblyInfoValue(netCoreLibProject, 'Authors');
        assert.equal(authors, 'Bleddyn Richards', 'Authors is set');

        const company = testUtils.TestUtils.getAssemblyInfoValue(netCoreLibProject, 'Company');
        assert.equal(company, 'Bleddyn Richards Inc', 'Company is set');

        const product = testUtils.TestUtils.getAssemblyInfoValue(netCoreLibProject, 'Product');
        assert.equal(product, 'Azure DevOps Assembly Info', 'Product is set');

        const description = testUtils.TestUtils.getAssemblyInfoValue(netCoreLibProject, 'Description');
        assert.equal(description, 'Assembly Info is an extension for Team Services that sets assembly information from a build.', 'Description is set');

        const copyright = testUtils.TestUtils.getAssemblyInfoValue(netCoreLibProject, 'Copyright');
        const copyrightResult = copyright.match(/^(Copyright © \d{4} \d{2}\.\d{2}\.\d{4} \d{2} \w+ \d{4} \d{2}:\d{2} \w+ Example Ltd)$/g) as RegExpMatchArray;
        assert.notStrictEqual(copyrightResult, null, 'Copyright field is not empty');
        assert.equal(copyrightResult.length, 1, 'Copyright is set');

        const packageLicenseUrl = testUtils.TestUtils.getAssemblyInfoValue(netCoreLibProject, 'PackageLicenseUrl');
        assert.equal(packageLicenseUrl, 'https://github.com/BMuuN/vsts-assemblyinfo-task/License.md', 'PackageLicenseUrl is set');

        const packageProjectUrl = testUtils.TestUtils.getAssemblyInfoValue(netCoreLibProject, 'PackageProjectUrl');
        assert.equal(packageProjectUrl, 'https://github.com/BMuuN/vsts-assemblyinfo-task/release', 'PackageProjectUrl is set');

        const packageIconUrl = testUtils.TestUtils.getAssemblyInfoValue(netCoreLibProject, 'PackageIconUrl');
        assert.equal(packageIconUrl, 'https://github.com/BMuuN/vsts-assemblyinfo-task/favicon.png', 'PackageIconUrl is set');

        const repositoryUrl = testUtils.TestUtils.getAssemblyInfoValue(netCoreLibProject, 'RepositoryUrl');
        assert.equal(repositoryUrl, 'https://github.com/BMuuN/vsts-assemblyinfo-task', 'RepositoryUrl is set');

        const repositoryType = testUtils.TestUtils.getAssemblyInfoValue(netCoreLibProject, 'RepositoryType');
        assert.equal(repositoryType, 'OSS for Azure Dev Ops', 'RepositoryType is set');

        const packageTags = testUtils.TestUtils.getAssemblyInfoValue(netCoreLibProject, 'PackageTags');
        assert.equal(packageTags, 'Tags, Build, Release, VSTS', 'PackageTags is set');

        const packageReleaseNotes = testUtils.TestUtils.getAssemblyInfoValue(netCoreLibProject, 'PackageReleaseNotes');
        assert.equal(packageReleaseNotes, 'The extension will recursively search the specified Source Folder for all files listed in the Source Files field and set the assembly data.', 'PackageReleaseNotes is set');

        const neutralLanguage = testUtils.TestUtils.getAssemblyInfoValue(netCoreLibProject, 'NeutralLanguage');
        assert.equal(neutralLanguage, 'en-GB', 'NeutralLanguage is set');

        const assemblyVersion = testUtils.TestUtils.getAssemblyInfoValue(netCoreLibProject, 'AssemblyVersion');
        const assemblyVersionResult = assemblyVersion.match(/^(2018\.11\.\d{4})$/g) as RegExpMatchArray;
        assert.notStrictEqual(assemblyVersionResult, null, 'AssemblyVersion field is not empty');
        assert.equal(assemblyVersionResult.length, 1, 'AssemblyVersion is set');

        const fileVersion = testUtils.TestUtils.getAssemblyInfoValue(netCoreLibProject, 'FileVersion');
        const fileVersionResult = fileVersion.match(/^(1990\.03\.\d{4}\.\d{4,5})$/g) as RegExpMatchArray;
        assert.notStrictEqual(fileVersionResult, null, 'FileVersion field is not empty');
        assert.equal(fileVersionResult.length, 1, 'FileVersion is set');

        const informationalVersion = testUtils.TestUtils.getAssemblyInfoValue(netCoreLibProject, 'InformationalVersion');
        assert.equal(informationalVersion, '2.3.4-beta5', 'InformationalVersion is set');

        done();
    });

    it('should succeed with date transforms `Copyright` field', (done: MochaDone) => {
        this.timeout(1000);

        const tp = path.join(testDir, 'success-date-transforms.js');
        const tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

        tr.run();

        assert.equal(tr.succeeded, true, 'should have succeeded');
        assert.equal(tr.invokedToolCount, 0, 'should not invoke any tooling');
        assert.equal(tr.warningIssues.length, 0, 'should have no warnings');
        assert.equal(tr.errorIssues.length, 0, 'should have no errors');

        const copyright = testUtils.TestUtils.getLine(tr.stdout, 'Copyright: Copyright © ');
        const regex = /^(Copyright: Copyright © \d{4} \d{2}\.\d{2}\.\d{4} \d{2} \w+ \d{4} \d{2}:\d{2} \w+ Example Ltd)$/g;
        const result = copyright.match(regex) as RegExpMatchArray;

        assert.notStrictEqual(result, null, 'Copyright field is not empty');
        assert.equal(result.length, 1, 'Dates not transformed for copyright field');

        done();
    });

    it('should succeed with date transforms for `Company` field', (done: MochaDone) => {
        this.timeout(1000);

        const tp = path.join(testDir, 'success-date-transforms.js');
        const tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

        tr.run();

        assert.equal(tr.succeeded, true, 'should have succeeded');
        assert.equal(tr.invokedToolCount, 0, 'should not invoke any tooling');
        assert.equal(tr.warningIssues.length, 0, 'should have no warnings');
        assert.equal(tr.errorIssues.length, 0, 'should have no errors');

        const copyright = testUtils.TestUtils.getLine(tr.stdout, 'Company: Bleddyn Richards Inc ');
        const regex = /^(Company: Bleddyn Richards Inc \d{4})$/g;
        const result = copyright.match(regex) as RegExpMatchArray;

        assert.notStrictEqual(result, null, 'Company field is not empty');
        assert.equal(result.length, 1, 'Dates not transformed for company field');

        done();
    });

    it('should succeed with date transforms for `Description` field', (done: MochaDone) => {
        this.timeout(1000);

        const tp = path.join(testDir, 'success-date-transforms.js');
        const tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

        tr.run();

        assert.equal(tr.succeeded, true, 'should have succeeded');
        assert.equal(tr.invokedToolCount, 0, 'should not invoke any tooling');
        assert.equal(tr.warningIssues.length, 0, 'should have no warnings');
        assert.equal(tr.errorIssues.length, 0, 'should have no errors');

        const copyright = testUtils.TestUtils.getLine(tr.stdout, 'Description: Assembly Info ');
        const regex = /^(Description: Assembly Info \d{4} is an extension for Azure DevOps that sets assembly information from a build.)$/g;
        const result = copyright.match(regex) as RegExpMatchArray;

        assert.notStrictEqual(result, null, 'Description field is not empty');
        assert.equal(result.length, 1, 'Dates not transformed for description field');

        done();
    });

    it('should succeed and printed input task parameters', (done: MochaDone) => {
        this.timeout(1000);

        const tp = path.join(testDir, 'success.js');
        const tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

        tr.run();

        assert.equal(tr.succeeded, true, 'should have succeeded');
        assert.equal(tr.invokedToolCount, 0, 'should not invoke any tooling');
        assert.equal(tr.warningIssues.length, 0, 'should have no warnings');
        assert.equal(tr.errorIssues.length, 0, 'should have no errors');

        // Input Parameters Printed (only in debug mode)
        assert.equal(tr.stdout.indexOf('Source folder: C:\\DEV\\GIT\\vsts-assemblyinfo-task\\tests\\projects') > 0, true, '`Source folder` input printed');
        assert.equal(tr.stdout.indexOf('Source files: **\\NetCoreLib.csproj') > 0, true, '`Source files` input printed');
        assert.equal(tr.stdout.indexOf('Insert attributes: true') > 0, true, '`Insert attributes` input printed');
        assert.equal(tr.stdout.indexOf('File encoding: auto') > 0, true, '`File encoding` input printed');
        assert.equal(tr.stdout.indexOf('Write unicode BOM: false') > 0, true, '`Write unicode BOM` input printed');
        assert.equal(tr.stdout.indexOf('Generate NuGet package on build: true') > 0, true, '`Generate NuGet package on build` input printed');
        assert.equal(tr.stdout.indexOf('Require license acceptance: true') > 0, true, '`Require license acceptance` input printed');
        assert.equal(tr.stdout.indexOf('Package id: vsts-assemblyinfo-task') > 0, true, '`Package id` input printed');
        assert.equal(tr.stdout.indexOf('Package version: 9.8.7-beta65') > 0, true, '`Package version` input printed');
        assert.equal(tr.stdout.indexOf('Authors: Bleddyn Richards') > 0, true, '`Authors` input printed');
        assert.equal(tr.stdout.indexOf('Company: Bleddyn Richards Inc') > 0, true, '`Company` input printed');
        assert.equal(tr.stdout.indexOf('Product: Azure DevOps Assembly Info') > 0, true, '`Product` input printed');
        assert.equal(tr.stdout.indexOf('Description: Assembly Info ') > 0, true, '`Description` input printed');
        assert.equal(tr.stdout.indexOf('Copyright: Copyright © ') > 0, true, '`Copyright` input printed');
        assert.equal(tr.stdout.indexOf('License Url: https://github.com/BMuuN/vsts-assemblyinfo-task/License.md') > 0, true, '`License Url` input printed');
        assert.equal(tr.stdout.indexOf('Project Url: https://github.com/BMuuN/vsts-assemblyinfo-task/release') > 0, true, '`Project Url` input printed');
        assert.equal(tr.stdout.indexOf('Icon Url: https://github.com/BMuuN/vsts-assemblyinfo-task/favicon.png') > 0, true, '`Icon Url` input printed');
        assert.equal(tr.stdout.indexOf('Repository Url: https://github.com/BMuuN/vsts-assemblyinfo-task') > 0, true, '`Repository Url` input printed');
        assert.equal(tr.stdout.indexOf('Repository type: OSS for Azure Dev Ops') > 0, true, '`Repository type` input printed');
        assert.equal(tr.stdout.indexOf('Tags: Tags, Build, Release, VSTS') > 0, true, '`Tags` input printed');
        assert.equal(tr.stdout.indexOf('Release notes: The extension will recursively search the specified Source Folder for all files listed in the Source Files field and set the assembly data.') > 0, true, '`Release notes` input printed');
        assert.equal(tr.stdout.indexOf('Assembly neutral language: en-GB') > 0, true, '`Assembly neutral language` input printed');
        assert.equal(tr.stdout.indexOf('Assembly version: 2018.11.') > 0, true, '`Assembly version` input printed');
        assert.equal(tr.stdout.indexOf('Assembly file version: 1990.03.') > 0, true, '`Assembly file version` input printed');
        assert.equal(tr.stdout.indexOf('Informational version: 2.3.4-beta5') > 0, true, '`Informational version` input printed');
        assert.equal(tr.stdout.indexOf('Log Level: verbose') > 0, true, '`Log Level` input printed');
        assert.equal(tr.stdout.indexOf('Fail on Warning: true') > 0, true, '`Fail on Warning` input printed');

        done();
    });

    it('should succeed and set output variables', (done: MochaDone) => {
        this.timeout(1000);

        const tp = path.join(testDir, 'success.js');
        const tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

        tr.run();

        assert.equal(tr.succeeded, true, 'should have succeeded');
        assert.equal(tr.invokedToolCount, 0, 'should not invoke any tooling');
        assert.equal(tr.warningIssues.length, 0, 'should have no warnings');

        assert.equal(tr.errorIssues.length, 0, 'should have no errors');
        assert.equal(tr.stdout.indexOf('##vso[task.setvariable variable=AssemblyInfo.Version;issecret=false;]2018.11.') > 0, true, 'AssemblyInfo.Version output variable set');
        assert.equal(tr.stdout.indexOf('##vso[task.setvariable variable=AssemblyInfo.FileVersion;issecret=false;]1990.03.') > 0, true, 'AssemblyInfo.FileVersion output variable set');
        assert.equal(tr.stdout.indexOf('##vso[task.setvariable variable=AssemblyInfo.InformationalVersion;issecret=false;]2.3.4-beta5') > 0, true, 'AssemblyInfo.InformationalVersion output variable set');
        assert.equal(tr.stdout.indexOf('##vso[task.setvariable variable=AssemblyInfo.PackageVersion;issecret=false;]9.8.7-beta65') > 0, true, 'PackageVersion output variable set');

        done();
    });

    it('should succeed with basic inputs', (done: MochaDone) => {
        this.timeout(1000);

        const tp = path.join(testDir, 'success.js');
        const tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

        tr.run();

        assert.equal(tr.succeeded, true, 'should have succeeded');
        assert.equal(tr.invokedToolCount, 0, 'should not invoke any tooling');
        assert.equal(tr.warningIssues.length, 0, 'should have no warnings');
        assert.equal(tr.errorIssues.length, 0, 'should have no errors');

        // Start of the file path will differ on each dev machine and build server
        // assert.equal(tr.stdout.indexOf('Processing: C:\\DEV\\GIT\\vsts-assemblyinfo-task\\tests\\projects\\NetCoreLib\\NetCoreLib.csproj') >= 0, true, '');

        assert.equal(tr.stdout.indexOf('Detected file encoding: iso-8859-2') > 0, true, 'File encoding detected');
        assert.equal(tr.stdout.indexOf('Verify file encoding: iso-8859-2') > 0, true, 'File encoding verified');

        assert.equal(tr.stdout.indexOf('GeneratePackageOnBuild --> true') > 0, true, 'GeneratePackageOnBuild is set');
        assert.equal(tr.stdout.indexOf('PackageRequireLicenseAcceptance --> true') > 0, true, 'PackageRequireLicenseAcceptance is set');
        assert.equal(tr.stdout.indexOf('PackageId --> vsts-assemblyinfo-task') > 0, true, 'PackageId is set');
        assert.equal(tr.stdout.indexOf('Version --> 9.8.7-beta65') > 0, true, 'Version is set');
        assert.equal(tr.stdout.indexOf('Authors --> Bleddyn Richards') > 0, true, 'Authors is set');
        assert.equal(tr.stdout.indexOf('Company --> Bleddyn Richards Inc') > 0, true, 'Company is set');
        assert.equal(tr.stdout.indexOf('Product --> Azure DevOps Assembly Info') > 0, true, 'Product is set');
        assert.equal(tr.stdout.indexOf('Description --> Assembly Info is an extension for Team Services that sets assembly information from a build.') > 0, true, 'Description is set');
        assert.equal(tr.stdout.indexOf('Copyright --> Copyright © 2020') > 0, true, 'Copyright is set');
        assert.equal(tr.stdout.indexOf('PackageLicenseUrl --> https://github.com/BMuuN/vsts-assemblyinfo-task/License.md') > 0, true, 'PackageLicenseUrl is set');
        assert.equal(tr.stdout.indexOf('PackageProjectUrl --> https://github.com/BMuuN/vsts-assemblyinfo-task/release') > 0, true, 'PackageProjectUrl is set');
        assert.equal(tr.stdout.indexOf('PackageIconUrl --> https://github.com/BMuuN/vsts-assemblyinfo-task/favicon.png') > 0, true, 'PackageIconUrl is set');
        assert.equal(tr.stdout.indexOf('RepositoryUrl --> https://github.com/BMuuN/vsts-assemblyinfo-task') > 0, true, 'RepositoryUrl is set');
        assert.equal(tr.stdout.indexOf('RepositoryType --> OSS for Azure Dev Ops') > 0, true, 'RepositoryType is set');
        assert.equal(tr.stdout.indexOf('PackageTags --> Tags, Build, Release, VSTS') > 0, true, 'PackageTags is set');
        assert.equal(tr.stdout.indexOf('PackageReleaseNotes --> The extension will recursively search the specified Source Folder for all files listed in the Source Files field and set the assembly data.') > 0, true, 'PackageReleaseNotes is set');
        assert.equal(tr.stdout.indexOf('NeutralLanguage --> en-GB') > 0, true, 'NeutralLanguage is set');
        assert.equal(tr.stdout.indexOf('AssemblyVersion --> 2018.11.') > 0, true, 'AssemblyVersion is set');
        assert.equal(tr.stdout.indexOf('FileVersion --> 1990.03.') > 0, true, 'FileVersion is set');
        assert.equal(tr.stdout.indexOf('InformationalVersion --> 2.3.4-beta5') > 0, true, 'InformationalVersion is set');

        done();
    });

    // it('should fail on warning', (done: MochaDone) => {
    //     this.timeout(1000);

    //     // const tp = path.join(__dirname, 'failure.js');
    //     const tp = path.join('c:\\DEV\\GIT\\vsts-assemblyinfo-task\\src\\netcore\\dist\\tests', 'failure.js');
    //     const tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

    //     tr.run();
    //     assert.equal(tr.succeeded, false, 'should have failed');
    //     // assert.equal(tr.invokedToolCount, 1);
    //     assert.equal(tr.warningIssues, 0, 'should have no warnings');
    //     assert.equal(tr.errorIssues.length, 1, 'should have 1 error issue');
    //     assert.equal(tr.errorIssues[0], 'File is not .csproj or .vbproj', 'error issue output');

    //     // if (process.platform === 'win32') {
    //     //     assert.equal(tr.errorIssues[0], '/mocked/tools/cmd failed with return code: 1', 'error issue output');
    //     // }
    //     // else {
    //     //     assert.equal(tr.errorIssues[0], '/mocked/tools/echo failed with return code: 1', 'error issue output');
    //     // }

    //     // assert(tr.stdout.indexOf('atool output here') >= 0, 'tool stdout');
    //     // assert.equal(tr.stdout.indexOf('Hello Mock!'), -1, 'task module should have never been called');
    //     assert.equal(tr.stdout.indexOf('Hello bad'), -1, 'Should not display Hello bad');

    //     done();
    // });

    // TODO: This is not failiog instantly
    it('should fail instantly on warning file not csproj or vbproj', (done: MochaDone) => {
        this.timeout(1000);

        const tp = path.join(testDir, 'failure.js');
        const tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

        tr.run();

        assert.equal(tr.succeeded, false, 'should have failed');
        assert.equal(tr.warningIssues, 0, 'should have no warnings');
        assert.equal(tr.errorIssues.length, 1, 'should have 1 error issue');
        assert.equal(tr.errorIssues[0], 'File is not .csproj or .vbproj', 'file is not csproj or vbproj');

        done();
    });
});
