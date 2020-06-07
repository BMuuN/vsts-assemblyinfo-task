import path = require('path');
import models = require('../builders/request-model-builder');

const taskPath = path.join('c:\\DEV\\GIT\\vsts-assemblyinfo-task\\src\\netcore\\dist', 'index.js');

new models.RequestModel(taskPath)
    .withFailOnWarning(true)
    .withCompany('Bleddyn Richards Inc $(date:YYYY)')
    .withDescription('Assembly Info $(date:YYYY) is an extension for Azure DevOps that sets assembly information from a build.')
    .build();
