import * as assert from 'assert';
import * as ttm from 'azure-pipelines-task-lib/mock-test';
import * as path from 'path';
import { TestUtils } from './helpers/test-utils'


describe('Net Core - Input Files Tests', function() {

    const TestRegEx = {
        assemblyVersion: /^(2018\.11\.\d{4}(.\d{1,5})?)$/g,
        fileVersion: /^(1990\.03\.\d{4}\.\d{1,5})$/g,
        informationalVersion: /^(\d{1,4}\.\d{1,4}\.\d{1,5}-prerelease)/g,
        packageVersion: /^(\d{1,4}\.\d{1,4}\.\d{1,5}-beta5)/g,
    };

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

    it('should succeed and update assembly data (NetCoreLib.csproj)', (done: Mocha.Done) => {
        this.timeout(1000);

        const tp = path.join(testDir, 'success-file-utf8.js');
        const tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

        tr.run();

        assert.strictEqual(tr.succeeded, true, 'should have succeeded');
        assert.strictEqual(tr.invokedToolCount, 0, 'should not invoke any tooling');
        assert.strictEqual(tr.warningIssues.length, 0, 'should have no warnings');
        assert.strictEqual(tr.errorIssues.length, 0, 'should have no errors');

        const netCoreLibProject = path.join(projectDir, 'NetCoreLib/NetCoreLib.csproj');

        const generatePackageOnBuild = TestUtils.getAssemblyInfoValue(netCoreLibProject, 'GeneratePackageOnBuild');
        assert.strictEqual(generatePackageOnBuild, 'true', 'GeneratePackageOnBuild is not set');

        const packageRequireLicenseAcceptance = TestUtils.getAssemblyInfoValue(netCoreLibProject, 'PackageRequireLicenseAcceptance');
        assert.strictEqual(packageRequireLicenseAcceptance, 'true', 'PackageRequireLicenseAcceptance is not set');

        const packageId = TestUtils.getAssemblyInfoValue(netCoreLibProject, 'PackageId');
        assert.strictEqual(packageId, 'vsts-assemblyinfo-task', 'PackageId is not set');

        const version = TestUtils.getAssemblyInfoValue(netCoreLibProject, 'Version');
        assert.strictEqual(version, '9.8.7-beta5', 'Version is not set');

        const authors = TestUtils.getAssemblyInfoValue(netCoreLibProject, 'Authors');
        assert.strictEqual(authors, 'Bleddyn Richards', 'Authors is not set');

        const company = TestUtils.getAssemblyInfoValue(netCoreLibProject, 'Company');
        assert.strictEqual(company, 'Bleddyn Richards Inc', 'Company is not set');

        const product = TestUtils.getAssemblyInfoValue(netCoreLibProject, 'Product');
        assert.strictEqual(product, 'Azure DevOps Assembly Info', 'Product is not set');

        const description = TestUtils.getAssemblyInfoValue(netCoreLibProject, 'Description');
        assert.strictEqual(description, 'Assembly Info is an extension for Azure DevOps that sets assembly information from a build.', 'Description is not set');

        const copyright = TestUtils.getAssemblyInfoValue(netCoreLibProject, 'Copyright');
        const copyrightResult = copyright.match(/^(Copyright © \d{4} \d{2}\.\d{2}\.\d{4} \d{2} \w+ \d{4} \d{2}:\d{2} \w+ Example Ltd)$/g) as RegExpMatchArray;
        assert.notStrictEqual(copyrightResult, null, 'Copyright field is empty');
        assert.strictEqual(copyrightResult.length, 1, 'Copyright is not set');

        const packageLicenseFile = TestUtils.getAssemblyInfoValue(netCoreLibProject, 'PackageLicenseFile');
        assert.strictEqual(packageLicenseFile, 'https://github.com/BMuuN/vsts-assemblyinfo-task/License.md', 'PackageLicenseFile is not set');

        const packageProjectUrl = TestUtils.getAssemblyInfoValue(netCoreLibProject, 'PackageProjectUrl');
        assert.strictEqual(packageProjectUrl, 'https://github.com/BMuuN/vsts-assemblyinfo-task/release', 'PackageProjectUrl is not set');

        const packageIcon = TestUtils.getAssemblyInfoValue(netCoreLibProject, 'PackageIcon');
        assert.strictEqual(packageIcon, 'https://github.com/BMuuN/vsts-assemblyinfo-task/favicon.png', 'PackageIcon is not set');

        const repositoryUrl = TestUtils.getAssemblyInfoValue(netCoreLibProject, 'RepositoryUrl');
        assert.strictEqual(repositoryUrl, 'https://github.com/BMuuN/vsts-assemblyinfo-task', 'RepositoryUrl is not set');

        const repositoryType = TestUtils.getAssemblyInfoValue(netCoreLibProject, 'RepositoryType');
        assert.strictEqual(repositoryType, 'OSS for Azure Dev Ops', 'RepositoryType is not set');

        const packageTags = TestUtils.getAssemblyInfoValue(netCoreLibProject, 'PackageTags');
        assert.strictEqual(packageTags, 'Tags, Build, Release, VSTS', 'PackageTags is not set');

        const packageReleaseNotes = TestUtils.getAssemblyInfoValue(netCoreLibProject, 'PackageReleaseNotes');
        assert.strictEqual(packageReleaseNotes, 'The extension will recursively search the specified Source Folder for all files listed in the Source Files field and set the assembly data.', 'PackageReleaseNotes is not set');

        const neutralLanguage = TestUtils.getAssemblyInfoValue(netCoreLibProject, 'NeutralLanguage');
        assert.strictEqual(neutralLanguage, 'en-GB', 'NeutralLanguage is not set');

        const assemblyVersion = TestUtils.getAssemblyInfoValue(netCoreLibProject, 'AssemblyVersion');
        const assemblyVersionResult = assemblyVersion.match(TestRegEx.assemblyVersion) as RegExpMatchArray;
        assert.notStrictEqual(assemblyVersionResult, null, 'AssemblyVersion field is not empty');
        assert.strictEqual(assemblyVersionResult.length, 1, 'AssemblyVersion is not set');

        const fileVersion = TestUtils.getAssemblyInfoValue(netCoreLibProject, 'FileVersion');
        const fileVersionResult = fileVersion.match(TestRegEx.fileVersion) as RegExpMatchArray;
        assert.notStrictEqual(fileVersionResult, null, 'FileVersion field is empty');
        assert.strictEqual(fileVersionResult.length, 1, 'FileVersion is not set');

        const informationalVersion = TestUtils.getAssemblyInfoValue(netCoreLibProject, 'InformationalVersion');
        assert.strictEqual(informationalVersion, '2.3.4-prerelease', 'InformationalVersion is not set');

        done();
    });

    it('should succeed and update assembly data (Directory.Build.props)', (done: Mocha.Done) => {
        this.timeout(1000);

        const tp = path.join(testDir, 'success-file-props-utf8');
        const tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

        tr.run();

        assert.strictEqual(tr.succeeded, true, 'should have succeeded');
        assert.strictEqual(tr.invokedToolCount, 0, 'should not invoke any tooling');
        assert.strictEqual(tr.warningIssues.length, 0, 'should have no warnings');
        assert.strictEqual(tr.errorIssues.length, 0, 'should have no errors');

        const netCoreLibProject = path.join(projectDir, 'Directory.Build.props');

        const generatePackageOnBuild = TestUtils.getAssemblyInfoValue(netCoreLibProject, 'GeneratePackageOnBuild');
        assert.strictEqual(generatePackageOnBuild, 'true', 'GeneratePackageOnBuild is not set');

        const packageRequireLicenseAcceptance = TestUtils.getAssemblyInfoValue(netCoreLibProject, 'PackageRequireLicenseAcceptance');
        assert.strictEqual(packageRequireLicenseAcceptance, 'true', 'PackageRequireLicenseAcceptance is not set');

        const packageId = TestUtils.getAssemblyInfoValue(netCoreLibProject, 'PackageId');
        assert.strictEqual(packageId, 'vsts-assemblyinfo-task', 'PackageId is not set');

        const version = TestUtils.getAssemblyInfoValue(netCoreLibProject, 'Version');
        assert.strictEqual(version, '9.8.7-beta5', 'Version is not set');

        const authors = TestUtils.getAssemblyInfoValue(netCoreLibProject, 'Authors');
        assert.strictEqual(authors, 'Bleddyn Richards', 'Authors is not set');

        const company = TestUtils.getAssemblyInfoValue(netCoreLibProject, 'Company');
        assert.strictEqual(company, 'Bleddyn Richards Inc', 'Company is not set');

        const product = TestUtils.getAssemblyInfoValue(netCoreLibProject, 'Product');
        assert.strictEqual(product, 'Azure DevOps Assembly Info', 'Product is not set');

        const description = TestUtils.getAssemblyInfoValue(netCoreLibProject, 'Description');
        assert.strictEqual(description, 'Assembly Info is an extension for Azure DevOps that sets assembly information from a build.', 'Description is not set');

        const copyright = TestUtils.getAssemblyInfoValue(netCoreLibProject, 'Copyright');
        const copyrightResult = copyright.match(/^(Copyright © \d{4} \d{2}\.\d{2}\.\d{4} \d{2} \w+ \d{4} \d{2}:\d{2} \w+ Example Ltd)$/g) as RegExpMatchArray;
        assert.notStrictEqual(copyrightResult, null, 'Copyright field is empty');
        assert.strictEqual(copyrightResult.length, 1, 'Copyright is not set');

        const packageLicenseFile = TestUtils.getAssemblyInfoValue(netCoreLibProject, 'PackageLicenseFile');
        assert.strictEqual(packageLicenseFile, 'https://github.com/BMuuN/vsts-assemblyinfo-task/License.md', 'PackageLicenseFile is not set');

        const packageProjectUrl = TestUtils.getAssemblyInfoValue(netCoreLibProject, 'PackageProjectUrl');
        assert.strictEqual(packageProjectUrl, 'https://github.com/BMuuN/vsts-assemblyinfo-task/release', 'PackageProjectUrl is not set');

        const packageIcon = TestUtils.getAssemblyInfoValue(netCoreLibProject, 'PackageIcon');
        assert.strictEqual(packageIcon, 'https://github.com/BMuuN/vsts-assemblyinfo-task/favicon.png', 'PackageIcon is not set');

        const repositoryUrl = TestUtils.getAssemblyInfoValue(netCoreLibProject, 'RepositoryUrl');
        assert.strictEqual(repositoryUrl, 'https://github.com/BMuuN/vsts-assemblyinfo-task', 'RepositoryUrl is not set');

        const repositoryType = TestUtils.getAssemblyInfoValue(netCoreLibProject, 'RepositoryType');
        assert.strictEqual(repositoryType, 'OSS for Azure Dev Ops', 'RepositoryType is not set');

        const packageTags = TestUtils.getAssemblyInfoValue(netCoreLibProject, 'PackageTags');
        assert.strictEqual(packageTags, 'Tags, Build, Release, VSTS', 'PackageTags is not set');

        const packageReleaseNotes = TestUtils.getAssemblyInfoValue(netCoreLibProject, 'PackageReleaseNotes');
        assert.strictEqual(packageReleaseNotes, 'The extension will recursively search the specified Source Folder for all files listed in the Source Files field and set the assembly data.', 'PackageReleaseNotes is not set');

        const neutralLanguage = TestUtils.getAssemblyInfoValue(netCoreLibProject, 'NeutralLanguage');
        assert.strictEqual(neutralLanguage, 'en-GB', 'NeutralLanguage is not set');

        const assemblyVersion = TestUtils.getAssemblyInfoValue(netCoreLibProject, 'AssemblyVersion');
        const assemblyVersionResult = assemblyVersion.match(TestRegEx.assemblyVersion) as RegExpMatchArray;
        assert.notStrictEqual(assemblyVersionResult, null, 'AssemblyVersion field is not empty');
        assert.strictEqual(assemblyVersionResult.length, 1, 'AssemblyVersion is not set');

        const fileVersion = TestUtils.getAssemblyInfoValue(netCoreLibProject, 'FileVersion');
        const fileVersionResult = fileVersion.match(TestRegEx.fileVersion) as RegExpMatchArray;
        assert.notStrictEqual(fileVersionResult, null, 'FileVersion field is empty');
        assert.strictEqual(fileVersionResult.length, 1, 'FileVersion is not set');

        const informationalVersion = TestUtils.getAssemblyInfoValue(netCoreLibProject, 'InformationalVersion');
        assert.strictEqual(informationalVersion, '2.3.4-prerelease', 'InformationalVersion is not set');

        done();
    });

    it('should succeed and update assembly data (EmptyDirectory.Build.props)', (done: Mocha.Done) => {
        this.timeout(1000);

        const tp = path.join(testDir, 'success-file-empty-props-utf8');
        const tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

        tr.run();

        assert.strictEqual(tr.succeeded, true, 'should have succeeded');
        assert.strictEqual(tr.invokedToolCount, 0, 'should not invoke any tooling');
        assert.strictEqual(tr.warningIssues.length, 0, 'should have no warnings');
        assert.strictEqual(tr.errorIssues.length, 0, 'should have no errors');

        const netCoreLibProject = path.join(projectDir, 'EmptyDirectory.Build.props');

        const generatePackageOnBuild = TestUtils.getAssemblyInfoValue(netCoreLibProject, 'GeneratePackageOnBuild');
        assert.strictEqual(generatePackageOnBuild, 'true', 'GeneratePackageOnBuild is not set');

        const packageRequireLicenseAcceptance = TestUtils.getAssemblyInfoValue(netCoreLibProject, 'PackageRequireLicenseAcceptance');
        assert.strictEqual(packageRequireLicenseAcceptance, 'true', 'PackageRequireLicenseAcceptance is not set');

        const packageId = TestUtils.getAssemblyInfoValue(netCoreLibProject, 'PackageId');
        assert.strictEqual(packageId, 'vsts-assemblyinfo-task', 'PackageId is not set');

        const version = TestUtils.getAssemblyInfoValue(netCoreLibProject, 'Version');
        assert.strictEqual(version, '9.8.7-beta5', 'Version is not set');

        const authors = TestUtils.getAssemblyInfoValue(netCoreLibProject, 'Authors');
        assert.strictEqual(authors, 'Bleddyn Richards', 'Authors is not set');

        const company = TestUtils.getAssemblyInfoValue(netCoreLibProject, 'Company');
        assert.strictEqual(company, 'Bleddyn Richards Inc', 'Company is not set');

        const product = TestUtils.getAssemblyInfoValue(netCoreLibProject, 'Product');
        assert.strictEqual(product, 'Azure DevOps Assembly Info', 'Product is not set');

        const description = TestUtils.getAssemblyInfoValue(netCoreLibProject, 'Description');
        assert.strictEqual(description, 'Assembly Info is an extension for Azure DevOps that sets assembly information from a build.', 'Description is not set');

        const copyright = TestUtils.getAssemblyInfoValue(netCoreLibProject, 'Copyright');
        const copyrightResult = copyright.match(/^(Copyright © \d{4} \d{2}\.\d{2}\.\d{4} \d{2} \w+ \d{4} \d{2}:\d{2} \w+ Example Ltd)$/g) as RegExpMatchArray;
        assert.notStrictEqual(copyrightResult, null, 'Copyright field is empty');
        assert.strictEqual(copyrightResult.length, 1, 'Copyright is not set');

        const packageLicenseFile = TestUtils.getAssemblyInfoValue(netCoreLibProject, 'PackageLicenseFile');
        assert.strictEqual(packageLicenseFile, 'https://github.com/BMuuN/vsts-assemblyinfo-task/License.md', 'PackageLicenseFile is not set');

        const packageProjectUrl = TestUtils.getAssemblyInfoValue(netCoreLibProject, 'PackageProjectUrl');
        assert.strictEqual(packageProjectUrl, 'https://github.com/BMuuN/vsts-assemblyinfo-task/release', 'PackageProjectUrl is not set');

        const packageIcon = TestUtils.getAssemblyInfoValue(netCoreLibProject, 'PackageIcon');
        assert.strictEqual(packageIcon, 'https://github.com/BMuuN/vsts-assemblyinfo-task/favicon.png', 'PackageIcon is not set');

        const repositoryUrl = TestUtils.getAssemblyInfoValue(netCoreLibProject, 'RepositoryUrl');
        assert.strictEqual(repositoryUrl, 'https://github.com/BMuuN/vsts-assemblyinfo-task', 'RepositoryUrl is not set');

        const repositoryType = TestUtils.getAssemblyInfoValue(netCoreLibProject, 'RepositoryType');
        assert.strictEqual(repositoryType, 'OSS for Azure Dev Ops', 'RepositoryType is not set');

        const packageTags = TestUtils.getAssemblyInfoValue(netCoreLibProject, 'PackageTags');
        assert.strictEqual(packageTags, 'Tags, Build, Release, VSTS', 'PackageTags is not set');
        
        const packageReleaseNotes = TestUtils.getAssemblyInfoValue(netCoreLibProject, 'PackageReleaseNotes');
        assert.strictEqual(packageReleaseNotes, 'The extension will recursively search the specified Source Folder for all files listed in the Source Files field and set the assembly data.', 'PackageReleaseNotes is not set');

        const neutralLanguage = TestUtils.getAssemblyInfoValue(netCoreLibProject, 'NeutralLanguage');
        assert.strictEqual(neutralLanguage, 'en-GB', 'NeutralLanguage is not set');

        const assemblyVersion = TestUtils.getAssemblyInfoValue(netCoreLibProject, 'AssemblyVersion');
        const assemblyVersionResult = assemblyVersion.match(TestRegEx.assemblyVersion) as RegExpMatchArray;
        assert.notStrictEqual(assemblyVersionResult, null, 'AssemblyVersion field is not empty');
        assert.strictEqual(assemblyVersionResult.length, 1, 'AssemblyVersion is not set');

        const fileVersion = TestUtils.getAssemblyInfoValue(netCoreLibProject, 'FileVersion');
        const fileVersionResult = fileVersion.match(TestRegEx.fileVersion) as RegExpMatchArray;
        assert.notStrictEqual(fileVersionResult, null, 'FileVersion field is empty');
        assert.strictEqual(fileVersionResult.length, 1, 'FileVersion is not set');

        const informationalVersion = TestUtils.getAssemblyInfoValue(netCoreLibProject, 'InformationalVersion');
        assert.strictEqual(informationalVersion, '2.3.4-prerelease', 'InformationalVersion is not set');

        done();
    });
});