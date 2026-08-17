import { createReducer, createSelector, on } from '@ngrx/store';
import { NotificationItem } from '../../models/notification.model';
import * as NotificationActions from './notification.actions';


export interface NotificationState {
    items: NotificationItem[];
    unreadCount: number;
    totalRecords: number;
    loading: boolean;
    error: string | null;
}

export const initialState: NotificationState = {
    items: [],
    unreadCount: 0,
    totalRecords: 0,
    loading: false,
    error: null,
}

export const notificationReducer = createReducer(
    initialState,
    on(NotificationActions.loadNotifications, (state) => ({ ...state, loading: true })),
    on(NotificationActions.loadNotificationSuccess, (state, { response }) => ({
        ...state,
        loading: false,
        items: response.items,
        unreadCount: response.unreadCount,
        totalRecords: response.totalRecords
    })),
    
    // Handle Mark As Read
    on(NotificationActions.markAsReadSuccess, (state, { Id }) => ({
        ...state,
        items: state.items.map(item => item.id === Id ? { ...item, isRead: true } : item),
        unreadCount: state.unreadCount > 0 ? state.unreadCount - 1 : 0
    })),

    // Handle Live SSE Update
    on(NotificationActions.receiveRealTimeNotification, (state, { notification }) => ({
        ...state,
        items: [notification, ...state.items],
        unreadCount: state.unreadCount + 1,
        totalRecords: state.totalRecords + 1
    })),

)