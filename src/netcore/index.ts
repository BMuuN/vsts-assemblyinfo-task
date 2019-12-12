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
import { Logger, TelemetryService } from './services';
import * as utils from './services/utils.service';

let logger: Logger = new Logger(false, LoggingLevel.Normal);

async function run() {

    const disableTelemetry: boolean = tl.getBoolInput('DisableTelemetry', true);
    const telemetry = new TelemetryService(disableTelemetry, '#{NetCoreInstrumentationKey}#');
    telemetry.trackEvent('Start Net Core');

    try {
        const regExModel = new models.RegEx();

        const model = getDefaultModel();
        model.fileNames = utils.formatFileNames(model.fileNames);

        logger = new Logger(model.failOnWarning, utils.mapLogLevel(model.logLevel));

        // Make sure path to source code directory is available
        if (!tl.exist(model.path)) {
            logger.error(`Source directory does not exist: ${model.path}`);
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

        logger.success('Complete.');

    } catch (err) {
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
                const newValue = utils.transformDates(value, regex);
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
        path: tl.getPathInput('Path', true) || '',
        fileNames: tl.getDelimitedInput('FileNames', '\n', true),
        insertAttributes: tl.getBoolInput('InsertAttributes', true),
        fileEncoding: tl.getInput('FileEncoding', true) || '',
        detectedFileEncoding: '',
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

        logLevel: tl.getInput('LogLevel', true) || '',
        failOnWarning: tl.getBoolInput('FailOnWarning', true),
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
    logger.debug(`License Url: ${model.licenseUrl}`);
    logger.debug(`Project Url: ${model.projectUrl}`);
    logger.debug(`Icon Url: ${model.iconUrl}`);
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

    logger.debug('');
}

function setManifestData(model: models.NetCore, regEx: models.RegEx): void {

    logger.info('Setting .Net Core / .Net Standard assembly info...');

    tl.findMatch(model.path, model.fileNames).forEach((file: string) => {

        logger.info(`Processing: ${file}`);

        if (path.extname(file) !== '.csproj' && path.extname(file) !== '.props') {
            logger.warning('File is not .csproj or .props');
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

            // Ensure the project is tartgeting .Net Core or .Net Standard
            if (!result.Project.$.Sdk || result.Project.$.Sdk.indexOf('Microsoft.NET.Sdk') < 0) {
                logger.warning(`Project is not targeting .Net Core or .Net Standard, moving to next file.`);
                logger.info('');
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

function setAssemblyData(group: any, model: models.NetCore): void {

    // Generate Package On Build
    if (model.insertAttributes && !group.GeneratePackageOnBuild) {
        group.GeneratePackageOnBuild = '';
    }

    if (group.GeneratePackageOnBuild || group.GeneratePackageOnBuild === '') {
        group.GeneratePackageOnBuild = model.generatePackageOnBuild;
        logger.info(`GeneratePackageOnBuild --> ${model.generatePackageOnBuild}`);
    }

    // Package Require License Acceptance
    if (model.insertAttributes && !group.PackageRequireLicenseAcceptance) {
        group.PackageRequireLicenseAcceptance = '';
    }

    if (group.PackageRequireLicenseAcceptance || group.PackageRequireLicenseAcceptance === '') {
        group.PackageRequireLicenseAcceptance = model.requireLicenseAcceptance;
        logger.info(`PackageRequireLicenseAcceptance --> ${model.requireLicenseAcceptance}`);
    }

    // Package Id
    if (model.packageId) {

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

        if (model.insertAttributes && !group.Version) {
            group.Version = '';
        }

        if (group.Version || group.Version === '') {
            group.Version = model.packageVersion;
            logger.info(`Version --> ${model.packageVersion}`);
        }
    }

    // Authors
    if (model.authors) {

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

        if (model.insertAttributes && !group.Copyright) {
            group.Copyright = '';
        }

        if (group.Copyright || group.Copyright === '') {
            group.Copyright = model.copyright;
            logger.info(`Copyright --> ${model.copyright}`);
        }
    }

    // License Url
    if (model.licenseUrl) {

        if (model.insertAttributes && !group.PackageLicenseUrl) {
            group.PackageLicenseUrl = '';
        }

        if (group.PackageLicenseUrl || group.PackageLicenseUrl === '') {
            group.PackageLicenseUrl = model.licenseUrl;
            logger.info(`PackageLicenseUrl --> ${model.licenseUrl}`);
        }
    }

    // Project Url
    if (model.projectUrl) {

        if (model.insertAttributes && !group.PackageProjectUrl) {
            group.PackageProjectUrl = '';
        }

        if (group.PackageProjectUrl || group.PackageProjectUrl === '') {
            group.PackageProjectUrl = model.projectUrl;
            logger.info(`PackageProjectUrl --> ${model.projectUrl}`);
        }
    }

    // Icon Url
    if (model.iconUrl) {

        if (model.insertAttributes && !group.PackageIconUrl) {
            group.PackageIconUrl = '';
        }

        if (group.PackageIconUrl || group.PackageIconUrl === '') {
            group.PackageIconUrl = model.iconUrl;
            logger.info(`PackageIconUrl --> ${model.iconUrl}`);
        }

        // PackageIconUrl will be deprecated in favor of the new PackageIcon property.
        // Starting with NuGet 5.3 & Visual Studio 2019 version 16.3, pack will raise NU5048 warning if the package metadata only specifies PackageIconUrl.
        // https://docs.microsoft.com/en-us/nuget/reference/msbuild-targets#packageiconurl
        // if (model.insertAttributes && !group.PackageIcon) {
        //     group.PackageIcon = '';
        // }

        // if (group.PackageIcon || group.PackageIcon === '') {
        //     group.PackageIcon = model.iconUrl;
        //     logger.info(`PackageIcon --> ${model.iconUrl}`);
        // }
    }

    // Repository Url
    if (model.repositoryUrl) {

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

        if (model.insertAttributes && !group.AssemblyVersion) {
            group.AssemblyVersion = '';
        }

        if (group.AssemblyVersion || group.AssemblyVersion === '') {
            group.AssemblyVersion = model.version;
            logger.info(`AssemblyVersion --> ${model.version}`);
        }
    }

    // File Version
    if (model.fileVersion) {

        if (model.insertAttributes && !group.FileVersion) {
            group.FileVersion = '';
        }

        if (group.FileVersion || group.FileVersion === '') {
            group.FileVersion = model.fileVersion;
            logger.info(`FileVersion --> ${model.fileVersion}`);
        }
    }

    // Informational Version
    if (model.informationalVersion) {

        if (model.insertAttributes && !group.InformationalVersion) {
            group.InformationalVersion = '';
        }

        if (group.InformationalVersion || group.InformationalVersion === '') {
            group.InformationalVersion = model.informationalVersion;
            logger.info(`InformationalVersion --> ${model.informationalVersion}`);
        }
    }
}

run();
