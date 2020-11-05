import * as assert from 'assert';
import * as ttm from 'azure-pipelines-task-lib/mock-test';
import * as path from 'path';
import * as testUtils from './helpers/test-utils';

describe('Net Core Task Tests', function() {

    const TestRegEx = {
        // copyright: /^(Copyright: Copyright © \d{4} \d{2}\.\d{2}\.\d{4} \d{2} \w+ \d{4} \d{2}:\d{2} \w+ Example Ltd)$/g,
        // company: /^(Company: Bleddyn Richards Inc \d{4})$/g,
        // description: /^(Description: Assembly Info \d{4} is an extension for Azure DevOps that sets assembly information from a build.)$/g,

        assemblyVersion: /^(2018\.11\.\d{4}(.\d{1,5})?)$/g,
        fileVersion: /^(1990\.03\.\d{4}\.\d{1,5})$/g,
        informationalVersion: /^(\d{1}\.\d{4}\.\d{1,5}-beta5)/g,
        packageVersion: /^(\d{1}\.\d{4}\.\d{1,5}-beta65)/g,
    };

    let testDir: string = '';
    let projectDir: string = '';

    before(() => {
        // Uncomment on errors to diagnose
        // process.env['TASK_TEST_TRACE'] = '1';

        testDir = path.join(__dirname, '..\\dist\\tests\\task-runners');
        console.log(`Test Dir:  ${testDir}`);

        projectDir = path.join(__dirname, '..\\..\\..\\tests\\projects');
        console.log(`Project Dir:  ${projectDir}`);
    });

    after(() => {

    });

    it('should succeed with version number wildcard', (done: MochaDone) => {
        this.timeout(1000);

        const tp = path.join(testDir, 'success-version-wildcard.js');
        const tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

        tr.run();

        // console.log(tr.stdout);

        assert.equal(tr.succeeded, true, 'should have succeeded');
        assert.equal(tr.invokedToolCount, 0, 'should not invoke any tooling');
        assert.equal(tr.warningIssues.length, 0, 'should have no warnings');
        assert.equal(tr.errorIssues.length, 0, 'should have no errors');

        const netCoreLibProject = path.join(projectDir, '\\NetCoreLib\\NetCoreLib.csproj');

        const assemblyVersion = testUtils.TestUtils.getAssemblyInfoValue(netCoreLibProject, 'AssemblyVersion');
        const assemblyVersionResult = assemblyVersion.match(TestRegEx.assemblyVersion) as RegExpMatchArray;
        assert.notStrictEqual(assemblyVersionResult, null, 'AssemblyVersion field is not empty');
        assert.equal(assemblyVersionResult.length, 1, 'AssemblyVersion is set');

        const fileVersion = testUtils.TestUtils.getAssemblyInfoValue(netCoreLibProject, 'FileVersion');
        const fileVersionResult = fileVersion.match(TestRegEx.fileVersion) as RegExpMatchArray;
        assert.notStrictEqual(fileVersionResult, null, 'FileVersion field is not empty');
        assert.equal(fileVersionResult.length, 1, 'FileVersion is set');

        const informationalVersion = testUtils.TestUtils.getAssemblyInfoValue(netCoreLibProject, 'InformationalVersion');
        const informationalVersionResult = informationalVersion.match(TestRegEx.informationalVersion) as RegExpMatchArray;
        assert.notStrictEqual(informationalVersionResult, null, 'InformationalVersion field is not empty');
        assert.equal(informationalVersionResult.length, 1, 'InformationalVersion is set');

        const version = testUtils.TestUtils.getAssemblyInfoValue(netCoreLibProject, 'Version');
        const versionResult = version.match(TestRegEx.packageVersion) as RegExpMatchArray;
        assert.notStrictEqual(versionResult, null, 'Version field is not empty');
        assert.equal(versionResult.length, 1, 'Version is set');

        done();
    });

    it('should succeed and update assembly info data', (done: MochaDone) => {
        this.timeout(1000);

        const tp = path.join(testDir, 'success-file-utf8.js');
        const tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

        tr.run();

        // console.log(tr.stdout);

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
        // const assemblyVersionResult = assemblyVersion.match(/^(2018\.11\.\d{4})$/g) as RegExpMatchArray;
        const assemblyVersionResult = assemblyVersion.match(TestRegEx.assemblyVersion) as RegExpMatchArray;
        assert.notStrictEqual(assemblyVersionResult, null, 'AssemblyVersion field is not empty');
        assert.equal(assemblyVersionResult.length, 1, 'AssemblyVersion is set');

        const fileVersion = testUtils.TestUtils.getAssemblyInfoValue(netCoreLibProject, 'FileVersion');
        // const fileVersionResult = fileVersion.match(/^(1990\.03\.\d{4}\.\d{4,5})$/g) as RegExpMatchArray;
        const fileVersionResult = fileVersion.match(TestRegEx.fileVersion) as RegExpMatchArray;
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

    it('should succeed and print input task parameters', (done: MochaDone) => {
        this.timeout(1000);

        const tp = path.join(testDir, 'success.js');
        const tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

        tr.run();

        assert.equal(tr.succeeded, true, 'should have succeeded');
        assert.equal(tr.invokedToolCount, 0, 'should not invoke any tooling');
        assert.equal(tr.warningIssues.length, 0, 'should have no warnings');
        assert.equal(tr.errorIssues.length, 0, 'should have no errors');

        // Input Parameters Printed (only in debug mode)
        assert.equal(tr.stdout.indexOf('Source folder: C:\\DEV\\GIT\\vsts-assemblyinfo-task\\tests\\projects') > -1, true, '`Source folder` input printed');
        assert.equal(tr.stdout.indexOf('Source files: **\\NetCoreLib.csproj') > -1, true, '`Source files` input printed');
        assert.equal(tr.stdout.indexOf('Insert attributes: true') > -1, true, '`Insert attributes` input printed');
        assert.equal(tr.stdout.indexOf('File encoding: auto') > -1, true, '`File encoding` input printed');
        assert.equal(tr.stdout.indexOf('Write unicode BOM: false') > -1, true, '`Write unicode BOM` input printed');
        assert.equal(tr.stdout.indexOf('Generate NuGet package on build: true') > -1, true, '`Generate NuGet package on build` input printed');
        assert.equal(tr.stdout.indexOf('Require license acceptance: true') > -1, true, '`Require license acceptance` input printed');
        assert.equal(tr.stdout.indexOf('Package id: vsts-assemblyinfo-task') > -1, true, '`Package id` input printed');
        assert.equal(tr.stdout.indexOf('Package version: 9.8.7-beta65') > -1, true, '`Package version` input printed');
        assert.equal(tr.stdout.indexOf('Authors: Bleddyn Richards') > -1, true, '`Authors` input printed');
        assert.equal(tr.stdout.indexOf('Company: Bleddyn Richards Inc') > -1, true, '`Company` input printed');
        assert.equal(tr.stdout.indexOf('Product: Azure DevOps Assembly Info') > -1, true, '`Product` input printed');
        assert.equal(tr.stdout.indexOf('Description: Assembly Info ') > -1, true, '`Description` input printed');
        assert.equal(tr.stdout.indexOf('Copyright: Copyright © ') > -1, true, '`Copyright` input printed');
        assert.equal(tr.stdout.indexOf('License Url: https://github.com/BMuuN/vsts-assemblyinfo-task/License.md') > -1, true, '`License Url` input printed');
        assert.equal(tr.stdout.indexOf('Project Url: https://github.com/BMuuN/vsts-assemblyinfo-task/release') > -1, true, '`Project Url` input printed');
        assert.equal(tr.stdout.indexOf('Icon Url: https://github.com/BMuuN/vsts-assemblyinfo-task/favicon.png') > -1, true, '`Icon Url` input printed');
        assert.equal(tr.stdout.indexOf('Repository Url: https://github.com/BMuuN/vsts-assemblyinfo-task') > -1, true, '`Repository Url` input printed');
        assert.equal(tr.stdout.indexOf('Repository type: OSS for Azure Dev Ops') > -1, true, '`Repository type` input printed');
        assert.equal(tr.stdout.indexOf('Tags: Tags, Build, Release, VSTS') > -1, true, '`Tags` input printed');
        assert.equal(tr.stdout.indexOf('Release notes: The extension will recursively search the specified Source Folder for all files listed in the Source Files field and set the assembly data.') > -1, true, '`Release notes` input printed');
        assert.equal(tr.stdout.indexOf('Assembly neutral language: en-GB') > -1, true, '`Assembly neutral language` input printed');
        assert.equal(tr.stdout.indexOf('Assembly version: 2018.11.') > -1, true, '`Assembly version` input printed');
        assert.equal(tr.stdout.indexOf('Assembly file version: 1990.03.') > -1, true, '`Assembly file version` input printed');
        assert.equal(tr.stdout.indexOf('Informational version: 2.3.4-beta5') > -1, true, '`Informational version` input printed');
        assert.equal(tr.stdout.indexOf('Log Level: verbose') > -1, true, '`Log Level` input printed');
        assert.equal(tr.stdout.indexOf('Fail on Warning: true') > -1, true, '`Fail on Warning` input printed');

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
        assert.equal(tr.stdout.indexOf('##vso[task.setvariable variable=AssemblyInfo.Version;issecret=false;]2018.11.') > -1, true, 'AssemblyInfo.Version output variable set');
        assert.equal(tr.stdout.indexOf('##vso[task.setvariable variable=AssemblyInfo.FileVersion;issecret=false;]1990.03.') > -1, true, 'AssemblyInfo.FileVersion output variable set');
        assert.equal(tr.stdout.indexOf('##vso[task.setvariable variable=AssemblyInfo.InformationalVersion;issecret=false;]2.3.4-beta5') > -1, true, 'AssemblyInfo.InformationalVersion output variable set');
        assert.equal(tr.stdout.indexOf('##vso[task.setvariable variable=AssemblyInfo.PackageVersion;issecret=false;]9.8.7-beta65') > -1, true, 'PackageVersion output variable set');

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

        const projectPath = path.join(projectDir, '\\NetCoreLib\\NetCoreLib.csproj');
        assert.equal(tr.stdout.indexOf(`Processing: ${projectPath}`) > -1, true, 'Project file is being processed');
        assert.equal(tr.stdout.indexOf('Detected file encoding: iso-8859-1') > -1, true, 'File encoding detected');
        assert.equal(tr.stdout.indexOf('Verify file encoding: iso-8859-1') > -1, true, 'File encoding verified');
        assert.equal(tr.stdout.indexOf('GeneratePackageOnBuild --> true') > -1, true, 'GeneratePackageOnBuild is set');
        assert.equal(tr.stdout.indexOf('PackageRequireLicenseAcceptance --> true') > -1, true, 'PackageRequireLicenseAcceptance is set');
        assert.equal(tr.stdout.indexOf('PackageId --> vsts-assemblyinfo-task') > -1, true, 'PackageId is set');
        assert.equal(tr.stdout.indexOf('Version --> 9.8.7-beta65') > -1, true, 'Version is set');
        assert.equal(tr.stdout.indexOf('Authors --> Bleddyn Richards') > -1, true, 'Authors is set');
        assert.equal(tr.stdout.indexOf('Company --> Bleddyn Richards Inc') > -1, true, 'Company is set');
        assert.equal(tr.stdout.indexOf('Product --> Azure DevOps Assembly Info') > -1, true, 'Product is set');
        assert.equal(tr.stdout.indexOf('Description --> Assembly Info is an extension for Team Services that sets assembly information from a build.') > -1, true, 'Description is set');
        assert.equal(tr.stdout.indexOf('Copyright --> Copyright © 2020') > -1, true, 'Copyright is set');
        assert.equal(tr.stdout.indexOf('PackageLicenseUrl --> https://github.com/BMuuN/vsts-assemblyinfo-task/License.md') > -1, true, 'PackageLicenseUrl is set');
        assert.equal(tr.stdout.indexOf('PackageProjectUrl --> https://github.com/BMuuN/vsts-assemblyinfo-task/release') > -1, true, 'PackageProjectUrl is set');
        assert.equal(tr.stdout.indexOf('PackageIconUrl --> https://github.com/BMuuN/vsts-assemblyinfo-task/favicon.png') > -1, true, 'PackageIconUrl is set');
        assert.equal(tr.stdout.indexOf('RepositoryUrl --> https://github.com/BMuuN/vsts-assemblyinfo-task') > -1, true, 'RepositoryUrl is set');
        assert.equal(tr.stdout.indexOf('RepositoryType --> OSS for Azure Dev Ops') > -1, true, 'RepositoryType is set');
        assert.equal(tr.stdout.indexOf('PackageTags --> Tags, Build, Release, VSTS') > -1, true, 'PackageTags is set');
        assert.equal(tr.stdout.indexOf('PackageReleaseNotes --> The extension will recursively search the specified Source Folder for all files listed in the Source Files field and set the assembly data.') > -1, true, 'PackageReleaseNotes is set');
        assert.equal(tr.stdout.indexOf('NeutralLanguage --> en-GB') > -1, true, 'NeutralLanguage is set');
        assert.equal(tr.stdout.indexOf('AssemblyVersion --> 2018.11.') > -1, true, 'AssemblyVersion is set');
        assert.equal(tr.stdout.indexOf('FileVersion --> 1990.03.') > -1, true, 'FileVersion is set');
        assert.equal(tr.stdout.indexOf('InformationalVersion --> 2.3.4-beta5') > -1, true, 'InformationalVersion is set');

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

    //     // assert(tr.stdout.indexOf('atool output here') > -1, 'tool stdout');
    //     // assert.equal(tr.stdout.indexOf('Hello Mock!'), -1, 'task module should have never been called');
    //     assert.equal(tr.stdout.indexOf('Hello bad'), -1, 'Should not display Hello bad');

    //     done();
    // });

    it('should fail instantly when source directory does not exist', (done: MochaDone) => {
        this.timeout(1000);

        const tp = path.join(testDir, 'failure-source-dir-not-found.js');
        const tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

        tr.run();

        assert.equal(tr.succeeded, false, 'should have failed');
        assert.equal(tr.warningIssues, 0, 'should have no warnings');
        assert.equal(tr.errorIssues.length, 1, 'should have 1 error issue');
        assert.equal(tr.errorIssues[0], 'Source directory does not exist: C:\\DEV\\GIT\\invalid-directory', 'Source directory does not exist');

        assert.equal(tr.stdout.indexOf('Insert attributes: true') === -1, true, '`Insert attributes` input not printed');
        assert.equal(tr.stdout.indexOf('File encoding: auto') === -1, true, '`File encoding` input not printed');
        assert.equal(tr.stdout.indexOf('Write unicode BOM: false') === -1, true, '`Write unicode BOM` input not printed');
        assert.equal(tr.stdout.indexOf('Package id: vsts-assemblyinfo-task') === -1, true, '`Package id` input not printed');
        assert.equal(tr.stdout.indexOf('Package version: 9.8.7-beta65') === -1, true, '`Package version` input not printed');
        assert.equal(tr.stdout.indexOf('Authors: Bleddyn Richards') === -1, true, '`Authors` input not printed');
        assert.equal(tr.stdout.indexOf('Company: Bleddyn Richards Inc') === -1, true, '`Company` input not printed');
        assert.equal(tr.stdout.indexOf('Product: Azure DevOps Assembly Info') === -1, true, '`Product` input not printed');

        done();
    });

    // TODO: This is not failing instantly
    it('should fail instantly on warning file not csproj or vbproj', (done: MochaDone) => {
        this.timeout(1000);

        const tp = path.join(testDir, 'failure.js');
        const tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

        tr.run();

        // console.log(tr.stdout);

        assert.equal(tr.succeeded, false, 'should have failed');
        assert.equal(tr.warningIssues, 0, 'should have no warnings');
        assert.equal(tr.errorIssues.length, 1, 'should have 1 error issue');
        assert.equal(tr.errorIssues[0], 'File is not .csproj or .vbproj', 'file is not csproj or vbproj');
        // assert.equal(tr.stdout.indexOf(`Processing: ${projectDir}`), -1, 'NetCoreLib.csproj was not processed');

        done();
    });
});
