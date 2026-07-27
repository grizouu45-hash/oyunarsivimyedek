const fs = require('fs');

const path = 'src/pages/AdminPanel.tsx';
let content = fs.readFileSync(path, 'utf8');

const regex = /const imageHandler = useCallback\(\(\) => \{[\s\S]*?\[imageHandler, videoHandler\],\n  \);/m;

const newHandlers = `const imageHandler = useCallback(() => {
    const quill = quillRef.current?.getEditor();
    const range = quill?.getSelection();
    const position = range ? range.index : (quill?.getLength() || 0);

    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.click();
    input.onchange = () => {
      const file = input.files?.[0];
      if (file) {
        if (file.size > 5 * 1024 * 1024) {
          alert("Görsel boyutu çok büyük (Maks 5MB).");
          return;
        }
        setIsUploadingMedia(true);
        
        const reader = new FileReader();
        reader.onloadend = () => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement("canvas");
            let width = img.width;
            let height = img.height;

            const MAX_WIDTH = 1000;
            const MAX_HEIGHT = 1000;

            if (width > height) {
              if (width > MAX_WIDTH) {
                height *= MAX_WIDTH / width;
                width = MAX_WIDTH;
              }
            } else {
              if (height > MAX_HEIGHT) {
                width *= MAX_HEIGHT / height;
                height = MAX_HEIGHT;
              }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d");
            if (ctx) {
              ctx.drawImage(img, 0, 0, width, height);
              const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.6);
              if (quill) {
                quill.insertEmbed(position, "image", compressedDataUrl);
                quill.setSelection(position + 1, 0);
              }
            }
            setIsUploadingMedia(false);
          };
          img.onerror = () => {
             alert("Görsel işlenirken hata oluştu.");
             setIsUploadingMedia(false);
          };
          img.src = reader.result;
        };
        reader.onerror = () => {
          alert("Dosya okunamadı.");
          setIsUploadingMedia(false);
        };
        reader.readAsDataURL(file);
      }
    };
  }, []);

  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [1, 2, 3, false] }],
          ["bold", "italic", "underline", "strike", "blockquote"],
          [{ list: "ordered" }, { list: "bullet" }],
          [{ color: [] }, { background: [] }],
          [{ align: [] }],
          ["link", "image", "video"],
          ["clean"],
        ],
        handlers: {
          image: imageHandler,
        },
      },
    }),
    [imageHandler],
  );`;

if (regex.test(content)) {
    content = content.replace(regex, newHandlers);
    fs.writeFileSync(path, content);
    console.log("Replaced successfully!");
} else {
    console.log("Could not find match.");
}
