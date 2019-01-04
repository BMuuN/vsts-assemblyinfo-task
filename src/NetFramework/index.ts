import tl = require('azure-pipelines-task-lib/task');
import trm = require('azure-pipelines-task-lib/toolrunner');
import chardet = require('chardet');
import fs = require('fs');
import iconv = require('iconv-lite');
import moment = require('moment');
import path = require('path');

import models = require('./models');
import utils = require('./services/utils.service');

async function run() {
    try {

        const regExModel = new models.RegEx();

        const model = getDefaultModel();
        model.fileNames = utils.formatFileNames(model.fileNames);

        // Make sure path to source code directory is available
        if (!tl.exist(model.path)) {
            tl.setResult(tl.TaskResult.Failed, `Source directory does not exist: ${model.path}`);
            return;
        }

        utils.setCopyright(model, regExModel);
        generateVersionNumbers(model, regExModel);
        printTaskParameters(model);
        setManifestData(model, regExModel);

        tl.setVariable('AssemblyInfo.Version', model.version, false);
        tl.setVariable('AssemblyInfo.FileVersion', model.fileVersion, false);
        tl.setVariable('AssemblyInfo.InformationalVersion', model.informationalVersion, false);

        tl.setResult(tl.TaskResult.Succeeded, tl.loc('TaskReturnCode'));

    } catch (err) {
        tl.setResult(tl.TaskResult.Failed, tl.loc('TaskFailed', err.message));
    }
}

function getDefaultModel(): models.NetFramework {
    const model: models.NetFramework = {
        path: tl.getPathInput('Path', true),
        fileNames: tl.getDelimitedInput('FileNames', '\n', true),
        insertAttributes: tl.getBoolInput('InsertAttributes', true),
        fileEncoding: tl.getInput('FileEncoding', true),
        writeBOM: tl.getBoolInput('WriteBOM', true),
        title: tl.getInput('Title', false),
        product: tl.getInput('Product', false),
        description: tl.getInput('Description', false),
        company: tl.getInput('Company', false),
        copyright: tl.getInput('Copyright', false),
        trademark: tl.getInput('Trademark', false),
        culture: tl.getInput('Culture', false),
        configuration: tl.getInput('Configuration', false),
        version: tl.getInput('VersionNumber', false),
        fileVersion: tl.getInput('FileVersionNumber', false),
        informationalVersion: tl.getInput('InformationalVersion', false),
        verBuild: '',
        verRelease: '',
    };

    return model;
}

function generateVersionNumbers(model: models.NetFramework, regexModel: models.RegEx): void {
    const start = moment('2000-01-01');
    const end = moment();
    let duration = moment.duration(end.diff(start));
    const verBuild = Math.round(duration.asDays());

    const midnight = moment().startOf('day');
    duration = moment.duration(end.diff(midnight));
    const verRelease = Math.round(duration.asSeconds() / 2);

    model.verBuild = verBuild.toString();
    model.verRelease = verRelease.toString();

    const version = model.version.match(regexModel.version);
    const versionValue = version && version[0] || '';

    const fileVersion = model.fileVersion.match(regexModel.version);
    const fileVersionValue = fileVersion && fileVersion[0] || '';

    model.version = utils.setWildcardVersionNumber(versionValue, model.verBuild, model.verRelease);
    model.fileVersion = utils.setWildcardVersionNumber(fileVersionValue, model.verBuild, model.verRelease);
    model.informationalVersion = utils.setWildcardVersionNumber(model.informationalVersion, model.verBuild, model.verRelease);
}

function printTaskParameters(model: models.NetFramework): void {
    console.log(`Source folder: ${model.path}`);
    console.log(`Source files: ${model.fileNames}`);
    console.log(`Insert attributes: ${model.insertAttributes}`);
    console.log(`File encoding: ${model.fileEncoding}`);
    console.log(`Write unicode BOM: ${model.writeBOM}`),

    console.log(`Title: ${model.title}`);
    console.log(`Product: ${model.product}`);
    console.log(`Description: ${model.description}`);
    console.log(`Company: ${model.company}`);
    console.log(`Copyright: ${model.copyright}`);
    console.log(`Trademark: ${model.trademark}`);
    console.log(`Culture: ${model.culture}`);
    console.log(`Configuration: ${model.configuration}`);
    console.log(`Assembly version: ${model.version}`);
    console.log(`Assembly file version: ${model.fileVersion}`);
    console.log(`Informational version: ${model.informationalVersion}`);
}

function setManifestData(model: models.NetFramework, regEx: models.RegEx): void {

    console.log('Setting .Net Framework assembly info...');

    tl.findMatch(model.path, model.fileNames).forEach((file: string) => {

        console.log(`Processing: ${file}`);

        if (path.extname(file) !== '.vb' && path.extname(file) !== '.cs') {
            console.log(`File is not .vb or .cs`);
            return;
        }

        if (!tl.exist(file)) {
            tl.error(`File not found: ${file}`);
            return;
        }

        setFileEncoding(file, model);

        if (!iconv.encodingExists(model.fileEncoding)) {
            tl.error(`${model.fileEncoding} file encoding not supported`);
            return;
        }

        let fileContent: string = iconv.decode(fs.readFileSync(file), model.fileEncoding);

        fileContent = addUsingIfMissing(file, fileContent);

        fileContent = processNetFrameworkAttribute(file, fileContent, 'AssemblyVersion', regEx.word, model.version, model.insertAttributes);
        fileContent = processNetFrameworkAttribute(file, fileContent, 'AssemblyFileVersion', regEx.word, model.fileVersion, model.insertAttributes);
        fileContent = processNetFrameworkAttribute(file, fileContent, 'AssemblyInformationalVersion', regEx.word, model.informationalVersion, model.insertAttributes);
        fileContent = processNetFrameworkAttribute(file, fileContent, 'AssemblyTitle', regEx.word, model.title, model.insertAttributes);
        fileContent = processNetFrameworkAttribute(file, fileContent, 'AssemblyProduct', regEx.word, model.product, model.insertAttributes);
        fileContent = processNetFrameworkAttribute(file, fileContent, 'AssemblyCompany', regEx.word, model.company, model.insertAttributes);
        fileContent = processNetFrameworkAttribute(file, fileContent, 'AssemblyTrademark', regEx.word, model.trademark, model.insertAttributes);
        fileContent = processNetFrameworkAttribute(file, fileContent, 'AssemblyDescription', regEx.word, model.description, model.insertAttributes);
        fileContent = processNetFrameworkAttribute(file, fileContent, 'AssemblyCulture', regEx.word, model.culture, model.insertAttributes);
        fileContent = processNetFrameworkAttribute(file, fileContent, 'AssemblyConfiguration', regEx.word, model.configuration, model.insertAttributes);
        fileContent = processNetFrameworkAttribute(file, fileContent, 'AssemblyCopyright', regEx.word, model.copyright, model.insertAttributes);

        fs.writeFileSync(file, iconv.encode(fileContent, model.fileEncoding, { addBOM: model.writeBOM, stripBOM: undefined, defaultEncoding: undefined }));

        console.log(`${file} - Assembly Info Applied`);

        const chardetResult = chardet.detectFileSync(file, { sampleSize: 64 });
        console.log(`Verify character encoding: ${chardetResult}`);
    });
}

function setFileEncoding(file: string, model: models.NetFramework) {
    const chardetEncoding = chardet.detectFileSync(file, { sampleSize: 64 });
    const chardetEncodingValue: string = chardetEncoding && chardetEncoding.toString().toLocaleLowerCase() || 'utf-8';

    console.log(`Detected character encoding: ${chardetEncodingValue}`);

    if (model.fileEncoding === 'auto') {
        model.fileEncoding = chardetEncodingValue;
    } else if (model.fileEncoding !== chardetEncodingValue) {
        console.log(`Detected character encoding is different to the one specified.`);
    }
}

function addUsingIfMissing(file: string, content: string) {

    let usings: string[] = [];

    if (file.endsWith('.vb')) {
        usings = ['Imports System.Reflection'];
    } else if (file.endsWith('.cs')) {
        usings = ['using System.Reflection;', 'using System.Runtime.CompilerServices;'];
    }

    usings.forEach((value, index, array) => {
        const res = content.match(new RegExp(`${value}`, 'gi'));
        if (!res || res.length <= 0) {
            console.log(`Adding --> ${value}`);
            content = value.concat('\r\n', content);
        }
    });

    return content;
}

function processNetFrameworkAttribute(file: string, fileContent: string, attributeName: string, regex: string, value: string, insertAttributes: boolean): string {

    if (value && value.length > 0) {
        if (insertAttributes) {
            fileContent = insertAttribute(file, fileContent, attributeName, value);
        }
        fileContent = replaceAttribute(fileContent, attributeName, regex, value);
    }

    return fileContent;
}

function insertAttribute(file: string, content: string, name: string, value: string): string {

    if (file.endsWith('.vb')) {

        // ignores comments and finds correct attribute
        const res = content.match(new RegExp(`\\<Assembly:\\s*${name}`, 'gi'));
        if (!res || res.length <= 0) {
            console.log(`Adding --> ${name}: ${value}`);
            content += `\r\n<Assembly: ${name}("${value}")\>`;
        }

    } else if (file.endsWith('.cs')) {

        // ignores comments and finds correct attribute
        const res = content.match(new RegExp(`\\[assembly:\\s*${name}`, 'gi'));
        if (!res || res.length <= 0) {
            console.log(`Adding --> ${name}: ${value}`);
            content += `\r\n[assembly: ${name}("${value}")\]`;
        }
    }

    return content;
}

function replaceAttribute(content: string, name: string, regEx: string, value: string): string {
    console.log(`${name}: ${value}`);
    content = content.replace(new RegExp(`${name}\\s*\\w*\\(${regEx}\\)`, 'gi'), `${name}("${value}")`);
    return content;
}

run();
