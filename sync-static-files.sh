#!/bin/bash

# Sync static files from mainapp/public to root public directory
# This ensures that files referenced in the app are available at the expected paths

echo "🔄 Syncing static files from mainapp/public to root public directory..."

# Create base static directory if it doesn't exist
mkdir -p public/static

# Function to copy files while preserving existing ones
copy_if_missing() {
    local src_dir="$1"
    local dest_dir="$2"
    
    if [ -d "$src_dir" ]; then
        mkdir -p "$dest_dir"
        
        # Copy files from source to destination if they don't exist
        for file in "$src_dir"/*; do
            if [ -f "$file" ]; then
                filename=$(basename "$file")
                if [ ! -f "$dest_dir/$filename" ]; then
                    echo "📄 Copying missing file: $filename"
                    cp "$file" "$dest_dir/"
                fi
            fi
        done
        
        # Handle subdirectories recursively
        for subdir in "$src_dir"/*/; do
            if [ -d "$subdir" ]; then
                dirname=$(basename "$subdir")
                copy_if_missing "$subdir" "$dest_dir/$dirname"
            fi
        done
    fi
}

# Copy all static files from mainapp/public to root public
echo "📁 Copying static files..."
copy_if_missing "mainapp/public/static" "public/static"

# List all files that were available for copying
echo ""
echo "✅ Static files sync completed!"
echo ""
echo "📍 Key files now available at:"
echo "   - /static/menu/keys.png"
echo "   - /static/menu/franche_1.png"
echo "   - /static/menu/techRealt.png"
echo ""
echo "📊 File counts:"
echo "   - mainapp/public/static: $(find mainapp/public/static -type f 2>/dev/null | wc -l | tr -d ' ') files"
echo "   - public/static: $(find public/static -type f 2>/dev/null | wc -l | tr -d ' ') files" 