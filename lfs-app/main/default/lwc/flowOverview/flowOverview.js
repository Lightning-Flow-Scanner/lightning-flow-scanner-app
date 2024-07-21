import { LightningElement, api, track } from "lwc";
import { NavigationMixin } from "lightning/navigation";

export default class FlowOverview extends NavigationMixin(LightningElement) {
  @api
  get records() {
    return this._data;
  }
  set records(value) {
    this._data = [...value];
  }

  @track _data = [];

  @track err;

  sortedBy = "lastModifiedDate";
  sortedDirection = "desc";
  columns = [
    { label: "Label", fieldName: "masterLabel", type: "text", sortable: true },
    {
      label: "API Name",
      fieldName: "developerNameUrl",
      type: "url",
      typeAttributes: {
        label: { fieldName: "developerName" },
        target: "_blank"
      },
      sortable: true
    },
    { label: "Process Type", fieldName: "processType", type: "text" },
    { label: "Description", fieldName: "flowDescription", type: "text" },
    {
      label: "Is Active",
      fieldName: "isActive",
      type: "boolean",
      cellAttributes: { alignment: "center" },
      sortable: true
    },
    {
      label: "Last Modified Date",
      fieldName: "lastModifiedDate",
      type: "date",
      typeAttributes: {
        year: "numeric",
        month: "long",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit"
      },
      sortable: true
    },
    {
      label: "Last Modified By",
      fieldName: "lastModifiedBy",
      type: "text",
      sortable: true
    },
    {
      type: "button",
      typeAttributes: {
        label: "Scan",
        name: "scan",
        variant: "base",
        title: "Click to Scan Flow"
      }
    }
  ];

  reverseDirection = {
    asc: "desc",
    desc: "asc"
  };

  sortRecords(event) {
    const fieldName = event.detail.fieldName;
    const sortDirection = this.reverseDirection[this.sortedDirection] ?? "desc";
    const sortData = () => {
      let parseData = JSON.parse(JSON.stringify(this.records));
      const keyValue = (a) => {
        return a[fieldName];
      };
      const isReverse = sortDirection === "asc" ? 1 : -1;
      parseData.sort((x, y) => {
        x = keyValue(x) ? keyValue(x) : "";
        y = keyValue(y) ? keyValue(y) : "";
        return isReverse * ((x > y) - (y > x));
      });
      return parseData;
    };
    this._data = [...sortData()];
    this.sortedBy = fieldName;
    this.sortedDirection = sortDirection;
  }

  handleRowAction(event) {
    const actionName = event.detail.action.name;
    const row = event.detail.row;
    if (actionName === "scan") {
      const scanEvent = new CustomEvent("scanflow", {
        detail: {
          flowId: row.id
        }
      });
      this.dispatchEvent(scanEvent);
    }
  }
}
