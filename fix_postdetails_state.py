import re

with open('src/pages/PostDetails.tsx', 'r') as f:
    text = f.read()

# Replace imports
text = text.replace("import { useParams, Link } from 'react-router-dom';", "import { useParams, Link, useLocation } from 'react-router-dom';")

# Replace hook usage
text = text.replace("  const { id } = useParams<{ id: string }>();\n  const [post, setPost] = useState<Game | null>(null);", 
                    "  const { id } = useParams<{ id: string }>();\n  const location = useLocation();\n  const [post, setPost] = useState<Game | null>((location.state?.game as Game) || null);")

# Replace fetchPost logic
old_fetch = """  useEffect(() => {
    async function fetchPost() {
      if (!id) return;
      try {
        const docRef = doc(db, 'games', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setPost({ id: docSnap.id, ...docSnap.data() } as Game);
          
          // Only increment if we haven't in this session
          const sessionKey = `viewed_${id}`;
          if (!sessionStorage.getItem(sessionKey)) {
            try {
              await updateDoc(docRef, { views: increment(1) });
              sessionStorage.setItem(sessionKey, 'true');
            } catch (e) {
              console.error("Error incrementing views:", e);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching post:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchPost();
  }, [id]);"""

new_fetch = """  useEffect(() => {
    async function fetchPost() {
      if (!id) return;
      
      // If we already have the post from state, we can stop loading immediately
      // But we still might want to increment views and fetch latest data silently
      if (post) {
        setLoading(false);
      }
      
      try {
        const docRef = doc(db, 'games', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setPost({ id: docSnap.id, ...docSnap.data() } as Game);
          
          // Only increment if we haven't in this session
          const sessionKey = `viewed_${id}`;
          if (!sessionStorage.getItem(sessionKey)) {
            try {
              await updateDoc(docRef, { views: increment(1) });
              sessionStorage.setItem(sessionKey, 'true');
            } catch (e) {
              console.error("Error incrementing views:", e);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching post:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchPost();
  }, [id]);"""

text = text.replace(old_fetch, new_fetch)

with open('src/pages/PostDetails.tsx', 'w') as f:
    f.write(text)
