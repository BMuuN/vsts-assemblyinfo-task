import path = require('path');
import models = require('../builders/request-model-builder');

const taskPath = path.join(__dirname, '..\\..\\index.js');

new models.RequestModel(taskPath)
    .withFailOnWarning(false)
    .withFileEncoding('auto')
    .withWriteBom(true)
    .withVersionNumber('TS Extension Test Build_#.15.#.98')
    .withFileVersionNumber('TS Extension Test Build_#.92.#.6')
    .withPackageVersion('#.#.2-beta1')
    .withInformationalVersionNumber('2.#.#-fail')
    .build();
