 [![Lightning Flow Scanner](media/banner.png)](https://github.com/Lightning-Flow-Scanner)

 [![Demo](media/lfsapp.gif)](https://github.com/Lightning-Flow-Scanner)

#### Pinpoint deviations from Industry Best Practices in Salesforce Flows and ensure standards of business automation excellence.

## Features

- **Flow Overview**: Displays a list of all flows in your Salesforce org and allows users to scan the metadata of a selected flow.
- **Flow Analysis**: Provides detailed metadata analysis of the selected flow.

## Using the Lightning Flow Scanner

1) Open the App Launcher:
- Click on the App Launcher icon in the top-left corner of your Salesforce interface.
- Search for "Flow Scanner" in the App Launcher search bar.
- Click on the "Flow Scanner" app to open it.

2) Scan a Flow:
- To scan a flow, click the "Scan" button next to the flow you want to analyze.

## Project Structure

The project is organized into two main directories:

1) force-app: The main application(tab, page etc)
2) lfs_component: Contains the Lightning Flow Scanner Component, used by the main application.

This structure allows for clear separation of the core scanning functionality and the main application logic. By modularizing the core scanning functionality, we ensure easier maintenance and updates. Additionally, this setup encourages other Salesforce apps to integrate our functionality, promoting collaboration and expanding the potential use cases for the Lightning Flow Scanner.

## Development

### Development Flow

1) Authorize Your Salesforce Org:
Authorize your Salesforce org to set up a connection between your local development environment and the Salesforce org:

```sh
sfdx force:auth:web:login -d -a <YourOrgAlias>
```

2) Install dependency

Install the Lightning Flow Scanner Component required for core functionality:

```sh
sfdx force:package:install --package 04tDn0000011NpvIAE --wait 10 -u <YourOrgAlias>
```

3) Push Source to Your Org:
Push the latest source to your og:

```sh
sfdx force:source:push
```

3) Pull Source from Your Org:
```sh
sfdx force:source:pull
```
