$ProgressPreference = 'SilentlyContinue'
foreach ($path in @('/food-price-monitoring','/market-price','/commodity-price-report','/national-commodity-price','/price-monitoring','/sitemap.xml')) {
  $url = "https://fmard.gov.ng$path"
  try {
    $r = Invoke-WebRequest -Uri $url -TimeoutSec 12 -UseBasicParsing
    Write-Output "$url => $($r.StatusCode) LEN $($r.Content.Length)"
  } catch {
    Write-Output "$url => ERROR $($_.Exception.Message)"
  }
}
