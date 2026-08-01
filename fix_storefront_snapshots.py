import re

with open('src/pages/StoreFront.tsx', 'r') as f:
    text = f.read()

# Questions
q_old = """    const unsubscribeQuestions = onSnapshot(qQuestions, (snapshot) => {
      const qsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as WeeklyQuestion[];
      const activeQ = qsData.find((q) => q.active);
      setActiveQuestion(activeQ || null);
    });"""
q_new = """    const unsubscribeQuestions = onSnapshot(qQuestions, (snapshot) => {
      const qsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as WeeklyQuestion[];
      const activeQ = qsData.find((q) => q.active);
      setActiveQuestion(activeQ || null);
    }, (error: any) => {
      console.error("Questions error", error);
    });"""
text = text.replace(q_old, q_new)

# Giveaways
g_old = """    const unsubscribeGiveaways = onSnapshot(qGiveaways, (snapshot) => {
      const gData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Giveaway[];
      const activeG = gData.find((g) => g.active);
      setActiveGiveaway(activeG || null);
    });"""
g_new = """    const unsubscribeGiveaways = onSnapshot(qGiveaways, (snapshot) => {
      const gData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Giveaway[];
      const activeG = gData.find((g) => g.active);
      setActiveGiveaway(activeG || null);
    }, (error: any) => {
      console.error("Giveaways error", error);
    });"""
text = text.replace(g_old, g_new)

# Products
p_old = """    const unsubscribeProducts = onSnapshot(qProducts, (snapshot) => {
      const pData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Product[];
      const activeProducts = pData.filter(p => p.active);
      setProducts(activeProducts);
    });"""
p_new = """    const unsubscribeProducts = onSnapshot(qProducts, (snapshot) => {
      const pData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Product[];
      const activeProducts = pData.filter(p => p.active);
      setProducts(activeProducts);
    }, (error: any) => {
      console.error("Products error", error);
    });"""
text = text.replace(p_old, p_new)

with open('src/pages/StoreFront.tsx', 'w') as f:
    f.write(text)
