export interface NotificationItem {
    id: string;
    title: string;
    message: string;
    isRead: boolean
    type: 'success' | 'error' | 'info' | 'warning';
    timestamp: Date;
}