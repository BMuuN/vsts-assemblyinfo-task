import tl = require('azure-pipelines-task-lib/task');
import { LoggingLevel, MessageType } from '../enums';

export class Logger {

    breakOnWarning: boolean;
    logLevel: LoggingLevel;

    constructor(breakOnWarning: boolean, logLevel: LoggingLevel) {
        this.breakOnWarning = breakOnWarning;
        this.logLevel = logLevel;
    }

    info(message: string): void {
        this.log(MessageType.Info, message);
    }

    debug(message: string): void {
        this.log(MessageType.Debug, message);
    }

    warning(message: string): void {
        this.log(MessageType.Warning, message);
    }

    error(message: string): void {
        this.log(MessageType.Error, message);
    }

    success(message: string): void {
        this.log(MessageType.Success, message);
    }

    private log(type: MessageType, message: string) {

        switch (type) {
            case MessageType.Info:
                {
                    if (this.logLevel !== LoggingLevel.Off) {
                        console.log(message);
                    }
                }
                break;

            case MessageType.Debug:
                {
                    if (this.logLevel === LoggingLevel.Verbose) {
                        console.log(message);
                        tl.debug(message);
                    }
                }
                break;

            case MessageType.Warning:
                this.breakOnWarning
                    ? tl.setResult(tl.TaskResult.Failed, message)
                    : tl.warning(message);
                break;

            case MessageType.Error:
                // tl.setResult(tl.TaskResult.Failed, tl.loc('TaskFailed', err.message));
                tl.setResult(tl.TaskResult.Failed, message);
                break;

            case MessageType.Success:
                tl.setResult(tl.TaskResult.Succeeded, message);
                break;
        }
    }
}
