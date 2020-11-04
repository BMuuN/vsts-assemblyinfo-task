import path = require('path');
import models = require('../builders/request-model-builder');

const taskPath = path.join(__dirname, '..\\..\\index.js');

new models.RequestModel(taskPath)
    .withFailOnWarning(false)
    .withFileEncoding('iso-8859-1')
    .withWriteBom(true)
    // .withVersionNumber('TS Extension Test Build_2018.11.1234.4321')
    .withVersionNumber('TS Extension Test Build_2018.11.*.*')
    // .withVersionNumber('TS Extension Test Build_2018.11.*')

    // .withVersionNumber('2018.11.1234.4321')

    // .withVersionNumber('*.*.2018.11')
    // .withVersionNumber('2018.*.*.11')
    // .withVersionNumber('2018.11.*.*')

    // .withVersionNumber('2018.11.1234')
    // .withVersionNumber('*.2018.11')
    // .withVersionNumber('2018.*.11')
    // .withVersionNumber('2018.11.*')

    // .withVersionNumber('*.2018.11.4321')
    // .withVersionNumber('2018.*.11.4321')
    // .withVersionNumber('2018.11.*.4321')

    // .withPackageVersion('9.8.7-beta65')
    // .withPackageVersion('*.*.7-beta65')
    .withPackageVersion('9.*.*-beta65')

    // .withPackageVersion('*.8.7-beta65')
    // .withPackageVersion('9.*.7-beta65')
    // .withPackageVersion('9.8.*-beta65')

    // .withFileVersionNumber('TS Extension Test Build_1990.03.6789.9876')
    .withFileVersionNumber('TS Extension Test Build_1990.03.*.*')
    // .withFileVersionNumber('TS Extension Test Build_1990.03.*')

    // .withFileVersionNumber('1990.03.6789.9876')

    // .withFileVersionNumber('*.*.1990.03')
    // .withFileVersionNumber('1990.*.*.03')
    // .withFileVersionNumber('1990.03.*.*')

    // .withFileVersionNumber('1990.03.6789')
    // .withFileVersionNumber('*.1990.03')
    // .withFileVersionNumber('1990.*.03')
    // .withFileVersionNumber('1990.03.*')

    // .withFileVersionNumber('*.1990.03.6789')
    // .withFileVersionNumber('1990.*.03.6789')
    // .withFileVersionNumber('1990.03.*.6789')

    // .withInformationalVersionNumber('2.3.4-beta5')
    // .withInformationalVersionNumber('*.*.4-beta5')
    .withInformationalVersionNumber('2.*.*-beta5')

    // .withInformationalVersionNumber('*.3.4-beta5')
    // .withInformationalVersionNumber('2.*.4-beta5')
    // .withInformationalVersionNumber('2.3.*-beta5')

    .build();
