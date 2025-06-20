// Notification System
class NotificationSystem {
    constructor() {
        this.container = null;
        this.notifications = new Map();
        this.init();
    }

    init() {
        // Create notification container if it doesn't exist
        this.container = document.getElementById('notification-container');
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = 'notification-container';
            this.container.className = 'notification-container';
            document.body.appendChild(this.container);
        }
        console.log('Notification system initialized');
    }show(message, type = 'info', options = {}) {
        const {
            title = null,
            duration = 5000,
            persistent = false,
            id = null
        } = options;

        const notificationId = id || Date.now().toString();
        
        // Remove existing notification with same ID
        if (this.notifications.has(notificationId)) {
            this.remove(notificationId);
        }

        const notification = this.createNotification(message, type, title, notificationId);
        this.container.appendChild(notification);
        this.notifications.set(notificationId, notification);

        // Trigger show animation after a short delay to ensure DOM is ready
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                notification.classList.add('show');
            });
        });

        // Auto remove after duration (unless persistent)
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
        }        const messageElement = document.createElement('div');
        messageElement.className = 'notification-message';
        messageElement.textContent = message;
        textContainer.appendChild(messageElement);

        const closeButton = document.createElement('button');
        closeButton.className = 'notification-close';
        closeButton.textContent = '×';
        closeButton.setAttribute('aria-label', 'Close notification');
        closeButton.addEventListener('click', () => this.remove(id));

        content.appendChild(icon);
        content.appendChild(textContainer);
        notification.appendChild(content);
        notification.appendChild(closeButton);        return notification;
    }

    remove(id) {
        const notification = this.notifications.get(id);
        if (notification && notification.parentNode) {
            // Add hide class for smooth fadeout
            notification.classList.add('hide');
            notification.classList.remove('show');
            
            // Wait for animation to complete (match CSS transition duration)
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
                this.notifications.delete(id);
            }, 300); // Match CSS transition duration
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
    }    info(message, options = {}) {
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
