import re

with open('src/components/NotificationsCenter.tsx', 'r') as f:
    text = f.read()

n_old = """    const unsubscribe = onSnapshot(q, (snapshot) => {
      const readGlobal = JSON.parse(localStorage.getItem(`read_notifs_${user.uid}`) || '[]');
      
      const notifsData = snapshot.docs.map(doc => {
        const data = doc.data();
        let isRead = data.read;
        if (data.userId === 'all') {
          isRead = readGlobal.includes(doc.id);
        }
        return {
          id: doc.id,
          ...data,
          read: isRead
        };
      }) as Notification[];
      
      setNotifications(notifsData);
    });"""

n_new = """    const unsubscribe = onSnapshot(q, (snapshot) => {
      const readGlobal = JSON.parse(localStorage.getItem(`read_notifs_${user.uid}`) || '[]');
      
      const notifsData = snapshot.docs.map(doc => {
        const data = doc.data();
        let isRead = data.read;
        if (data.userId === 'all') {
          isRead = readGlobal.includes(doc.id);
        }
        return {
          id: doc.id,
          ...data,
          read: isRead
        };
      }) as Notification[];
      
      setNotifications(notifsData);
    }, (error: any) => {
      console.error("Notifications error", error);
    });"""

text = text.replace(n_old, n_new)

with open('src/components/NotificationsCenter.tsx', 'w') as f:
    f.write(text)
