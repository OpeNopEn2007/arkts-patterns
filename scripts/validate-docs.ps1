#!/usr/bin/env pwsh
Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$referencesDir = Join-Path $repoRoot "skills/arkts-patterns/references"
$templateDir = Join-Path $repoRoot "skills/arkts-patterns/empty-ability-template"

$errors = @()

function Test-JsonFile {
  param(
    [Parameter(Mandatory = $true)]
    [string]$RelativePath
  )

  $fullPath = Join-Path $repoRoot $RelativePath
  if (-not (Test-Path -LiteralPath $fullPath)) {
    $script:errors += "Missing JSON config: $RelativePath"
    return
  }

  try {
    Get-Content -LiteralPath $fullPath -Raw | ConvertFrom-Json | Out-Null
  } catch {
    $script:errors += "Invalid JSON config ${RelativePath}: $($_.Exception.Message)"
  }
}

for ($i = 1; $i -le 27; $i++) {
  $prefix = "{0:d2}" -f $i
  $match = @(Get-ChildItem -Path $referencesDir -File -Filter "$prefix-*.md")
  if ($match.Count -eq 0) {
    $errors += "Missing reference file for prefix $prefix (expected: ${prefix}-*.md)."
  } elseif ($match.Count -gt 1) {
    $names = ($match | ForEach-Object { $_.Name }) -join ", "
    $errors += "Multiple reference files for prefix ${prefix}: $names"
  }
}

$requiredFiles = @(
  "README.md",
  "RESOURCES.md",
  "templates/README.md",
  "templates/empty-ability/README.md",
  "templates/empty-ability/configuration.md"
)

foreach ($file in $requiredFiles) {
  $fullPath = Join-Path $referencesDir $file
  if (-not (Test-Path -LiteralPath $fullPath)) {
    $errors += "Missing required references file: $file"
  }
}

$requiredTemplateFiles = @(
  "AppScope/app.json5",
  "entry/src/main/module.json5",
  "entry/src/main/ets/entryability/EntryAbility.ets",
  "entry/src/main/ets/entrybackupability/EntryBackupAbility.ets",
  "entry/src/main/ets/pages/Index.ets"
)

foreach ($file in $requiredTemplateFiles) {
  $fullPath = Join-Path $templateDir $file
  if (-not (Test-Path -LiteralPath $fullPath)) {
    $errors += "Missing required template file: empty-ability-template/$file"
  }
}

$agentsIterateSkill = Join-Path $repoRoot ".agents/skills/iterate/SKILL.md"
$claudeIterateSkill = Join-Path $repoRoot ".claude/skills/iterate/SKILL.md"

if (-not (Test-Path -LiteralPath $agentsIterateSkill)) {
  $errors += "Missing iterate authority skill: .agents/skills/iterate/SKILL.md"
}

if (-not (Test-Path -LiteralPath $claudeIterateSkill)) {
  $errors += "Missing Claude iterate adapter skill: .claude/skills/iterate/SKILL.md"
}

if ((Test-Path -LiteralPath $agentsIterateSkill) -and (Test-Path -LiteralPath $claudeIterateSkill)) {
  $agentsContent = Get-Content -LiteralPath $agentsIterateSkill -Raw
  $claudeContent = Get-Content -LiteralPath $claudeIterateSkill -Raw
  if ($agentsContent -ne $claudeContent) {
    $errors += ".claude/skills/iterate/SKILL.md is not synchronized with .agents/skills/iterate/SKILL.md"
  }
}

$forbiddenFiles = @(
  ".agents/skills/case-learning-iterator/SKILL.md",
  ".claude/skills/case-learning-iterator/SKILL.md",
  ".codex/skills/case-learning-iterator/SKILL.md",
  "docs/iterations/DEVELOPMENT-SKILL-SPEC.md"
)

foreach ($file in $forbiddenFiles) {
  $fullPath = Join-Path $repoRoot $file
  if (Test-Path -LiteralPath $fullPath) {
    $errors += "Deprecated file still exists: $file"
  }
}

Test-JsonFile ".claude/settings.json"
Test-JsonFile ".codex/hooks.json"

if ($errors.Count -gt 0) {
  Write-Host "Documentation validation failed:" -ForegroundColor Red
  foreach ($err in $errors) {
    Write-Host " - $err" -ForegroundColor Red
  }
  exit 1
}

Write-Host "Documentation validation passed." -ForegroundColor Green
