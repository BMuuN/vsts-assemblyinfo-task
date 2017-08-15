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
$VersionRegex = "\d+\.\d+\.\d+\.\d+"

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
    $Version = ValidateVersionNumber $VersionNumber
    $FileVersion = ValidateVersionNumber $FileVersionNumber

    Write-Host "Source Directory: $Path"
    $NetFrameworkFileNames | ForEach-Object { Write-Host "Net Framework File Names: $_" }
    $NetCoreFileNames | ForEach-Object { Write-Host "Net Core File Names: $_" }
    Write-Host "Title: $Title"
    Write-Host "Product: $Product"
    Write-Host "Description: $Description"
    Write-Host "Company: $Company"
    Write-Host "Copyright: $Copyright"
    Write-Host "Trademark: $Trademark"
    Write-Host "Culture: $Culture"
    Write-Host "Configuration: $Configuration"
    Write-Host "Version: $Version"
    Write-Host "File Version: $FileVersion"
    Write-Host "Informational Version: $InformationalVersion"
    
    if ($NetFrameworkFileNames) {
        NetFramework
    }

    if ($NetCoreFileNames) {
        NetCore
    }
}

Function ValidateVersionNumber($number)
{
    Write-Host "Validating: $number"

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

        # set version
        if(![string]::IsNullOrWhiteSpace($Version)) {
            $filecontent -replace "AssemblyVersion\($WordRegex\)", "AssemblyVersion(`"$Version`")" | Out-File $file
            $filecontent = Get-Content($file)
        }

        # set file version
        if(![string]::IsNullOrWhiteSpace($FileVersion)) {
            $filecontent -replace "AssemblyFileVersion\($WordRegex\)", "AssemblyFileVersion(`"$FileVersion`")" | Out-File $file
            $filecontent = Get-Content($file)
        }
        
        # set informational version
        if(![string]::IsNullOrWhiteSpace($InformationalVersion)) {
            $filecontent -replace "AssemblyInformationalVersion\($WordRegex\)", "AssemblyInformationalVersion(`"$InformationalVersion`")" | Out-File $file
            $filecontent = Get-Content($file)
        }
        
        # set title
        if(![string]::IsNullOrWhiteSpace($Title)) {
            $filecontent -replace "AssemblyTitle\($WordRegex\)", "AssemblyTitle(`"$Title`")" | Out-File $file
            $filecontent = Get-Content($file)
        }

        # set product
        if(![string]::IsNullOrWhiteSpace($Product)) {
            $filecontent -replace "AssemblyProduct\($WordRegex\)", "AssemblyProduct(`"$Product`")" | Out-File $file
            $filecontent = Get-Content($file)
        }

        # set company
        if(![string]::IsNullOrWhiteSpace($Company)) {
        $filecontent -replace "AssemblyCompany\($WordRegex\)", "AssemblyCompany(`"$Company`")" | Out-File $file
        $filecontent = Get-Content($file)
        }

        # set copyright
        if(![string]::IsNullOrWhiteSpace($Copyright)) {
            $Copyright = [Regex]::Replace($Copyright, "\$\(date:$DateRegex\)", { Get-Date -format $args.Groups[1].Value })
            $filecontent -replace "AssemblyCopyright\($WordRegex\)", "AssemblyCopyright(`"$Copyright`")" | Out-File $file
            $filecontent = Get-Content($file)
        }

        # set trademark
        if(![string]::IsNullOrWhiteSpace($Trademark)) {
            $filecontent -replace "AssemblyTrademark\($WordRegex\)", "AssemblyTrademark(`"$Trademark`")" | Out-File $file
            $filecontent = Get-Content($file)
        }

        # set desription
        if(![string]::IsNullOrWhiteSpace($Description)) {
            $filecontent -replace "AssemblyDescription\($WordRegex\)", "AssemblyDescription(`"$Description`")" | Out-File $file
            $filecontent = Get-Content($file)
        }

        # set culture
        if(![string]::IsNullOrWhiteSpace($Culture)) {
            $filecontent -replace "AssemblyCulture\($WordRegex\)", "AssemblyCulture(`"$Culture`")" | Out-File $file
            $filecontent = Get-Content($file)
        }

        # set configuration
        if(![string]::IsNullOrWhiteSpace($Configuration)) {
            $filecontent -replace "AssemblyConfiguration\($WordRegex\)", "AssemblyConfiguration(`"$Configuration`")" | Out-File $file
            $filecontent = Get-Content($file)
        }

        Write-Host "$file - assembly info applied"
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

        if (($filecontent.Project -eq $null) -Or ($filecontent.Project.PropertyGroup -eq $null))
        {
            Write-Warning "No assembly info tags found in: $file"
            continue
        }

        foreach ($group in $filecontent.Project.PropertyGroup) {

            # set version
            if(($group.AssemblyVersion -ne $null) -And ![string]::IsNullOrWhiteSpace($Version)) {
                $group.AssemblyVersion = "$Version"
            }

            # set file version
            if (($group.FileVersion -ne $null) -And ![string]::IsNullOrWhiteSpace($FileVersion)) {
                $group.FileVersion = "$FileVersion"
            }

            # set informational version
            if (($group.Version -ne $null) -And ![string]::IsNullOrWhiteSpace($InformationalVersion)) {
                $group.Version = $InformationalVersion
            }

            # set title
            if (($group.AssemblyTitle -ne $null) -And ![string]::IsNullOrWhiteSpace($Title)) {
                $group.AssemblyTitle = $Title
            }

            # set product
            if (($group.Product -ne $null) -And ![string]::IsNullOrWhiteSpace($Product)) {
                $group.Product = $Product
            }
            
            #set company
            if (($group.Company -ne $null) -And ![string]::IsNullOrWhiteSpace($Company)) {
                $group.Company = $Company
            }
            
            # set copyright
            if (($group.Copyright -ne $null) -And ![string]::IsNullOrWhiteSpace($Copyright)) {
                $Copyright = [Regex]::Replace($Copyright, "\$\(date:$DateRegex\)", { Get-Date -format $args.Groups[1].Value })
                $group.Copyright = $Copyright
            }

            # set trademark

            # set description
            if (($group.Description -ne $null) -And ![string]::IsNullOrWhiteSpace($Description)) {
                $group.Description = $Description
            }
            
            # set culture
            if (($group.NeutralLanguage -ne $null) -And ![string]::IsNullOrWhiteSpace($Culture)) {
                $group.NeutralLanguage = $Culture
            }
            
            # set configuration
        }

        $filecontent.Save($file)
        
        Write-Host "$file - assembly info applied"
    }
}

Main