import tmma = require('azure-pipelines-task-lib/mock-answer');
import tmrm = require('azure-pipelines-task-lib/mock-run');

export class RequestModel {

    tmr!: tmrm.TaskMockRunner;

    constructor(taskPath: string) {

        this.tmr = new tmrm.TaskMockRunner(taskPath);

        this.tmr.setInput('PATH', 'C:\\DEV\\GIT\\vsts-assemblyinfo-task\\tests\\projects');
        this.tmr.setInput('FILENAMES', '\n**\\NetCoreLib.csproj');
        this.tmr.setInput('INSERTATTRIBUTES', 'true');
        this.tmr.setInput('FILEENCODING', 'auto');
        this.tmr.setInput('WRITEBOM', 'false');
        this.tmr.setInput('PACKAGEVERSION', '9.8.7-beta65');
        this.tmr.setInput('VERSIONNUMBER', 'TS Extension Test Build_2018.11.*');
        this.tmr.setInput('FILEVERSIONNUMBER', '1990.03.*.*');
        this.tmr.setInput('INFORMATIONALVERSION', '2.3.4-beta5');
        this.tmr.setInput('TITLE', 'Assembly Info');
        this.tmr.setInput('PRODUCT', 'Azure DevOps Assembly Info');
        this.tmr.setInput('DESCRIPTION', 'Assembly Info is an extension for Azure DevOps that sets assembly information from a build.');
        this.tmr.setInput('COMPANY', 'Bleddyn Richards Inc');
        this.tmr.setInput('CULTURE', 'en-GB');
        this.tmr.setInput('COPYRIGHT', 'Copyright © $(date:YYYY) $(date:DD.MM.YYYY DD MMMM YYYY HH:mm a) Example Ltd');
        this.tmr.setInput('LOGLEVEL', 'verbose');
        this.tmr.setInput('FAILONWARNING', 'false');
        this.tmr.setInput('DISABLETELEMETRY', 'true');
        this.tmr.setInput('IGNORENETFRAMEWORKPROJECTS', 'false');

        this.tmr.setInput('TRADEMARK', 'Example Trademark');
        this.tmr.setInput('CONFIGURATION', 'debug');
        this.tmr.setInput('GENERATEPACKAGEONBUILD', 'true');
        this.tmr.setInput('PACKAGEREQUIRELICENSEACCEPTANCE', 'true');
        this.tmr.setInput('PACKAGEID', 'vsts-assemblyinfo-task');
        this.tmr.setInput('AUTHORS', 'Bleddyn Richards');
        this.tmr.setInput('PACKAGELICENSEURL', 'https://github.com/BMuuN/vsts-assemblyinfo-task/License.md');
        this.tmr.setInput('PACKAGEPROJECTURL', 'https://github.com/BMuuN/vsts-assemblyinfo-task/release');
        this.tmr.setInput('PACKAGEICONURL', 'https://github.com/BMuuN/vsts-assemblyinfo-task/favicon.png');
        this.tmr.setInput('REPOSITORYURL', 'https://github.com/BMuuN/vsts-assemblyinfo-task');
        this.tmr.setInput('REPOSITORYTYPE', 'OSS for Azure Dev Ops');
        this.tmr.setInput('PACKAGETAGS', 'Tags, Build, Release, VSTS');
        this.tmr.setInput('PACKAGERELEASENOTES', 'The extension will recursively search the specified Source Folder for all files listed in the Source Files field and set the assembly data.');
    }

    withSourcePath(value: string): RequestModel {
        this.tmr.setInput('PATH', value);
        return this;
    }

    withFileNames(value: string): RequestModel {
        this.tmr.setInput('FILENAMES', value);
        return this;
    }

    withFileEncoding(value: string): RequestModel {
        this.tmr.setInput('FILEENCODING', value);
        return this;
    }

    withWriteBom(value: boolean): RequestModel {
        this.tmr.setInput('WRITEBOM', value.toString());
        return this;
    }

    withPackageVersion(value: string): RequestModel {
        this.tmr.setInput('PACKAGEVERSION', value);
        return this;
    }

    withVersionNumber(value: string): RequestModel {
        this.tmr.setInput('VERSIONNUMBER', value);
        return this;
    }

    withFileVersionNumber(value: string): RequestModel {
        this.tmr.setInput('FILEVERSIONNUMBER', value);
        return this;
    }

    withInformationalVersionNumber(value: string): RequestModel {
        this.tmr.setInput('INFORMATIONALVERSION', value);
        return this;
    }

    withFailOnWarning(value: boolean): RequestModel {
        this.tmr.setInput('FAILONWARNING', value.toString());
        return this;
    }

    withCompany(value: string): RequestModel {
        this.tmr.setInput('COMPANY', value.toString());
        return this;
    }

    withDescription(value: string): RequestModel {
        this.tmr.setInput('DESCRIPTION', value.toString());
        return this;
    }

    withAnswers(): void {
        const a: tmma.TaskLibAnswers = {
            which: {
                xcodebuild: '/home/bin/xcodebuild',
            },
            checkPath : {
                '/home/bin/xcodebuild': true,
            },
            getVariable: {
                'build.sourcesDirectory': '/user/build',
                'HOME': '/users/test',
            },
            findMatch: {
                '**/*.xcodeproj/*.xcworkspace': [
                  '/user/build/fun.xcodeproj/project.xcworkspace',
                ],
                '**/*.app': [
                  '/user/build/output/$(SDK)/$(Configuration)/build.sym/Release.iphoneos/fun.app',
                ],
            },
            exec: {
                '/home/bin/xcodebuild -version': {
                  code: 0,
                  stdout: 'Xcode 7.2.1',
                },
                '/home/bin/xcodebuild -sdk $(SDK) -configuration $(Configuration) -workspace /user/build/fun.xcodeproj/project.xcworkspace -scheme myscheme build': {
                  code: 0,
                  stdout: 'xcodebuild output here',
                },
            },
        } as tmma.TaskLibAnswers;

        this.tmr.setAnswers(a);
    }

    build(): RequestModel {
        this.tmr.run(true);
        return this;
    }
}
