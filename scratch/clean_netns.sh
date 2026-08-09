#!/system/bin/sh
pkill -9 dockerd containerd 2>/dev/null
mount | grep netns | while read -r line; do
  m=$(echo "$line" | awk '{print $3}')
  umount -l "$m" 2>/dev/null
done
rm -rf /data/local/tmp/chrootDebian/run/docker/netns/*
echo "NETNS_CLEANED_SUCCESSFULLY"
