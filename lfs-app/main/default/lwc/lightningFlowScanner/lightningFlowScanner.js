import { LightningElement, track, api } from "lwc";
import { loadScript } from "lightning/platformResourceLoader";
import lfs from "@salesforce/resourceUrl/LFS";

export default class LightningFlowScanner extends LightningElement {
  /**
   * @type {!string}
   */
  @api name;
  /**
   * @type {!(string|unknown)}
   */
  @api metadata;
  /**
   * @type {!string}
   */
  @api id;

  /**
   * @type {!number}
   */
  numberOfRules = 0;
  /**
   * @type {!unknown}
   */
  @track flow = {};
  /**
   * @type unknown
   */
  @track scanResult;
  /**
   * @type {?unknown}
   */
  @track error;

  /**
   * @type {!unknown[]}
   */
  @track ruleTable = [];

  /**
   * @type {boolean}
   */
  scanned = false;

  constructor() {
    super();
    this.addEventListener("lfs-scan", () => {
      this.scanned = false;
      this.scanFlow();
    });
  }

  async connectedCallback() {
    await this.initialize();
    this.dispatchEvent(new CustomEvent("lfs-scan"));
  }

  async initialize() {
    if (this.scriptLoaded) {
      return;
    }
    try {
      await loadScript(this, lfs);
      this.numberOfRules = lightningflowscanner.getRules().length;
      window.lightningflowscanner = lightningflowscanner;
      this.scriptLoaded = true;
    } catch (error) {
      this.scriptLoaded = false;
      this.error = error;
      console.error("Error loading JavaScript file:", error);
    }
  }

  scanFlow() {
    try {
      // UMD namespace is lightningflowscanner all lowercase
      this.flow = new window.lightningflowscanner.Flow(
        this.name,
        this.metadata
      );
      let uri = "/services/data/v61.0/tooling/sobjects/Flow/" + this.id;
      let parsedFlow = { uri, flow: this.flow };
      try {
        const [scanResults] = window.lightningflowscanner.scan([parsedFlow]);
        this.scanResult = { ...scanResults };
        this.generateRuleTable();
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

  generateRuleTable() {
    this.ruleTable = [
      ...this.scanResult.ruleResults
        .filter((rule) => rule.occurs)
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
    ];
  }

  /**
   * @type boolean
   */
  get hasScanResults() {
    return this.isLoaded && (this.scanResult?.ruleResults?.length > 0 || false);
  }

  /**
   * @type boolean
   */
  get noViolations() {
    return (
      this.flowName &&
      (!this.scanResult?.ruleResults?.find((rule) => rule.occurs) || false)
    );
  }

  /**
   * @type string
   */
  get flowName() {
    return this.isLoaded && (this.flow?.name || "");
  }

  get showLoading() {
    return !this.flowName && !this.hasScanResults;
  }

  /**
   * @type boolean
   */
  get isLoaded() {
    return this.scanned;
  }
}
