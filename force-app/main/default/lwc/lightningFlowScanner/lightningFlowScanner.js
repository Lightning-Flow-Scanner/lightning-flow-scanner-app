// myComponent.js
import { LightningElement } from 'lwc';
import { loadScript } from 'lightning/platformResourceLoader';
import lfs from '@salesforce/resourceUrl/lfs';

export default class MyComponent extends LightningElement {
    result;

    connectedCallback() {
        try {
            // Load Lightning Flow Scanner from the static resource URL
            loadScript(this, lfs).then(() => {
                let rules = lightningflowscanner.getRules();
                for (let rule of rules){
                    console.log(rule.name);
                }
                });
                
          
        } catch(error) {
            console.error('Error loading JavaScript file:', error);
        }
    }
}