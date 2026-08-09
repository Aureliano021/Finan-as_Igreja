$b = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes(([string]::Join("`n", (Get-Content scratch\clean_loop.sh)))))
$b | .\scratch_plink.exe -batch -hostkey "SHA256:dcbIPakUhWpV0wMwIaD7Lk5HbjGyXBxeD/xWXCcfQOE" -P 2222 -pw 010487 u0_a153@192.168.1.83 "su -c 'base64 -d > /data/local/tmp/clean_loop.sh && chmod +x /data/local/tmp/clean_loop.sh && sh /data/local/tmp/clean_loop.sh'"
