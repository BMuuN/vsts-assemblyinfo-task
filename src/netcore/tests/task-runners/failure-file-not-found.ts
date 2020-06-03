import tmrm = require('azure-pipelines-task-lib/mock-run');
import path = require('path');
import models = require('../builders/request-model-builder');

// const taskPath = path.join(__dirname, '..', 'index.js');
const taskPath = path.join('c:\\DEV\\GIT\\vsts-assemblyinfo-task\\src\\netcore\\dist', 'index.js');

const model = new models.RequestModel(taskPath)
    .withFileNames('\n**\\FileNotFound.csproj')
    .withFailOnWarning(false)
    .build();
