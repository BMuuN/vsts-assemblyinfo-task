import * as assert from 'assert';
import * as ttm from 'azure-pipelines-task-lib/mock-test';
import * as path from 'path';
import { TestUtils } from './helpers/test-utils'

describe('Net Framework - Input Files Tests', function() {

    const TestRegEx = {
        assemblyVersion: /^(\d{1,4}\.\d{1,4}\.\d{1,4}(.\d{1,5})?)$/g,
        fileVersion: /^(\d{1,4}\.\d{1,4}\.\d{1,4}\.\d{1,5})$/g,
        informationalVersion: /^(\d{1,4}\.\d{1,4}\.\d{1,5}-prerelease)/g,
    };

    let rootDir: string = '';
    let testDir: string = '';
    let projectDir: string = '';

    before(() => {
        console.log('');
        rootDir = process.cwd();
        console.log(`Dir Name: \t${rootDir}`);

        testDir = path.join(rootDir, 'src/netframework/tests/task-runners');
        console.log(`Test Dir: \t${testDir}`);

        projectDir = path.join(rootDir, '/tests/projects');
        console.log(`Project Dir: \t${projectDir}`);
    });

    it('should succeed and update assembly data (AssemblyInfo.cs)', (done: Mocha.Done) => {
        this.timeout(1000);

        const tp = path.join(testDir, 'success-file-utf8.js');
        const tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

        tr.run();

        assert.strictEqual(tr.succeeded, true, 'should have succeeded');
        assert.strictEqual(tr.invokedToolCount, 0, 'should not invoke any tooling');
        assert.strictEqual(tr.warningIssues.length, 0, 'should have no warnings');
        assert.strictEqual(tr.errorIssues.length, 0, 'should have no errors');

        const cSharpLibProject = path.join(projectDir, 'CSharpLib/Properties/AssemblyInfo.cs');

        const title = TestUtils.getAssemblyInfoValue(cSharpLibProject, 'AssemblyTitle');
        assert.strictEqual(title, 'Assembly Info', 'AssemblyTitle is not set');

        const product = TestUtils.getAssemblyInfoValue(cSharpLibProject, 'AssemblyProduct');
        assert.strictEqual(product, 'Azure DevOps Assembly Info', 'AssemblyProduct is not set');

        const company = TestUtils.getAssemblyInfoValue(cSharpLibProject, 'AssemblyCompany');
        assert.strictEqual(company, 'Bleddyn Richards Inc', 'AssemblyCompany is not set');

        const trademark = TestUtils.getAssemblyInfoValue(cSharpLibProject, 'AssemblyTrademark');
        assert.strictEqual(trademark, 'Example ® Trademark', 'AssemblyTrademark is not set');

        const description = TestUtils.getAssemblyInfoValue(cSharpLibProject, 'AssemblyDescription');
        assert.strictEqual(description, 'Assembly Info is an extension for Azure DevOps that sets assembly information from a build.', 'AssemblyDescription is not set');

        const culture = TestUtils.getAssemblyInfoValue(cSharpLibProject, 'AssemblyCulture');
        assert.strictEqual(culture, 'en-GB', 'AssemblyCulture is not set');

        const configuration = TestUtils.getAssemblyInfoValue(cSharpLibProject, 'AssemblyConfiguration');
        assert.strictEqual(configuration, 'debug', 'AssemblyConfiguration is not set');

        const copyright = TestUtils.getAssemblyInfoValue(cSharpLibProject, 'AssemblyCopyright');
        const copyrightResult = copyright.match(/^(Copyright © \d{4} \d{2}\.\d{2}\.\d{4} \d{2} \w+ \d{4} \d{2}:\d{2} \w+ Example Ltd)$/g) as RegExpMatchArray;
        assert.notStrictEqual(copyrightResult, null, 'AssemblyCopyright field is empty');
        assert.strictEqual(copyrightResult.length, 1, 'AssemblyCopyright is not set');

        const assemblyVersion = TestUtils.getAssemblyInfoValue(cSharpLibProject, 'AssemblyVersion');
        const assemblyVersionResult = assemblyVersion.match(TestRegEx.assemblyVersion) as RegExpMatchArray;
        assert.notStrictEqual(assemblyVersionResult, null, 'AssemblyVersion field is empty');
        assert.strictEqual(assemblyVersionResult.length, 1, 'AssemblyVersion is not set');

        const fileVersion = TestUtils.getAssemblyInfoValue(cSharpLibProject, 'AssemblyFileVersion');
        const fileVersionResult = fileVersion.match(TestRegEx.fileVersion) as RegExpMatchArray;
        assert.notStrictEqual(fileVersionResult, null, 'AssemblyFileVersion field is empty');
        assert.strictEqual(fileVersionResult.length, 1, 'AssemblyFileVersion is not set');

        const informationalVersion = TestUtils.getAssemblyInfoValue(cSharpLibProject, 'AssemblyInformationalVersion');
        const informationalVersionResult = informationalVersion.match(TestRegEx.informationalVersion) as RegExpMatchArray;
        assert.notStrictEqual(informationalVersionResult, null, 'AssemblyInformationalVersion field is empty');
        assert.strictEqual(informationalVersionResult.length, 1, 'AssemblyInformationalVersion is not set');

        done();
    });

    it('should succeed and update assembly data (AssemblyInfo.cpp)', (done: Mocha.Done) => {
        this.timeout(1000);

        const tp = path.join(testDir, 'success-file-cplus-utf8.js');
        const tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

        tr.run();

        assert.strictEqual(tr.succeeded, true, 'should have succeeded');
        assert.strictEqual(tr.invokedToolCount, 0, 'should not invoke any tooling');
        assert.strictEqual(tr.warningIssues.length, 0, 'should have no warnings');
        assert.strictEqual(tr.errorIssues.length, 0, 'should have no errors');

        const cSharpLibProject = path.join(projectDir, 'AssemblyInfo.cpp');

        const title = TestUtils.getAssemblyInfoValue(cSharpLibProject, 'AssemblyTitle');
        assert.strictEqual(title, 'Assembly Info', 'AssemblyTitle is not set');

        const product = TestUtils.getAssemblyInfoValue(cSharpLibProject, 'AssemblyProduct');
        assert.strictEqual(product, 'Azure DevOps Assembly Info', 'AssemblyProduct is not set');

        const company = TestUtils.getAssemblyInfoValue(cSharpLibProject, 'AssemblyCompany');
        assert.strictEqual(company, 'Bleddyn Richards Inc', 'AssemblyCompany is not set');

        const trademark = TestUtils.getAssemblyInfoValue(cSharpLibProject, 'AssemblyTrademark');
        assert.strictEqual(trademark, 'Example ® Trademark', 'AssemblyTrademark is not set');

        const description = TestUtils.getAssemblyInfoValue(cSharpLibProject, 'AssemblyDescription');
        assert.strictEqual(description, 'Assembly Info is an extension for Azure DevOps that sets assembly information from a build.', 'AssemblyDescription is not set');

        const culture = TestUtils.getAssemblyInfoValue(cSharpLibProject, 'AssemblyCulture');
        assert.strictEqual(culture, 'en-GB', 'AssemblyCulture is not set');

        const configuration = TestUtils.getAssemblyInfoValue(cSharpLibProject, 'AssemblyConfiguration');
        assert.strictEqual(configuration, 'debug', 'AssemblyConfiguration is not set');

        const copyright = TestUtils.getAssemblyInfoValue(cSharpLibProject, 'AssemblyCopyright');
        const copyrightResult = copyright.match(/^(Copyright © \d{4} \d{2}\.\d{2}\.\d{4} \d{2} \w+ \d{4} \d{2}:\d{2} \w+ Example Ltd)$/g) as RegExpMatchArray;
        assert.notStrictEqual(copyrightResult, null, 'AssemblyCopyright field is empty');
        assert.strictEqual(copyrightResult.length, 1, 'AssemblyCopyright is not set');

        const assemblyVersion = TestUtils.getAssemblyInfoValue(cSharpLibProject, 'AssemblyVersion');
        const assemblyVersionResult = assemblyVersion.match(TestRegEx.assemblyVersion) as RegExpMatchArray;
        assert.notStrictEqual(assemblyVersionResult, null, 'AssemblyVersion field is empty');
        assert.strictEqual(assemblyVersionResult.length, 1, 'AssemblyVersion is not set');

        const fileVersion = TestUtils.getAssemblyInfoValue(cSharpLibProject, 'AssemblyFileVersion');
        const fileVersionResult = fileVersion.match(TestRegEx.fileVersion) as RegExpMatchArray;
        assert.notStrictEqual(fileVersionResult, null, 'AssemblyFileVersion field is empty');
        assert.strictEqual(fileVersionResult.length, 1, 'AssemblyFileVersion is not set');

        const informationalVersion = TestUtils.getAssemblyInfoValue(cSharpLibProject, 'AssemblyInformationalVersion');
        const informationalVersionResult = informationalVersion.match(TestRegEx.informationalVersion) as RegExpMatchArray;
        assert.notStrictEqual(informationalVersionResult, null, 'AssemblyInformationalVersion field is empty');
        assert.strictEqual(informationalVersionResult.length, 1, 'AssemblyInformationalVersion is not set');

        done();
    });
});