$callInput = [Console]::In.ReadToEnd() | ConvertFrom-Json
$command = $callInput.tool_input.command
if ($command -match '\bgit\b.*\bpush\b') {
  [Console]::Error.WriteLine("Blocked by project hook: git push is not allowed. Ask the user to push.")
  exit 2
}
exit 0