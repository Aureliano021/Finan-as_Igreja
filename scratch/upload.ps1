$b1 = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes(([string]::Join("`n", (Get-Content scratch\autostart_debian.sh)))))
$b2 = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes(([string]::Join("`n", (Get-Content scratch\start_services.sh)))))

$b1 | .\scratch_plink.exe -batch -hostkey "SHA256:dcbIPakUhWpV0wMwIaD7Lk5HbjGyXBxeD/xWXCcfQOE" -P 2222 -pw 010487 u0_a153@192.168.1.83 "su -c 'base64 -d > /data/adb/service.d/autostart_debian.sh && chmod +x /data/adb/service.d/autostart_debian.sh'"

$b2 | .\scratch_plink.exe -batch -hostkey "SHA256:dcbIPakUhWpV0wMwIaD7Lk5HbjGyXBxeD/xWXCcfQOE" -P 2222 -pw 010487 u0_a153@192.168.1.83 "su -c 'base64 -d > /data/local/tmp/chrootDebian/root/start_services.sh && chmod +x /data/local/tmp/chrootDebian/root/start_services.sh'"

.\scratch_plink.exe -batch -hostkey "SHA256:dcbIPakUhWpV0wMwIaD7Lk5HbjGyXBxeD/xWXCcfQOE" -P 2222 -pw 010487 u0_a153@192.168.1.83 "su -c 'cat /data/adb/service.d/autostart_debian.sh /data/local/tmp/chrootDebian/root/start_services.sh'"
