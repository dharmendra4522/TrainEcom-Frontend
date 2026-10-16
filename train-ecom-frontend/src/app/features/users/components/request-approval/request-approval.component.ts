import { FormControl } from '@angular/forms';
import { Component, EventEmitter, inject, Output } from '@angular/core';
import { TableAction, TableActionEvent, TableColumn } from '../../../../core/models/table.model';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { debounceTime, distinctUntilChanged } from 'rxjs';

export interface Element extends Record<string, unknown> {
  requestBy: string,
  requestType: string,
  requestMesage: string
}

@Component({
  selector: 'app-request-approval',
  templateUrl: './request-approval.component.html',
  styleUrl: './request-approval.component.css'
})
export class RequestApprovalComponent {
  private dialog = inject(MatDialog);
  searchControl = new FormControl('');
  private pageSize = 10;
  private currentPage = 1;
  hasMoreData = true;

  @Output() loadMore = new EventEmitter();
  // table dummy data
  tableData: Element[] = [
    { requestBy: 'John Doe', requestType: 'Account Creation', requestMesage: 'Please create an account for me.' },
    { requestBy: 'Jane Smith', requestType: 'Password Reset', requestMesage: 'I need to reset my password.' },
    { requestBy: 'Michael Johnson', requestType: 'Account Deletion', requestMesage: 'I want to delete my account.' },
    { requestBy: 'Michael Johnson', requestType: 'Account Deletion', requestMesage: 'I want to delete my account.' },
    { requestBy: 'Michael Johnson', requestType: 'Account Deletion', requestMesage: 'I want to delete my account.' },
    { requestBy: 'Michael Johnson', requestType: 'Account Deletion', requestMesage: 'I want to delete my account.' },
    { requestBy: 'Michael Johnson', requestType: 'Account Deletion', requestMesage: 'I want to delete my account.' },
    { requestBy: 'Michael Johnson', requestType: 'Account Deletion', requestMesage: 'I want to delete my account.' },
    { requestBy: 'Michael Johnson', requestType: 'Account Deletion', requestMesage: 'I want to delete my account.' },
    { requestBy: 'Michael Johnson', requestType: 'Account Deletion', requestMesage: 'I want to delete my account.' },
    { requestBy: 'Michael Johnson', requestType: 'Account Deletion', requestMesage: 'I want to delete my account.' },
    { requestBy: 'Michael Johnson', requestType: 'Account Deletion', requestMesage: 'I want to delete my account.' }
  ];

  filterData: Element[] = [];

  // table column data
  columns: TableColumn[] = [
    {
      key: 'requestBy',
      label: 'Request By',
      type: 'text',
      sortable: true
    },
    {
      key: 'requestType',
      label: 'Request Type',
      type: 'text',
      sortable: true
    },
    {
      key: 'requestMesage',
      label: 'Request Message',
      type: 'text',
      sortable: true
    }
  ];

  // actions of table
  actions: TableAction[] = [
    {
      actionKey: 'approve',
      icon: 'check_circle',
      color: 'primary',
      tooltip: 'Approve'

    },
    {
      actionKey: 'reject',
      icon: 'cancel',
      color: 'warn',
      tooltip: 'Reject'
    }
  ];

  ngOnInit(): void {
    this.initalLoad();
    this.setUpSearchControl();
  }

  private initalLoad(): void {
    this.filterData = this.tableData.slice(0, this.pageSize)
  }

  private setUpSearchControl(): void {
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(value => {
      this.filterApply(value ?? '');
    });
  }

  private filterApply(val: string): void {
    const search = val.trim().toLowerCase();
    this.filterData = this.tableData.filter(item =>
      item.requestBy.toLowerCase().includes(search) ||
      item.requestMesage.toLowerCase().includes(search) ||
      item.requestType.toLowerCase().includes(search)
    );
  }

  onActionClick(event: TableActionEvent): void {
    console.log(event);
    if (event.action == 'approve') {
      this.onApprove();
    } else {
      this.onReject();
    }
  }

  private onApprove(): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Approve Request',
        message: 'Are you sure want to Approve this request?'
      }
    })
    dialogRef.afterClosed().subscribe({
      next: (respose) => {
        console.log('request Accept', respose)
      }
    })
  }

  private onReject(): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Reject Request',
        message: 'Are you sure want to Reject this Request?'
      }
    })
    dialogRef.afterClosed().subscribe({
      next: (response) => {
        console.log('request reject', response)
      }
    })
  }

  closeDialog(): void {
    this.dialog.closeAll();
  }

  loadMoreData(): void {
    const nextPage = this.currentPage + 1;
    const newData = this.tableData.slice(0, nextPage * this.pageSize);
    this.filterData = [...newData];
    this.currentPage = nextPage;
    this.hasMoreData = this.filterData.length < this.tableData.length;
  }

}
