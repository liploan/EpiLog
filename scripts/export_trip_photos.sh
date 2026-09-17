#!/usr/bin/env bash

# Export unmodified originals from Apple Photos album "Trip To Spain"
ALBUM_NAME="Trip To Spain"
DEST_DIR="$HOME/Desktop/TripToSpain_Photos"

echo "=========================================================="
echo "  Exporting album \"$ALBUM_NAME\" from Apple Photos..."
echo "  Target directory: $DEST_DIR"
echo "=========================================================="

mkdir -p "$DEST_DIR"

osascript <<EOF
tell application "Photos"
    try
        set targetAlbum to album "$ALBUM_NAME"
        set photoCount to count of media items of targetAlbum
        if photoCount is 0 then
            display dialog "The album '$ALBUM_NAME' was found, but it has 0 photos." buttons {"OK"} default button "OK"
            return
        end if
        
        set destAlias to (POSIX file "$DEST_DIR") as alias
        export (get media items of targetAlbum) to destAlias with using originals
        
        return "SUCCESS: Exported " & photoCount & " photos with full EXIF/GPS metadata to $DEST_DIR"
    on error errMsg
        return "ERROR: " & errMsg
    end try
end tell
EOF

echo ""
echo "✅ Export complete! You can now drag the photos from: $DEST_DIR into EpiLog."
