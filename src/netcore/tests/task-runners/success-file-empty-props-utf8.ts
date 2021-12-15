import path = require('path');
import models = require('../builders/request-model-builder');

const taskPath = path.join(__dirname, '..\\..\\index.js');

new models.RequestModel(taskPath)
    .withFileNames('\n**/EmptyDirectory.Build.props')
    .withFailOnWarning(false)
    .withFileEncoding('utf-8')
    .build();
