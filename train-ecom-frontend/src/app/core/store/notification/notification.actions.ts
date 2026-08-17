import { createAction, props } from '@ngrx/store';
import { NotificationItem, NotificationResponse } from '../../models/notification.model';


export const loadNotifications = createAction(
    '[Notification API] Load Notifications',
    props<{ pageNumber: number, pageSize: number }>()
);

export const loadNotificationSuccess = createAction(
    '[Notification API] Load Notification Success',
    props<{ response: NotificationResponse }>()
);

export const loadNotificationFailure = createAction(
    '[Notification API] Load Notification Failure',
    props<{ error: string }>()
);


// for marking notification as read
export const markAsRead = createAction(
    '[Notification API] Mark As Read',
    props<{Id: string }>()
)

export const markAsReadSuccess = createAction(
    '[Notification API] Mark As Read Success',
    props<{ Id: string }>()
)

export const markAsReadFailure = createAction(
    '[Notification API] Mark As Read Failure',
    props<{ error: string }>()
)



// SSE real time action for notification
export const connectSSE = createAction(
    '[Notification API] Connect SSE'
)

export const disconnectSSE = createAction(
    '[Notification API] Disconnect SSE'
)


export const receiveRealTimeNotification = createAction(
    '[Notification API] Receive Real Time Notification',
    props<{ notification: NotificationItem }>()
)