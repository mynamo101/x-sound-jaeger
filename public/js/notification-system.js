// Notification System
class NotificationSystem {
    constructor() {
        this.container = null;
        this.notifications = new Map();
        this.init();
    }

    init() {
        this.container = document.createElement('div');
        this.container.className = 'notification-container';
        document.body.appendChild(this.container);
        console.log('Notification system initialized');
    }

    show(message, type = 'info', options = {}) {
        const {
            title = null,
            duration = 5000,
            persistent = false
        } = options;

        const notificationId = Date.now().toString() + Math.random();
        console.log('Creating notification with id:', notificationId);

        const notification = this.createNotification(message, type, title, notificationId);
        this.container.appendChild(notification);
        this.notifications.set(notificationId, notification);

        // 動畫顯示
        requestAnimationFrame(() => {
            notification.classList.add('show');
        });

        // 自動關閉
        if (!persistent && duration > 0) {
            setTimeout(() => {
                this.remove(notificationId);
            }, duration);
        }

        return notificationId;
    }

    createNotification(message, type, title, id) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.dataset.id = id;

        const content = document.createElement('div');
        content.className = 'notification-content';

        const icon = document.createElement('div');
        icon.className = `notification-icon ${type}`;

        const textContainer = document.createElement('div');
        textContainer.className = 'notification-text';

        if (title) {
            const titleElement = document.createElement('div');
            titleElement.className = 'notification-title';
            titleElement.textContent = title;
            textContainer.appendChild(titleElement);
        }

        const messageElement = document.createElement('div');
        messageElement.className = 'notification-message';
        messageElement.textContent = message;
        textContainer.appendChild(messageElement);

        const closeButton = document.createElement('button');
        closeButton.className = 'notification-close';
        closeButton.innerHTML = '×';
        closeButton.setAttribute('aria-label', 'Close notification');
        
        // 關閉按鈕事件
        closeButton.addEventListener('click', (e) => {
            console.log('Close button clicked for notification:', id);
            e.preventDefault();
            e.stopPropagation();
            this.remove(id);
        });

        content.appendChild(icon);
        content.appendChild(textContainer);
        notification.appendChild(content);
        notification.appendChild(closeButton);

        return notification;
    }

    remove(id) {
        console.log('Removing notification with id:', id);
        const notification = this.notifications.get(id);
        if (notification && notification.parentNode) {
            notification.classList.add('hide');
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
                this.notifications.delete(id);
            }, 300);
        }
    }

    success(message, options = {}) {
        return this.show(message, 'success', options);
    }

    error(message, options = {}) {
        return this.show(message, 'error', options);
    }

    warning(message, options = {}) {
        return this.show(message, 'warning', options);
    }

    info(message, options = {}) {
        return this.show(message, 'info', options);
    }

    loading(message, options = {}) {
        const loadingOptions = {
            ...options,
            persistent: true
        };
        const id = this.show(message, 'loading', loadingOptions);
        
        // Add loading spinner
        const notification = this.notifications.get(id);
        if (notification) {
            const icon = notification.querySelector('.notification-icon');
            icon.innerHTML = '<div class="notification-loading"></div>';
        }
        
        return id;
    }

    clear() {
        this.notifications.forEach((_, id) => this.remove(id));
    }

    // Replace one notification with another smoothly
    replace(fromId, message, type = 'info', options = {}) {
        const oldNotification = this.notifications.get(fromId);
        if (!oldNotification) {
            return this.show(message, type, options);
        }

        const {
            title = null,
            duration = 5000,
            persistent = false,
            id = null
        } = options;

        const notificationId = id || Date.now().toString();
        
        // Create new notification
        const newNotification = this.createNotification(message, type, title, notificationId);
        
        // Insert new notification before old one
        this.container.insertBefore(newNotification, oldNotification);
        this.notifications.set(notificationId, newNotification);

        // Animate new notification in
        requestAnimationFrame(() => {
            newNotification.classList.add('show');
        });

        // Remove old notification after a slight delay
        setTimeout(() => {
            this.remove(fromId);
        }, 200);

        // Auto remove new notification after duration (unless persistent)
        if (!persistent && duration > 0) {
            setTimeout(() => {
                this.remove(notificationId);
            }, duration);
        }

        return notificationId;
    }
}

// Create global instance
window.notify = new NotificationSystem();

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NotificationSystem;
}
