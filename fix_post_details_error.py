import re

with open('src/pages/PostDetails.tsx', 'r') as f:
    text = f.read()

# Add quota error state
text = text.replace("const [loading, setLoading] = useState(true);",
                    "const [loading, setLoading] = useState(true);\n  const [quotaError, setQuotaError] = useState(false);")

# Update fetch error handling
old_err = """      } catch (error) {
        console.error("Error fetching post:", error);
      } finally {"""
new_err = """      } catch (error: any) {
        console.error("Error fetching post:", error);
        if (error.code === 'resource-exhausted') {
          setQuotaError(true);
        }
      } finally {"""
text = text.replace(old_err, new_err)

# Update return if not found
old_return = """  if (!post || post.status === 'trash') {
    return (
      <div className="min-h-screen bg-[#0F051D] transition-colors duration-300 relative text-white">
        <title>Bulunamadı | OYUNARŞİVİM.com</title>
        <Header />
        <div className="flex flex-col items-center justify-center h-[60vh] text-center px-4">
          <h2 className="text-2xl font-bold text-white mb-4">Haber Bulunamadı</h2>
          <Link to="/" className="text-indigo-400 hover:underline inline-flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Ana Sayfaya Dön
          </Link>
        </div>
      </div>
    );
  }"""
new_return = """  if (quotaError) {
    return (
      <div className="min-h-screen bg-[#0F051D] transition-colors duration-300 relative text-white">
        <title>Sistem Yoğunluğu | OYUNARŞİVİM.com</title>
        <Header />
        <div className="flex flex-col items-center justify-center h-[60vh] text-center px-4">
          <h2 className="text-2xl font-bold text-white mb-4">Sistem Şu An Yoğun</h2>
          <p className="text-white/60 mb-8 max-w-md">Veritabanı kotası aşıldığı için şu an içeriğe ulaşılamıyor. Lütfen daha sonra tekrar deneyin.</p>
          <Link to="/" className="text-indigo-400 hover:underline inline-flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Ana Sayfaya Dön
          </Link>
        </div>
      </div>
    );
  }

  if (!post || post.status === 'trash') {
    return (
      <div className="min-h-screen bg-[#0F051D] transition-colors duration-300 relative text-white">
        <title>Bulunamadı | OYUNARŞİVİM.com</title>
        <Header />
        <div className="flex flex-col items-center justify-center h-[60vh] text-center px-4">
          <h2 className="text-2xl font-bold text-white mb-4">Haber Bulunamadı</h2>
          <Link to="/" className="text-indigo-400 hover:underline inline-flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Ana Sayfaya Dön
          </Link>
        </div>
      </div>
    );
  }"""
text = text.replace(old_return, new_return)

with open('src/pages/PostDetails.tsx', 'w') as f:
    f.write(text)
