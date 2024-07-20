[![Lightning Flow Scanner](media/banner.png)](https://github.com/Lightning-Flow-Scanner)

[![Demo](media/lfsapp.gif)](https://github.com/Lightning-Flow-Scanner)

#### Pinpoint deviations from Industry Best Practices in Salesforce Flows and ensure standards of business automation excellence.

## Quickstart

<a href="https://githubsfdeploy.herokuapp.com?owner=Lightning-Flow-Scanner&repo=lightning-flow-scanner-app&ref=master">
  <img alt="Deploy to Salesforce"
       src="https://raw.githubusercontent.com/afawcett/githubsfdeploy/master/deploy.png">
</a>

- **Assign Permissions**: Setup -> Permission Sets -> Find `Lightning Flow Scanner Admin` permission set -> Manage assignments -> Assign to your awesome admin

## Features

- **Flow Overview**: Displays a list of all flows in your Salesforce org and allows users to scan the metadata of a selected flow.
- **Flow Analysis**: Provides detailed metadata analysis of the selected flow.

## Using the Lightning Flow Scanner

1. Open the App Launcher:

- Click on the App Launcher icon in the top-left corner of your Salesforce interface.
- Search for "Flow Scanner" in the App Launcher search bar.
- Click on the "Flow Scanner" app to open it.

2. Scan a Flow:

- To scan a flow, click the "Scan" button next to the flow you want to analyze.

## Project Structure

The project is organized into app directories:

1. force-app: staging area
2. lfs-app: Contains the Lightning Flow Scanner main application.

## Development

### Development Flow

1. Authorize Your Salesforce Org:
   Authorize your Salesforce org to set up a connection between your local development environment and the Salesforce org:

```sh
sf org login web --alias <YourOrgAlias> --set-default
```

2. Push Source to Your Org:

```sh
sf project deploy start --source-dir lfs-app
```
