import re

with open('src/components/Comments.tsx', 'r') as f:
    text = f.read()

c_old = """    const unsubscribe = onSnapshot(q, (snapshot) => {
      const commentsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Comment[];
      setComments(commentsData);
    });"""

c_new = """    const unsubscribe = onSnapshot(q, (snapshot) => {
      const commentsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Comment[];
      setComments(commentsData);
    }, (error: any) => {
      console.error("Comments error", error);
    });"""

text = text.replace(c_old, c_new)

with open('src/components/Comments.tsx', 'w') as f:
    f.write(text)
