#!/bin/bash

# Extract version without quotes
VERSION=$(jq -r '.version' ./src/manifest.json)

# Check if jq command succeeded
if [ $? -ne 0 ]; then
    echo "Failed to extract version"
    exit 1
fi

# Ensure VERSION is not empty
if [ -z "$VERSION" ]; then
    echo "Version is empty"
    exit 1
fi

# Create build directory if it doesn't exist
mkdir -p ./build

# Zip the src directory into a file named after the version
zip -r "./build/TabApple-$VERSION.zip" ./src/

# Check if zip succeeded
if [ $? -eq 0 ]; then
    echo "Successfully created zip: TabApple-$VERSION.zip"
else
    echo "Failed to create zip file"
    exit 1
fi
