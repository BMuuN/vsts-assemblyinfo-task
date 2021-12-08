import path = require('path');
import models = require('../builders/request-model-builder');

const taskPath = path.join(__dirname, '..\\..\\index.js');

new models.RequestModel(taskPath)
    .withFailOnWarning(false)
    .withFileEncoding('auto')
    .withWriteBom(true)
    .withVersionNumber('TS Extension Test Build_2018.11.*.*')
    .withPackageVersion('9.*.*-beta5')
    .withFileVersionNumber('TS Extension Test Build_1990.03.*.*')
    .withInformationalVersionNumber('2.*.*-prerelease')
    .build();
