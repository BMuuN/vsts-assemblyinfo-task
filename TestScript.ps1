$Path = (Get-Item -Path ".\" -Verbose).FullName + "\test"
$FileNames = "AssemblyInfo.cs,
`"AssemblyInfo.vb`"
GlobalInfo.cs,\r\nNetCoreLib.csproj"
#$FileNames = "AssemblyInfo.cs\r\nAssemblyInfo.vb"
$InsertAttributes = $true
$Title = "Test Title"
$Product = "Product of Example Inc"
$Company = "Example Inc"
$Copyright = "Copyright © `$(date:yyyy) `$(date:dd.MM.yyyy dd MMMM yyyy HH:mm tt) Example Ltd"
#$Copyright = ""
$Trademark = "Example Trademark"
$Description = "Example description"
$Culture = "en-GB"
$Configuration = "debug" # true = Release, false = debug
$VersionNumber = "TS Extension Test Build_2017.08.*"
$FileVersionNumber = "1990.03.*.*"
$InformationalVersion = "1.1.0-beta2"

.\src\task\ApplyAssemblyInfo.ps1 -Path $Path -FileNames $FileNames -InsertAttributes $InsertAttributes -Title $Title -Product $Product -Company $Company -Copyright $Copyright -Trademark $Trademark -Description $Description -Culture $Culture -Configuration $Configuration -VersionNumber $VersionNumber -FileVersionNumber $FileVersionNumber -InformationalVersion $InformationalVersion