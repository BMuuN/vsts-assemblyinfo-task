export class TestUtils {

    static getLine(stdout: string, start: string): string {
        const startIndex = stdout.indexOf(start);
        const endIndex = stdout.indexOf('\n', startIndex);
        return stdout.substring(startIndex, endIndex);
    }
}
