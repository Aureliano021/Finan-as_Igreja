#!/system/bin/sh
exec > /data/local/tmp/autostart.log 2>&1
echo "[AUTOSTART] Boot script started at $(date)"

# Wait 15 seconds after boot for network and system to settle
sleep 15

echo "[AUTOSTART] Mounting rshared chroot folder..."
mount --bind /data/local/tmp/chrootDebian /data/local/tmp/chrootDebian
mount --make-rshared /data/local/tmp/chrootDebian

echo "[AUTOSTART] Starting SSH service in Debian..."
/system/bin/chroot /data/local/tmp/chrootDebian /bin/bash -c 'export PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:$PATH; service ssh start || /usr/sbin/sshd'

echo "[AUTOSTART] Starting Nginx web server in Debian..."
/system/bin/chroot /data/local/tmp/chrootDebian /bin/bash -c 'export PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:$PATH; /usr/sbin/nginx'

echo "[AUTOSTART] Boot script finished!"
