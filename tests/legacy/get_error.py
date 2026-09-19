import re
with open('audit/s09_failed_details_dom.html', 'r') as f:
    content = f.read()
    print("DOM length:", len(content))
    if 'vite-error-overlay' in content:
        print("Vite error overlay found!")
    else:
        print("No overlay found. Let's look for Draft.")
        if "Draft" in content:
            print("Draft found in DOM!")
        else:
            print("Draft NOT found in DOM. Searching for QT-...")
            for line in content.split('\n'):
                if "QT-" in line:
                    print("Found line with QT-:", line.strip()[:100])
