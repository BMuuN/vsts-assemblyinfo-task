import path = require('path');
import models = require('../builders/request-model-builder');

const taskPath = path.join(__dirname, '..\\..\\index.js');

new models.RequestModel(taskPath)
    .withFailOnWarning(false)
    .withFileEncoding('iso-8859-1')
    .withWriteBom(true)
    .build();
