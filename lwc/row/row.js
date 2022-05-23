import { LightningElement, api } from 'lwc';

export default class Row extends LightningElement {
    @api row;
    draftNameValue;
    draftRatingValue;

    connectedCallback(){
        this.draftNameValue = this.row.Name;
        this.draftRatingValue = this.row.Rating;
    }
    
    ratingOptions = [
        { value: '', label: '-None-' },
        { value: 'Warm', label: 'Warm' },
        { value: 'Cold', label: 'Cold' },
        { value: 'Hot', label: 'Hot' }
    ];
    showModalEditName = false;
    showModalEditRating = false;

    handleEditName() {
        this.showModalEditName = true;
        setInterval(() => {
            this.template.querySelector(`[data-id="${this.row.Id}"]`).focus();
        }, 500);
    }

    handleEditRating() {
        this.showModalEditRating = true;
        setInterval(() => {
            this.template.querySelector(`[data-id="${this.row.Id}"]`).focus();
        }, 500);
    }

    handleDelete() {
        this.dispatchEvent(new CustomEvent('delete', {
                detail: {
                    data: { Id: this.row.Id }
                }
            }));
    }

    handleNameOnBlur() {
        this.showModalEditName = false;
        if (this.draftNameValue == this.row.Name) {
            this.template.querySelector(`[data-th-name-id="${this.row.Id}"]`).classList.remove('slds-is-edited');
        } else {
            this.template.querySelector(`[data-th-name-id="${this.row.Id}"]`).classList.add('slds-is-edited');
            this.dispatchEvent(new CustomEvent('draftvalurchanged', {
                detail: {
                    data: { Id: this.row.Id, Name: this.draftNameValue }
                }
            }));
        }
    }

    handleRatingOnBlur() {
        this.showModalEditRating = false;
        if (this.draftRatingValue == this.row.Rating) {
            this.template.querySelector(`[data-th-rating-id="${this.row.Id}"]`).classList.remove('slds-is-edited');
        } else {
            this.template.querySelector(`[data-th-rating-id="${this.row.Id}"]`).classList.add('slds-is-edited');
            this.dispatchEvent(new CustomEvent('draftvalurchanged', {
                detail: {
                    data: { Id: this.row.Id, Rating: this.draftRatingValue }
                }
            }));
        }
    }

    handleNameOnKeyUp(event) {
        this.draftNameValue = event.target.value;
    }

    handleRatingOnchange(event) {
        this.draftRatingValue = event.target.value;
    }

    @api resetData() {
        this.draftNameValue = this.row.Name;
        this.draftRatingValue = this.row.Rating;
        this.template.querySelector(`[data-th-name-id="${this.row.Id}"]`).classList.remove('slds-is-edited');
        this.template.querySelector(`[data-th-rating-id="${this.row.Id}"]`).classList.remove('slds-is-edited');
    }
}