import * as tl from 'azure-pipelines-task-lib/task';
import { LoggingLevel } from './enums';
import * as models from './models';
import { Logger, TelemetryService, Utils } from './services';

let logger: Logger = new Logger(false, LoggingLevel.Normal);

async function run() {

    const disableTelemetry: boolean = tl.getBoolInput('disableTelemetry', true);
    const telemetry = new TelemetryService(disableTelemetry, '#{NetCoreInstrumentationKey}#');
    telemetry.trackEvent('Start Tagging');

    try {
        const model = getDefaultModel();

        logger = new Logger(model.failOnWarning, Utils.mapLogLevel(model.logLevel));

        printTaskParameters(model);
        setTaggingOptions(model);

        logger.success('Complete.');

    } catch (err: any) {
        logger.error(`Task failed with error: ${err.message}`);
        telemetry.trackException(err.message);
    }

    telemetry.trackEvent('End Tagging');
}

function getDefaultModel(): models.Tagging {
    const model: models.Tagging = {
        logLevel: tl.getInput('logLevel', true) || '',
        failOnWarning: tl.getBoolInput('failOnWarning', true),
        pipelineName: tl.getInput('pipelineName', false) || '',
        pipelineTag: tl.getInput('pipelineTag', false) || '',
    };

    return model;
}

function printTaskParameters(model: models.Tagging): void {
    logger.debug('Task Parameters...');
    logger.debug(`Log Level: ${model.logLevel}`);
    logger.debug(`Fail on Warning: ${model.failOnWarning}`);
    logger.debug(`Pipeline Tag: ${model.pipelineTag}`);
    logger.debug(`Pipeline Name: ${model.pipelineName}`);
    logger.debug('');
}

function setTaggingOptions(model: models.Tagging) {

    if (model.pipelineName) {
        tl.updateBuildNumber(model.pipelineName);
    }

    if (model.pipelineTag) {
        tl.addBuildTag(model.pipelineTag);
    }
}

run();
