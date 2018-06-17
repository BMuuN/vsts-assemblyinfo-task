#export INPUT_SAMPLESTRING="Hello World"
#export INPUT_SAMPLEBOOL=true

export INPUT_PATH="\test"
export INPUT_FILENAMES="AssemblyInfo.cs,
\"AssemblyInfo.vb\"
GlobalInfo.cs,\r\nNetCoreLib.csproj"
#export INPUT_FILENAMES="AssemblyInfo.cs\r\nAssemblyInfo.vb"
export INPUT_INSERTATTRIBUTES=true
export INPUT_TITLE="Test Title"
export INPUT_PRODUCT="Product of Example Inc"
export INPUT_DESCRIPTION="Example description"
export INPUT_COMPANY="Example Inc"
export INPUT_COPYRIGHT="Copyright © $(date:yyyy) $(date:dd.MM.yyyy dd MMMM yyyy HH:mm tt) Example Ltd"
#export INPUT_COPYRIGHT=""
export INPUT_TRADEMARK="Example Trademark"
export INPUT_CULTURE="en-GB"
export INPUT_CONFIGURATION="debug" 
export INPUT_VERSIONNUMBER="TS Extension Test Build_2017.08.*"
export INPUT_FILEVERSIONNUMBER="1990.03.*.*"
export INPUT_INFORMATIONALVERSION="1.1.0-beta2"

node dist/src/task/index.js