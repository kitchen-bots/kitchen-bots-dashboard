import os
import re

directories = ['src/dashboard/pages/admin', 'src/dashboard/pages/customer']

for d in directories:
    for filename in os.listdir(d):
        if not filename.endswith('.tsx'): continue
        filepath = os.path.join(d, filename)
        with open(filepath, 'r') as f:
            content = f.read()
        
        changed = False

        # Find the badly matched pattern: `\?\.data \|\| \(Array\.isArray\(([^?]+)\) \? \1 : \[\]\)`
        # Actually my script inserted `?.data || ...`
        # Let's just find `\?\.data \|\| \(Array\.isArray\(([^?]+)\) \? \1 : \[\]\)`
        
        # In the file, we have: `updatedProduct : p?.data || (Array.isArray(products.map(p => p.id === id ? updatedProduct : p) ? products.map(p => p.id === id ? updatedProduct : p : [])));`
        # We can just manually revert these specific files.
        # Actually, let's write a simpler regex:
        # `\?\.data \|\| \(Array\.isArray\((.*?)\) \? \1 : \[\]\)` -> this might not work because of nested parens.
        pass

