#!/system/bin/sh
# Script de Autostart limpo para Magisk com Antidesligamento de CPU/Wi-Fi

CHROOT=/data/local/tmp/chrootDebian
LOG=/data/local/tmp/autostart.log

export PATH=/system/bin:/system/xbin:/sbin:/vendor/bin:$PATH

echo "[AUTOSTART] Boot script iniciado em $(date)" > $LOG

# Aguarda 120s (2 minutos) para o Android e o Wi-Fi carregarem completamente apos o boot
sleep 120

echo "[AUTOSTART] Configurando prevencao de suspensao de CPU e Wi-Fi (Anti-Doze)..." >> $LOG
dumpsys deviceidle disable >> $LOG 2>&1
echo "igreja_server_wakelock" > /sys/power/wake_lock 2>/dev/null
cmd wifi set-power-mode 0 >> $LOG 2>&1
iw dev wlan0 set power_save off >> $LOG 2>&1

for cpu in /sys/devices/system/cpu/cpu*/cpufreq/scaling_governor; do
  echo "performance" > $cpu 2>/dev/null || echo "schedutil" > $cpu 2>/dev/null
done

echo "[AUTOSTART] Criando pastas temporarias..." >> $LOG
mkdir -p /tmp /data/data/com.termux/files/usr/tmp
chmod 1777 /tmp /data/data/com.termux/files/usr/tmp 2>/dev/null

echo "[AUTOSTART] Montando sistemas de arquivos virtuais e rshared..." >> $LOG
mount -o bind $CHROOT $CHROOT 2>/dev/null
mount --make-rshared $CHROOT 2>/dev/null

if ! mountpoint -q $CHROOT/proc; then
  mount -t proc proc $CHROOT/proc 2>/dev/null
fi

if ! mountpoint -q $CHROOT/sys; then
  mount -t sysfs sysfs $CHROOT/sys 2>/dev/null
fi

if ! mountpoint -q $CHROOT/dev; then
  mount -o bind /dev $CHROOT/dev 2>/dev/null
fi

if ! mountpoint -q $CHROOT/dev/pts; then
  mount -t devpts devpts $CHROOT/dev/pts 2>/dev/null
fi

mkdir -p $CHROOT/dev/shm
if ! mountpoint -q $CHROOT/dev/shm; then
  mount -t tmpfs tmpfs $CHROOT/dev/shm 2>/dev/null
fi

echo "[AUTOSTART] Executando /root/start_services.sh no Debian..." >> $LOG
chroot $CHROOT /bin/bash /root/start_services.sh >> $LOG 2>&1

echo "[AUTOSTART] Boot script concluido com sucesso em $(date)!" >> $LOG
