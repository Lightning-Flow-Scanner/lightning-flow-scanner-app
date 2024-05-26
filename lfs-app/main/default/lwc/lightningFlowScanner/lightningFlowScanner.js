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
  scriptLoaded = false;
  scanned = false;

  lightningFlowScanner;

  connectedCallback() {
    loadScript(this, lfs)
      .then(() => {
        try {
          // UMD namespace is lightningflowscanner all lowercase
          // eslint-disable-next-line no-undef
          this.lightningFlowScanner = lightningflowscanner;
          this.scriptLoaded = true;
          this.scan();
        } catch (error) {
          this.error = error;
          this.scriptLoaded = false;
          console.error("Error parsing flow:", error);
        }
      })
      .catch((error) => {
        this.scriptLoaded = false;
        this.error = error;
        console.error("Error loading JavaScript file:", error);
      });
  }

  @api
  async scan() {
    this.scanned = false;
    try {
      // UMD namespace is lightningflowscanner all lowercase
      this.numberOfRules = this.lightningFlowScanner.getRules().length;
      this.flow = {
        ...new this.lightningFlowScanner.Flow(this.name, this.metadata)
      };

      let uri = "/services/data/v60.0/tooling/sobjects/Flow/" + this.id;
      let parsedFlow = { uri, flow: this.flow };
      try {
        const scanResults = await this.lightningFlowScanner.scan([parsedFlow]);
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
  }

  get hasScanResults() {
    return this.isLoaded && (this.scanResult?.ruleResults?.length > 0 ?? false);
  }

  get flowName() {
    return this.isLoaded && (this.flow?.name ?? "");
  }

  get isLoaded() {
    return this.scriptLoaded && this.scanned;
  }
}
