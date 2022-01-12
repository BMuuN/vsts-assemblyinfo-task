import path = require('path');
import models = require('../builders/request-model-builder');

const taskPath = path.join(__dirname, '..\\..\\index.js');

new models.RequestModel(taskPath)
    .withFailOnWarning(false)
    .withGenerateDocumentationFile('true')
    .withGeneratePackageOnBuild('true')
    .withPackageRequireLicenseAcceptance('true')
    .build();
