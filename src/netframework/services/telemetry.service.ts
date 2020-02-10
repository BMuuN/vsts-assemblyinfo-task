import appInsights = require('applicationinsights');

export class TelemetryService {

    client!: appInsights.TelemetryClient;

    constructor(disableTelemetry: boolean, instrumentationKey: string) {

        if (!disableTelemetry) {
            appInsights.setup(instrumentationKey);

            this.client = appInsights.defaultClient;

            appInsights.defaultClient.commonProperties = {
                task: 'Net Framework',
                version: '#{ExtensionVersion}#',
            };

            appInsights.start();
        }
    }

    trackEvent(message: string) {
        if (this.client) {
            this.client.trackEvent({name: message});
        }
    }

    trackException(message: string) {
        if (this.client) {
            this.client.trackException({exception: new Error(message)});
        }
    }
}
