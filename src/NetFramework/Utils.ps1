Function ValidateVersionNumber([string]$Version, [string]$Regex)
{
    if(![string]::IsNullOrWhiteSpace($Version)) {
        $VersionData = [Regex]::Matches($Version, $Regex)
        switch($VersionData.Count)
        {
        0        
            { 
                Write-Error "Could not find version number data in $Version."
                exit 1
            }
        1 
            {
                return $VersionData[0].Value;
            }
        default 
            { 
                Write-Warning "Found more than instance of version data in $Version." 
                Write-Warning "Will assume first instance is version ($VersionData)."
                return $VersionData;
            }
        }

        return [string]::Empty;
    }
}

Function SetWildcardVersionNumber($Value) {

    if([string]::IsNullOrWhiteSpace($Value)) {
        return $Value
    }

    if ($Value.Contains(".*.*")) {
        $Value = $Value -replace "\.\*\.\*", ".$VerBuild.$VerRelease"
    } elseif ($Value.Contains(".*")) {
        $Value = $Value -replace "\.\*", ".$VerBuild"
    }

    return $Value
}