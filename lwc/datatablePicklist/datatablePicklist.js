import { LightningElement, api } from 'lwc';

export default class DatatablePicklist extends LightningElement {
    @api label;
    @api placeholder;
    @api options;
    @api value;
    @api context;
    @api iseditable;

    isPickListVisibillity = false;

    handleChange(event) {
        this.value = event.detail.value;
        this.isPickListVisibillity = false;
        this.dispatchEvent(new CustomEvent('picklistchanged', {
            composed: true,
            bubbles: true,
            cancelable: true,
            detail: {
                data: { context: this.context, value: this.value }
            }
        }));
    }

    onEdit() {
        this.isPickListVisibillity = true;
    }

    onBlur() {
        this.isPickListVisibillity = false;
    }

}