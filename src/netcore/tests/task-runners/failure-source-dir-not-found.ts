import path = require('path');
import models = require('../builders/request-model-builder');

const taskPath = path.join(__dirname, '..\\..\\index.js');

new models.RequestModel(taskPath)
    .withSourcePath('C:\\DEV\\GIT\\invalid-directory')
    .withFailOnWarning(false)
    .build();
