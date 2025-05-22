"use client";
import { useEffect } from "react";

export default function DisqusThread({ identifier, title, url }: { identifier: string, title: string, url: string }) {
  useEffect(() => {
    if ((window as any).DISQUS) {
      (window as any).DISQUS.reset({
        reload: true,
        config: function () {
          this.page.identifier = identifier;
          this.page.title = title;
          this.page.url = url;
        }
      });
    } else {
      const d = document, s = d.createElement('script');
      s.src = 'https://YOUR_DISQUS_SHORTNAME.disqus.com/embed.js'; // <-- Disqus shortname
      s.setAttribute('data-timestamp', Date.now().toString());
      (d.head || d.body).appendChild(s);
    }
  }, [identifier, title, url]);

  return (
    <div className="mt-12">
      <div id="disqus_thread"></div>
    </div>
  );
} 