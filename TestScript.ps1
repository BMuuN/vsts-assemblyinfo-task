$Path = "C:\Temp"
$FileNames = "AssemblyInfo.cs, 
`"AssemblyInfo.vb`"
GlobalInfo.cs, NetCore.csproj"
$Title = "Test Title"
$Product = "Product of Example Inc"
$Company = "Example Inc"
$Copyright = "Copyright © `$(date:yyyy) `$(date:M.d.yyyy dd MMMM yyyy HH:mm tt) Example Ltd"
$Trademark = "Example Trademark"
$Description = "Example description"
$Culture = "en-GB"
$Configuration = $true # true = Release, false = debug
$VersionNumber = "TS Extension Test Build_2017.08.05.3"
$FileVersionNumber = "1990.03.07.11"
$InformationalVersion = "21.14.580.1234"

.\task\ApplyAssemblyInfo.ps1 -Path $Path -FileNames $FileNames -Title $Title -Product $Product -Company $Company -Copyright $Copyright -Trademark $Trademark -Description $Description -Culture $Culture -Configuration $Configuration -VersionNumber $VersionNumber -FileVersionNumber $FileVersionNumber -InformationalVersion $InformationalVersion