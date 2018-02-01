Param
(
	[String]$Store = "Cert:\LocalMachine\Root",
    [String]$Delim = "@"
)

$type = [System.Security.Cryptography.X509Certificates.X509ContentType]::Cert
$certs = Get-ChildItem $Store
$output = ""

ForEach ($c in $certs)
{
	$output += [System.Convert]::ToBase64String($c.export($type))
    $output += $Delim
}

$output
