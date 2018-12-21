import tl = require('azure-pipelines-task-lib/task');
import trm = require('azure-pipelines-task-lib/toolrunner');
import chardet = require('chardet');
import fs = require('fs');
import iconv = require('iconv-lite');
import moment = require('moment');
import path = require('path');
import xml2js = require('xml2js');

import models = require('../Common/models');
import utils = require('../Common/services');

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

        // set output variables
        tl.setVariable('AssemblyInfo.Version', model.version, false);
        tl.setVariable('AssemblyInfo.FileVersion', model.fileVersion, false);
        tl.setVariable('AssemblyInfo.InformationalVersion', model.informationalVersion, false);
        tl.setVariable('AssemblyInfo.PackageVersion', model.packageVersion, false);

        tl.setResult(tl.TaskResult.Succeeded, tl.loc('TaskReturnCode'));

    } catch (err) {
        tl.setResult(tl.TaskResult.Failed, tl.loc('TaskFailed', err.message));
    }
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
        verRelease: '',
    };

    return model;
}

function generateVersionNumbers(model: models.NetCore, regexModel: models.RegEx): void {
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

    model.packageVersion = utils.setWildcardVersionNumber(model.packageVersion, model.verBuild, model.verRelease);
    model.version = utils.setWildcardVersionNumber(versionValue, model.verBuild, model.verRelease);
    model.fileVersion = utils.setWildcardVersionNumber(fileVersionValue, model.verBuild, model.verRelease);
    model.informationalVersion = utils.setWildcardVersionNumber(model.informationalVersion, model.verBuild, model.verRelease);
}

function printTaskParameters(model: models.NetCore): void {
    tl.debug(`Source folder: ${model.path}`);
    tl.debug(`Source files: ${model.fileNames}`);
    tl.debug(`Insert attributes: ${model.insertAttributes}`);
    tl.debug(`File encoding: ${model.fileEncoding}`);
    tl.debug(`Write unicode BOM: ${model.writeBOM}`);

    tl.debug(`Generate NuGet package on build: ${model.generatePackageOnBuild}`);
    tl.debug(`Require license acceptance: ${model.requireLicenseAcceptance}`);

    tl.debug(`Package id: ${model.packageId}`);
    tl.debug(`Package version: ${model.packageVersion}`);
    tl.debug(`Authors: ${model.authors}`);
    tl.debug(`Company: ${model.company}`);
    tl.debug(`Product: ${model.product}`);
    tl.debug(`Description: ${model.description}`);
    tl.debug(`Copyright: ${model.copyright}`);
    tl.debug(`License Url: ${model.licenseUrl}`);
    tl.debug(`Project Url: ${model.projectUrl}`);
    tl.debug(`Icon Url: ${model.iconUrl}`);
    tl.debug(`Repository Url: ${model.repositoryUrl}`);
    tl.debug(`Repository type: ${model.repositoryType}`);
    tl.debug(`Tags: ${model.tags}`);
    tl.debug(`Release notes: ${model.releaseNotes}`);
    tl.debug(`Assembly neutral language: ${model.culture}`);
    tl.debug(`Assembly version: ${model.version}`);
    tl.debug(`Assembly file version: ${model.fileVersion}`);
    tl.debug(`Informational version: ${model.informationalVersion}`);
}

function setManifestData(model: models.NetCore, regEx: models.RegEx): void {

    tl.debug('Setting .Net Core assembly info...');

    tl.findMatch(model.path, model.fileNames).forEach((file: string) => {

        tl.debug(`Processing: ${file}`);

        if (path.extname(file) !== '.csproj') {
            tl.debug(`File is not .csproj`);
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
            console.dir(result);
            console.log('Done');

            if (err) {
                tl.error(`Error reading file: ${err}`);
                return;
            }

            if (!result.Project || !result.Project.PropertyGroup) {
                tl.error(`Error reading file: ${err}`);
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

            tl.debug(`${file} - Assembly Info Applied`);

            const chardetResult = chardet.detectFileSync(file, { sampleSize: 64 });
            tl.debug(`Verify character encoding: ${chardetResult}`);
        });
    });
}

function setFileEncoding(file: string, model: models.NetCore) {
    const chardetEncoding = chardet.detectFileSync(file, { sampleSize: 64 });
    const chardetEncodingValue: string = chardetEncoding && chardetEncoding.toString().toLocaleLowerCase() || 'utf-8';

    tl.debug(`Detected character encoding: ${chardetEncodingValue}`);

    if (model.fileEncoding === 'auto') {
        model.fileEncoding = chardetEncodingValue;
    } else if (model.fileEncoding !== chardetEncodingValue) {
        tl.debug(`Detected character encoding is different to the one specified.`);
    }
}

function setAssemblyData(group: any, model: models.NetCore) {

    // Generate Package On Build
    if (model.insertAttributes && !group.GeneratePackageOnBuild) {
        group.GeneratePackageOnBuild = '';
    }

    if (group.GeneratePackageOnBuild) {
        group.GeneratePackageOnBuild = model.generatePackageOnBuild;
        tl.debug(`tGenerate package on build: ${model.generatePackageOnBuild}`);
    }

    // Package Require License Acceptance
    if (model.insertAttributes && !group.PackageRequireLicenseAcceptance) {
        group.PackageRequireLicenseAcceptance = '';
    }

    if (group.PackageRequireLicenseAcceptance) {
        group.PackageRequireLicenseAcceptance = model.requireLicenseAcceptance;
        tl.debug(`tPackage require license acceptance: ${model.requireLicenseAcceptance}`);
    }

    // Package Id
    if (model.packageId) {

        if (model.insertAttributes && !group.PackageId) {
            group.PackageId = '';
        }

        if (group.PackageId) {
            group.PackageId = model.packageId;
            tl.debug(`tPackage id: ${model.packageId}`);
        }
    }

    // Package Version
    if (model.packageVersion) {

        if (model.insertAttributes && !group.Version) {
            group.Version = '';
        }

        if (group.Version) {
            group.Version = model.packageVersion;
            tl.debug(`tPackage version: ${model.packageVersion}`);
        }
    }

    // Authors
    if (model.authors) {

        if (model.insertAttributes && !group.Authors) {
            group.Authors = '';
        }

        if (group.Authors) {
            group.Authors = model.authors;
            tl.debug(`tAuthors: ${model.authors}`);
        }
    }

    // Company
    if (model.company) {

        if (model.insertAttributes && !group.Company) {
            group.Company = '';
        }

        if (group.Company) {
            group.Company = model.company;
            tl.debug(`tCompany: ${model.company}`);
        }
    }

    // Product
    if (model.product) {

        if (model.insertAttributes && !group.Product) {
            group.Product = '';
        }

        if (group.Product) {
            group.Product = model.product;
            tl.debug(`tProduct: ${model.product}`);
        }
    }

    // Description
    if (model.description) {

        if (model.insertAttributes && !group.Description) {
            group.Description = '';
        }

        if (group.Description) {
            group.Description = model.description;
            tl.debug(`tDescription: ${model.description}`);
        }
    }

    // Copyright
    if (model.copyright) {

        if (model.insertAttributes && !group.Copyright) {
            group.Copyright = '';
        }

        if (group.Copyright) {
            group.Copyright = model.copyright;
            tl.debug(`tCopyright: ${model.copyright}`);
        }
    }

    // License Url
    if (model.licenseUrl) {

        if (model.insertAttributes && !group.PackageLicenseUrl) {
            group.PackageLicenseUrl = '';
        }

        if (group.PackageLicenseUrl) {
            group.PackageLicenseUrl = model.licenseUrl;
            tl.debug(`tLicense URL: ${model.licenseUrl}`);
        }
    }

    // Project Url
    if (model.projectUrl) {

        if (model.insertAttributes && !group.PackageProjectUrl) {
            group.PackageProjectUrl = '';
        }

        if (group.PackageProjectUrl) {
            group.PackageProjectUrl = model.projectUrl;
            tl.debug(`tProject URL: ${model.projectUrl}`);
        }
    }

    // Icon Url
    if (model.iconUrl) {

        if (model.insertAttributes && !group.PackageIconUrl) {
            group.PackageIconUrl = '';
        }

        if (group.PackageIconUrl) {
            group.PackageIconUrl = model.iconUrl;
            tl.debug(`tIcon URL: ${model.iconUrl}`);
        }
    }

    // Repository Url
    if (model.repositoryUrl) {

        if (model.insertAttributes && !group.RepositoryUrl) {
            group.RepositoryUrl = '';
        }

        if (group.RepositoryUrl) {
            group.RepositoryUrl = model.repositoryUrl;
            tl.debug(`tRepository URL: ${model.repositoryUrl}`);
        }
    }

    // Repository Type
    if (model.repositoryType) {

        if (model.insertAttributes && !group.RepositoryType) {
            group.RepositoryType = '';
        }

        if (group.RepositoryType) {
            group.RepositoryType = model.repositoryType;
            tl.debug(`tRepository type: ${model.repositoryType}`);
        }
    }

    // Tags
    if (model.tags) {

        if (model.insertAttributes && !group.PackageTags) {
            group.PackageTags = '';
        }

        if (group.PackageTags) {
            group.PackageTags = model.tags;
            tl.debug(`tTags: ${model.tags}`);
        }
    }

    // Release Notes
    if (model.releaseNotes) {

        if (model.insertAttributes && !group.PackageReleaseNotes) {
            group.PackageReleaseNotes = '';
        }

        if (group.PackageReleaseNotes) {
            group.PackageReleaseNotes = model.releaseNotes;
            tl.debug(`tRelease notes: ${model.releaseNotes}`);
        }
    }

    // Culture
    if (model.culture) {

        if (model.insertAttributes && !group.NeutralLanguage) {
            group.NeutralLanguage = '';
        }

        if (group.NeutralLanguage) {
            group.NeutralLanguage = model.culture;
            tl.debug(`tAssembly neutral language: ${model.culture}`);
        }
    }

    // Assembly Version
    if (model.version) {

        if (model.insertAttributes && !group.AssemblyVersion) {
            group.AssemblyVersion = '';
        }

        if (group.AssemblyVersion) {
            group.AssemblyVersion = model.version;
            tl.debug(`tAssembly Version: ${model.version}`);
        }
    }

    // File Version
    if (model.fileVersion) {

        if (model.insertAttributes && !group.FileVersion) {
            group.FileVersion = '';
        }

        if (group.FileVersion) {
            group.FileVersion = model.fileVersion;
            tl.debug(`tFile version: ${model.fileVersion}`);
        }
    }

    // Informational Version
    if (model.informationalVersion) {

        if (model.insertAttributes && !group.InformationalVersion) {
            group.InformationalVersion = '';
        }

        if (group.InformationalVersion) {
            group.InformationalVersion = model.informationalVersion;
            tl.debug(`tInformational version: ${model.informationalVersion}`);
        }
    }
}

run();
