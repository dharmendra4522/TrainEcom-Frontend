import { FormControl } from '@angular/forms';
import { Component, EventEmitter, inject, Output } from '@angular/core';
import { TableAction, TableActionEvent, TableColumn } from '../../../../core/models/table.model';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { Element } from '../../../../core/models/request-approve.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-request-approval',
  templateUrl: './request-approval.component.html',
  styleUrl: './request-approval.component.css'
})
export class RequestApprovalComponent {
  private dialog = inject(MatDialog);
  private router = inject(Router);
  searchControl = new FormControl('');
  private pageSize: number = 10;
  private currentPage: number = 1;
  requestCount: number = 0;
  hasMoreData = true;

  @Output() loadMore = new EventEmitter();
  @Output() requestCountChange = new EventEmitter<number>();
  // table dummy data
  tableData: Element[] = [
    {
      id: 1,
      requestBy: 'John Doe',
      requestDate: '2026-10-01',
      requestType: ['Account Creation', 'Document Upload'],
      requestMesage: 'Please create an account for me.'
    },
    {
      id: 2,
      requestBy: 'Jane Smith',
      requestDate: '2026-10-02',
      requestType: ['Password Reset'],
      requestMesage: 'I need to reset my password.'
    },
    {
      id: 3,
      requestBy: 'Michael Johnson',
      requestDate: '2026-10-03',
      requestType: ['Account Deletion'],
      requestMesage: 'I want to permanently delete my account.'
    },
    {
      id: 4,
      requestBy: 'Emily Davis',
      requestDate: '2026-10-04',
      requestType: ['Profile Update'],
      requestMesage: 'Please update my contact information.'
    },
    {
      id: 5,
      requestBy: 'Robert Brown',
      requestDate: '2026-10-05',
      requestType: ['Vendor Registration'],
      requestMesage: 'Requesting verification for vendor registration.'
    },
    {
      id: 6,
      requestBy: 'Sophia Wilson',
      requestDate: '2026-10-06',
      requestType: ['Order Issue'],
      requestMesage: 'My recent order was delivered with missing items.'
    },
    {
      id: 7,
      requestBy: 'Daniel Taylor',
      requestDate: '2026-10-07',
      requestType: ['Business Verification'],
      requestMesage: 'Kindly verify my submitted business documents.'
    },
    {
      id: 8,
      requestBy: 'Olivia Martinez',
      requestDate: '2026-10-08',
      requestType: ['Address Change'],
      requestMesage: 'Please update my registered address.'
    },
    {
      id: 9,
      requestBy: 'James Anderson',
      requestDate: '2026-10-09',
      requestType: ['Account Suspension'],
      requestMesage: 'I would like to temporarily suspend my account.'
    },
    {
      id: 10,
      requestBy: 'Isabella Thomas',
      requestDate: '2026-10-10',
      requestType: ['Payment Query'],
      requestMesage: 'Need clarification regarding a recent payment.'
    },
    {
      id: 11,
      requestBy: 'William Jackson',
      requestDate: '2026-10-11',
      requestType: ['Product Approval'],
      requestMesage: 'Requesting approval for newly added products.'
    },
    {
      id: 12,
      requestBy: 'Mia Harris',
      requestDate: '2026-10-12',
      requestType: ['Technical Support'],
      requestMesage: 'Unable to access vendor dashboard after login.'
    }
  ];

  filterData: Element[] = [];


  // table column data
  columns: TableColumn[] = [
    {
      key: 'id',
      label: 'ID',
      type: 'text',
      sortable: true,
      clickable: true
    },
    {
      key: 'requestBy',
      label: 'Request By',
      type: 'text',
      truncate: true,
      sortable: true
    },
    {
      key: 'requestDate',
      label: 'Request Date',
      type: 'date',
      truncate: true,
      sortable: true
    },
    {
      key: 'requestType',
      label: 'Request Type',
      type: 'text',
      truncate: true,
      sortable: true
    },
    {
      key: 'requestMesage',
      label: 'Request Message',
      type: 'text',
      truncate: true,
      sortable: true
    }
  ];

  // actions of table
  actions: TableAction[] = [
    {
      actionKey: 'approve',
      icon: 'check_circle',
      color: 'secondary',
      tooltip: 'Approve'

    },
    {
      actionKey: 'reject',
      icon: 'cancel',
      color: 'warn',
      tooltip: 'Reject'
    },
    {
      actionKey: 'view-profile',
      icon: 'visibility',
      color: 'primary',
      tooltip: 'View Profile'
    }
  ];

  ngOnInit(): void {
    this.initalLoad();
    this.setUpSearchControl();
  }

  private initalLoad(): void {
    this.requestCount = this.tableData.length;
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
    const searchTerm = val.trim().toLowerCase();
    this.filterData = this.tableData.filter(item =>
      item.id.toString().includes(searchTerm) ||
      item.requestBy.toLowerCase().includes(searchTerm) ||
      item.requestDate.toLowerCase().includes(searchTerm) ||
      item.requestMesage.toLowerCase().includes(searchTerm) ||
      item.requestType.some(type => type.toLowerCase().includes(searchTerm))
    );
  }

  onActionClick(event: TableActionEvent): void {
    console.log(event);
    switch (event.action) {
      case 'approve':
        this.onApprove();
        break;
      case 'reject':
        this.onReject();
        break;
      case 'view-profile':
        this.onViewProfile();
        break;
      default:
        console.warn('unknow action');
        break;
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
        this.tableData.length
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

  private onViewProfile(): void {
    this.router.navigate(['/admin/users/manage/23']);
    this.dialog.closeAll();
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
