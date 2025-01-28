import { LightningElement, track, api } from "lwc";
import { loadScript } from "lightning/platformResourceLoader";
import lfs from "@salesforce/resourceUrl/LFS";

export default class LightningFlowScanner extends LightningElement {
  @api name;
  @api metadata;

  @track numberOfRules;
  @track flow;
  @track scanResult = [];
  @track error;

  @track ruleTable = [];

  // primitives
  scanned = false;

  connectedCallback() {
    loadScript(this, lfs)
      .then(() => {
        this.scanned = false;
        try {
          // UMD namespace is lightningflowscanner all lowercase
          // eslint-disable-next-line no-undef
          this.numberOfRules = lightningflowscanner.getRules().length;
          this.flow = {
            ...new lightningflowscanner.Flow(this.name, this.metadata) // eslint-disable-line no-undef
          };
          let uri = "/services/data/v61.0/tooling/sobjects/Flow/" + this.id;
          let parsedFlow = { uri, flow: this.flow };
          try {
            // eslint-disable-next-line no-undef
            const scanResults = lightningflowscanner.scan([parsedFlow]);
            this.scanResult = { ...scanResults[0] };
            // Add unique keys to each rule result and its details
            this.ruleTable = [
              ...this.scanResult.ruleResults
                .map((ruleResult, ruleIndex) => {
                  return {
                    ...ruleResult,
                    id: `rule-${ruleIndex}`,
                    details: ruleResult?.details?.map((detail, detailIndex) => {
                      return {
                        ...detail,
                        id: `rule-${ruleIndex}-detail-${detailIndex}`,
                        name: detail.name ?? ""
                      };
                    })
                  };
                })
                .filter((rule) => {
                  return rule.details.length > 0;
                })
            ];
          } catch (e) {
            this.error = e;
            console.error("Error scanning flow:", e);
          }
        } catch (error) {
          this.error = error;
          console.error("Error parsing flow:", error);
        } finally {
          this.scanned = true;
        }
      })
      .catch((error) => {
        this.scriptLoaded = false;
        this.error = error;
        console.error("Error loading JavaScript file:", error);
      });
  }

  get hasScanResults() {
    return this.isLoaded && (this.scanResult?.ruleResults?.length > 0 || false);
  }

  get noViolations() {
    return !this.scanResult?.ruleResults?.find((rule) => rule.occurs);
  }

  get flowName() {
    return this.isLoaded && (this.flow?.name ?? "");
  }

  get isLoaded() {
    return this.scanned;
  }
}
