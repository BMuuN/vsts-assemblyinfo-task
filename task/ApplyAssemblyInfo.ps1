[CmdletBinding()]
param (

    [Parameter(Mandatory)]
    [String]$Path,

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
    [string]$FileVersionNumber
    
    [Parameter(Mandatory=$false)]
    [string]$FileInformationalVersion
)

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
                #Write-Host "Version Number is valid: $VersionData"
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

# Set a flag to force verbose as a default
$VerbosePreference = 'Continue' # equiv to -verbose

# Regular expression pattern to find the version
$VersionRegex = "\d+\.\d+\.\d+\.\d+"

# Regular expression pattern to find any string
$WordRegex = ".*"

# Date regular expression pattern
$DateRegex = "(([\w.: +])*?)"

# Make sure path to source code directory is available
if (-not (Test-Path $Path))
{
    Write-Error "Source directory does not exist: $Path"
    exit 1
}

$Version = ValidateVersionNumber $VersionNumber
$FileVersion = ValidateVersionNumber $FileVersionNumber

# write data to the output
Write-Host "Source Directory: $Path"
Write-Host "Version Parameter: $VersionNumber"
Write-Host "Title: $Title"
Write-Host "Version: $Version"
Write-Host "File Version: $FileVersion"
Write-Host "File Informational Version: $FileInformationalVersion"
Write-Host "Product: $Product"
Write-Host "Company: $Company"
Write-Host "Copyright: $Copyright"
Write-Host "Trademark: $Trademark"
Write-Host "Description: $Description"
Write-Host "Culture: $Culture"
Write-Host "Configuration: $Configuration"

# Get all AssemblyInfo files
$files = Get-ChildItem $Path -Recurse -Include "*Properties*","My Project" | 
    Where-Object { $_.PSIsContainer } | 
    ForEach-Object { Get-ChildItem -Path $_.FullName -Recurse -Include "AssemblyInfo.*" }

if($files)
{
    Write-Host "Applying assembly info to $($files.count) files..."

    foreach ($file in $files) {
        
        # remove the read-only attribute, making the file writable
        attrib $file -r

        # get the file contents
        $filecontent = Get-Content($file)

        # set version
        if(![string]::IsNullOrWhiteSpace($Version)) {
            $filecontent -replace "AssemblyVersion\(`"$VersionRegex`"\)", "AssemblyVersion(`"$Version`")" | Out-File $file
            $filecontent = Get-Content($file)
        }

        # set file version
        if(![string]::IsNullOrWhiteSpace($FileVersion)) {
            $filecontent -replace "AssemblyFileVersion\(`"$VersionRegex`"\)", "AssemblyFileVersion(`"$FileVersion`")" | Out-File $file
            $filecontent = Get-Content($file)
        }

        # set file informational version
        if(![string]::IsNullOrWhiteSpace($FileInformationalVersion)) {
            $filecontent -replace "AssemblyInformationalVersion\(`"$WordRegex`"\)", "AssemblyInformationalVersion(`"$FileInformationalVersion`")" | Out-File $file
            $filecontent = Get-Content($file)
        }
        
        # set title
        if(![string]::IsNullOrWhiteSpace($Title)) {
            $filecontent -replace "AssemblyTitle\(`"$WordRegex`"\)", "AssemblyTitle(`"$Title`")" | Out-File $file
            $filecontent = Get-Content($file)
        }

        # set product
        if(![string]::IsNullOrWhiteSpace($Product)) {
            $filecontent -replace "AssemblyProduct\(`"$WordRegex`"\)", "AssemblyProduct(`"$Product`")" | Out-File $file
            $filecontent = Get-Content($file)
        }

        # set company
        if(![string]::IsNullOrWhiteSpace($Company)) {
         $filecontent -replace "AssemblyCompany\(`"$WordRegex`"\)", "AssemblyCompany(`"$Company`")" | Out-File $file
         $filecontent = Get-Content($file)
        }

        # set copyright
        if(![string]::IsNullOrWhiteSpace($Copyright)) {
            $Copyright = [Regex]::Replace($Copyright, "\$\(date:$DateRegex\)", { Get-Date -format $args.Groups[1].Value })
            $filecontent -replace "AssemblyCopyright\(`"$WordRegex`"\)", "AssemblyCopyright(`"$Copyright`")" | Out-File $file
            $filecontent = Get-Content($file)
        }

        # set trademark
        if(![string]::IsNullOrWhiteSpace($Trademark)) {
            $filecontent -replace "AssemblyTrademark\(`"$WordRegex`"\)", "AssemblyTrademark(`"$Trademark`")" | Out-File $file
            $filecontent = Get-Content($file)
        }

        # set desription
        if(![string]::IsNullOrWhiteSpace($Description)) {
            $filecontent -replace "AssemblyDescription\(`"$WordRegex`"\)", "AssemblyDescription(`"$Description`")" | Out-File $file
            $filecontent = Get-Content($file)
        }

        # set culture
        if(![string]::IsNullOrWhiteSpace($Culture)) {
            $filecontent -replace "AssemblyCulture\(`"$WordRegex`"\)", "AssemblyCulture(`"$Culture`")" | Out-File $file
            $filecontent = Get-Content($file)
        }

        # set configuration
        if(![string]::IsNullOrWhiteSpace($Configuration)) {
            $filecontent -replace "AssemblyConfiguration\(`"$WordRegex`"\)", "AssemblyConfiguration(`"$Configuration`")" | Out-File $file
            $filecontent = Get-Content($file)
        }

        Write-Host "$file - assembly info applied"
    }
}
else
{
    Write-Warning "No Assembly Info files found."
}