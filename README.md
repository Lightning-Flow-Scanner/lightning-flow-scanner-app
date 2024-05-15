# Lightning Web Component - Development Preview

**Note: This project is still in development.**

## Overview

This project aims to integrate a core module into a Lightning Web Component (LWC) in Salesforce. The core module is successfully being loaded as a static resource, although it seemingly required several changes on the core module. We are currently able to show the rules.

## Core Module

The core module is loaded as a single JavaScript file static resource. The JavaScript file can be generated using `ncc` on the core module as follows:

`git clone https://github.com/Lightning-Flow-Scanner/lightning-flow-scanner-core.git`

`cd lightning-flow-scanner-core`

`git checkout toolingapi`

`npx rollup -c rollup.config.js`

## Development Status

Despite the current state, this project demonstrates promising progress towards realizing a Lightning Web Component. 