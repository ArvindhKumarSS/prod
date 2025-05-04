#!/bin/bash

# Check if wkhtmltoimage is installed
if ! command -v wkhtmltoimage &> /dev/null; then
    echo "wkhtmltoimage is not installed. Please install it first."
    echo "On macOS: brew install wkhtmltopdf"
    exit 1
fi

# Create comics directory if it doesn't exist
mkdir -p ../public/images/comics

# Convert each HTML file to PNG
for i in {1..5}; do
    wkhtmltoimage --width 800 --height 600 --quality 100 \
        ../public/images/comic-$i.html \
        ../public/images/comics/comic-$i.png
done

echo "Comic panels generated successfully!" 