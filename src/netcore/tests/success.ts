// import ma = require('azure-pipelines-task-lib/mock-answer');
import tmrm = require('azure-pipelines-task-lib/mock-run');
import path = require('path');
import models = require('./builders/request-model-builder');

// const taskPath = path.join(__dirname, '../dist', 'index.js');
const taskPath = path.join('c:\\DEV\\GIT\\vsts-assemblyinfo-task\\src\\netcore\\dist', 'index.js');

const model = new models.RequestModel(taskPath)
    .withFailOnWarning(true)
    .build();

// const tmr: tmrm.TaskMockRunner = new tmrm.TaskMockRunner(taskPath);

// tmr.setInput('PATH', 'C:\\DEV\\GIT\\vsts-assemblyinfo-task\\tests\\projects');
// tmr.setInput('FILENAMES', '\n**\\NetCoreLib.csproj');
// tmr.setInput('INSERTATTRIBUTES', 'true');
// tmr.setInput('FILEENCODING', 'auto');
// tmr.setInput('WRITEBOM', 'false');
// tmr.setInput('PACKAGEVERSION', '9.8.7-beta65');
// tmr.setInput('VERSIONNUMBER', 'TS Extension Test Build_2018.11.*');
// tmr.setInput('FILEVERSIONNUMBER', '1990.03.*.*');
// tmr.setInput('INFORMATIONALVERSION', '2.3.4-beta5');
// tmr.setInput('TITLE', 'Assembly Info');
// tmr.setInput('PRODUCT', 'Azure DevOps Assembly Info');
// tmr.setInput('DESCRIPTION', 'Assembly Info is an extension for Team Services that sets assembly information from a build.');
// tmr.setInput('COMPANY', 'Bleddyn Richards Inc');
// tmr.setInput('CULTURE', 'en-GB');
// tmr.setInput('COPYRIGHT', 'Copyright © $(date:YYYY) $(date:DD.MM.YYYY DD MMMM YYYY HH:mm a) Example Ltd');
// tmr.setInput('LOGLEVEL', 'verbose');
// tmr.setInput('FAILONWARNING', 'false');
// tmr.setInput('DISABLETELEMETRY', 'true');
// tmr.setInput('IGNORENETFRAMEWORKPROJECTS', 'false');

// tmr.setInput('TRADEMARK', 'Example Trademark');
// tmr.setInput('CONFIGURATION', 'debug');
// tmr.setInput('GENERATEPACKAGEONBUILD', 'true');
// tmr.setInput('PACKAGEREQUIRELICENSEACCEPTANCE', 'true');
// tmr.setInput('PACKAGEID', 'vsts-assemblyinfo-task');
// tmr.setInput('AUTHORS', 'Bleddyn Richards');
// tmr.setInput('PACKAGELICENSEURL', 'https://github.com/BMuuN/vsts-assemblyinfo-task/License.md');
// tmr.setInput('PACKAGEPROJECTURL', 'https://github.com/BMuuN/vsts-assemblyinfo-task/release');
// tmr.setInput('PACKAGEICONURL', 'https://github.com/BMuuN/vsts-assemblyinfo-task/favicon.png');
// tmr.setInput('REPOSITORYURL', 'https://github.com/BMuuN/vsts-assemblyinfo-task');
// tmr.setInput('REPOSITORYTYPE', 'OSS for Azure Dev Ops');
// tmr.setInput('PACKAGETAGS', 'Tags, Build, Release, VSTS');
// tmr.setInput('PACKAGERELEASENOTES', 'The extension will recursively search the specified Source Folder for all files listed in the Source Files field and set the assembly data.');

// tmr.run(true);
