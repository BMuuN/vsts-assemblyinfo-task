import path = require('path');
import models = require('../builders/request-model-builder');

// const taskPath = path.join(__dirname, '../dist', 'index.js');
const taskPath = path.join('c:\\DEV\\GIT\\vsts-assemblyinfo-task\\src\\netcore\\dist', 'index.js');

const model = new models.RequestModel(taskPath)
    .withFailOnWarning(true)
    .build();
