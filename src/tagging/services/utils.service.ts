import { LoggingLevel } from '../enums';

export class Utils {

    static mapLogLevel(level: string): LoggingLevel {
        switch (level) {
            case 'normal':
                return LoggingLevel.Normal;
    
            case 'verbose':
                return LoggingLevel.Verbose;
    
            case 'off':
                return LoggingLevel.Off;
        }
    
        return LoggingLevel.Normal;
    }
}
