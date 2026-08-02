import re

with open('src/pages/AdminPanel.tsx', 'r') as f:
    text = f.read()

# Games
old_games_snap = """        setGames(gamesData);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching games:", error);
        // If permission denied, they are probably not admin
        if (error.message.includes("permission")) {
          console.error(
            "You do not have permission to access the admin panel.",
          );
          auth.signOut();
        }
        setLoading(false);
      },
    );"""
new_games_snap = """        setGames(gamesData);
        setLoading(false);
      },
      (error: any) => {
        console.error("Error fetching games:", error);
        // If permission denied, they are probably not admin
        if (error.message && error.message.includes("permission")) {
          console.error(
            "You do not have permission to access the admin panel.",
          );
          auth.signOut();
        }
        setLoading(false);
      },
    );"""
text = text.replace(old_games_snap, new_games_snap)

# Questions
q_old = """    const unsubscribe2 = onSnapshot(q2, (snapshot) => {
      const qsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as WeeklyQuestion[];
      setWeeklyQuestions(qsData);
    });"""
q_new = """    const unsubscribe2 = onSnapshot(q2, (snapshot) => {
      const qsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as WeeklyQuestion[];
      setWeeklyQuestions(qsData);
    }, (error: any) => console.error("Admin Questions error", error));"""
text = text.replace(q_old, q_new)

# Giveaways
gw_old = """    const unsubscribe3 = onSnapshot(q3, (snapshot) => {
      const gData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Giveaway[];
      setGiveaways(gData);
    });"""
gw_new = """    const unsubscribe3 = onSnapshot(q3, (snapshot) => {
      const gData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Giveaway[];
      setGiveaways(gData);
    }, (error: any) => console.error("Admin Giveaways error", error));"""
text = text.replace(gw_old, gw_new)

with open('src/pages/AdminPanel.tsx', 'w') as f:
    f.write(text)
