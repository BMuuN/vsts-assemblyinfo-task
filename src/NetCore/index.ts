import path = require('path');
import tl = require('vsts-task-lib/task');
import trm = require('vsts-task-lib/toolrunner');
import fs = require('fs');
import moment = require('moment');
import chardet = require('chardet');
import iconv = require('iconv-lite');
import xmlReader = require('read-xml');

import utils = require('../Common/utils');
import models = require('../Common/models');

async function run() {
    try {

        let regExModel = new models.RegEx();

        let model: models.NetCore = {
            path: tl.getPathInput('Path', true),
            fileNames: tl.getDelimitedInput('FileNames', '\n', true),
            insertAttributes: tl.getBoolInput('InsertAttributes', true),
            fileEncoding: tl.getInput('SaveFileEncoding', true),
            writeBOM: tl.getBoolInput('WriteBOM', true),

            title: tl.getInput('Title', false),
            product: tl.getInput('Product', false),
            description: tl.getInput('Description', false),
            company: tl.getInput('Company', false),
            culture: tl.getInput('Culture', false),
            authors: tl.getInput('Authors', false),
            packageLicenseUrl: tl.getInput('PackageLicenseUrl', false),
            packageProjectUrl: tl.getInput('PackageProjectUrl', false),
            packageIconUrl: tl.getInput('PackageIconUrl', false),
            repositoryUrl: tl.getInput('RepositoryUrl', false),
            generatePackageOnBuild: tl.getInput('GeneratePackageOnBuild', false),
            repositoryType: tl.getInput('RepositoryType', false),
            packageTags: tl.getInput('PackageTags', false),
            packageReleaseNotes: tl.getInput('PackageReleaseNotes', false),

            version: tl.getInput('VersionNumber', false),
            fileVersion: tl.getInput('FileVersionNumber', false),
            informationalVersion: tl.getInput('InformationalVersion', false),
            verBuild: '',
            verRelease: ''
        };

        // Clean up the filenames
        let targetFiles: string[] = [];
        model.fileNames.forEach((x: string) => {
            if (x)
                x.split(',').forEach((y: string) => {
                    if (y) {
                        targetFiles.push(y.trim());
                    }
                })
        });
        model.fileNames = targetFiles;

        // Make sure path to source code directory is available
        if(!tl.exist(model.path)) {
            tl.setResult(tl.TaskResult.Failed, `Source directory does not exist: ${model.path}`);
            return;
        }

        setWildcardVersionNumbers(model);
        printTaskParameters(model);
        netCore(model, regExModel);

        tl.setVariable('AssemblyInfo.Version', model.version, false);
        tl.setVariable('AssemblyInfo.FileVersion', model.fileVersion, false);
        tl.setVariable('AssemblyInfo.InformationalVersion', model.informationalVersion, false);

        tl.debug('Task done!');
        tl.setResult(tl.TaskResult.Succeeded, tl.loc('TaskReturnCode'));
    }
    catch (err) {
        tl.setResult(tl.TaskResult.Failed, tl.loc('TaskFailed', err.message));
    }
}

function setWildcardVersionNumbers(model: models.NetCore): void {
    let start = moment('2000-01-01');
    let end = moment();
    var duration = moment.duration(end.diff(start));
    let verBuild = Math.round(duration.asDays());

    let midnight = moment().startOf('day');
    duration = moment.duration(end.diff(midnight));
    let verRelease = Math.round(duration.asSeconds() / 2);

    model.verBuild = verBuild.toString();
    model.verRelease = verRelease.toString();
    model.version = utils.setWildcardVersionNumber(model.version, model.verBuild, model.verRelease);
    model.fileVersion = utils.setWildcardVersionNumber(model.fileVersion, model.verBuild, model.verRelease);
    model.informationalVersion = utils.setWildcardVersionNumber(model.informationalVersion, model.verBuild, model.verRelease);
}

function printTaskParameters(model: models.NetCore): void {
    tl.debug(`Path: ${model.path}`);
    tl.debug(`File Names: ${model.fileNames}`);
    tl.debug(`Insert Attributes: ${model.insertAttributes}`);
    tl.debug(`File Encoding: ${model.fileEncoding}`);
    tl.debug(`Write BOM: ${model.writeBOM}`),
    tl.debug(`Title: ${model.title}`);
    tl.debug(`Product: ${model.product}`);
    tl.debug(`Description: ${model.description}`);
    tl.debug(`Company: ${model.company}`);
    tl.debug(`Culture: ${model.culture}`);
    tl.debug(`Authors: ${model.authors}`);
    tl.debug(`PackageLicenseUrl: ${model.packageLicenseUrl}`);
    tl.debug(`PackageProjectUrl: ${model.packageProjectUrl}`);
    tl.debug(`PackageIconUrl: ${model.packageIconUrl}`);
    tl.debug(`RepositoryUrl: ${model.repositoryUrl}`);
    tl.debug(`GeneratePackageOnBuild: ${model.generatePackageOnBuild}`);
    tl.debug(`RepositoryType: ${model.repositoryType}`);
    tl.debug(`PackageTags: ${model.packageTags}`);
    tl.debug(`PackageReleaseNotes: ${model.packageReleaseNotes}`);
    tl.debug(`Version Number: ${model.version}`);
    tl.debug(`File Version Number: ${model.fileVersion}`);
    tl.debug(`Informational Version: ${model.informationalVersion}`);
}

function netCore(model: models.NetCore, regEx: models.RegEx): void {
    
    tl.debug('Setting .Net Core assembly info...');

    tl.findMatch(model.path, model.fileNames).forEach(file => {

        if (!tl.exist(file))
        {
            //tl.warning(`File not found: ${file}`);
            //tl.error(`file not found: ${file}`);
            throw new Error('File not found: ${file}.')
        }

        tl.debug(`Processing: ${file}`);

        // encodings is an array of objects sorted by confidence value in decending order
        // e.g. [{ confidence: 90, name: 'UTF-8'}, {confidence: 20, name: 'windows-1252', lang: 'fr'}]
        if (model.fileEncoding === 'auto') {
            let chardetEncoding = chardet.detectFileSync(file, { sampleSize: 64 });
            model.fileEncoding = getChardetResult(chardetEncoding);
            tl.debug(`Detected character encoding: ${model.fileEncoding}`);
        }
        
        xmlReader.readXML(fs.readFileSync(file, model.fileEncoding), function(err: any, data: any) {
            
            if (err) {
              tl.error(`Error reading file: ${err}`);
              return;
            }

            tl.debug(`xml encoding: ${data.encoding}`);
            tl.debug(`Decoded xml ${data.content}`);

            // read file and replace tokens
            // let data: string = iconv.decode(fs.readFileSync(file), model.fileEncoding);
            // let data: string = fs.readFileSync(file, model.fileEncoding);
            // let fileContent = xmlParser.toJson(data);
            let fileContent = data.content;

            if (!fileContent.Project || !fileContent.Project.PropertyGroup) {
                tl.error(`Error reading file: ${err}`);
                return
            }

            for (let group of fileContent.Project.PropertyGroup) {

                // Version
                if (model.version) {
        
                    if (model.insertAttributes 
                        && !group.AssemblyVersion 
                        && (group.TargetFramework || group.TargetFrameworks)) {
                        group.AssemblyVersion = '';
                    }

                    if (group.AssemblyVersion) {
                        group.AssemblyVersion = model.version
                        tl.debug(`tAssemblyVersion: ${model.version}`);
                    }
                }
            }

            // fileContent = processNetFrameworkAttribute(file, fileContent, 'AssemblyVersion', regEx.word, model.version, model.insertAttributes);
            // fileContent = processNetFrameworkAttribute(file, fileContent, 'AssemblyFileVersion', regEx.word, model.fileVersion, model.insertAttributes);
            // fileContent = processNetFrameworkAttribute(file, fileContent, 'AssemblyInformationalVersion', regEx.word, model.informationalVersion, model.insertAttributes);
            // fileContent = processNetFrameworkAttribute(file, fileContent, 'AssemblyTitle', regEx.word, model.title, model.insertAttributes);
            // fileContent = processNetFrameworkAttribute(file, fileContent, 'AssemblyProduct', regEx.word, model.product, model.insertAttributes);
            // fileContent = processNetFrameworkAttribute(file, fileContent, 'AssemblyCompany', regEx.word, model.company, model.insertAttributes);
            // fileContent = processNetFrameworkAttribute(file, fileContent, 'AssemblyTrademark', regEx.word, model.trademark, model.insertAttributes);
            // fileContent = processNetFrameworkAttribute(file, fileContent, 'AssemblyDescription', regEx.word, model.description, model.insertAttributes);
            // fileContent = processNetFrameworkAttribute(file, fileContent, 'AssemblyCulture', regEx.word, model.culture, model.insertAttributes);
            // fileContent = processNetFrameworkAttribute(file, fileContent, 'AssemblyConfiguration', regEx.word, model.configuration, model.insertAttributes);
            // fileContent = processNetFrameworkAttribute(file, fileContent, 'AssemblyCopyright', regEx.word, model.copyright, model.insertAttributes);

            fs.writeFileSync(file, iconv.encode(fileContent, model.fileEncoding, { addBOM: model.writeBOM, stripBOM: undefined, defaultEncoding: undefined }));

            tl.debug(`${file} - Assembly Info Applied`);

            let chardetResult = chardet.detectFileSync(file, { sampleSize: 64 });
            tl.debug(`Verify character encoding: ${chardetResult}`);

          });
    });
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
        let res = content.match(new RegExp(`\\<Assembly:\\s*${name}`, 'gi'));
        if (!res || res.length <= 0) {
            tl.debug(`Adding --> ${name}: ${value}`);
            content += `\r\n<Assembly: ${name}("${value}")\>`;
        }

    } else if (file.endsWith('.cs')) {
        
        // ignores comments and finds correct attribute
        let res = content.match(new RegExp(`\\[assembly:\\s*${name}`, 'gi'));
        if (!res || res.length <= 0) {
            tl.debug(`Adding --> ${name}: ${value}`);
            content += `\r\n[assembly: ${name}("${value}")\]`;
        }
    }

    return content;
}

function replaceAttribute(content: string, name: string, regEx: string, value: string): string {
    tl.debug(`${name}: ${value}`);
    content = content.replace(new RegExp(`${name}\\s*\\(${regEx}\\)`, 'gi'), `${name}("${value}")`);
    return content;
}

function getChardetResult(encoding: chardet.Result): string {
    
    // switch(encoding) {
    //     case '':
    //         return 'utf8';
    //     case '':
    //         return 'utf-8';
    //     case '':
    //         return 'ucs2';
    //     case '':
    //         return 'ucs-2';
    //     case '':
    //         return 'utf16le';
    //     case '':
    //         return 'utf-16le';
    //     case '':
    //         return 'latin1';
    //     case '':
    //         return 'binary';
    //     case '':
    //         return 'base64';
    //     case '':
    //         return 'ascii';
    //     case '':
    //         return 'hex';
    // }

    if (!encoding) {
        return 'utf8';
    }
    
    return encoding.toString().toLocaleLowerCase();
}

run();