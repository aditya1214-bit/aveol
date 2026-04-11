import os

dir_path = r'c:\Users\bachh\Desktop\Aveol'

for filename in os.listdir(dir_path):
    if filename.endswith('.html'):
        filepath = os.path.join(dir_path, filename)
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        new_content = content.replace('Join Waitlist', 'Book a Free Call')
        new_content = new_content.replace('Join the Waitlist', 'Book a Free Call')
        new_content = new_content.replace('Reserve My Spot →', 'Request Early Access →')
        new_content = new_content.replace('Reserve Early Access →', 'Book a Free Consultation →')
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {filename}")
