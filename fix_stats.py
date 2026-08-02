import re

with open('src/pages/StatisticsPanel.tsx', 'r') as f:
    text = f.read()

# Update fetchStats
fetch_stats_old = re.compile(r'async\s+function\s+fetchStats\(\)\s*\{.*?\}\s*\}\s*return\s*\(', re.DOTALL)

fetch_stats_new = """async function fetchStats() {
    try {
      // Total Users
      try {
        const usersRef = collection(db, 'users');
        const usersSnapshot = await getDocs(usersRef);
        setTotalUsers(usersSnapshot.size || 0);
      } catch(e) { console.error('Users error', e) }

      // Total Comments (efficiently, if possible, or just as it was before by querying all comments directly)
      try {
        const commentsRef = collection(db, 'comments');
        const commentsSnapshot = await getDocs(commentsRef);
        setTotalComments(commentsSnapshot.size || 0);
      } catch(e) { console.error('Comments error', e) }

      setLoading(false);
    } catch (error: any) {
      if (error?.code !== "resource-exhausted") { console.error("Error fetching stats:", error); }
      setLoading(false);
    }
  }

  return ("""

text = fetch_stats_old.sub(fetch_stats_new, text)

# Remove the Users List modal UI and state
text = re.sub(r'const\s+\[usersList,\s*setUsersList\].*?;', '', text)
text = re.sub(r'const\s+\[showUsersModal,\s*setShowUsersModal\].*?;', '', text)
text = re.sub(r'<AdminUsersModal\s+isOpen=\{showUsersModal\}.*?/>', '', text, flags=re.DOTALL)
text = re.sub(r'import\s+\{\s*AdminUsersModal\s*\}\s*from\s*\'../components/AdminUsersModal\';', '', text)

with open('src/pages/StatisticsPanel.tsx', 'w') as f:
    f.write(text)
