Remove-Item *.vsix

foreach ($folder in Get-ChildItem | Where-Object { $_.PSIsContainer })
{
   tfx extension create --manifest-globs vss-extension.json --root $folder 
}