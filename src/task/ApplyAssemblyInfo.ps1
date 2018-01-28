[CmdletBinding()]
param (

    [Parameter(Mandatory=$True)]
    [String]$Path,

    [Parameter(Mandatory=$True)]
    [String]$FileNames,

    [Parameter(Mandatory=$false)]
    [String]$Title,
    
    [Parameter(Mandatory=$false)]
    [String]$Product,
    
    [Parameter(Mandatory=$false)]
    [String]$Company,
    
    [Parameter(Mandatory=$false)]
    [String]$Copyright,
    
    [Parameter(Mandatory=$false)]
    [String]$Trademark,
    
    [Parameter(Mandatory=$false)]
    [String]$Description,
    
    [Parameter(Mandatory=$false)]
    [String]$Culture,
    
    [Parameter(Mandatory=$false)]
    [String]$Configuration,

    [Parameter(Mandatory=$false)]
    [string]$VersionNumber,

    [Parameter(Mandatory=$false)]
    [string]$FileVersionNumber,

    [Parameter(Mandatory=$false)]
    [string]$InformationalVersion
)


# Set a flag to force verbose as a default
$VerbosePreference = 'Continue' # equiv to -verbose

# Regular expression pattern to find the version
$VersionRegex = "\d+\.\d+\.?\d*\.?\d*"

# Regular expression pattern to find any string
$WordRegex = ".*"

# Date regular expression pattern
$DateRegex = "(([\w.: +])*?)"

Function Main() {

    # Make sure path to source code directory is available
    if (-not (Test-Path $Path))
    {
        Write-Error "Source directory does not exist: $Path"
        exit 1
    }

    # Filter the file list
    $FileNames = $FileNames -replace "`t|`r|`n", "," -replace "`"", "" -split "," |
                Where-Object { $_ } | 
                ForEach-Object { $_.Trim() }

    [System.Collections.ArrayList]$NetFrameworkFileNames = @()
    $NetFrameworkFileNames += $FileNames | Where-Object { $_ -like "*.cs" }
    $NetFrameworkFileNames += $FileNames | Where-Object { $_ -like "*.vb" }
    $NetCoreFileNames = $FileNames | Where-Object { $_ -like "*.csproj" }

    # Validate version numbers
    Write-Host "Validating Version Number: $VersionNumber"
    $Version = ValidateVersionNumber $VersionNumber
    Write-Host "Validating File Version Number: $FileVersionNumber"
    $FileVersion = ValidateVersionNumber $FileVersionNumber

    Write-Host "Task Parameters:"
    Write-Host "`tSource Directory: $Path"
    $NetFrameworkFileNames | ForEach-Object { Write-Host "`tNet Framework File Names: $_" }
    $NetCoreFileNames | ForEach-Object { Write-Host "`tNet Core File Names: $_" }
    Write-Host "`tTitle: $Title"
    Write-Host "`tProduct: $Product"
    Write-Host "`tDescription: $Description"
    Write-Host "`tCompany: $Company"
    Write-Host "`tCopyright: $Copyright"
    Write-Host "`tTrademark: $Trademark"
    Write-Host "`tCulture: $Culture"
    Write-Host "`tConfiguration: $Configuration"
    Write-Host "`tVersion: $Version"
    Write-Host "`tFile Version: $FileVersion"
    Write-Host "`tInformational Version: $InformationalVersion"
    
    if ($NetFrameworkFileNames) {
        NetFramework
    }

    if ($NetCoreFileNames) {
        NetCore
    }
}

Function ValidateVersionNumber($number)
{
    if(![string]::IsNullOrWhiteSpace($number)) {
        $VersionData = [Regex]::Matches($number, $VersionRegex)
        switch($VersionData.Count)
        {
        0        
            { 
                Write-Error "Could not find version number data in $number."
                exit 1
            }
        1 
            {
                return $VersionData;
            }
        default 
            { 
                Write-Warning "Found more than instance of version data in $number." 
                Write-Warning "Will assume first instance is version."
                return $VersionData;
            }
        }

        return [string]::Empty;
    }
}

Function NetFramework() {

    Write-Host "Setting .Net Framework assembly info..."

    # Get all AssemblyInfo files
    $files = Get-ChildItem $Path -Recurse -Include $NetFrameworkFileNames

    if(!$files)
    {
        Write-Warning "No file found with filename: $NetFrameworkFileNames"
        return
    }

    foreach ($file in $files) {
        
        # remove the read-only attribute, making the file writable
        attrib $file -r

        # get the file contents
        $filecontent = Get-Content($file)

        # get the filename
        $fileName = Split-Path $file -Leaf
        Write-Host "File: $file"

        # set version
        if(![string]::IsNullOrWhiteSpace($Version)) {
            $filecontent = $filecontent -replace "AssemblyVersion\s*\($WordRegex\)", "AssemblyVersion(`"$Version`")"
            $filecontent = $filecontent -replace "AssemblyVersionAttribute\s*\($WordRegex\)", "AssemblyVersion(`"$Version`")"
            Write-Host "`tAssemblyVersion: $Version"
        }

        # set file version
        if(![string]::IsNullOrWhiteSpace($FileVersion)) {
            $filecontent = $filecontent -replace "AssemblyFileVersion\s*\($WordRegex\)", "AssemblyFileVersion(`"$FileVersion`")"
            $filecontent = $filecontent -replace "AssemblyFileVersionAttribute\s*\($WordRegex\)", "AssemblyFileVersion(`"$FileVersion`")"
            Write-Host "`tAssemblyFileVersion: $FileVersion"
        }
        
        # set informational version
        if(![string]::IsNullOrWhiteSpace($InformationalVersion)) {
            $filecontent = $filecontent -replace "AssemblyInformationalVersion\s*\($WordRegex\)", "AssemblyInformationalVersion(`"$InformationalVersion`")"
            $filecontent = $filecontent -replace "AssemblyInformationalVersionAttribute\s*\($WordRegex\)", "AssemblyInformationalVersion(`"$InformationalVersion`")"
            Write-Host "`tAssemblyInformationalVersion: $InformationalVersion"
        }
        
        # set title
        if(![string]::IsNullOrWhiteSpace($Title)) {
            $filecontent = $filecontent -replace "AssemblyTitle\s*\($WordRegex\)", "AssemblyTitle(`"$Title`")"
            $filecontent = $filecontent -replace "AssemblyTitleAttribute\s*\($WordRegex\)", "AssemblyTitle(`"$Title`")"
            Write-Host "`tAssemblyTitle: $Title"
        }

        # set product
        if(![string]::IsNullOrWhiteSpace($Product)) {
            $filecontent = $filecontent -replace "AssemblyProduct\s*\($WordRegex\)", "AssemblyProduct(`"$Product`")"
            $filecontent = $filecontent -replace "AssemblyProductAttribute\s*\($WordRegex\)", "AssemblyProduct(`"$Product`")"
            Write-Host "`tAssemblyProduct: $Product"
        }

        # set company
        if(![string]::IsNullOrWhiteSpace($Company)) {
            $filecontent = $filecontent -replace "AssemblyCompany\s*\($WordRegex\)", "AssemblyCompany(`"$Company`")"
            $filecontent = $filecontent -replace "AssemblyCompanyAttribute\s*\($WordRegex\)", "AssemblyCompany(`"$Company`")"
            Write-Host "`tAssemblyCompany: $Company"
        }

        # set copyright
        if(![string]::IsNullOrWhiteSpace($Copyright)) {
            $Copyright = [Regex]::Replace($Copyright, "\$\(date:$DateRegex\)", { Get-Date -format $args.Groups[1].Value })
            $filecontent = $filecontent -replace "AssemblyCopyright\s*\($WordRegex\)", "AssemblyCopyright(`"$Copyright`")"
            $filecontent = $filecontent -replace "AssemblyCopyrightAttribute\s*\($WordRegex\)", "AssemblyCopyright(`"$Copyright`")"
            Write-Host "`tAssemblyCopyright: $Copyright"
        }

        # set trademark
        if(![string]::IsNullOrWhiteSpace($Trademark)) {
            $filecontent = $filecontent -replace "AssemblyTrademark\s*\($WordRegex\)", "AssemblyTrademark(`"$Trademark`")"
            $filecontent = $filecontent -replace "AssemblyTrademarkAttribute\s*\($WordRegex\)", "AssemblyTrademark(`"$Trademark`")"
            Write-Host "`tAssemblyTrademark: $Trademark"
        }

        # set desription
        if(![string]::IsNullOrWhiteSpace($Description)) {
            $filecontent = $filecontent -replace "AssemblyDescription\s*\($WordRegex\)", "AssemblyDescription(`"$Description`")"
            $filecontent = $filecontent -replace "AssemblyDescriptionAttribute\s*\($WordRegex\)", "AssemblyDescription(`"$Description`")"
            Write-Host "`tAssemblyDescription: $Description"
        }

        # set culture
        if(![string]::IsNullOrWhiteSpace($Culture)) {
            $filecontent = $filecontent -replace "AssemblyCulture\s*\($WordRegex\)", "AssemblyCulture(`"$Culture`")"
            $filecontent = $filecontent -replace "AssemblyCultureAttribute\s*\($WordRegex\)", "AssemblyCulture(`"$Culture`")"
            Write-Host "`tAssemblyCulture: $Culture"
        }

        # set configuration
        if(![string]::IsNullOrWhiteSpace($Configuration)) {
            $filecontent = $filecontent -replace "AssemblyConfiguration\s*\($WordRegex\)", "AssemblyConfiguration(`"$Configuration`")"
            $filecontent = $filecontent -replace "AssemblyConfigurationAttribute\s*\($WordRegex\)", "AssemblyConfiguration(`"$Configuration`")"
            Write-Host "`tAssemblyConfiguration: $Configuration"
        }

        $filecontent | Out-File $file
        Write-Host "`t$fileName - assembly info applied"
    }
}

Function NetCore() {

    Write-Host "Setting .Net Core assembly info..."

    # Apply the version to the assembly property files
    $files = Get-ChildItem $Path -Recurse -Include $NetCoreFileNames

    if(!$files)
    {
        Write-Warning "No file found with filename: $NetCoreFileNames"
        return
    }

    foreach ($file in $files) {
        
        # remove the read-only attribute, making the file writable
        attrib $file -r

        # get the file contents
        [xml]$filecontent = Get-Content $file

        # get the filename
        $fileName = Split-Path $file -Leaf
        Write-Host "File: $file"

        if (($filecontent.Project -eq $null) -Or ($filecontent.Project.PropertyGroup -eq $null))
        {
            Write-Warning "No assembly info tags found in: $file"
            continue
        }

        foreach ($group in $filecontent.Project.PropertyGroup) {

            # set version
            if(($group.AssemblyVersion -ne $null) -And ![string]::IsNullOrWhiteSpace($Version)) {
                $group.AssemblyVersion = "$Version"
                Write-Host "`tAssemblyVersion: $Version"
            }

            # set file version
            if (($group.FileVersion -ne $null) -And ![string]::IsNullOrWhiteSpace($FileVersion)) {
                $group.FileVersion = "$FileVersion"
                Write-Host "`tFileVersion: $FileVersion"
            }

            # set informational version
            if (($group.Version -ne $null) -And ![string]::IsNullOrWhiteSpace($InformationalVersion)) {
                $group.Version = $InformationalVersion
                Write-Host "`tVersion: $InformationalVersion"
            }

            # set title
            if (($group.AssemblyTitle -ne $null) -And ![string]::IsNullOrWhiteSpace($Title)) {
                $group.AssemblyTitle = $Title
                Write-Host "`tAssemblyTitle: $Title"
            }

            # set product
            if (($group.Product -ne $null) -And ![string]::IsNullOrWhiteSpace($Product)) {
                $group.Product = $Product
                Write-Host "`tProduct: $Product"
            }
            
            #set company
            if (($group.Company -ne $null) -And ![string]::IsNullOrWhiteSpace($Company)) {
                $group.Company = $Company
                Write-Host "`tCompany: $Company"
            }
            
            # set copyright
            if (($group.Copyright -ne $null) -And ![string]::IsNullOrWhiteSpace($Copyright)) {
                $Copyright = [Regex]::Replace($Copyright, "\$\(date:$DateRegex\)", { Get-Date -format $args.Groups[1].Value })
                $group.Copyright = $Copyright
                Write-Host "`tCopyright: $Copyright"
            }

            # set trademark

            # set description
            if (($group.Description -ne $null) -And ![string]::IsNullOrWhiteSpace($Description)) {
                $group.Description = $Description
                Write-Host "`tDescription: $Description"
            }
            
            # set culture
            if (($group.NeutralLanguage -ne $null) -And ![string]::IsNullOrWhiteSpace($Culture)) {
                $group.NeutralLanguage = $Culture
                Write-Host "`tNeutralLanguage: $Culture"
            }
            
            # set configuration
        }

        $filecontent.Save($file)

        Write-Host "`t$fileName - assembly info applied"
    }
}

Main
