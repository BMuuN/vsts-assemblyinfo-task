# Assembly Info
Assembly Info is an extension for Team Foundation Server / Team Services that sets assembly information from a build.

The extension will search the specified **Source Folder** for assembly info **Source Files** and set the manifest data. This will result in assembly (*.dll) files containing common assembly information.

The following fields can be set:

| Attribute | Function |
|-----------|-----------|
| Title | Provides a friendly name for the assembly. |
| Product | Provides the product information for the assembly. |
| Description | Provides a short description that summarizes the nature and purpose of the assembly. |
| Company | Provides the company name for the assembly. |
| Copyright | Provide the assembly or product copyright information. |
| Trademark | Provides the assembly or product trademark information. |
| Culture | Provides information on what culture the assembly supports. |
| Configuration | Provides the build configuration for the assembly, such as debug or release. |
| Version Number | Provides a assembly version for the application. |
| File Version Number | Provides a file version for the application. |
| Informational Version | Provides a text version for the application. |

*If no value is specified for a particular field that field will be ignored and the default value in the AssemblyInfo source file will be used.*

> For more information regarding assembly attributes please see the following [Microsoft Doc](https://docs.microsoft.com/en-us/dotnet/framework/app-domains/set-assembly-attributes)

## How to use the build task
### Configuration
1. Create or edit a build definition.
3. Click **Add build step...** and add the **Assembly Info** task from the Build category.
4. Configure the task by providing values for the fields mentioned in the above table.  
> Ensure you specify the file names you wish to populate within the **Source Files** field: -  
> For .Net Framework specify files such as: AssemblyInfo.cs, AssemblyInfo.vb, GlobalInfo.cs  
> For .Net Core specify the project file: Example.csproj

  ![Assembly Info task parameters](images/Task_Parameters.png)

5. The result, an assembly with the manifest data applied.  

  ![Assembly Info Set](images/Assembly_Manifest_Data.png)

## Version Number
A version number must be specified in the format `digit.digit.digit.digit`:  
```
1.0.0.0
2016.12.31.1
```
To achieve the best result:
1. From the **General** tab set the **Build number format** to:
```
$(Build.DefinitionName)_$(date:yyyy).$(date:MM).$(date:dd)$(rev:.r)
```
2. From the Assembly Info task set the **Version Number** to:
```
$(Build.BuildNumber)
```
This approach ensures:
1. The version number is in the correct format.
2. The version number is determined by the build and not the task.
3. Enables us to associate assemblies (*.dll) to a specific build.

## Copyright
Set dates in the copyright field using the following examples:  
```
Copyright © $(date:yyyy) Example Ltd  
Copyright © $(date:dd MM yyyy) Example Ltd  
Copyright © $(date:M.d.yyyy) Example Ltd  
Copyright © $(date:dd MMMM yyyy HH:mm tt) Example Ltd
```

## Release Notes
> **v1.0.25**
> - Bug fix: Array of file names not created when 2 files are specified.

> **v1.0.23**
> - Added support for .Net Core.
> - Added *Source Files* task parameter.
> - Added *Informational Version* task parameter.  
>  Thanks to [roryza](https://github.com/roryza) and [richardctrimble](https://github.com/richardctrimble).
> - Fixed issue with space between quotes and parenthesese [Issue #1](https://github.com/BMuuN/vsts-assemblyinfo-task/issues/1).

> **v1.0.22**
> - Added *File Version* task parameter.

> **v1.0.21**
> - Added date transforms for the *Copyright* task parameter.

> **v1.0.14**
> - Initial release