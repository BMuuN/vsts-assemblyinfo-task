import path = require('path');
import models = require('../builders/request-model-builder');

const taskPath = path.join('c:\\DEV\\GIT\\vsts-assemblyinfo-task\\src\\netcore\\dist', 'index.js');

new models.RequestModel(taskPath)
    .withFailOnWarning(true)
    .withFileEncoding('utf-8')
    .withWriteBom(true)
    .build();
