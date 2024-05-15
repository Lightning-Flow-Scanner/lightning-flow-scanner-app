# Lightning Web Component - Development Preview

**Note: This project is still in development.**

## Overview

This project aims to integrate a core module into a Lightning Web Component (LWC) in Salesforce. The core module is successfully being loaded as a static resource. However, due to an error regarding the absence of the __dirname variable, a node-specific variable. 

Error:
`Failed to load script at /resource/1715776405000/lfs: __dirname is not defined [__dirname is not defined]
`

This error is related to [webpack Issue #14072](https://github.com/webpack/webpack/issues/14072), which discusses the necessity for webpack to support free __filename and __dirname references in CommonJS files when building an ECMAScript Module (ESM) build. The feature request aims to address compatibility issues encountered in projects using dependencies that are still in the CommonJS format. 

## Core Module

The core module is loaded as a single JavaScript file static resource. The JavaScript file can be generated using `ncc` on the core module as follows:

`git clone https://github.com/Lightning-Flow-Scanner/lightning-flow-scanner-core.git`

`cd lightning-flow-scanner-core`

`ncc build ./dist/index.js -o <outputdir>`

## Development Status

Despite the current error, this project demonstrates promising progress towards realizing a Lightning Web Component. Further testing and adjustments are required and future iterations may involve creating a version of the core module that is not based on CommonJS files and or using different bundlers like rollup or parcel to build the JavaScript file.  
