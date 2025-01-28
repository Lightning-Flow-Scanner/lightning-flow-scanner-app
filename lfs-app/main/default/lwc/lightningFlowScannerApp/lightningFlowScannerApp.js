import { LightningElement, api, track } from "lwc";
import { loadScript } from "lightning/platformResourceLoader";
import OrgCheckStaticRessource from "@salesforce/resourceUrl/OrgCheck_SR";

export default class lightningFlowScannerApp extends LightningElement {
  @api accessToken;
  @api userId;
  @track activeTab = 1;
  @track records = [];
  @track err;
  @track selectedFlowRecord = null;
  @track flowMetadata = null;
  @track flowName;
  conn;

  isLoading = false;

  get isTab1Active() {
    return this.activeTab === 1;
  }

  get isTab2Active() {
    return this.activeTab === 2;
  }

  get FlowsClass() {
    return this.activeTab === 1 ? "active" : "";
  }

  get AnalysisClass() {
    return this.activeTab === 2 ? "active" : "";
  }

  async connectedCallback() {
    try {
      await loadScript(this, OrgCheckStaticRessource + "/js/jsforce.js");
      let SF_API_VERSION = "61.0";
      // jsforce namespace is defined on static resource
      // eslint-disable-next-line no-undef
      this.conn = new jsforce.Connection({
        accessToken: this.accessToken,
        version: SF_API_VERSION,
        maxRequest: "10000"
      });

      const res = await this.conn.tooling.query(
        `SELECT Id, DeveloperName, Description, LatestVersion.Description, ActiveVersion.Description, LatestVersion.LastModifiedDate, ActiveVersion.LastModifiedDate, LatestVersion.LastModifiedBy.Name, ActiveVersion.LastModifiedBy.Name, ActiveVersionId, LatestVersionId, ActiveVersion.Status, ActiveVersion.MasterLabel, ActiveVersion.ProcessType, LatestVersion.Status, LatestVersion.MasterLabel, LatestVersion.ProcessType FROM FlowDefinition`
      );
      if (res && res.records) {
        this.records = res.records.map((record) => {
          const deriveFromVersion = record.ActiveVersionId
            ? "ActiveVersion"
            : "LatestVersion";
          const result = {
            id: record.Id,
            developerName: record?.DeveloperName,
            developerNameUrl: `/${record.Id}`,
            isActive: !!record.ActiveVersionId,
            masterLabel: record[deriveFromVersion]?.MasterLabel,
            processType: record[deriveFromVersion]?.ProcessType,
            flowDescription: record[deriveFromVersion]?.Description,
            lastModifiedDate: record[deriveFromVersion]?.LastModifiedDate,
            lastModifiedBy: record[deriveFromVersion]?.LastModifiedBy?.Name,
            versionId: record.ActiveVersionId
              ? record?.ActiveVersionId
              : record?.LatestVersionId
          };
          return result;
        });

        if (this.records.length > 0) {
          this.selectedFlowRecord = this.records[0];
          await this.loadFlowMetadata(this.selectedFlowRecord);
        }
      }
    } catch (error) {
      this.err = error.message;
      console.error(error.message);
    }
  }

  async loadFlowMetadata(record) {
    try {
      const ensureLatest = await this.conn.tooling.query(
        `SELECT Id, ActiveVersionId, LatestVersionId FROM FlowDefinition WHERE Id = '${record.id}' LIMIT 1`
      );
      const latestRecord = ensureLatest.records.pop();
      let id = latestRecord.LatestVersionId ?? latestRecord.ActiveVersionId;
      const metadataRes = await this.conn.tooling.query(
        `SELECT Id, Fullname, Metadata, Description, ApiVersion FROM Flow WHERE Id = '${id}' LIMIT 1`
      );
      let fullname = metadataRes.records[0].FullName;
      let fmd = metadataRes.records[0].Metadata;
      if (metadataRes && metadataRes.records) {
        this.flowName = fullname;
        this.flowMetadata = fmd;
      }
    } catch (error) {
      this.err = error.message;
      console.error(error.message);
    } finally {
      this.isLoading = false;
    }
  }

  handleTabClick(event) {
    this.activeTab = parseInt(event.currentTarget.dataset.tab, 10);
  }

  async handleScanFlow(event) {
    this.isLoading = true;
    const flowId = event.detail.flowId;
    const record = this.records.find((rec) => rec.id === flowId);
    if (record) {
      await this.loadFlowMetadata(record, this.conn);
      this.selectedFlowRecord = record;
    }
    this.activeTab = 2;
  }
}
