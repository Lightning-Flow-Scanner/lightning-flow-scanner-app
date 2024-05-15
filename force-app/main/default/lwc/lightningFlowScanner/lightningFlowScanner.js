// myComponent.js
import { LightningElement } from 'lwc';
import { loadScript } from 'lightning/platformResourceLoader';
import lfsURL from '@salesforce/resourceUrl/lfs';

export default class MyComponent extends LightningElement {
    result;

    connectedCallback() {
        try {
            // Load Lightning Flow Scanner from the static resource URL
            Promise.all([
                loadScript(this, lfsURL)
            ])
            .then(async () => {
                // Now you can use Lightning Flow Scanner Functions from the imported Static Resource
                const { getRules, parse, scan, fix } = window.lfs;

                // Use the Core Module functions
                const rules = await getRules(); // Example usage of getRules
                // const parsedFlows = parse(['uri1', 'uri2']); // Example usage of parse
                // const scannedFlows = scan(parsedFlows, { /* ruleOptions */ }); // Example usage of scan
                // const fixedResults = fix(scannedFlows); // Example usage of fix

                // Assign the result to a component property
                console.log(rules[0]);
                this.result = rules;
            })
            .catch(error => {
                console.error('Error loading JavaScript file:', error);
            });
        } catch(error) {
            console.error('Error loading JavaScript file:', error);
        }
    }
}