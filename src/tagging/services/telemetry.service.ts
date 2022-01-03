import appInsights = require('applicationinsights');

export class TelemetryService {

    client!: appInsights.TelemetryClient;

    constructor(disableTelemetry: boolean, instrumentationKey: string) {

        if (!disableTelemetry) {
            appInsights.setup(instrumentationKey);

            this.client = appInsights.defaultClient;

            appInsights.defaultClient.commonProperties = {
                task: 'Pipeline Tagging',
                version: '#{ExtensionVersion}#',
            };

            appInsights.start();
        }
    }

    trackEvent(message: string) {
        if (this.client) {
            let data: appInsights.Contracts.EventTelemetry = {
                name: message
            };
            this.client.trackEvent(data);
        }
    }

    trackException(message: string) {
        if (this.client) {
            let data: appInsights.Contracts.ExceptionTelemetry = {
                exception: new Error(message)
            };
            this.client.trackException(data);
        }
    }

    trackMetric(key: string, value: number) {
        if (this.client) {
            let data: appInsights.Contracts.MetricTelemetry = {
                name: key,
                value: value
            };
            this.client.trackMetric(data);
        }
    }
}
