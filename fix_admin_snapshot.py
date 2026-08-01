import re

with open('src/pages/AdminPanel.tsx', 'r') as f:
    text = f.read()

# Games
g_old = """        setGames(gamesData);
        setFilteredGames(gamesData);
        setLoading(false);
      }
    );"""
g_new = """        setGames(gamesData);
        setFilteredGames(gamesData);
        setLoading(false);
      },
      (error: any) => {
        console.error("Admin Games error", error);
        setLoading(false);
      }
    );"""
text = text.replace(g_old, g_new)

# Questions
q_old = """    const unsubscribe2 = onSnapshot(q2, (snapshot) => {
      const questionsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as WeeklyQuestion[];
      setWeeklyQuestions(questionsData);
    });"""
q_new = """    const unsubscribe2 = onSnapshot(q2, (snapshot) => {
      const questionsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as WeeklyQuestion[];
      setWeeklyQuestions(questionsData);
    }, (error: any) => console.error("Admin Questions error", error));"""
text = text.replace(q_old, q_new)

# Giveaways
gw_old = """    const unsubscribe3 = onSnapshot(q3, (snapshot) => {
      const giveawaysData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Giveaway[];
      setGiveaways(giveawaysData);
    });"""
gw_new = """    const unsubscribe3 = onSnapshot(q3, (snapshot) => {
      const giveawaysData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Giveaway[];
      setGiveaways(giveawaysData);
    }, (error: any) => console.error("Admin Giveaways error", error));"""
text = text.replace(gw_old, gw_new)

# Products
p_old = """    const unsubscribe4 = onSnapshot(q4, (snapshot) => {
      const pData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Product[];
      setProducts(pData);
    });"""
p_new = """    const unsubscribe4 = onSnapshot(q4, (snapshot) => {
      const pData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Product[];
      setProducts(pData);
    }, (error: any) => console.error("Admin Products error", error));"""
text = text.replace(p_old, p_new)

with open('src/pages/AdminPanel.tsx', 'w') as f:
    f.write(text)
