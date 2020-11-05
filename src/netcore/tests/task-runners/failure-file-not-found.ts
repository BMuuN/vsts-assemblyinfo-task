import path = require('path');
import models = require('../builders/request-model-builder');

const taskPath = path.join(__dirname, '..\\..\\index.js');
// const taskPath = path.join('c:\\DEV\\GIT\\vsts-assemblyinfo-task\\src\\netcore\\dist', 'index.js');

new models.RequestModel(taskPath)
    .withFileNames('\n**\\FileNotFound.csproj')
    .withFailOnWarning(false)
    .build();
