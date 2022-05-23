import { LightningElement, track, wire } from 'lwc';

import { refreshApex } from '@salesforce/apex';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { updateRecord } from 'lightning/uiRecordApi';
import { deleteRecord } from 'lightning/uiRecordApi';

import getAccounts from '@salesforce/apex/AccountController.getAccounts';

const COLUMNS = [
    { label: 'Name', fieldName: 'Name', type: 'text', editable: {fieldName: 'controlEditName'}  },
    { label: 'Rating', fieldName: 'Rating', type: 'picklist', typeAttributes: {
        placeholder: 'Pick Value',
            options: [
            { label: '-None-', value: '' },
            { label: 'Hot', value: 'Hot' },
            { label: 'Warm', value: 'Warm' },
            { label: 'Cold', value: 'Cold' },
        ],
        value: { fieldName: 'Rating' }, 
        context: { fieldName: 'Id' }, 
        iseditable: { fieldName: 'controlEditRating' }}
    },
    { label: 'Actions', type: "button-icon", fixedWidth: 100, typeAttributes: {
        name: 'Delete',
        iconName: 'utility:delete',
        class: 'slds-m-left_xx-small',
        variant: 'bare',
        title: 'Delete',
} },
];

export default class Accounts extends LightningElement {

    @track draftValues = [];
    lastSavedData = [];

    columns = COLUMNS;

    wiredAccountResult;

    @track accounts;
    @track error;

    @wire(getAccounts)
    imperativeWiring(result) {
        this.wiredAccountResult = result;
        const { data, error } = result;
        if(data) {
            this.accounts = data.map(function(item) {
                return {
                    'Id' : item.Id,
                    'Name' : item.Name,
                    'Rating' : item.Rating,
                    'controlEditName' : true,
                    'controlEditRating' : true,
                }
            });
            this.lastSavedData = this.accounts;
        }
    }

    updateDataValues(updateItem) {
        let copyData = [... this.accounts];
        copyData.forEach(item => {
            if (item.Id === updateItem.Id) {
                for (let field in updateItem) {
                    item[field] = updateItem[field];
                }
            }
        });
        this.accounts = [...copyData];
    }

    updateDraftValues(updateItem) {
        let draftValueChanged = false;
        let copyDraftValues = [...this.draftValues];
        copyDraftValues.forEach(item => {
            if (item.Id === updateItem.Id) {
                for (let field in updateItem) {
                    item[field] = updateItem[field];
                }
                draftValueChanged = true;
            }
        });

        this.blockEditable();

        if (draftValueChanged) {
            this.draftValues = [...copyDraftValues];
        } else {
            this.draftValues = [...copyDraftValues, updateItem];
        }
    }

    blockEditable() {
        this.accounts = this.accounts.map(function(item) {
            return {
                ...item,
                'controlEditName' : false,
                'controlEditRating' : false,
            }
        });
    }

    unblockEditable() {
        this.accounts = this.accounts.map(function(item) {
            return {
                ...item,
                'controlEditName' : true,
                'controlEditRating' : true,
            }
        });
    }

    picklistChanged(event) {
        event.stopPropagation();
        let dataRecieved = event.detail.data;
        let updatedItem = { Id: dataRecieved.context, Rating: dataRecieved.value };
        this.updateDraftValues(updatedItem);
        this.updateDataValues(updatedItem);
    }

    handleCellChange(event) {
        this.updateDraftValues(event.detail.draftValues[0]);
    }

    handleSave(event) {
        const fields = {}; 
        fields['Id'] = event.detail.draftValues[0].Id;
        fields['Name'] = event.detail.draftValues[0].Name;
        fields['Rating'] = event.detail.draftValues[0].Rating;

        const recordInput = {fields};

        updateRecord(recordInput)
        .then(() => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: 'Account updated',
                    variant: 'success'
                })
            );
            return refreshApex(this.wiredAccountResult).then(() => {
                this.draftValues = [];
            });
        }).catch(error => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error updating or reloading record',
                    message: error.body.message,
                    variant: 'error'
                })
            );
        });
        this.lastSavedData = this.accounts;
        this.unblockEditable();
    }

    handleCancel(event) {
        this.accounts = this.lastSavedData;
        this.draftValues = [];
        this.unblockEditable();
    }

    handleRowAction(event) {
        if (event.detail.action.name === 'Delete') {
            const recordId = event.detail.row.Id;
            deleteRecord(recordId)
            .then(() => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Account deleted',
                        variant: 'success'
                    })
                );
                refreshApex(this.wiredAccountResult);
            })
            .catch(error => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error deleting record',
                        message: error.body.message,
                        variant: 'error'
                    })
                );
            })    
        }
    }

}