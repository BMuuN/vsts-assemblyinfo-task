import tmma = require('azure-pipelines-task-lib/mock-answer');
import tmrm = require('azure-pipelines-task-lib/mock-run');

export class RequestModel {

    tmr!: tmrm.TaskMockRunner;

    constructor(taskPath: string) {

        this.tmr = new tmrm.TaskMockRunner(taskPath);

        this.tmr.setInput('PATH', 'X:\\DEV\\GIT\\vsts-assemblyinfo-task\\tests\\projects');
        this.tmr.setInput('FILENAMES', '\n**\\AssemblyInfo.cs');
        this.tmr.setInput('INSERTATTRIBUTES', 'true');
        this.tmr.setInput('FILEENCODING', 'auto');
        this.tmr.setInput('WRITEBOM', 'true');
        
        this.tmr.setInput('VERSIONNUMBER', 'TS Extension Test Build_2018.11.*');
        this.tmr.setInput('FILEVERSIONNUMBER', '1990.03.*.*');
        this.tmr.setInput('INFORMATIONALVERSION', '2.3.4-prerelease');

        this.tmr.setInput('TITLE', 'Assembly Info');
        this.tmr.setInput('PRODUCT', 'Azure DevOps Assembly Info');
        this.tmr.setInput('DESCRIPTION', 'Assembly Info is an extension for Azure DevOps that sets assembly information from a build.');
        this.tmr.setInput('COMPANY', 'Bleddyn Richards Inc');
        this.tmr.setInput('CULTURE', 'en-GB');
        this.tmr.setInput('COPYRIGHT', 'Copyright © $(date:YYYY) $(date:DD.MM.YYYY DD MMMM YYYY HH:mm a) Example Ltd');
        this.tmr.setInput('TRADEMARK', 'Example ® Trademark');
        this.tmr.setInput('CONFIGURATION', 'debug');

        this.tmr.setInput('LOGLEVEL', 'verbose');
        this.tmr.setInput('FAILONWARNING', 'false');
        this.tmr.setInput('DISABLETELEMETRY', 'true');

        this.tmr.setInput('UPDATEBUILDNUMBER', 'Build-$(Build.BuildId)_1990.03.*.*-beta5');
        this.tmr.setInput('ADDBUILDTAG', 'Tag v1990.03.*.*-beta5');
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

    withCopyright(value: string): RequestModel {
        this.tmr.setInput('COPYRIGHT', value.toString());
        return this;
    }
    
    build(): RequestModel {
        this.tmr.run(true);
        return this;
    }
}
