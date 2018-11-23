'use strict';

import path = require('path');
import tl = require('vsts-task-lib/task');
import trm = require('vsts-task-lib/toolrunner');
import fs = require('fs');
import moment = require('moment');
import chardet = require('chardet');
import iconv = require('iconv-lite');
import xml2js = require('xml2js');

import utils = require('../Common/utils');
import models = require('../Common/models');

async function run() {
    try {

        let regExModel = new models.RegEx();

        var model = getDefaultModel();
        model.fileNames = utils.formatFileNames(model.fileNames);

        // Make sure path to source code directory is available
        if (!tl.exist(model.path)) {
            tl.setResult(tl.TaskResult.Failed, `Source directory does not exist: ${model.path}`);
            return;
        }

        utils.setCopyright(model, regExModel);
        setWildcardVersionNumbers(model);
        printTaskParameters(model);
        setManifestData(model, regExModel);

        // set output variables
        tl.setVariable('AssemblyInfo.PackageVersion', model.packageVersion, false);
        tl.setVariable('AssemblyInfo.AssemblyVersion', model.version, false);
        tl.setVariable('AssemblyInfo.FileVersion', model.fileVersion, false);
        tl.setVariable('AssemblyInfo.InformationalVersion', model.informationalVersion, false);

        tl.setResult(tl.TaskResult.Succeeded, tl.loc('TaskReturnCode'));
    }
    catch (err) {
        tl.setResult(tl.TaskResult.Failed, tl.loc('TaskFailed', err.message));
    }
}

function getDefaultModel(): models.NetCore {
    let model: models.NetCore = {
        path: tl.getPathInput('Path', true),
        fileNames: tl.getDelimitedInput('FileNames', '\n', true),
        insertAttributes: tl.getBoolInput('InsertAttributes', true),
        fileEncoding: tl.getInput('FileEncoding', true),
        writeBOM: tl.getBoolInput('WriteBOM', true),

        generatePackageOnBuild: tl.getBoolInput('GeneratePackageOnBuild', true),
        requireLicenseAcceptance: tl.getBoolInput('PackageRequireLicenseAcceptance', true),

        packageId: tl.getInput('PackageId', false),
        packageVersion: tl.getInput('PackageVersion', false),
        authors: tl.getInput('Authors', false),
        company: tl.getInput('Company', false),
        product: tl.getInput('Product', false),
        description: tl.getInput('Description', false),
        copyright: tl.getInput('Copyright', false),
        licenseUrl: tl.getInput('PackageLicenseUrl', false),
        projectUrl: tl.getInput('PackageProjectUrl', false),
        iconUrl: tl.getInput('PackageIconUrl', false),
        repositoryUrl: tl.getInput('RepositoryUrl', false),
        repositoryType: tl.getInput('RepositoryType', false),
        tags: tl.getInput('PackageTags', false),
        releaseNotes: tl.getInput('PackageReleaseNotes', false),
        culture: tl.getInput('Culture', false),
        version: tl.getInput('VersionNumber', false),
        fileVersion: tl.getInput('FileVersionNumber', false),
        informationalVersion: tl.getInput('InformationalVersion', false),

        verBuild: '',
        verRelease: ''
    };

    return model;
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

    model.packageVersion = utils.setWildcardVersionNumber(model.packageVersion, model.verBuild, model.verRelease);
    model.version = utils.setWildcardVersionNumber(model.version, model.verBuild, model.verRelease);
    model.fileVersion = utils.setWildcardVersionNumber(model.fileVersion, model.verBuild, model.verRelease);
    model.informationalVersion = utils.setWildcardVersionNumber(model.informationalVersion, model.verBuild, model.verRelease);
}

function printTaskParameters(model: models.NetCore): void {
    tl.debug(`Path: ${model.path}`);
    tl.debug(`File names: ${model.fileNames}`);
    tl.debug(`Insert missing attributes: ${model.insertAttributes}`);
    tl.debug(`File encoding: ${model.fileEncoding}`);
    tl.debug(`Write BOM: ${model.writeBOM}`);

    tl.debug(`Generate NuGet package on build: ${model.generatePackageOnBuild}`);
    tl.debug(`Require license acceptance: ${model.requireLicenseAcceptance}`);

    tl.debug(`Package id: ${model.packageId}`);
    tl.debug(`Package version: ${model.packageVersion}`);
    tl.debug(`Authors: ${model.authors}`);
    tl.debug(`Company: ${model.company}`);
    tl.debug(`Product: ${model.product}`);
    tl.debug(`Description: ${model.description}`);
    tl.debug(`Copyright: ${model.copyright}`);
    tl.debug(`License URL: ${model.licenseUrl}`);
    tl.debug(`Project URL: ${model.projectUrl}`);
    tl.debug(`Icon URL: ${model.iconUrl}`);
    tl.debug(`Repository URL: ${model.repositoryUrl}`);
    tl.debug(`Repository type: ${model.repositoryType}`);
    tl.debug(`Tags: ${model.tags}`);
    tl.debug(`Release notes: ${model.releaseNotes}`);
    tl.debug(`Assembly neutral language: ${model.culture}`);
    tl.debug(`Assembly version: ${model.version}`);
    tl.debug(`File version number: ${model.fileVersion}`);
    tl.debug(`Informational version: ${model.informationalVersion}`);
}

function setManifestData(model: models.NetCore, regEx: models.RegEx): void {

    tl.debug('Setting .Net Core assembly info...');

    tl.findMatch(model.path, model.fileNames).forEach(file => {

        tl.debug(`Processing: ${file}`);

        if (path.extname(file) !== '.csproj') {
            tl.debug(`File is not .csproj`);
            return;
        }

        if (!tl.exist(file)) {
            tl.error(`File not found: ${file}`);
            return;
        }

        // encodings is an array of objects sorted by confidence value in decending order
        // e.g. [{ confidence: 90, name: 'UTF-8'}, {confidence: 20, name: 'windows-1252', lang: 'fr'}]
        if (model.fileEncoding === 'auto') {
            let chardetEncoding = chardet.detectFileSync(file, { sampleSize: 64 });
            model.fileEncoding = utils.getChardetResult(chardetEncoding);
            tl.debug(`Detected character encoding: ${model.fileEncoding}`);
        }

        // read file and replace tokens
        let fileContent: string = iconv.decode(fs.readFileSync(file), model.fileEncoding);

        var parser = new xml2js.Parser();
        parser.parseString(fileContent, function (err: any, result: any) {
            console.dir(result);
            console.log('Done');

            if (err) {
                tl.error(`Error reading file: ${err}`);
                return;
            }

            if (!result.Project || !result.Project.PropertyGroup) {
                tl.error(`Error reading file: ${err}`);
                return
            }

            for (let group of result.Project.PropertyGroup) {

                // Ensure we're in the correct property group
                if (!group.TargetFramework && !group.TargetFrameworks) {
                    continue;
                }

                setAssemblyData(group, model);
            }

            // rebuild xml project structure
            var builder = new xml2js.Builder({ headless: true });
            var xml = builder.buildObject(result);

            fs.writeFileSync(file, iconv.encode(xml, model.fileEncoding, { addBOM: model.writeBOM, stripBOM: undefined, defaultEncoding: undefined }));

            tl.debug(`${file} - Assembly Info Applied`);

            let chardetResult = chardet.detectFileSync(file, { sampleSize: 64 });
            tl.debug(`Verify character encoding: ${chardetResult}`);
        });
    });
}

function setAssemblyData(group: any, model: models.NetCore) {

    // Generate Package On Build
    if (model.insertAttributes && !group.GeneratePackageOnBuild) {
        group.GeneratePackageOnBuild = '';
    }

    if (group.GeneratePackageOnBuild) {
        group.GeneratePackageOnBuild = model.generatePackageOnBuild
        tl.debug(`tGenerate package on build: ${model.generatePackageOnBuild}`);
    }

    // Package Require License Acceptance
    if (model.insertAttributes && !group.PackageRequireLicenseAcceptance) {
        group.PackageRequireLicenseAcceptance = '';
    }

    if (group.PackageRequireLicenseAcceptance) {
        group.PackageRequireLicenseAcceptance = model.requireLicenseAcceptance
        tl.debug(`tPackage require license acceptance: ${model.requireLicenseAcceptance}`);
    }

    // Package Id
    if (model.packageId) {

        if (model.insertAttributes && !group.PackageId) {
            group.PackageId = '';
        }

        if (group.PackageId) {
            group.PackageId = model.packageId
            tl.debug(`tPackage id: ${model.packageId}`);
        }
    }

    // Package Version
    if (model.packageVersion) {

        if (model.insertAttributes && !group.Version) {
            group.Version = '';
        }

        if (group.Version) {
            group.Version = model.packageVersion
            tl.debug(`tPackage version: ${model.packageVersion}`);
        }
    }

    // Authors
    if (model.authors) {

        if (model.insertAttributes && !group.Authors) {
            group.Authors = '';
        }

        if (group.Authors) {
            group.Authors = model.authors
            tl.debug(`tAuthors: ${model.authors}`);
        }
    }

    // Company
    if (model.company) {

        if (model.insertAttributes && !group.Company) {
            group.Company = '';
        }

        if (group.Company) {
            group.Company = model.company
            tl.debug(`tCompany: ${model.company}`);
        }
    }

    // Product
    if (model.product) {

        if (model.insertAttributes && !group.Product) {
            group.Product = '';
        }

        if (group.Product) {
            group.Product = model.product
            tl.debug(`tProduct: ${model.product}`);
        }
    }

    // Description
    if (model.description) {

        if (model.insertAttributes && !group.Description) {
            group.Description = '';
        }

        if (group.Description) {
            group.Description = model.description
            tl.debug(`tDescription: ${model.description}`);
        }
    }

    // Copyright
    if (model.copyright) {

        if (model.insertAttributes && !group.Copyright) {
            group.Copyright = '';
        }

        if (group.Copyright) {
            group.Copyright = model.copyright
            tl.debug(`tCopyright: ${model.copyright}`);
        }
    }

    // License Url
    if (model.licenseUrl) {

        if (model.insertAttributes && !group.PackageLicenseUrl) {
            group.PackageLicenseUrl = '';
        }

        if (group.PackageLicenseUrl) {
            group.PackageLicenseUrl = model.licenseUrl
            tl.debug(`tLicense URL: ${model.licenseUrl}`);
        }
    }

    // Project Url
    if (model.projectUrl) {

        if (model.insertAttributes && !group.PackageProjectUrl) {
            group.PackageProjectUrl = '';
        }

        if (group.PackageProjectUrl) {
            group.PackageProjectUrl = model.projectUrl
            tl.debug(`tProject URL: ${model.projectUrl}`);
        }
    }

    // Icon Url
    if (model.iconUrl) {

        if (model.insertAttributes && !group.PackageIconUrl) {
            group.PackageIconUrl = '';
        }

        if (group.PackageIconUrl) {
            group.PackageIconUrl = model.iconUrl
            tl.debug(`tIcon URL: ${model.iconUrl}`);
        }
    }

    // Repository Url
    if (model.repositoryUrl) {

        if (model.insertAttributes && !group.RepositoryUrl) {
            group.RepositoryUrl = '';
        }

        if (group.RepositoryUrl) {
            group.RepositoryUrl = model.repositoryUrl
            tl.debug(`tRepository URL: ${model.repositoryUrl}`);
        }
    }

    // Repository Type
    if (model.repositoryType) {

        if (model.insertAttributes && !group.RepositoryType) {
            group.RepositoryType = '';
        }

        if (group.RepositoryType) {
            group.RepositoryType = model.repositoryType
            tl.debug(`tRepository type: ${model.repositoryType}`);
        }
    }

    // Tags
    if (model.tags) {

        if (model.insertAttributes && !group.PackageTags) {
            group.PackageTags = '';
        }

        if (group.PackageTags) {
            group.PackageTags = model.tags
            tl.debug(`tTags: ${model.tags}`);
        }
    }

    // Release Notes
    if (model.releaseNotes) {

        if (model.insertAttributes && !group.PackageReleaseNotes) {
            group.PackageReleaseNotes = '';
        }

        if (group.PackageReleaseNotes) {
            group.PackageReleaseNotes = model.releaseNotes
            tl.debug(`tRelease notes: ${model.releaseNotes}`);
        }
    }

    // Culture
    if (model.culture) {

        if (model.insertAttributes && !group.NeutralLanguage) {
            group.NeutralLanguage = '';
        }

        if (group.NeutralLanguage) {
            group.NeutralLanguage = model.culture
            tl.debug(`tAssembly neutral language: ${model.culture}`);
        }
    }

    // Assembly Version
    if (model.version) {

        if (model.insertAttributes && !group.AssemblyVersion) {
            group.AssemblyVersion = '';
        }

        if (group.AssemblyVersion) {
            group.AssemblyVersion = model.version
            tl.debug(`tAssembly Version: ${model.version}`);
        }
    }

    // File Version
    if (model.fileVersion) {

        if (model.insertAttributes && !group.FileVersion) {
            group.FileVersion = '';
        }

        if (group.FileVersion) {
            group.FileVersion = model.fileVersion
            tl.debug(`tFile version: ${model.fileVersion}`);
        }
    }

    // Informational Version
    if (model.informationalVersion) {

        if (model.insertAttributes && !group.InformationalVersion) {
            group.InformationalVersion = '';
        }

        if (group.InformationalVersion) {
            group.InformationalVersion = model.informationalVersion
            tl.debug(`tInformational version: ${model.informationalVersion}`);
        }
    }
}

run();