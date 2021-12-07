import * as assert from 'assert';
import * as ttm from 'azure-pipelines-task-lib/mock-test';
import * as path from 'path';
import * as testUtils from './helpers/test-utils';

describe('Net Core Task Version Tests', function() {

    const TestRegEx = {
        assemblyVersion: /^(\d{1,4}\.\d{1,4}\.\d{1,4}(.\d{1,5})?)$/g,
        fileVersion: /^(\d{1,4}\.\d{1,4}\.\d{1,4}\.\d{1,5})$/g,
        informationalVersion: /^(\d{1,4}\.\d{1,4}\.\d{1,5}-prerelease)/g,
        packageVersion: /^(\d{1,4}\.\d{1,4}\.\d{1,5}-beta5)/g,
    };

    let rootDir: string = '';
    let testDir: string = '';
    let projectDir: string = '';

    before(() => {
        console.log('');
        rootDir = process.cwd();
        console.log(`Dir Name: \t${rootDir}`);

        testDir = path.join(rootDir, 'src/netcore/tests/task-runners');
        console.log(`Test Dir: \t${testDir}`);

        projectDir = path.join(rootDir, '/tests/projects');
        console.log(`Project Dir: \t${projectDir}`);
    });

    it('should succeed with version number wildcard', (done: Mocha.Done) => {
        this.timeout(1000);

        const tp = path.join(testDir, 'success-version-wildcard.js');
        const tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

        tr.run();

        assert.strictEqual(tr.succeeded, true, 'should have succeeded');
        assert.strictEqual(tr.invokedToolCount, 0, 'should not invoke any tooling');
        assert.strictEqual(tr.warningIssues.length, 0, 'should have no warnings');
        assert.strictEqual(tr.errorIssues.length, 0, 'should have no errors');

        const netCoreLibProject = path.join(projectDir, 'NetCoreLib/NetCoreLib.csproj');

        const assemblyVersion = testUtils.TestUtils.getAssemblyInfoValue(netCoreLibProject, 'AssemblyVersion');
        const assemblyVersionResult = assemblyVersion.match(TestRegEx.assemblyVersion) as RegExpMatchArray;
        assert.notStrictEqual(assemblyVersionResult, null, 'AssemblyVersion field is empty');
        assert.strictEqual(assemblyVersionResult.length, 1, 'AssemblyVersion is not set');

        const fileVersion = testUtils.TestUtils.getAssemblyInfoValue(netCoreLibProject, 'FileVersion');
        const fileVersionResult = fileVersion.match(TestRegEx.fileVersion) as RegExpMatchArray;
        assert.notStrictEqual(fileVersionResult, null, 'FileVersion field is empty');
        assert.strictEqual(fileVersionResult.length, 1, 'FileVersion is not set');

        const informationalVersion = testUtils.TestUtils.getAssemblyInfoValue(netCoreLibProject, 'InformationalVersion');
        const informationalVersionResult = informationalVersion.match(TestRegEx.informationalVersion) as RegExpMatchArray;
        assert.notStrictEqual(informationalVersionResult, null, 'InformationalVersion field is empty');
        assert.strictEqual(informationalVersionResult.length, 1, 'InformationalVersion is not set');

        const packageVersion = testUtils.TestUtils.getAssemblyInfoValue(netCoreLibProject, 'Version');
        const packageVersionResult = packageVersion.match(TestRegEx.packageVersion) as RegExpMatchArray;
        assert.notStrictEqual(packageVersionResult, null, 'Package version field is empty');
        assert.strictEqual(packageVersionResult.length, 1, 'Package version is not set');

        done();
    });

    it('should succeed and keep parts of existing version', (done: Mocha.Done) => {
        this.timeout(1000);

        const tp = path.join(testDir, 'success-version-keep.js');
        const tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

        tr.run();

        assert.strictEqual(tr.succeeded, true, 'should have succeeded');
        assert.strictEqual(tr.invokedToolCount, 0, 'should not invoke any tooling');
        assert.strictEqual(tr.warningIssues.length, 0, 'should have no warnings');
        assert.strictEqual(tr.errorIssues.length, 0, 'should have no errors');

        const netCoreLibProject = path.join(projectDir, 'NetCoreLib/NetCoreLib.csproj');

        // These tests run after 'basic_test_suite' therefore the version numbers have already been set.
        // This ensure the unit tests here for the hash '#' check skip are working as intended.

        const assemblyVersion = testUtils.TestUtils.getAssemblyInfoValue(netCoreLibProject, 'AssemblyVersion');
        const assemblyVersionResult = assemblyVersion.match(/^(\d{1,4}\.15\.\d{1,4}(.98)?)$/g) as RegExpMatchArray;
        assert.notStrictEqual(assemblyVersionResult, null, 'AssemblyVersion field is not empty');
        assert.strictEqual(assemblyVersionResult.length, 1, 'AssemblyVersion is not set');

        const fileVersion = testUtils.TestUtils.getAssemblyInfoValue(netCoreLibProject, 'FileVersion');
        const fileVersionResult = fileVersion.match(/^(\d{1,4}\.92\.\d{1,4}\.6)$/g) as RegExpMatchArray;
        assert.notStrictEqual(fileVersionResult, null, 'FileVersion field is empty');
        assert.strictEqual(fileVersionResult.length, 1, 'FileVersion is not set');

        const informationalVersion = testUtils.TestUtils.getAssemblyInfoValue(netCoreLibProject, 'InformationalVersion');
        const informationalVersionResult = informationalVersion.match(/^(2\.\d{1,4}\.\d{1,5}-prerelease)/g) as RegExpMatchArray;
        assert.notStrictEqual(informationalVersionResult, null, 'InformationalVersion field is empty');
        assert.strictEqual(informationalVersionResult.length, 1, 'InformationalVersion is not set');

        const packageVersion = testUtils.TestUtils.getAssemblyInfoValue(netCoreLibProject, 'Version');
        const packageVersionResult = packageVersion.match(/^(\d{1,4}\.\d{1,4}\.2-beta1)/g) as RegExpMatchArray;
        assert.notStrictEqual(packageVersionResult, null, 'Packave version field is empty');
        assert.strictEqual(packageVersionResult.length, 1, 'Package version is not set');

        done();
    });

});