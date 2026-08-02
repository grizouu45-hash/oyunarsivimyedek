import re
with open('src/pages/StoreFront.tsx', 'r') as f:
    text = f.read()

old_err = """      },
      (error) => {
        console.error("Error fetching games:", error);
        setLoading(false);
      },
    );"""
new_err = """      },
      (error: any) => {
        console.error("Error fetching games:", error);
        if (error.code === 'resource-exhausted') {
          setQuotaError(true);
        }
        setLoading(false);
      },
    );"""
text = text.replace(old_err, new_err)

with open('src/pages/StoreFront.tsx', 'w') as f:
    f.write(text)
