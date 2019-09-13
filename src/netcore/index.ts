import tl = require('azure-pipelines-task-lib/task');
import trm = require('azure-pipelines-task-lib/toolrunner');
import chardet = require('chardet');
import fs = require('fs');
import iconv = require('iconv-lite');
import moment = require('moment');
import path = require('path');
import xml2js = require('xml2js');

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

        applyTransforms(model, regExModel);
        generateVersionNumbers(model, regExModel);
        printTaskParameters(model);
        setManifestData(model, regExModel);

        // set output variables
        tl.setVariable('AssemblyInfo.Version', model.version, false);
        tl.setVariable('AssemblyInfo.FileVersion', model.fileVersion, false);
        tl.setVariable('AssemblyInfo.InformationalVersion', model.informationalVersion, false);
        tl.setVariable('AssemblyInfo.PackageVersion', model.packageVersion, false);

        console.log('Complete.');
        tl.setResult(tl.TaskResult.Succeeded, 'Complete');

    } catch (err) {
        tl.debug(err.message);
        // tl._writeError(err);
        // tl.setResult(tl.TaskResult.Failed, tl.loc('TaskFailed', err.message));
        tl.setResult(tl.TaskResult.Failed, `Task failed with error: ${err.message}`);
    }
}

function applyTransforms(model: models.NetCore, regex: models.RegEx): void {
    Object.keys(model).forEach((key: string) => {
        if (model.hasOwnProperty(key)) {
            const value = Reflect.get(model, key);
            if (typeof value === 'string' && value !== '') {
                const newValue = utils.transformDates(value, regex);
                if (value !== newValue) {
                    Reflect.set(model, key, newValue);
                    // console.log(`Key: ${key},  Value: ${value},  New Value: ${newValue}`);
                }
            }
          }
    });
}

function getDefaultModel(): models.NetCore {
    const model: models.NetCore = {
        path: tl.getPathInput('Path', true),
        fileNames: tl.getDelimitedInput('FileNames', '\n', true),
        insertAttributes: tl.getBoolInput('InsertAttributes', true),
        fileEncoding: tl.getInput('FileEncoding', true),
        writeBOM: tl.getBoolInput('WriteBOM', true),

        generatePackageOnBuild: tl.getBoolInput('GeneratePackageOnBuild', true),
        requireLicenseAcceptance: tl.getBoolInput('PackageRequireLicenseAcceptance', true),

        packageId: tl.getInput('PackageId', false) || '',
        packageVersion: tl.getInput('PackageVersion', false) || '',
        authors: tl.getInput('Authors', false) || '',
        company: tl.getInput('Company', false) || '',
        product: tl.getInput('Product', false) || '',
        description: tl.getInput('Description', false) || '',
        copyright: tl.getInput('Copyright', false) || '',
        licenseUrl: tl.getInput('PackageLicenseUrl', false) || '',
        projectUrl: tl.getInput('PackageProjectUrl', false) || '',
        iconUrl: tl.getInput('PackageIconUrl', false) || '',
        repositoryUrl: tl.getInput('RepositoryUrl', false) || '',
        repositoryType: tl.getInput('RepositoryType', false) || '',
        tags: tl.getInput('PackageTags', false) || '',
        releaseNotes: tl.getInput('PackageReleaseNotes', false) || '',
        culture: tl.getInput('Culture', false) || '',
        version: tl.getInput('VersionNumber', false) || '',
        fileVersion: tl.getInput('FileVersionNumber', false) || '',
        informationalVersion: tl.getInput('InformationalVersion', false) || '',

        verBuild: '',
        verRelease: '',
    };

    return model;
}

function generateVersionNumbers(model: models.NetCore, regex: models.RegEx): void {
    const start = moment('2000-01-01');
    const end = moment();
    let duration = moment.duration(end.diff(start));
    const verBuild = Math.round(duration.asDays());

    const midnight = moment().startOf('day');
    duration = moment.duration(end.diff(midnight));
    const verRelease = Math.round(duration.asSeconds() / 2);

    model.verBuild = verBuild.toString();
    model.verRelease = verRelease.toString();

    const version = model.version.match(regex.version);
    const versionValue = version && version[0] || '';

    const fileVersion = model.fileVersion.match(regex.version);
    const fileVersionValue = fileVersion && fileVersion[0] || '';

    model.packageVersion = utils.setWildcardVersionNumber(model.packageVersion, model.verBuild, model.verRelease);
    model.version = utils.setWildcardVersionNumber(versionValue, model.verBuild, model.verRelease);
    model.fileVersion = utils.setWildcardVersionNumber(fileVersionValue, model.verBuild, model.verRelease);
    model.informationalVersion = utils.setWildcardVersionNumber(model.informationalVersion, model.verBuild, model.verRelease);
}

function printTaskParameters(model: models.NetCore): void {

    console.log('Task Parameters...');
    console.log(`Source folder: ${model.path}`);
    console.log(`Source files: ${model.fileNames}`);
    console.log(`Insert attributes: ${model.insertAttributes}`);
    console.log(`File encoding: ${model.fileEncoding}`);
    console.log(`Write unicode BOM: ${model.writeBOM}`);

    console.log(`Generate NuGet package on build: ${model.generatePackageOnBuild}`);
    console.log(`Require license acceptance: ${model.requireLicenseAcceptance}`);

    console.log(`Package id: ${model.packageId}`);
    console.log(`Package version: ${model.packageVersion}`);
    console.log(`Authors: ${model.authors}`);
    console.log(`Company: ${model.company}`);
    console.log(`Product: ${model.product}`);
    console.log(`Description: ${model.description}`);
    console.log(`Copyright: ${model.copyright}`);
    console.log(`License Url: ${model.licenseUrl}`);
    console.log(`Project Url: ${model.projectUrl}`);
    console.log(`Icon Url: ${model.iconUrl}`);
    console.log(`Repository Url: ${model.repositoryUrl}`);
    console.log(`Repository type: ${model.repositoryType}`);
    console.log(`Tags: ${model.tags}`);
    console.log(`Release notes: ${model.releaseNotes}`);
    console.log(`Assembly neutral language: ${model.culture}`);
    console.log(`Assembly version: ${model.version}`);
    console.log(`Assembly file version: ${model.fileVersion}`);
    console.log(`Informational version: ${model.informationalVersion}`);
    console.log('');
}

function setManifestData(model: models.NetCore, regEx: models.RegEx): void {

    console.log('Setting .Net Core / .Net Standard assembly info...');

    tl.findMatch(model.path, model.fileNames).forEach((file: string) => {

        console.log(`Processing: ${file}`);

        if (path.extname(file) !== '.csproj') {
            console.log('File is not .csproj');
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

        const fileContent: string = iconv.decode(fs.readFileSync(file), model.fileEncoding);

        const parser = new xml2js.Parser();
        parser.parseString(fileContent, (err: any, result: any) => {

            if (err) {
                tl.error(`Error reading file: ${err}`);
                return;
            }

            if (!result.Project || !result.Project.PropertyGroup) {
                tl.error(`Error reading file: ${err}`);
                return;
            }

            // Ensure the project is tartgeting .Net Core or .Net Standard
            if (!result.Project.$.Sdk || result.Project.$.Sdk.indexOf('Microsoft.NET.Sdk') < 0) {
                tl.warning(`Project is not targeting .Net Core or .Net Standard, moving to next file.`);
                console.log('');
                return;
            }

            for (const group of result.Project.PropertyGroup) {

                // Ensure we're in the correct property group
                if (!group.TargetFramework && !group.TargetFrameworks) {
                    continue;
                }

                setAssemblyData(group, model);
            }

            // rebuild xml project structure
            const builder = new xml2js.Builder({ headless: true });
            const xml = builder.buildObject(result);

            fs.writeFileSync(file, iconv.encode(xml, model.fileEncoding, { addBOM: model.writeBOM, stripBOM: undefined, defaultEncoding: undefined }));

            const encodingResult = getFileEncoding(file);
            console.log(`Verify file encoding: ${encodingResult}`);
            console.log('');
        });
    });
}

function getFileEncoding(file: string): string {
    const encoding = chardet.detectFileSync(file, { sampleSize: 64 });
    return encoding && encoding.toString().toLocaleLowerCase() || 'utf-8';
}

function setFileEncoding(file: string, model: models.NetCore) {
    const encoding = getFileEncoding(file);
    console.log(`Detected file encoding: ${encoding}`);

    if (model.fileEncoding === 'auto') {
        model.fileEncoding = encoding;
    } else if (model.fileEncoding !== encoding) {
        tl.warning(`Detected file encoding (${encoding}) is different to the one specified (${model.fileEncoding}).`);
    }
}

function setAssemblyData(group: any, model: models.NetCore): void {

    // Generate Package On Build
    if (model.insertAttributes && !group.GeneratePackageOnBuild) {
        group.GeneratePackageOnBuild = '';
    }

    if (group.GeneratePackageOnBuild || group.GeneratePackageOnBuild === '') {
        group.GeneratePackageOnBuild = model.generatePackageOnBuild;
        console.log(`GeneratePackageOnBuild --> ${model.generatePackageOnBuild}`);
    }

    // Package Require License Acceptance
    if (model.insertAttributes && !group.PackageRequireLicenseAcceptance) {
        group.PackageRequireLicenseAcceptance = '';
    }

    if (group.PackageRequireLicenseAcceptance || group.PackageRequireLicenseAcceptance === '') {
        group.PackageRequireLicenseAcceptance = model.requireLicenseAcceptance;
        console.log(`PackageRequireLicenseAcceptance --> ${model.requireLicenseAcceptance}`);
    }

    // Package Id
    if (model.packageId) {

        if (model.insertAttributes && !group.PackageId) {
            group.PackageId = '';
        }

        if (group.PackageId || group.PackageId === '') {
            group.PackageId = model.packageId;
            console.log(`PackageId --> ${model.packageId}`);
        }
    }

    // Package Version
    if (model.packageVersion) {

        if (model.insertAttributes && !group.Version) {
            group.Version = '';
        }

        if (group.Version || group.Version === '') {
            group.Version = model.packageVersion;
            console.log(`Version --> ${model.packageVersion}`);
        }
    }

    // Authors
    if (model.authors) {

        if (model.insertAttributes && !group.Authors) {
            group.Authors = '';
        }

        if (group.Authors || group.Authors === '') {
            group.Authors = model.authors;
            console.log(`Authors --> ${model.authors}`);
        }
    }

    // Company
    if (model.company) {

        if (model.insertAttributes && !group.Company) {
            group.Company = '';
        }

        if (group.Company || group.Company === '') {
            group.Company = model.company;
            console.log(`Company --> ${model.company}`);
        }
    }

    // Product
    if (model.product) {

        if (model.insertAttributes && !group.Product) {
            group.Product = '';
        }

        if (group.Product || group.Product === '') {
            group.Product = model.product;
            console.log(`Product --> ${model.product}`);
        }
    }

    // Description
    if (model.description) {

        if (model.insertAttributes && !group.Description) {
            group.Description = '';
        }

        if (group.Description || group.Description === '') {
            group.Description = model.description;
            console.log(`Description --> ${model.description}`);
        }
    }

    // Copyright
    if (model.copyright) {

        if (model.insertAttributes && !group.Copyright) {
            group.Copyright = '';
        }

        if (group.Copyright || group.Copyright === '') {
            group.Copyright = model.copyright;
            console.log(`Copyright --> ${model.copyright}`);
        }
    }

    // License Url
    if (model.licenseUrl) {

        if (model.insertAttributes && !group.PackageLicenseUrl) {
            group.PackageLicenseUrl = '';
        }

        if (group.PackageLicenseUrl || group.PackageLicenseUrl === '') {
            group.PackageLicenseUrl = model.licenseUrl;
            console.log(`PackageLicenseUrl --> ${model.licenseUrl}`);
        }
    }

    // Project Url
    if (model.projectUrl) {

        if (model.insertAttributes && !group.PackageProjectUrl) {
            group.PackageProjectUrl = '';
        }

        if (group.PackageProjectUrl || group.PackageProjectUrl === '') {
            group.PackageProjectUrl = model.projectUrl;
            console.log(`PackageProjectUrl --> ${model.projectUrl}`);
        }
    }

    // Icon Url
    if (model.iconUrl) {

        if (model.insertAttributes && !group.PackageIconUrl) {
            group.PackageIconUrl = '';
        }

        if (group.PackageIconUrl || group.PackageIconUrl === '') {
            group.PackageIconUrl = model.iconUrl;
            console.log(`PackageIconUrl --> ${model.iconUrl}`);
        }
    }

    // Repository Url
    if (model.repositoryUrl) {

        if (model.insertAttributes && !group.RepositoryUrl) {
            group.RepositoryUrl = '';
        }

        if (group.RepositoryUrl || group.RepositoryUrl === '') {
            group.RepositoryUrl = model.repositoryUrl;
            console.log(`RepositoryUrl --> ${model.repositoryUrl}`);
        }
    }

    // Repository Type
    if (model.repositoryType) {

        if (model.insertAttributes && !group.RepositoryType) {
            group.RepositoryType = '';
        }

        if (group.RepositoryType || group.RepositoryType === '') {
            group.RepositoryType = model.repositoryType;
            console.log(`RepositoryType --> ${model.repositoryType}`);
        }
    }

    // Tags
    if (model.tags) {

        if (model.insertAttributes && !group.PackageTags) {
            group.PackageTags = '';
        }

        if (group.PackageTags || group.PackageTags === '') {
            group.PackageTags = model.tags;
            console.log(`PackageTags --> ${model.tags}`);
        }
    }

    // Release Notes
    if (model.releaseNotes) {

        if (model.insertAttributes && !group.PackageReleaseNotes) {
            group.PackageReleaseNotes = '';
        }

        if (group.PackageReleaseNotes || group.PackageReleaseNotes === '') {
            group.PackageReleaseNotes = model.releaseNotes;
            console.log(`PackageReleaseNotes --> ${model.releaseNotes}`);
        }
    }

    // Culture
    if (model.culture) {

        if (model.insertAttributes && !group.NeutralLanguage) {
            group.NeutralLanguage = '';
        }

        if (group.NeutralLanguage || group.NeutralLanguage === '') {
            group.NeutralLanguage = model.culture;
            console.log(`NeutralLanguage --> ${model.culture}`);
        }
    }

    // Assembly Version
    if (model.version) {

        if (model.insertAttributes && !group.AssemblyVersion) {
            group.AssemblyVersion = '';
        }

        if (group.AssemblyVersion || group.AssemblyVersion === '') {
            group.AssemblyVersion = model.version;
            console.log(`AssemblyVersion --> ${model.version}`);
        }
    }

    // File Version
    if (model.fileVersion) {

        if (model.insertAttributes && !group.FileVersion) {
            group.FileVersion = '';
        }

        if (group.FileVersion || group.FileVersion === '') {
            group.FileVersion = model.fileVersion;
            console.log(`FileVersion --> ${model.fileVersion}`);
        }
    }

    // Informational Version
    if (model.informationalVersion) {

        if (model.insertAttributes && !group.InformationalVersion) {
            group.InformationalVersion = '';
        }

        if (group.InformationalVersion || group.InformationalVersion === '') {
            group.InformationalVersion = model.informationalVersion;
            console.log(`InformationalVersion --> ${model.informationalVersion}`);
        }
    }
}

run();
