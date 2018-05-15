
Function NetFramework($Model, $RegEx) {

    Write-Host "Setting .Net Framework assembly info..."

    $files = Get-ChildItem $Model.Path -Recurse -Include $Model.NetFrameworkFileNames

    if(!$files)
    {
        Write-Warning "No file found with filename: $($Model.NetFrameworkFileNames)"
        return
    }

    foreach ($file in $files) {
        
        Write-Host "`t$($file.FullName)"

        if (-not (Test-Path $file.FullName)) {
            Write-Warning "No file found with filename: $($file.FullName)"
            return
        }

        attrib $file -r
        $filecontent = Get-Content $file
        $filecontent = ProcessNetFrameworkAttribute -File $file -FileContent $filecontent -AttributeName "AssemblyVersion" -Regex $RegEx.Word -Value $Model.Version
        $filecontent = ProcessNetFrameworkAttribute -File $file -FileContent $filecontent -AttributeName "AssemblyFileVersion" -Regex $RegEx.Word -Value $Model.FileVersion
        $filecontent = ProcessNetFrameworkAttribute -File $file -FileContent $filecontent -AttributeName "AssemblyInformationalVersion" -Regex $RegEx.Word -Value $Model.InformationalVersion
        $filecontent = ProcessNetFrameworkAttribute -File $file -FileContent $filecontent -AttributeName "AssemblyTitle" -Regex $RegEx.Word -Value $Model.Title
        $filecontent = ProcessNetFrameworkAttribute -File $file -FileContent $filecontent -AttributeName "AssemblyProduct" -Regex $RegEx.Word -Value $Model.Product
        $filecontent = ProcessNetFrameworkAttribute -File $file -FileContent $filecontent -AttributeName "AssemblyCompany" -Regex $RegEx.Word -Value $Model.Company
        $filecontent = ProcessNetFrameworkAttribute -File $file -FileContent $filecontent -AttributeName "AssemblyTrademark" -Regex $RegEx.Word -Value $Model.Trademark
        $filecontent = ProcessNetFrameworkAttribute -File $file -FileContent $filecontent -AttributeName "AssemblyDescription" -Regex $RegEx.Word -Value $Model.Description
        $filecontent = ProcessNetFrameworkAttribute -File $file -FileContent $filecontent -AttributeName "AssemblyCulture" -Regex $RegEx.Word -Value $Model.Culture
        $filecontent = ProcessNetFrameworkAttribute -File $file -FileContent $filecontent -AttributeName "AssemblyConfiguration" -Regex $RegEx.Word -Value $Model.Configuration
        $filecontent = ProcessNetFrameworkAttribute -File $file -FileContent $filecontent -AttributeName "AssemblyCopyright" -Regex $RegEx.Word -Value $Model.Copyright

        $filecontent | Out-File $file

        # Set Encoding
        #$filecontent | Out-File -Encoding utf8 $file

        # Write BOM
        # $Utf8NoBomEncoding = New-Object System.Text.UTF8Encoding $False
        # [System.IO.File]::WriteAllLines($file, $filecontent, $Utf8NoBomEncoding)

        Write-Host "`t$($file.FullName) - Assembly Info Applied"
    }
}

Function ProcessNetFrameworkAttribute($File, $FileContent, $AttributeName, $Regex, $Value) {

    if(![string]::IsNullOrWhiteSpace($Value)) {
        if ($InsertAttributes) {
            $FileContent = InsertAttribute -File $File -Content $FileContent -Name $AttributeName -Value $Value
        }
        $FileContent = ReplaceAttribute -Content $FileContent -Name $AttributeName -RegEx $Regex -Value $Value
    }

    return $FileContent;
}

Function InsertAttribute([System.IO.FileInfo]$File, [System.Collections.ArrayList]$Content, [string]$Name, [string]$Value) 
{
    if ($File.Extension -eq ".vb") {

        # ignores comments and finds correct attribute
        if (-not ($Content -Match "^\<Assembly:\s*$Name\.*")) {
            Write-Host "`tAdding --> $Name\: $Value"
            $Content.Add("<Assembly: $Name(`"$Value`")>") > $null
        }

    } elseif ($File.Extension -eq ".cs") {
        
        # ignores comments and finds correct attribute
        if (-not ($Content -Match "^\[assembly:\s*$Name\.*")) {
            Write-Host "`tAdding --> $Name\: $Value"
            $Content.Add("[assembly: $Name(`"$Value`")]") > $null
        }
    }

    return $Content
}

Function ReplaceAttribute([System.Collections.ArrayList]$Content, [string]$Name, [string]$RegEx, [string]$Value)
{
    Write-Host "`t$Name\: $Value"
    $Content = $Content -replace "$Name\s*\($RegEx\)", "$Name(`"$Value`")"
    $Content = $Content -replace "$Name`Attribute\s*\($RegEx\)", "$Name(`"$Value`")"
    return $Content
}