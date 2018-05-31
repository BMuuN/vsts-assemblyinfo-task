[CmdletBinding()]
param (

    [Parameter(Mandatory=$True)]
    [String]$Path,

    [Parameter(Mandatory=$True)]
    [String]$FileNames,

    [Parameter(Mandatory=$True)]
    [String]$InsertAttributes,

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

. "$PSScriptRoot\Utils.ps1"
. "$PSScriptRoot\NetFramework.ps1"
. "$PSScriptRoot\NetCore.ps1"

# Set a flag to force verbose as a default
$VerbosePreference = 'Continue' # equiv to -verbose

Function Main() {

    $RegEx = @{
        Version = "\d+\.\d+\.?\d*\.?\d*"
        Word = ".*"
        Date = "(([\w.: +])*?)"
    }

    $Model = @{
        Path = $Path
        FileNames = $FileNames
        Title = $Title
        Product = $Product
        Description = $Description
        Company = $Company
        Copyright = $Copyright
        Trademark = $Trademark
        Culture = $Culture
        Configuration = $Configuration
        Version = $VersionNumber
        FileVersion = $FileVersionNumber
        InformationalVersion = $InformationalVersion
        InsertAttributes = [System.Convert]::ToBoolean($InsertAttributes)
        NetFrameworkFileNames = @()
        NetCoreFileNames = @()
    }

    # [System.Collections.ArrayList]

    # Make sure path to source code directory is available
    if (-not (Test-Path $Model.Path))
    {
        Write-Error "Source directory does not exist: $($Model.Path)"
        exit 1
    }

    # Filter the file list
    $fileNames = $Model.FileNames `
                -replace "\\r\\n", "," `
                -replace "`t|`r|`n", "," `
                -replace "`"", "" `
                -split "," |
                Where-Object { $_ } | 
                ForEach-Object { $_.Trim() }
    $Model.NetFrameworkFileNames += $fileNames | Where-Object { $_ -like "*.cs" }
    $Model.NetFrameworkFileNames += $fileNames | Where-Object { $_ -like "*.vb" }
    $Model.NetCoreFileNames += $fileNames | Where-Object { $_ -like "*.csproj" }

    # Apply copyright transform
    $Model.Copyright = [Regex]::Replace($Model.Copyright, "\$\(date:$($RegEx.Date)\)", { Get-Date -format $args.Groups[1].Value })

    # Generate wildcard build numbers
    SetWildcardVersionNumbers([ref]$Model)

    # Validate version numbers
    Write-Host "Validating Version: $($Model.Version)"
    $Model.Version = ValidateVersionNumber -Version $Model.Version -RegEx $RegEx.Version
    Write-Host "Validating File Version: $($Model.FileVersion)"
    $Model.FileVersion = ValidateVersionNumber -Version $Model.FileVersion -RegEx $RegEx.Version

    PrintTaskParameters -Model $Model
    
    if ($Model.NetFrameworkFileNames) {
        NetFramework -Model $Model -RegEx $RegEx
    }

    if ($Model.NetCoreFileNames) {
        NetCore -Model $Model -RegEx $RegEx
    }

    Write-Host "##vso[task.setvariable variable=AssemblyInfo.Version]$($Model.Version)"
    Write-Host "##vso[task.setvariable variable=AssemblyInfo.FileVersion]$($Model.FileVersion)"
    Write-Host "##vso[task.setvariable variable=AssemblyInfo.InformationalVersion]$($Model.InformationalVersion)"
}

Function SetWildcardVersionNumbers([ref]$Model) {
    $d1 = '2000-01-01'
    $d2 = $(Get-Date)
    $ts = New-TimeSpan -Start $d1 -End $d2
    $verBuild = $ts.Days

    $midnight = $(Get-Date -Hour 0 -Minute 00 -Second 00)
    $ts = New-TimeSpan -Start $midnight -End $d2
    $verRelease = [math]::Round($ts.TotalSeconds / 2)

    $Model.Value.VerBuild = $verBuild
    $Model.Value.VerRelease = $verRelease
    $Model.Value.Version = SetWildcardVersionNumber -Value $Model.Value.Version -VerBuild $verBuild -VerRelease $verRelease
    $Model.Value.FileVersion = SetWildcardVersionNumber -Value $Model.Value.FileVersion -VerBuild $verBuild -VerRelease $verRelease
    $Model.Value.InformationalVersion = SetWildcardVersionNumber -Value $Model.Value.InformationalVersion -VerBuild $verBuild -VerRelease $verRelease
}

Function PrintTaskParameters($Model) {
    Write-Host "Task Parameters:"
    Write-Host "`tSource Directory: $($Model.Path)"
    $Model.NetFrameworkFileNames | ForEach-Object { Write-Host "`tNet Framework File: $_" }
    $Model.NetCoreFileNames | ForEach-Object { Write-Host "`tNet Core File: $_" }
    Write-Host "`tTitle: $($Model.Title)"
    Write-Host "`tProduct: $($Model.Product)"
    Write-Host "`tDescription: $($Model.Description)"
    Write-Host "`tCompany: $($Model.Company)"
    Write-Host "`tCopyright: $($Model.Copyright)"
    Write-Host "`tTrademark: $($Model.Trademark)"
    Write-Host "`tCulture: $($Model.Culture)"
    Write-Host "`tConfiguration: $($Model.Configuration)"
    Write-Host "`tVersion: $($Model.Version)"
    Write-Host "`tFile Version: $($Model.FileVersion)"
    Write-Host "`tInformational Version: $($Model.InformationalVersion)"
    Write-Host "`tInsert Attributes: $($Model.InsertAttributes)"
}

Main
