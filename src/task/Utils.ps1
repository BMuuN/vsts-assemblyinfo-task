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
                return $VersionData;
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

Function InsertAttribute([System.IO.FileInfo]$File, [System.Collections.ArrayList]$Content, [string]$Name, [string]$Value) 
{
    if ($File.Extension -eq ".vb") {

        # ignores comments and finds correct attribute
        if ($Content -Match "^\<Assembly:\s*$Name\.*") {
            
        } else {
            Write-Host "`tInserting $Name($Value)"
            $Content.Add("<Assembly: $Name(`"$Value`")>") > $null
        }

    } elseif ($File.Extension -eq ".cs") {
        
        # ignores comments and finds correct attribute
        if ($Content -Match "^\[assembly:\s*$Name\.*") {
            
        } else {
            Write-Host "`tInserting $Name($Value)"
            $Content.Add("[assembly: $Name(`"$Value`")]") > $null
        }
    }

    return $Content
}

Function ReplaceAttribute([System.Collections.ArrayList]$Content, [string]$Name, [string]$RegEx, [string]$Value)
{
    Write-Host "`tReplacing $Name($Value)"
    $Content = $Content -replace "$Name\s*\($RegEx\)", "$Name(`"$Value`")"
    $Content = $Content -replace "$Name`Attribute\s*\($RegEx\)", "$Name(`"$Value`")"
    return $Content
}