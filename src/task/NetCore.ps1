
Function NetCore($Model, $RegEx) {

    Write-Host "Setting .Net Core assembly info..."

    $files = Get-ChildItem $Model.Path -Recurse -Include $Model.NetCoreFileNames

    if(!$files)
    {
        Write-Warning "No file found with filename: $($Model.NetCoreFileNames)"
        return
    }

    foreach ($file in $files)
    {
        Write-Host "`t$($file.FullName)"

        if (-not (Test-Path $file.FullName)) {
            Write-Warning "No file found with filename: $($file.FullName)"
            return
        }

        attrib $file -r
        [xml]$filecontent = Get-Content $file

        if (($filecontent.Project -eq $null) -Or ($filecontent.Project.PropertyGroup -eq $null))
        {
            Write-Warning "No assembly info tags found in: $($file.FullName)"
            return
        }

        foreach ($group in $filecontent.Project.PropertyGroup) {

            # set version
            if (![string]::IsNullOrWhiteSpace($Model.Version)) {
    
                if ($Model.InsertAttributes -And $group.AssemblyVersion -eq $null -And ($group.TargetFramework -ne $null -Or $group.TargetFrameworks -ne $null)) {
                    $newElement = $filecontent.CreateElement("AssemblyVersion")
                    $group.AppendChild($newElement) > $null
                }
            
                if ($group.AssemblyVersion -ne $null) {
                    $group.AssemblyVersion = $Model.Version
                    Write-Host "`tAssemblyVersion: $($Model.Version)"
                }
            }

            # set file version
            if (![string]::IsNullOrWhiteSpace($Model.FileVersion)) {

                if ($Model.InsertAttributes -And $group.FileVersion -eq $null -And ($group.TargetFramework -ne $null -Or $group.TargetFrameworks -ne $null)) {
                    $newElement = $filecontent.CreateElement("FileVersion")
                    $group.AppendChild($newElement) > $null
                }

                if ($group.FileVersion -ne $null) {
                    $group.FileVersion = $Model.FileVersion
                    Write-Host "`tFileVersion: $($Model.FileVersion)"
                }
            }

            # set informational version
            if (![string]::IsNullOrWhiteSpace($Model.InformationalVersion)) {

                if ($Model.InsertAttributes -And $group.Version -eq $null -And ($group.TargetFramework -ne $null -Or $group.TargetFrameworks -ne $null)) {
                    $newElement = $filecontent.CreateElement("Version")
                    $group.AppendChild($newElement) > $null
                }

                if ($group.Version -ne $null) {
                    $group.Version = $Model.InformationalVersion
                    Write-Host "`tVersion: $($Model.InformationalVersion)"
                }
            }

            # set title
            if (![string]::IsNullOrWhiteSpace($Model.Title)) {
                
                if ($Model.InsertAttributes -And $group.AssemblyTitle -eq $null -And ($group.TargetFramework -ne $null -Or $group.TargetFrameworks -ne $null)) {
                    $newElement = $filecontent.CreateElement("AssemblyTitle")
                    $group.AppendChild($newElement) > $null
                }

                if ($group.AssemblyTitle -ne $null) {
                    $group.AssemblyTitle = $Model.Title
                    Write-Host "`tAssemblyTitle: $($Model.Title)"
                }
            }

            # set product
            if (![string]::IsNullOrWhiteSpace($Model.Product)) {
                
                if ($Model.InsertAttributes -And $group.Product -eq $null -And ($group.TargetFramework -ne $null -Or $group.TargetFrameworks -ne $null)) {
                    $newElement = $filecontent.CreateElement("Product")
                    $group.AppendChild($newElement) > $null
                }

                if ($group.Product -ne $null) {
                    $group.Product = $Model.Product
                    Write-Host "`tProduct: $($Model.Product)"
                }
            }
            
            #set company
            if (![string]::IsNullOrWhiteSpace($Model.Company)) {
                
                if ($Model.InsertAttributes -And $group.Company -eq $null -And ($group.TargetFramework -ne $null -Or $group.TargetFrameworks -ne $null)) {
                    $newElement = $filecontent.CreateElement("Company")
                    $group.AppendChild($newElement) > $null
                }

                if ($group.Company -ne $null) {
                    $group.Company = $Model.Company
                    Write-Host "`tCompany: $($Model.Company)"
                }
            }
            
            # set copyright
            if (![string]::IsNullOrWhiteSpace($Model.Copyright)) {
                
                if ($Model.InsertAttributes -And $group.Copyright -eq $null -And ($group.TargetFramework -ne $null -Or $group.TargetFrameworks -ne $null)) {
                    $newElement = $filecontent.CreateElement("Copyright")
                    $group.AppendChild($newElement) > $null
                }

                if ($group.Copyright -ne $null) {
                    $group.Copyright = $Model.Copyright
                    Write-Host "`tCopyright: $($Model.Copyright)"
                }
            }

            # set trademark

            # set description
            if (![string]::IsNullOrWhiteSpace($Model.Description)) {

                if ($InsertAttributes -And $group.Description -eq $null -And ($group.TargetFramework -ne $null -Or $group.TargetFrameworks -ne $null)) {
                    $newElement = $filecontent.CreateElement("Description")
                    $group.AppendChild($newElement) > $null
                }

                if ($group.Description -ne $null) {
                    $group.Description = $Model.Description
                    Write-Host "`tDescription: $($Model.Description)"
                }
            }
            
            # set culture
            if (![string]::IsNullOrWhiteSpace($Model.Culture)) {
                
                if ($Model.InsertAttributes -And $group.NeutralLanguage -eq $null -And ($group.TargetFramework -ne $null -Or $group.TargetFrameworks -ne $null)) {
                    $newElement = $filecontent.CreateElement("NeutralLanguage")
                    $group.AppendChild($newElement) > $null
                }

                if ($group.NeutralLanguage -ne $null) {
                    $group.NeutralLanguage = $Model.Culture
                    Write-Host "`tNeutralLanguage: $($Model.Culture)"
                }
            }
            
            # set configuration

            # Authors
            # PackageLicenseUrl
            # PackageProjectUrl
            # PackageIconUrl
            # RepositoryUrl
        }

        $filecontent.Save($file)

        Write-Host "`t$($file.FullName) - Assembly Info Applied"
    }
}
