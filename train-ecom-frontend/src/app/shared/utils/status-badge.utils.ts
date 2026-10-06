import { normalizeOrderStatus, normalizePaymentStatus } from "../../core/utils/role.utils";

export function getOrderStatusClass(status: string | number): string {
    const statusStr = normalizeOrderStatus(status)?.toLowerCase() || '';
    switch (statusStr) {
      case 'active':
        return 'bg-primary-subtle text-primary border border-primary-subtle';
      case 'shipped':
        return 'bg-warning-subtle text-warning border border-warning-subtle'; 
      case 'delivered':
        return 'bg-success-subtle text-success border border-success-subtle';
      case 'cancelled':
        return 'bg-danger-subtle text-danger border border-danger-subtle';
      default:
        return 'bg-secondary-subtle text-secondary border border-secondary-subtle';
    }
}

export function getPaymentStatusClass(status: string | number): string {
    const normalizeStatus = normalizePaymentStatus(status)?.toLowerCase() || '';
    switch (normalizeStatus) {
      case 'success':
      case 'paid':
        return 'bg-success-subtle text-success border border-success-subtle';
      case 'failed':
        return 'bg-danger-subtle text-danger border border-danger-subtle';
      case 'refunded':
        return 'bg-info-subtle text-info border border-info-subtle';
      case 'pending':
      default:
        return 'bg-warning-subtle text-warning border border-warning-subtle';
    }
}