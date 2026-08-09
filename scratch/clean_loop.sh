#!/system/bin/sh
i=0
while [ $i -lt 2500 ]; do
  umount -l /data/local/tmp/chrootDebian 2>/dev/null
  i=$((i + 1))
done
echo "FINAL_COUNT=$(mount | grep chrootDebian | wc -l)"
