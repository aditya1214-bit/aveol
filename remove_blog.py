import os
import re

dir_path = r'c:\Users\bachh\Desktop\Aveol'

for filename in os.listdir(dir_path):
    if filename.endswith('.html'):
        filepath = os.path.join(dir_path, filename)
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        # Remove lines that contain exactly the blog link (ignoring leading/trailing whitespace in the match)
        # It's better to just remove the tag <a href="blog.html"...>Blog</a>
        # and we need to handle variations like <a href="blog.html" class="active">Blog</a>
        # The user wants to remove links pointing to /blog from Desktop nav, Mobile nav, Footer.
        # But there is also '<a href="blog.html" class="article-back">← Back to Blog</a>' in articles, 
        # the user just said: 
        # Remove the "Blog" link from:
        # - Desktop navigation bar
        # - Mobile navigation menu
        # - Footer links
        # Do not delete the /blog page itself. Just hide all navigation links pointing to /blog.
        
        # Regex to remove <a href="blog.html">Blog</a> and <a href="blog.html" class="btn-ghost">Read the Blog</a>, etc in navs
        # Let's target lines where href="blog.html" is present and remove the link.
        
        # In this project, links are usually on a single line.
        new_content = re.sub(r'\n\s*<a href="blog\.html"[^>]*>.*?</a>', '', content)
        new_content = re.sub(r'<a href="blog\.html"[^>]*>.*?</a>', '', new_content)
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {filename}")
