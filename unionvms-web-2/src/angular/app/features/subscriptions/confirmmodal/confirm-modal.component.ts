import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-confirm-modal-content',
  template: `
    <div class="modal-header">
      <h4 class="modal-title">Please confirm</h4>
      <button type="button" class="close" aria-label="Close" (click)="activeModal.dismiss('CANCEL')">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>
    <div class="modal-body">
      <p> Are you sure you wish to delete {{name}}?</p>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-outline-dark" (click)="activeModal.close('CANCEL')">Cancel</button>
      <button type="button" class="btn btn-primary" (click)="activeModal.close('OK')">OK</button>
    </div>
  `
})
export class ConfirmModalComponent {
  @Input() name;

  constructor(public activeModal: NgbActiveModal) {}
}
