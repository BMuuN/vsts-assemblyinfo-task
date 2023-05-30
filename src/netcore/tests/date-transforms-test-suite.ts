import * as assert from 'assert';
import * as ttm from 'azure-pipelines-task-lib/mock-test';
import * as path from 'path';
import { TestUtils } from './helpers/test-utils'

describe('Net Core - Date Transforms Tests', function() {

    let rootDir: string = '';
    let testDir: string = '';
    let projectDir: string = '';

    before(() => {
        rootDir = process.cwd();
        testDir = path.join(rootDir, 'src/netcore/tests/task-runners');
        projectDir = path.join(rootDir, '/tests/projects');
    });

    it(`should succeed with date transforms for 'Copyright' field`, (done: Mocha.Done) => {
        this.timeout(1000);

        const tp = path.join(testDir, 'success-date-transforms.js');
        const tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

        tr.run();

        assert.strictEqual(tr.succeeded, true, 'should have succeeded');
        assert.strictEqual(tr.invokedToolCount, 0, 'should not invoke any tooling');
        assert.strictEqual(tr.warningIssues.length, 0, 'should have no warnings');
        assert.strictEqual(tr.errorIssues.length, 0, 'should have no errors');

        const netCoreLibProject = path.join(projectDir, 'NetCoreLib/NetCoreLib.csproj');

        const copyright = TestUtils.getAssemblyInfoValue(netCoreLibProject, 'Copyright');
        const regex = /^(Copyright © \d{4} \d{2}\.\d{2}\.\d{4} \d{2} \w+ \d{4} \d{2}:\d{2} \w+ Example Ltd)$/g;
        const result = copyright.match(regex) as RegExpMatchArray;

        assert.notStrictEqual(result, null, 'Copyright field is not empty');
        assert.strictEqual(result.length, 1, 'Dates not transformed for copyright field');

        done();
    });

    it(`should succeed with date transforms for 'Company' field`, (done: Mocha.Done) => {
        this.timeout(1000);

        const tp = path.join(testDir, 'success-date-transforms.js');
        const tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

        tr.run();

        assert.strictEqual(tr.succeeded, true, 'should have succeeded');
        assert.strictEqual(tr.invokedToolCount, 0, 'should not invoke any tooling');
        assert.strictEqual(tr.warningIssues.length, 0, 'should have no warnings');
        assert.strictEqual(tr.errorIssues.length, 0, 'should have no errors');

        const netCoreLibProject = path.join(projectDir, 'NetCoreLib/NetCoreLib.csproj');

        const company = TestUtils.getAssemblyInfoValue(netCoreLibProject, 'Company');
        const regex = /^(Bleddyn Richards Inc \d{4})$/g;
        const result = company.match(regex) as RegExpMatchArray;

        assert.notStrictEqual(result, null, 'Company field is not empty');
        assert.strictEqual(result.length, 1, 'Dates not transformed for company field');

        done();
    });

    it('should succeed with date transforms for `Description` field', (done: Mocha.Done) => {
        this.timeout(1000);

        const tp = path.join(testDir, 'success-date-transforms.js');
        const tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

        tr.run();

        assert.strictEqual(tr.succeeded, true, 'should have succeeded');
        assert.strictEqual(tr.invokedToolCount, 0, 'should not invoke any tooling');
        assert.strictEqual(tr.warningIssues.length, 0, 'should have no warnings');
        assert.strictEqual(tr.errorIssues.length, 0, 'should have no errors');

        const netCoreLibProject = path.join(projectDir, 'NetCoreLib/NetCoreLib.csproj');

        const description = TestUtils.getAssemblyInfoValue(netCoreLibProject, 'Description');
        const regex = /^(Assembly Info \d{4} is an extension for Azure DevOps that sets assembly information from a build.)$/g;
        const result = description.match(regex) as RegExpMatchArray;

        assert.notStrictEqual(result, null, 'Description field is not empty');
        assert.strictEqual(result.length, 1, 'Dates not transformed for description field');

        done();
    });
});