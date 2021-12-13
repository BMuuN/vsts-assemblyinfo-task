import tl = require('azure-pipelines-task-lib/task');
import trm = require('azure-pipelines-task-lib/toolrunner');
import chardet = require('chardet');
import fs = require('fs');
import iconv = require('iconv-lite');
import moment = require('moment');
import path = require('path');
import xml2js = require('xml2js');

import { LoggingLevel } from './enums';
import * as models from './models';
import { Logger, TelemetryService, Utils } from './services';

let logger: Logger = new Logger(false, LoggingLevel.Normal);

async function run() {

    const disableTelemetry: boolean = tl.getBoolInput('disableTelemetry', true);
    const telemetry = new TelemetryService(disableTelemetry, '#{NetCoreInstrumentationKey}#');
    telemetry.trackEvent('Start Net Core');

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
        setTaggingOptions(model);

        logger.success('Complete.');

    } catch (err: any) {
        logger.error(`Task failed with error: ${err.message}`);
        telemetry.trackException(err.message);
    }

    telemetry.trackEvent('End Net Core');
}

function applyTransforms(model: models.NetCore, regex: models.RegEx): void {
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

function getDefaultModel(): models.NetCore {
    const model: models.NetCore = {
        path: tl.getPathInput('path', true) || '',
        fileNames: tl.getDelimitedInput('fileNames', '\n', true),
        insertAttributes: tl.getBoolInput('insertAttributes', true),
        fileEncoding: tl.getInput('fileEncoding', true) || '',
        detectedFileEncoding: '',
        writeBOM: tl.getBoolInput('writeBOM', true),

        generatePackageOnBuild: tl.getBoolInput('generatePackageOnBuild', true),
        requireLicenseAcceptance: tl.getBoolInput('packageRequireLicenseAcceptance', true),

        packageId: tl.getInput('packageId', false) || '',
        packageVersion: tl.getInput('packageVersion', false) || '',
        authors: tl.getInput('authors', false) || '',
        company: tl.getInput('company', false) || '',
        product: tl.getInput('product', false) || '',
        description: tl.getInput('description', false) || '',
        copyright: tl.getInput('copyright', false) || '',
        licenseFile: tl.getInput('packageLicenseUrl', false) || '',
        licenseExpression: tl.getInput('packageLicenseExpression', false) || '',
        projectUrl: tl.getInput('packageProjectUrl', false) || '',
        packageIcon: tl.getInput('packageIconUrl', false) || '',
        repositoryUrl: tl.getInput('repositoryUrl', false) || '',
        repositoryType: tl.getInput('repositoryType', false) || '',
        tags: tl.getInput('packageTags', false) || '',
        releaseNotes: tl.getInput('packageReleaseNotes', false) || '',
        culture: tl.getInput('culture', false) || '',

        version: tl.getInput('versionNumber', false) || '',
        fileVersion: tl.getInput('fileVersionNumber', false) || '',
        informationalVersion: tl.getInput('informationalVersion', false) || '',
        verBuild: '',
        verRelease: '',

        logLevel: tl.getInput('logLevel', true) || '',
        failOnWarning: tl.getBoolInput('failOnWarning', true),

        buildNumber: tl.getInput('updateBuildNumber', false) || '',
        buildTag: tl.getInput('addBuildTag', false) || '',
    };

    return model;
}

function generateVersionNumbers(model: models.NetCore, regexModel: models.RegEx): void {
    const start = moment('2000-01-01');
    const end = moment();
    let duration = moment.duration(end.diff(start));
    const verBuild = Math.ceil(duration.asDays());

    const midnight = moment().startOf('day');
    duration = moment.duration(end.diff(midnight));
    const verRelease = Math.ceil(duration.asSeconds() / 2);

    model.verBuild = verBuild.toString();
    model.verRelease = verRelease.toString();

    const version = model.version.match(regexModel.version);
    const versionValue = version && version[0] || '';

    const fileVersion = model.fileVersion.match(regexModel.version);
    const fileVersionValue = fileVersion && fileVersion[0] || '';

    model.packageVersion = Utils.setWildcardVersionNumber(model.packageVersion, model.verBuild, model.verRelease);
    model.version = Utils.setWildcardVersionNumber(versionValue, model.verBuild, model.verRelease);
    model.fileVersion = Utils.setWildcardVersionNumber(fileVersionValue, model.verBuild, model.verRelease);
    model.informationalVersion = Utils.setWildcardVersionNumber(model.informationalVersion, model.verBuild, model.verRelease);
    
    model.buildNumber = Utils.setWildcardVersionNumber(model.buildNumber, model.verBuild, model.verRelease);
    model.buildTag = Utils.setWildcardVersionNumber(model.buildTag, model.verBuild, model.verRelease);
}

function printTaskParameters(model: models.NetCore): void {

    logger.debug('Task Parameters...');
    logger.debug(`Source folder: ${model.path}`);
    logger.debug(`Source files: ${model.fileNames}`);
    logger.debug(`Insert attributes: ${model.insertAttributes}`);
    logger.debug(`File encoding: ${model.fileEncoding}`);
    logger.debug(`Write unicode BOM: ${model.writeBOM}`);

    logger.debug(`Generate NuGet package on build: ${model.generatePackageOnBuild}`);
    logger.debug(`Require license acceptance: ${model.requireLicenseAcceptance}`);

    logger.debug(`Package id: ${model.packageId}`);
    logger.debug(`Package version: ${model.packageVersion}`);
    logger.debug(`Authors: ${model.authors}`);
    logger.debug(`Company: ${model.company}`);
    logger.debug(`Product: ${model.product}`);
    logger.debug(`Description: ${model.description}`);
    logger.debug(`Copyright: ${model.copyright}`);
    logger.debug(`License File: ${model.licenseFile}`);
    logger.debug(`License Expression: ${model.licenseExpression}`);
    logger.debug(`Project Url: ${model.projectUrl}`);
    logger.debug(`Package Icon: ${model.packageIcon}`);
    logger.debug(`Repository Url: ${model.repositoryUrl}`);
    logger.debug(`Repository type: ${model.repositoryType}`);
    logger.debug(`Tags: ${model.tags}`);
    logger.debug(`Release notes: ${model.releaseNotes}`);
    logger.debug(`Assembly neutral language: ${model.culture}`);
    logger.debug(`Assembly version: ${model.version}`);
    logger.debug(`Assembly file version: ${model.fileVersion}`);
    logger.debug(`Informational version: ${model.informationalVersion}`);

    logger.debug(`Log Level: ${model.logLevel}`);
    logger.debug(`Fail on Warning: ${model.failOnWarning}`);

    logger.debug(`Build Tag: ${model.buildTag}`);
    logger.debug(`Build Number: ${model.buildNumber}`);

    logger.debug('');
}

function setManifestData(model: models.NetCore, regEx: models.RegEx): void {

    logger.info('Setting .Net Core / .Net Standard assembly info...');

    const files = tl.findMatch(model.path, model.fileNames);

    if (files.length <= 0) {
        logger.error(`No files found for: ${model.fileNames.join(', ')}`);
        return;
    }

    files.forEach((file: string) => {

        logger.info(`Processing: ${file}`);

        if (path.extname(file) !== '.csproj' && path.extname(file) !== '.vbproj' && path.extname(file) !== '.props') {
            logger.warning('Invalid file.  Only the following file extensions are supported: .csproj, .vbproj, .props');
            return;
        }

        // this will never get called, remove?
        if (!tl.exist(file)) {
            logger.error(`File not found: ${file}`);
            return;
        }

        setFileEncoding(file, model);

        if (!iconv.encodingExists(model.detectedFileEncoding)) {
            logger.error(`${model.detectedFileEncoding} file encoding not supported`);
            return;
        }

        const fileContent: string = iconv.decode(fs.readFileSync(file), model.detectedFileEncoding);

        const parser = new xml2js.Parser();
        parser.parseString(fileContent, (err: any, result: any) => {

            if (err) {
                logger.error(`Error reading file: ${err}`);
                return;
            }

            if (!result.Project || !result.Project.PropertyGroup) {
                logger.error(`Error reading file: ${err}`);
                return;
            }

            setAssemblyData(result.Project.PropertyGroup, model);

            // rebuild xml project structure
            const builder = new xml2js.Builder({ headless: true });
            const xml = builder.buildObject(result);

            fs.writeFileSync(file, iconv.encode(xml, model.detectedFileEncoding, { addBOM: model.writeBOM, stripBOM: undefined, defaultEncoding: undefined }));

            const encodingResult = getFileEncoding(file);
            logger.debug(`Verify file encoding: ${encodingResult}`);
            logger.info('');
        });
    });
}

function getFileEncoding(file: string): string {
    const encoding = chardet.detectFileSync(file, { sampleSize: 64 });
    return encoding && encoding.toString().toLocaleLowerCase() || 'utf-8';
}

function setFileEncoding(file: string, model: models.NetCore) {
    const encoding = getFileEncoding(file);
    logger.debug(`Detected file encoding: ${encoding}`);

    model.detectedFileEncoding = model.fileEncoding;

    if (model.fileEncoding === 'auto') {
        model.detectedFileEncoding = encoding;
    } else if (model.fileEncoding !== encoding) {
        logger.warning(`Detected file encoding (${encoding}) is different to the one specified (${model.fileEncoding}).`);
    }
}

function getPropertyGroup(propertyGroups: any, name: string): any {
    for (const group of propertyGroups) {
        let keys = Object.keys(group);
        for (const key of keys) {
            if (key.toLowerCase() === name.toLowerCase()) {
                return group;
            } 
        }
    }

    return propertyGroups[0];
}

function setAssemblyData(propertyGroups: any, model: models.NetCore): void {

    // Generate Package On Build
    let group = getPropertyGroup(propertyGroups, 'GeneratePackageOnBuild');
    if (model.insertAttributes && !group.GeneratePackageOnBuild) {
        group.GeneratePackageOnBuild = '';
    }

    if (group.GeneratePackageOnBuild || group.GeneratePackageOnBuild === '') {
        group.GeneratePackageOnBuild = model.generatePackageOnBuild;
        logger.info(`GeneratePackageOnBuild --> ${model.generatePackageOnBuild}`);
    }

    // Package Require License Acceptance
    group = getPropertyGroup(propertyGroups, 'PackageRequireLicenseAcceptance');
    if (model.insertAttributes && !group.PackageRequireLicenseAcceptance) {
        group.PackageRequireLicenseAcceptance = '';
    }

    if (group.PackageRequireLicenseAcceptance || group.PackageRequireLicenseAcceptance === '') {
        group.PackageRequireLicenseAcceptance = model.requireLicenseAcceptance;
        logger.info(`PackageRequireLicenseAcceptance --> ${model.requireLicenseAcceptance}`);
    }

    // Package Id
    if (model.packageId) {

        group = getPropertyGroup(propertyGroups, 'PackageId');

        if (model.insertAttributes && !group.PackageId) {
            group.PackageId = '';
        }

        if (group.PackageId || group.PackageId === '') {
            group.PackageId = model.packageId;
            logger.info(`PackageId --> ${model.packageId}`);
        }
    }

    // Package Version
    if (model.packageVersion) {
        
        group = getPropertyGroup(propertyGroups, 'Version');

        if (model.insertAttributes && !group.Version) {
            group.Version = '';
        }

        if (group.Version || group.Version === '') {
            group.Version = Utils.setVersionNumber(group.Version[0], model.packageVersion);
            logger.info(`Version --> ${group.Version}`);
        }
    }

    // Authors
    if (model.authors) {

        group = getPropertyGroup(propertyGroups, 'Authors');

        if (model.insertAttributes && !group.Authors) {
            group.Authors = '';
        }

        if (group.Authors || group.Authors === '') {
            group.Authors = model.authors;
            logger.info(`Authors --> ${model.authors}`);
        }
    }

    // Company
    if (model.company) {

        group = getPropertyGroup(propertyGroups, 'Company');

        if (model.insertAttributes && !group.Company) {
            group.Company = '';
        }

        if (group.Company || group.Company === '') {
            group.Company = model.company;
            logger.info(`Company --> ${model.company}`);
        }
    }

    // Product
    if (model.product) {

        group = getPropertyGroup(propertyGroups, 'Product');

        if (model.insertAttributes && !group.Product) {
            group.Product = '';
        }

        if (group.Product || group.Product === '') {
            group.Product = model.product;
            logger.info(`Product --> ${model.product}`);
        }
    }

    // Description
    if (model.description) {

        group = getPropertyGroup(propertyGroups, 'Description');

        if (model.insertAttributes && !group.Description) {
            group.Description = '';
        }

        if (group.Description || group.Description === '') {
            group.Description = model.description;
            logger.info(`Description --> ${model.description}`);
        }
    }

    // Copyright
    if (model.copyright) {

        group = getPropertyGroup(propertyGroups, 'Copyright');

        if (model.insertAttributes && !group.Copyright) {
            group.Copyright = '';
        }

        if (group.Copyright || group.Copyright === '') {
            group.Copyright = model.copyright;
            logger.info(`Copyright --> ${model.copyright}`);
        }
    }

    // License File
    if (model.licenseFile) {

        group = getPropertyGroup(propertyGroups, 'PackageLicenseFile');

        if (model.insertAttributes && !group.PackageLicenseFile) {
            group.PackageLicenseFile = '';
        }

        if (group.PackageLicenseFile || group.PackageLicenseFile === '') {
            group.PackageLicenseFile = model.licenseFile;
            logger.info(`PackageLicenseFile --> ${model.licenseFile}`);
        }
    }

    // License Expression
    if (model.licenseExpression) {

        group = getPropertyGroup(propertyGroups, 'PackageLicenseExpression');

        if (model.insertAttributes && !group.PackageLicenseExpression) {
            group.PackageLicenseExpression = '';
        }

        if (group.PackageLicenseExpression || group.PackageLicenseExpression === '') {
            group.PackageLicenseExpression = model.licenseExpression;
            logger.info(`PackageLicenseExpression --> ${model.licenseExpression}`);
        }
    }

    // Project Url
    if (model.projectUrl) {

        group = getPropertyGroup(propertyGroups, 'PackageProjectUrl');

        if (model.insertAttributes && !group.PackageProjectUrl) {
            group.PackageProjectUrl = '';
        }

        if (group.PackageProjectUrl || group.PackageProjectUrl === '') {
            group.PackageProjectUrl = model.projectUrl;
            logger.info(`PackageProjectUrl --> ${model.projectUrl}`);
        }
    }

    // Package Icon
    if (model.packageIcon) {

        group = getPropertyGroup(propertyGroups, 'PackageIcon');

        if (model.insertAttributes && !group.PackageIcon) {
            group.PackageIcon = '';
        }

        if (group.PackageIcon || group.PackageIcon === '') {
            group.PackageIcon = model.packageIcon;
            logger.info(`PackageIcon --> ${model.packageIcon}`);
        }
    }

    // Repository Url
    if (model.repositoryUrl) {

        group = getPropertyGroup(propertyGroups, 'RepositoryUrl');

        if (model.insertAttributes && !group.RepositoryUrl) {
            group.RepositoryUrl = '';
        }

        if (group.RepositoryUrl || group.RepositoryUrl === '') {
            group.RepositoryUrl = model.repositoryUrl;
            logger.info(`RepositoryUrl --> ${model.repositoryUrl}`);
        }
    }

    // Repository Type
    if (model.repositoryType) {

        group = getPropertyGroup(propertyGroups, 'RepositoryType');

        if (model.insertAttributes && !group.RepositoryType) {
            group.RepositoryType = '';
        }

        if (group.RepositoryType || group.RepositoryType === '') {
            group.RepositoryType = model.repositoryType;
            logger.info(`RepositoryType --> ${model.repositoryType}`);
        }
    }

    // Tags
    if (model.tags) {

        group = getPropertyGroup(propertyGroups, 'PackageTags');

        if (model.insertAttributes && !group.PackageTags) {
            group.PackageTags = '';
        }

        if (group.PackageTags || group.PackageTags === '') {
            group.PackageTags = model.tags;
            logger.info(`PackageTags --> ${model.tags}`);
        }
    }

    // Release Notes
    if (model.releaseNotes) {

        group = getPropertyGroup(propertyGroups, 'PackageReleaseNotes');

        if (model.insertAttributes && !group.PackageReleaseNotes) {
            group.PackageReleaseNotes = '';
        }

        if (group.PackageReleaseNotes || group.PackageReleaseNotes === '') {
            group.PackageReleaseNotes = model.releaseNotes;
            logger.info(`PackageReleaseNotes --> ${model.releaseNotes}`);
        }
    }

    // Culture
    if (model.culture) {

        group = getPropertyGroup(propertyGroups, 'NeutralLanguage');

        if (model.insertAttributes && !group.NeutralLanguage) {
            group.NeutralLanguage = '';
        }

        if (group.NeutralLanguage || group.NeutralLanguage === '') {
            group.NeutralLanguage = model.culture;
            logger.info(`NeutralLanguage --> ${model.culture}`);
        }
    }

    // Assembly Version
    if (model.version) {

        group = getPropertyGroup(propertyGroups, 'AssemblyVersion');

        if (model.insertAttributes && !group.AssemblyVersion) {
            group.AssemblyVersion = '';
        }

        if (group.AssemblyVersion || group.AssemblyVersion === '') {
            group.AssemblyVersion = Utils.setVersionNumber(group.AssemblyVersion[0], model.version);
            logger.info(`AssemblyVersion --> ${model.version}`);
        }
    }

    // File Version
    if (model.fileVersion) {

        group = getPropertyGroup(propertyGroups, 'FileVersion');

        if (model.insertAttributes && !group.FileVersion) {
            group.FileVersion = '';
        }

        if (group.FileVersion || group.FileVersion === '') {
            group.FileVersion = Utils.setVersionNumber(group.FileVersion[0], model.fileVersion);
            logger.info(`FileVersion --> ${group.FileVersion}`);
        }
    }

    // Informational Version
    if (model.informationalVersion) {

        group = getPropertyGroup(propertyGroups, 'InformationalVersion');

        if (model.insertAttributes && !group.InformationalVersion) {
            group.InformationalVersion = '';
        }

        if (group.InformationalVersion || group.InformationalVersion === '') {
            group.InformationalVersion = Utils.setVersionNumber(group.InformationalVersion[0], model.informationalVersion);
            logger.info(`InformationalVersion --> ${group.InformationalVersion}`);
        }
    }
}

function setOutputVariables(model: models.NetCore) {
    tl.setVariable('AssemblyInfo.Version', model.version, false, true);
    tl.setVariable('AssemblyInfo.FileVersion', model.fileVersion, false, true);
    tl.setVariable('AssemblyInfo.InformationalVersion', model.informationalVersion, false, true);
    tl.setVariable('AssemblyInfo.PackageVersion', model.packageVersion, false, true);
}

function setTaggingOptions(model: models.NetCore) {

    if (model.buildNumber) {
        tl.updateBuildNumber(model.buildNumber);
    }

    if (model.buildTag) {
        tl.addBuildTag(model.buildTag);
    }
}

run();
