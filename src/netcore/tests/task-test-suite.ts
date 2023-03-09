import * as assert from 'assert';
import * as ttm from 'azure-pipelines-task-lib/mock-test';
import * as path from 'path';

describe('Net Core - Task Tests', function() {

    let rootDir: string = '';
    let testDir: string = '';
    let projectDir: string = '';

    before(() => {
        // Uncomment on errors to diagnose
        // process.env['TASK_TEST_TRACE'] = '1';

        console.log('');
        rootDir = process.cwd();
        // console.log(`Dir Name: ${__dirname}`);
        console.log(`Dir Name: \t${rootDir}`);

        testDir = path.join(rootDir, 'src/netcore/tests/task-runners');
        console.log(`Test Dir: \t${testDir}`);

        projectDir = path.join(rootDir, '/tests/projects');
        console.log(`Project Dir: \t${projectDir}`);
    });

    it('should succeed and print input task parameters', (done: Mocha.Done) => {
        this.timeout(1000);

        const tp = path.join(testDir, 'success.js');
        const tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

        tr.run();

        assert.strictEqual(tr.succeeded, true, 'should have succeeded');
        assert.strictEqual(tr.invokedToolCount, 0, 'should not invoke any tooling');
        assert.strictEqual(tr.warningIssues.length, 0, 'should have no warnings');
        assert.strictEqual(tr.errorIssues.length, 0, 'should have no errors');

        // Input Parameters Printed (only in debug mode)
        assert.strictEqual(tr.stdout.indexOf('Source folder: F:\\DEV\\GIT\\vsts-assemblyinfo-task\\tests\\projects') > -1, true, `'Source folder' input printed`);
        assert.strictEqual(tr.stdout.indexOf('Source files: **/NetCoreLib.csproj') > -1, true, `'Source files' input printed`);
        assert.strictEqual(tr.stdout.indexOf('Insert attributes: true') > -1, true, `'Insert attributes' input printed`);
        assert.strictEqual(tr.stdout.indexOf('File encoding: auto') > -1, true, `'File encoding' input printed`);
        assert.strictEqual(tr.stdout.indexOf('Write unicode BOM: true') > -1, true, `'Write unicode BOM' input printed`);
        assert.strictEqual(tr.stdout.indexOf('Generate NuGet package on build: true') > -1, true, `'Generate NuGet package on build' input printed`);
        assert.strictEqual(tr.stdout.indexOf('Require license acceptance: true') > -1, true, `'Require license acceptance' input printed`);
        assert.strictEqual(tr.stdout.indexOf('Package id: vsts-assemblyinfo-task') > -1, true, `'Package id' input printed`);
        assert.strictEqual(tr.stdout.indexOf('Package version: 9.8.7-beta5') > -1, true, `'Package version' input printed`);
        assert.strictEqual(tr.stdout.indexOf('Authors: Bleddyn Richards') > -1, true, `'Authors' input printed`);
        assert.strictEqual(tr.stdout.indexOf('Company: Bleddyn Richards Inc') > -1, true, `'Company' input printed`);
        assert.strictEqual(tr.stdout.indexOf('Product: Azure DevOps Assembly Info') > -1, true, `'Product' input printed`);
        assert.strictEqual(tr.stdout.indexOf('Description: Assembly Info ') > -1, true, `'Description' input printed`);
        assert.strictEqual(tr.stdout.indexOf('Copyright: Copyright © ') > -1, true, `Copyright' input printed`);
        assert.strictEqual(tr.stdout.indexOf('License File: https://github.com/BMuuN/vsts-assemblyinfo-task/License.md') > -1, true, `'License File' input printed`);
        assert.strictEqual(tr.stdout.indexOf('Project Url: https://github.com/BMuuN/vsts-assemblyinfo-task/release') > -1, true, `'Project Url' input printed`);
        assert.strictEqual(tr.stdout.indexOf('Package Icon: https://github.com/BMuuN/vsts-assemblyinfo-task/favicon.png') > -1, true, `'Package Icon' input printed`);
        assert.strictEqual(tr.stdout.indexOf('Repository Url: https://github.com/BMuuN/vsts-assemblyinfo-task') > -1, true, `'Repository Url' input printed`);
        assert.strictEqual(tr.stdout.indexOf('Repository type: OSS for Azure Dev Ops') > -1, true, `'Repository type' input printed`);
        assert.strictEqual(tr.stdout.indexOf('Tags: Tags, Build, Release, VSTS') > -1, true, `Tags' input printed`);
        assert.strictEqual(tr.stdout.indexOf('Release notes: The extension will recursively search the specified Source Folder for all files listed in the Source Files field and set the assembly data.') > -1, true, `'Release notes' input printed`);
        assert.strictEqual(tr.stdout.indexOf('Assembly neutral language: en-GB') > -1, true, `'Assembly neutral language' input printed`);
        assert.strictEqual(tr.stdout.indexOf('Assembly version: 2018.11.') > -1, true, `'Assembly version' input printed`);
        assert.strictEqual(tr.stdout.indexOf('Assembly file version: 1990.03.') > -1, true, `'Assembly file version' input printed`);
        assert.strictEqual(tr.stdout.indexOf('Informational version: 2.3.4-prerelease') > -1, true, `'Informational version' input printed`);
        assert.strictEqual(tr.stdout.indexOf('Log Level: verbose') > -1, true, `'Log Level' input printed`);
        assert.strictEqual(tr.stdout.indexOf('Fail on Warning: true') > -1, true, `'Fail on Warning' input printed`);

        done();
    });

    it('should succeed and print transformations', (done: Mocha.Done) => {
        this.timeout(1000);

        const tp = path.join(testDir, 'success.js');
        const tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

        tr.run();

        assert.strictEqual(tr.succeeded, true, 'should have succeeded');
        assert.strictEqual(tr.invokedToolCount, 0, 'should not invoke any tooling');
        assert.strictEqual(tr.warningIssues.length, 0, 'should have no warnings');
        assert.strictEqual(tr.errorIssues.length, 0, 'should have no errors');

        const projectPath = path.join(projectDir, 'NetCoreLib/NetCoreLib.csproj');
        assert.strictEqual(tr.stdout.indexOf(`Processing: ${projectPath}`) > -1, true, 'Project file is being processed');
        assert.strictEqual(tr.stdout.indexOf('Detected file encoding: utf-8') > -1, true, 'File encoding detected');
        assert.strictEqual(tr.stdout.indexOf('Verify file encoding: utf-8') > -1, true, 'File encoding verified');
        assert.strictEqual(tr.stdout.indexOf('GeneratePackageOnBuild --> true') > -1, true, 'GeneratePackageOnBuild is set');
        assert.strictEqual(tr.stdout.indexOf('PackageRequireLicenseAcceptance --> true') > -1, true, 'PackageRequireLicenseAcceptance is set');
        assert.strictEqual(tr.stdout.indexOf('PackageId --> vsts-assemblyinfo-task') > -1, true, 'PackageId is set');
        assert.strictEqual(tr.stdout.indexOf('Version --> 9.8.7-beta5') > -1, true, 'Version is set');
        assert.strictEqual(tr.stdout.indexOf('Authors --> Bleddyn Richards') > -1, true, 'Authors is set');
        assert.strictEqual(tr.stdout.indexOf('Company --> Bleddyn Richards Inc') > -1, true, 'Company is set');
        assert.strictEqual(tr.stdout.indexOf('Product --> Azure DevOps Assembly Info') > -1, true, 'Product is set');
        assert.strictEqual(tr.stdout.indexOf('Description --> Assembly Info is an extension for Azure DevOps that sets assembly information from a build.') > -1, true, 'Description is set');
        assert.strictEqual(tr.stdout.indexOf('Copyright --> Copyright © 2020') > -1, true, 'Copyright is set');
        assert.strictEqual(tr.stdout.indexOf('PackageLicenseFile --> https://github.com/BMuuN/vsts-assemblyinfo-task/License.md') > -1, true, 'PackageLicenseFile is set');
        assert.strictEqual(tr.stdout.indexOf('PackageProjectUrl --> https://github.com/BMuuN/vsts-assemblyinfo-task/release') > -1, true, 'PackageProjectUrl is set');
        assert.strictEqual(tr.stdout.indexOf('PackageIcon --> https://github.com/BMuuN/vsts-assemblyinfo-task/favicon.png') > -1, true, 'PackageIcon is set');
        assert.strictEqual(tr.stdout.indexOf('RepositoryUrl --> https://github.com/BMuuN/vsts-assemblyinfo-task') > -1, true, 'RepositoryUrl is set');
        assert.strictEqual(tr.stdout.indexOf('RepositoryType --> OSS for Azure Dev Ops') > -1, true, 'RepositoryType is set');
        assert.strictEqual(tr.stdout.indexOf('PackageTags --> Tags, Build, Release, VSTS') > -1, true, 'PackageTags is set');
        assert.strictEqual(tr.stdout.indexOf('PackageReleaseNotes --> The extension will recursively search the specified Source Folder for all files listed in the Source Files field and set the assembly data.') > -1, true, 'PackageReleaseNotes is set');
        assert.strictEqual(tr.stdout.indexOf('NeutralLanguage --> en-GB') > -1, true, 'NeutralLanguage is set');
        assert.strictEqual(tr.stdout.indexOf('AssemblyVersion --> 2018.11.') > -1, true, 'AssemblyVersion is set');
        assert.strictEqual(tr.stdout.indexOf('FileVersion --> 1990.03.') > -1, true, 'FileVersion is set');
        assert.strictEqual(tr.stdout.indexOf('InformationalVersion --> 2.3.4-prerelease') > -1, true, 'InformationalVersion is set');

        done();
    });

    it('should succeed and set output variables', (done: Mocha.Done) => {
        this.timeout(1000);

        const tp = path.join(testDir, 'success.js');
        const tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

        tr.run();

        assert.strictEqual(tr.succeeded, true, 'should have succeeded');
        assert.strictEqual(tr.invokedToolCount, 0, 'should not invoke any tooling');
        assert.strictEqual(tr.warningIssues.length, 0, 'should have no warnings');

        assert.strictEqual(tr.errorIssues.length, 0, 'should have no errors');
        assert.strictEqual(tr.stdout.indexOf('##vso[task.setvariable variable=AssemblyInfo.Version;isOutput=true;issecret=false;]2018.11.') > -1, true, 'AssemblyInfo.Version output variable set');
        assert.strictEqual(tr.stdout.indexOf('##vso[task.setvariable variable=AssemblyInfo.FileVersion;isOutput=true;issecret=false;]1990.03.') > -1, true, 'AssemblyInfo.FileVersion output variable set');
        assert.strictEqual(tr.stdout.indexOf('##vso[task.setvariable variable=AssemblyInfo.InformationalVersion;isOutput=true;issecret=false;]2.3.4-prerelease') > -1, true, 'AssemblyInfo.InformationalVersion output variable set');
        assert.strictEqual(tr.stdout.indexOf('##vso[task.setvariable variable=AssemblyInfo.PackageVersion;isOutput=true;issecret=false;]9.8.7-beta5') > -1, true, 'PackageVersion output variable set');

        done();
    });
    
    it('should fail instantly when source directory does not exist', (done: Mocha.Done) => {
        this.timeout(1000);

        const tp = path.join(testDir, 'failure-source-dir-not-found.js');
        const tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

        tr.run();

        assert.strictEqual(tr.succeeded, false, 'should have failed');
        assert.strictEqual(tr.warningIssues.length, 0, 'should have no warnings');
        assert.strictEqual(tr.errorIssues.length, 1, 'should have 1 error issue');
        assert.strictEqual(tr.errorIssues[0], 'Source directory does not exist: C:\\DEV\\GIT\\invalid-directory', 'Source directory does not exist');

        assert.strictEqual(tr.stdout.indexOf('Insert attributes: true') === -1, true, `'Insert attributes' input not printed`);
        assert.strictEqual(tr.stdout.indexOf('File encoding: auto') === -1, true, `'File encoding' input not printed`);
        assert.strictEqual(tr.stdout.indexOf('Write unicode BOM: false') === -1, true, `'Write unicode BOM' input not printed`);
        assert.strictEqual(tr.stdout.indexOf('Package id: vsts-assemblyinfo-task') === -1, true, `'Package id' input not printed`);
        assert.strictEqual(tr.stdout.indexOf('Package version: 9.8.7-beta65') === -1, true, `'Package version' input not printed`);
        assert.strictEqual(tr.stdout.indexOf('Authors: Bleddyn Richards') === -1, true, `'Authors' input not printed`);
        assert.strictEqual(tr.stdout.indexOf('Company: Bleddyn Richards Inc') === -1, true, `'Company' input not printed`);
        assert.strictEqual(tr.stdout.indexOf('Product: Azure DevOps Assembly Info') === -1, true, `'Product' input not printed`);

        done();
    });

    it('should fail instantly on warning file not csproj or vbproj or props', (done: Mocha.Done) => {
        this.timeout(1000);

        const tp = path.join(testDir, 'failure.js');
        const tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

        tr.run();

        assert.strictEqual(tr.succeeded, false, 'should have failed');
        assert.strictEqual(tr.warningIssues.length, 0, 'should have no warnings');
        assert.strictEqual(tr.errorIssues.length, 1, 'should have 1 error issue');
        assert.strictEqual(tr.errorIssues[0], 'Invalid file.  Only the following file extensions are supported: .csproj, .vbproj, .props', 'file is not correct extension');
        // assert.strictEqual(tr.stdout.indexOf(`Processing: ${projectDir}`), -1, 'NetCoreLib.csproj was not processed');

        done();
    });
});
