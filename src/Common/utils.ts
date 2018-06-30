
export function setWildcardVersionNumber(value: string, verBuild: string, verRelease: string) {

    if (!value || value === '') {
        return value;
    }

    if (value.includes('.*.*')) {
        value = value.replace('.*.*', `.${verBuild}.${verRelease}`);
    } else if (value.includes('.*')) {
        value = value.replace('.*', `.${verBuild}`);
    }

    return value;
}