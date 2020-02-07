import appInsights = require('applicationinsights');

export class TelemetryService {

    client!: appInsights.TelemetryClient;

    constructor(disableTelemetry: boolean, instrumentationKey: string) {

        appInsights.setup(instrumentationKey);

        appInsights.defaultClient.config.disableAppInsights = disableTelemetry;
        this.client = appInsights.defaultClient;

        appInsights.defaultClient.commonProperties = {
            task: 'Net Framework',
            version: '#{ExtensionVersion}#',
        };

        if (!disableTelemetry) {
            appInsights.start();
        }
    }

    trackEvent(message: string) {
        this.client.trackEvent({name: message});
    }

    trackException(message: string) {
        this.client.trackException({exception: new Error(message)});
    }
}
