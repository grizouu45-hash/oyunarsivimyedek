import re

with open('src/components/NotificationsCenter.tsx', 'r') as f:
    text = f.read()

old_notifs_snap = """      setNotifications(notifsData);
    });"""

new_notifs_snap = """      setNotifications(notifsData);
    }, (error: any) => console.error("Notifications error", error));"""

text = text.replace(old_notifs_snap, new_notifs_snap)

with open('src/components/NotificationsCenter.tsx', 'w') as f:
    f.write(text)
