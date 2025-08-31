import * as assert from 'assert';
import * as ttm from 'azure-pipelines-task-lib/mock-test';
import * as path from 'path';
import { TestUtils } from './helpers/test-utils'

describe('Net Core - Boolean Pick List Tests', function() {

    let rootDir: string = '';
    let testDir: string = '';
    let projectDir: string = '';

    before(() => {
        rootDir = process.cwd();
        testDir = path.join(rootDir, 'src/netcore/tests/task-runners');
        projectDir = path.join(rootDir, '/tests/projects');
    });

    it(`should succeed and set all fields to 'true'`, (done: Mocha.Done) => {
        this.timeout(1000);

        const tp = path.join(testDir, 'success-bool-picklist-true.js');
        const tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

        tr.runAsync();

        assert.strictEqual(tr.succeeded, true, 'should have succeeded');
        assert.strictEqual(tr.invokedToolCount, 0, 'should not invoke any tooling');
        assert.strictEqual(tr.warningIssues.length, 0, 'should have no warnings');
        assert.strictEqual(tr.errorIssues.length, 0, 'should have no errors');

        const netCoreLibProject = path.join(projectDir, 'NetCoreLib/NetCoreLib.csproj');

        const generateDocumentationFile = TestUtils.getAssemblyInfoValue(netCoreLibProject, 'GenerateDocumentationFile');
        assert.strictEqual(generateDocumentationFile, 'true', 'GenerateDocumentationFile is not set to true');

        const generatePackageOnBuild = TestUtils.getAssemblyInfoValue(netCoreLibProject, 'GeneratePackageOnBuild');
        assert.strictEqual(generatePackageOnBuild, 'true', 'GeneratePackageOnBuild is not set to true');

        const packageRequireLicenseAcceptance = TestUtils.getAssemblyInfoValue(netCoreLibProject, 'PackageRequireLicenseAcceptance');
        assert.strictEqual(packageRequireLicenseAcceptance, 'true', 'PackageRequireLicenseAcceptance is not set to true');

        done();
    });

    it(`should succeed and set all fields to 'false'`, (done: Mocha.Done) => {
        this.timeout(1000);

        const tp = path.join(testDir, 'success-bool-picklist-false.js');
        const tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

        tr.runAsync();

        assert.strictEqual(tr.succeeded, true, 'should have succeeded');
        assert.strictEqual(tr.invokedToolCount, 0, 'should not invoke any tooling');
        assert.strictEqual(tr.warningIssues.length, 0, 'should have no warnings');
        assert.strictEqual(tr.errorIssues.length, 0, 'should have no errors');

        const netCoreLibProject = path.join(projectDir, 'NetCoreLib/NetCoreLib.csproj');

        const generateDocumentationFile = TestUtils.getAssemblyInfoValue(netCoreLibProject, 'GenerateDocumentationFile');
        assert.strictEqual(generateDocumentationFile, 'false', 'GenerateDocumentationFile is not set to false');

        const generatePackageOnBuild = TestUtils.getAssemblyInfoValue(netCoreLibProject, 'GeneratePackageOnBuild');
        assert.strictEqual(generatePackageOnBuild, 'false', 'GeneratePackageOnBuild is not set to false');

        const packageRequireLicenseAcceptance = TestUtils.getAssemblyInfoValue(netCoreLibProject, 'PackageRequireLicenseAcceptance');
        assert.strictEqual(packageRequireLicenseAcceptance, 'false', 'PackageRequireLicenseAcceptance is not set to false');

        done();
    });

    it(`should succeed and skip all fields when set to 'ignore'`, (done: Mocha.Done) => {
        this.timeout(1000);

        const tp = path.join(testDir, 'success-bool-picklist-ignore.js');
        const tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

        tr.runAsync();

        assert.strictEqual(tr.succeeded, true, 'should have succeeded');
        assert.strictEqual(tr.invokedToolCount, 0, 'should not invoke any tooling');
        assert.strictEqual(tr.warningIssues.length, 0, 'should have no warnings');
        assert.strictEqual(tr.errorIssues.length, 0, 'should have no errors');

        const netCoreLibProject = path.join(projectDir, 'BoolPickListIgnored.Build.props');

        const generateDocumentationFile = TestUtils.elementExists(netCoreLibProject, 'GenerateDocumentationFile');
        assert.strictEqual(`${generateDocumentationFile}`, 'false', 'GenerateDocumentationFile has not been ignored');

        const generatePackageOnBuild = TestUtils.elementExists(netCoreLibProject, 'GeneratePackageOnBuild');
        assert.strictEqual(`${generatePackageOnBuild}`, 'false', 'GeneratePackageOnBuild has not been ignored');

        const packageRequireLicenseAcceptance = TestUtils.elementExists(netCoreLibProject, 'PackageRequireLicenseAcceptance');
        assert.strictEqual(`${packageRequireLicenseAcceptance}`, 'false', 'PackageRequireLicenseAcceptance has not been ignored');

        done();
    });
});