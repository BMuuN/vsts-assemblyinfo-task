import tl = require('azure-pipelines-task-lib/task');
import trm = require('azure-pipelines-task-lib/toolrunner');
import chardet = require('chardet');
import fs = require('fs');
import iconv = require('iconv-lite');
import moment = require('moment');
import path = require('path');

import { LoggingLevel } from './enums';
import models = require('./models');
import { Logger, TelemetryService, Utils } from './services';

let logger: Logger = new Logger(false, LoggingLevel.Normal);

async function run() {

    const disableTelemetry: boolean = tl.getBoolInput('DisableTelemetry', true);
    const telemetry = new TelemetryService(disableTelemetry, '#{NetFrameworkInstrumentationKey}#');
    telemetry.trackEvent('Start Net Framework');

    try {
        const regExModel = new models.RegEx();

        const model = getDefaultModel();
        model.fileNames = Utils.formatFileNames(model.fileNames);

        logger = new Logger(model.failOnWarning, Utils.mapLogLevel(model.logLevel));

        // Make sure path to source code directory is available
        if (!tl.exist(model.path)) {
            logger.error(`Source directory does not exist: ${model.path}`);
            return;
        }

        applyTransforms(model, regExModel);
        generateVersionNumbers(model, regExModel);
        printTaskParameters(model);
        setManifestData(model, regExModel);
        setOutputVariables(model);

        logger.success('Complete.');

    } catch (err: any) {
        logger.error(`Task failed with error: ${err.message}`);
        telemetry.trackException(err.message);
    }

    telemetry.trackEvent('End Net Framework');
}

function applyTransforms(model: models.NetFramework, regex: models.RegEx): void {
    Object.keys(model).forEach((key: string) => {
        if (model.hasOwnProperty(key)) {
            const value = Reflect.get(model, key);
            if (typeof value === 'string' && value !== '') {
                const newValue = Utils.transformDates(value, regex);
                if (value !== newValue) {
                    Reflect.set(model, key, newValue);
                    // logger.debug(`Key: ${key},  Value: ${value},  New Value: ${newValue}`);
                }
            }
          }
    });
}

function getDefaultModel(): models.NetFramework {
    const model: models.NetFramework = {
        path: tl.getPathInput('Path', true) || '',
        fileNames: tl.getDelimitedInput('FileNames', '\n', true),
        insertAttributes: tl.getBoolInput('InsertAttributes', true),
        fileEncoding: tl.getInput('FileEncoding', true) || '',
        detectedFileEncoding: '',
        writeBOM: tl.getBoolInput('WriteBOM', true),

        title: tl.getInput('Title', false) || '',
        product: tl.getInput('Product', false) || '',
        description: tl.getInput('Description', false) || '',
        company: tl.getInput('Company', false) || '',
        copyright: tl.getInput('Copyright', false) || '',
        trademark: tl.getInput('Trademark', false) || '',
        culture: tl.getInput('Culture', false) || '',
        configuration: tl.getInput('Configuration', false) || '',

        version: tl.getInput('VersionNumber', false) || '',
        fileVersion: tl.getInput('FileVersionNumber', false) || '',
        informationalVersion: tl.getInput('InformationalVersion', false) || '',
        verBuild: '',
        verRelease: '',

        logLevel: tl.getInput('LogLevel', true) || '',
        failOnWarning: tl.getBoolInput('FailOnWarning', true),
    };

    return model;
}

function generateVersionNumbers(model: models.NetFramework, regexModel: models.RegEx): void {
    const start = moment('2000-01-01');
    const end = moment();
    let duration = moment.duration(end.diff(start));
    const verBuild = Math.floor(duration.asDays());

    const midnight = moment().startOf('day');
    duration = moment.duration(end.diff(midnight));
    const verRelease = Math.ceil(duration.asSeconds() / 2);

    model.verBuild = verBuild.toString();
    model.verRelease = verRelease.toString();

    const version = model.version.match(regexModel.version);
    const versionValue = version && version[0] || '';

    const fileVersion = model.fileVersion.match(regexModel.version);
    const fileVersionValue = fileVersion && fileVersion[0] || '';

    model.version = Utils.setWildcardVersionNumber(versionValue, model.verBuild, model.verRelease);
    model.fileVersion = Utils.setWildcardVersionNumber(fileVersionValue, model.verBuild, model.verRelease);
    model.informationalVersion = Utils.setWildcardVersionNumber(model.informationalVersion, model.verBuild, model.verRelease);
}

function printTaskParameters(model: models.NetFramework): void {

    logger.debug('Task Parameters...');
    logger.debug(`Source folder: ${model.path}`);
    logger.debug(`Source files: ${model.fileNames}`);
    logger.debug(`Insert attributes: ${model.insertAttributes}`);
    logger.debug(`File encoding: ${model.fileEncoding}`);
    logger.debug(`Write unicode BOM: ${model.writeBOM}`),

    logger.debug(`Title: ${model.title}`);
    logger.debug(`Product: ${model.product}`);
    logger.debug(`Description: ${model.description}`);
    logger.debug(`Company: ${model.company}`);
    logger.debug(`Copyright: ${model.copyright}`);
    logger.debug(`Trademark: ${model.trademark}`);
    logger.debug(`Culture: ${model.culture}`);
    logger.debug(`Configuration: ${model.configuration}`);
    logger.debug(`Assembly version: ${model.version}`);
    logger.debug(`Assembly file version: ${model.fileVersion}`);
    logger.debug(`Informational version: ${model.informationalVersion}`);

    logger.debug(`Log Level: ${model.logLevel}`);
    logger.debug(`Fail on Warning: ${model.failOnWarning}`);

    logger.debug('');
}

function setManifestData(model: models.NetFramework, regEx: models.RegEx): void {

    logger.info('Setting .Net Framework assembly info...');

    const files = tl.findMatch(model.path, model.fileNames);

    if (files.length <= 0) {
        logger.error(`No files found for: ${model.fileNames.join(', ')}`);
        return;
    }

    files.forEach((file: string) => {

        logger.info(`Processing: ${file}`);

        if (path.extname(file) !== '.vb' && path.extname(file) !== '.cs' && path.extname(file) !== '.cpp') {
            logger.warning('Invalid file.  Only the following file extensions are supported: .cs, .vb, .cpp');
            logger.info('');
            return;
        }

        if (!tl.exist(file)) {
            logger.error(`File not found: ${file}`);
            return;
        }

        setFileEncoding(file, model);

        if (!iconv.encodingExists(model.detectedFileEncoding)) {
            logger.error(`${model.detectedFileEncoding} file encoding not supported`);
            return;
        }

        let fileContent: string = iconv.decode(fs.readFileSync(file), model.detectedFileEncoding);

        if (model.insertAttributes) {
            fileContent = addUsingIfMissing(file, fileContent);
        }

        fileContent = processAttribute(file, fileContent, 'AssemblyVersion', regEx.word, model.version, model.insertAttributes, true);
        fileContent = processAttribute(file, fileContent, 'AssemblyFileVersion', regEx.word, model.fileVersion, model.insertAttributes, true);
        fileContent = processAttribute(file, fileContent, 'AssemblyInformationalVersion', regEx.word, model.informationalVersion, model.insertAttributes, true);
        fileContent = processAttribute(file, fileContent, 'AssemblyTitle', regEx.word, model.title, model.insertAttributes, false);
        fileContent = processAttribute(file, fileContent, 'AssemblyProduct', regEx.word, model.product, model.insertAttributes, false);
        fileContent = processAttribute(file, fileContent, 'AssemblyCompany', regEx.word, model.company, model.insertAttributes, false);
        fileContent = processAttribute(file, fileContent, 'AssemblyTrademark', regEx.word, model.trademark, model.insertAttributes, false);
        fileContent = processAttribute(file, fileContent, 'AssemblyDescription', regEx.word, model.description, model.insertAttributes, false);
        fileContent = processAttribute(file, fileContent, 'AssemblyCulture', regEx.word, model.culture, model.insertAttributes, false);
        fileContent = processAttribute(file, fileContent, 'AssemblyConfiguration', regEx.word, model.configuration, model.insertAttributes, false);
        fileContent = processAttribute(file, fileContent, 'AssemblyCopyright', regEx.word, model.copyright, model.insertAttributes, false);

        fs.writeFileSync(file, iconv.encode(fileContent, model.detectedFileEncoding, { addBOM: model.writeBOM, stripBOM: undefined, defaultEncoding: undefined }));

        const encodingResult = getFileEncoding(file);
        logger.debug(`Verify file encoding: ${encodingResult}`);
        logger.info('');
    });
}

function getFileEncoding(file: string) {
    const encoding = chardet.detectFileSync(file, { sampleSize: 64 });
    return encoding && encoding.toString().toLocaleLowerCase() || 'utf-8';
}

function setFileEncoding(file: string, model: models.NetFramework) {
    const encoding = getFileEncoding(file);
    logger.debug(`Detected file encoding: ${encoding}`);

    model.detectedFileEncoding = model.fileEncoding;

    if (model.fileEncoding === 'auto') {
        model.detectedFileEncoding = encoding;
    } else if (model.fileEncoding !== encoding) {
        logger.warning(`Detected file encoding (${encoding}) is different to the one specified (${model.fileEncoding}).`);
    }
}

function addUsingIfMissing(file: string, content: string) {

    let usings: string[] = [];

    if (file.endsWith('.vb')) {
        usings = ['Imports System.Reflection'];
    } else if (file.endsWith('.cs')) {
        usings = ['using System.Runtime.CompilerServices;', 'using System.Reflection;'];
    } else if (file.endsWith('.cpp')) {
        usings = ['using namespace System::Reflection;', 'using namespace System::Runtime::InteropServices;'];
    }

    usings.forEach((value, index, array) => {
        const res = content.match(new RegExp(`${value}`, 'gi'));
        if (!res || res.length <= 0) {
            logger.info(`Adding --> ${value}`);
            content = value.concat('\r\n', content);
        }
    });

    return content;
}

function processAttribute(file: string, fileContent: string, attributeName: string, regex: string, value: string, insertAttributes: boolean, isVersionNumber: boolean): string {

    if (value && value.length > 0) {
        if (insertAttributes) {
            fileContent = insertAttribute(file, fileContent, attributeName, value);
        }
        fileContent = replaceAttribute(fileContent, attributeName, regex, value, isVersionNumber);
    }

    return fileContent;
}

function insertAttribute(file: string, content: string, name: string, value: string): string {

    if (file.endsWith('.vb')) {

        // ignores comments and finds correct attribute
        const res = content.match(new RegExp(`\\<Assembly:\\s*${name}`, 'gi'));
        if (!res || res.length <= 0) {
            logger.info(`Adding --> ${name}`);
            content += `\r\n<Assembly: ${name}("${value}")\>`;
        }

    } else if (file.endsWith('.cs')) {

        // ignores comments and finds correct attribute
        const res = content.match(new RegExp(`\\[assembly:\\s*${name}`, 'gi'));
        if (!res || res.length <= 0) {
            logger.info(`Adding --> ${name}`);
            content += `\r\n[assembly: ${name}("${value}")\]`;
        }

    } else if (file.endsWith('.cpp')) {
        
        // ignores comments and finds correct attribute
        const res = content.match(new RegExp(`^\\[assembly:\\s*${name}`, 'gim'));
        if (!res || res.length <= 0) {
            logger.info(`Adding --> ${name}`);
            content += `\r\n[assembly: ${name}("${value}")\];`;
        }
    }

    return content;
}

function replaceAttribute(content: string, name: string, regEx: string, value: string, isVersionNumber: boolean): string {
    logger.info(`${name} --> ${value}`);

    if (isVersionNumber) {
        let existingVersioNumberResult = content.match(new RegExp(`${name}\\s*\\w*\\(${regEx}\\)`, 'gi')) as RegExpMatchArray;
        if (existingVersioNumberResult && existingVersioNumberResult.length >= 1) {
            existingVersioNumberResult.forEach((val: string, index: number, array: string[]) => {
                let existingVersioNumber = val.substring(val.indexOf('("') + 2, val.indexOf('")'));
                let newVersion  = Utils.setVersionNumber(existingVersioNumber, value);
                content = content.replace(`${val}`, `${name}("${newVersion}")`);
            });
        }
    } else {
        content = content.replace(new RegExp(`${name}\\s*\\w*\\(${regEx}\\)`, 'gi'), `${name}("${value}")`);
    }

    return content;
}

function setOutputVariables(model: models.NetFramework) {
    tl.setVariable('Version', model.version, false);
    tl.setVariable('FileVersion', model.fileVersion, false);
    tl.setVariable('InformationalVersion', model.informationalVersion, false);
}

run();
