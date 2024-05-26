import { LightningElement, track, api } from "lwc";
import { loadScript } from "lightning/platformResourceLoader";
import lfs from "@salesforce/resourceUrl/LFS";

export default class LightningFlowScanner extends LightningElement {
  @api name;
  @api metadata;

  @track numberOfRules;
  @track flow;
  @track scanResult;
  @track error;

  scriptLoaded = false;

  connectedCallback() {
    loadScript(this, lfs)
      .then(() => {
        try {
          // UMD namespace is lightningflowscanner all lowercase
          // eslint-disable-next-line no-undef
          const lightningFlowScanner = lightningflowscanner;
          this.numberOfRules = lightningFlowScanner.getRules().length;
          this.flow = new lightningFlowScanner.Flow(this.name, this.metadata);

          let uri = "/services/data/v60.0/tooling/sobjects/Flow/" + this.id;
          let parsedFlow = { uri, flow: this.flow };

          try {
            let scanResults = lightningFlowScanner.scan([parsedFlow]);
            this.scanResult = scanResults[0];

            // Add unique keys to each rule result and its details
            this.scanResult.ruleResults = this.scanResult.ruleResults.map(
              (ruleResult, ruleIndex) => {
                return {
                  ...ruleResult,
                  id: `rule-${ruleIndex}`,
                  details: ruleResult.details.map((detail, detailIndex) => {
                    return {
                      ...detail,
                      id: `rule-${ruleIndex}-detail-${detailIndex}`
                    };
                  })
                };
              }
            );
          } catch (e) {
            this.error = e;
            console.error("Error scanning flow:", e);
          }
        } catch (error) {
          this.error = error;
          console.error("Error parsing flow:", error);
        }
      })
      .catch((error) => {
        this.error = error;
        console.error("Error loading JavaScript file:", error);
      });
  }

  get hasScanResults() {
    return this.scanResult?.ruleResults?.length > 0 ?? false;
  }

  get flowName() {
    return this.flow?.name ?? "";
  }
}
