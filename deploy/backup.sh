#!/usr/bin/env bash
# Daily backup of everything the admin and the website forms create:
#   data-store/      content, admin accounts, enquiries, job applications, CVs
#   public/uploads/  images uploaded in the admin
#
# Install (runs every night at 02:30, keeps 30 days):
#   chmod +x deploy/backup.sh
#   crontab -e   ->   30 2 * * * /var/www/cube/deploy/backup.sh >> /var/www/cube/logs/backup.log 2>&1
#
# Copy the backup folder to another machine or cloud storage as well; a backup
# on the same disk does not protect against a disk failure.
set -euo pipefail

APP_DIR="$(cd "$(dirname "$0")/.." && pwd)"
BACKUP_DIR="${BACKUP_DIR:-$APP_DIR/backups}"
KEEP_DAYS="${KEEP_DAYS:-30}"
STAMP="$(date +%Y-%m-%d_%H%M)"

mkdir -p "$BACKUP_DIR"
cd "$APP_DIR"
tar -czf "$BACKUP_DIR/cube-data_$STAMP.tar.gz" data-store public/uploads 2>/dev/null || \
  tar -czf "$BACKUP_DIR/cube-data_$STAMP.tar.gz" data-store
chmod 600 "$BACKUP_DIR/cube-data_$STAMP.tar.gz"
find "$BACKUP_DIR" -name 'cube-data_*.tar.gz' -mtime +"$KEEP_DAYS" -delete
echo "$(date -Is) backup ok: $BACKUP_DIR/cube-data_$STAMP.tar.gz"
