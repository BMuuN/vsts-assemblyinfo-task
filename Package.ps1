Remove-Item *.vsix

$assemblyInfoExtension = (Get-Item -Path ".\" -Verbose).FullName + "\src" 
tfx extension create --manifest-globs vss-extension.json --root $assemblyInfoExtension