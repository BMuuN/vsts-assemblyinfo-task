# Release Notes
> **v3.0.707**
> - Added new logo.
> - Changed 'PackageLicenseUrl' element to 'PackageLicenseFile'.
> - Changed 'PackageIconUrl' element to 'PackageIcon'.
> - The build will now fail when no source files are found.
> - Started to add unit test coverage.
> - Added output variables to task GUI.
> - Added "Tagging Group" to tag the builds and update build name. See [wiki](https://github.com/BMuuN/vsts-assemblyinfo-task/wiki/Build-Tagging) for configuration options.
> Thanks to [andyste1](https://github.com/andyste1)
> - Added support for `MSBuild.Sdk.Extras` projects.
> Thanks to [crb04c](https://github.com/crb04c)

> **v2.3.105**
> - Added support for `.vbproj` to .Net Core task.

> **v2.2.103**
> - Added section to Overview.md about the issues faced with App Insights telemetry service.
> Thanks to [chwebdude](https://github.com/chwebdude)
> - Added flag to ignore warnings when .Net Framework project found. Fixes [#136](https://github.com/BMuuN/vsts-assemblyinfo-task/issues/136)
> Thanks to [hermanvos](https://github.com/hermanvos)
> - Bug fix: Wildcard verion number rounding.
> Thanks to [THues3010 ](https://github.com/THues3010)

> **v2.1.85**
> - Added date transforms for all fields.
> - Enhanced logging options.
> - Added Application Insights.
> - Bug fix: File encoding using last detected encoding type.

> **v2.0.73**
> - Skip invalid `.csproj` file types.
> - Bug fix: Net Core missing attributes.

> **v2.0.65**
> - Rewrittein in Node JS.
> - Moved .Net Core to it's own extension.
> - Added support for file encoding (read and save).
> - Added wildcard file searching.
> - Added missing `using` statements.  
> Thanks to [SeriousM](https://github.com/SeriousM)

> **v1.1.36**
> - Added wilcard version number support.  
> Thanks to [andyste1](https://github.com/andyste1)
> - Added flag to insert missing attributes.  
> Thanks to [pbelousov](https://github.com/pbelousov)

> **v1.0.30**
> - Added support for spacing.  
>  Thanks to [enigmament](https://github.com/enigmament).

> **v1.0.29**
> - Added support for SemVer versioning.  
>  Thanks to [SimsonicLtd](https://github.com/SimsonicLtd).

> **v1.0.27**
> - Attribute fields are now grouped on the task pane.
> - Added additional check for attribute substitutions.
> - Added additional logging.
> - Added script for testing and packaging.
> - Updated Readme.

> **v1.0.26**
> - Bug fix: Fix for incorrect 'Patch' number.

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