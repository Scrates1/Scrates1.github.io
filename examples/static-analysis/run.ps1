param(
    [Parameter(Mandatory = $true)][string]$JdkHome,
    [string]$OutputDirectory = (Join-Path $env:TEMP 'static-analysis-series-02')
)

$ErrorActionPreference = 'Stop'
$oldJavaHome = $env:JAVA_HOME
try {
    $env:JAVA_HOME = (Resolve-Path -LiteralPath $JdkHome).Path
    $java = Join-Path $env:JAVA_HOME 'bin/java.exe'
    $javap = Join-Path $env:JAVA_HOME 'bin/javap.exe'
    $output = [System.IO.Path]::GetFullPath($OutputDirectory)
    & mvn -B -f (Join-Path $PSScriptRoot 'pom.xml') "-Dexample.outputDirectory=$output" compile dependency:build-classpath "-Dmdep.outputFile=$output/classpath.txt"
    if ($LASTEXITCODE -ne 0) { throw 'Maven build failed.' }
    $classes = Join-Path $output 'classes'
    $classpath = $classes + [System.IO.Path]::PathSeparator + (Get-Content -LiteralPath (Join-Path $output 'classpath.txt') -Raw).Trim()
    & $java -cp $classpath tutorial.InspectGraph $classes | Tee-Object -FilePath (Join-Path $output 'graph.txt')
    if ($LASTEXITCODE -ne 0) { throw 'Soot graph inspection failed.' }
    & $javap -classpath $classes -c -p tutorial.BranchFlow | Tee-Object -FilePath (Join-Path $output 'bytecode.txt')
    if ($LASTEXITCODE -ne 0) { throw 'javap failed.' }
    & $java -cp $classes tutorial.BranchFlow | Tee-Object -FilePath (Join-Path $output 'execution.txt')
    if ($LASTEXITCODE -ne 0) { throw 'Sample execution failed.' }
    & $java -cp $classpath tutorial.TaintWorklist $classes | Tee-Object -FilePath (Join-Path $output 'taint.txt')
    if ($LASTEXITCODE -ne 0) { throw 'Taint worklist verification failed.' }
    Write-Output "Results: $output"
} finally {
    $env:JAVA_HOME = $oldJavaHome
}
