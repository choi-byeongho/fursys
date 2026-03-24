import os
import re

replacements = {
    r'text-gray-400': 'text-gray-600',
    r'text-gray-300': 'text-gray-700',
    r'text-gray-200': 'text-gray-800',
    r'bg-gray-50': 'bg-white',
    r'border-gray-200': 'border-gray-300',
    r'border-gray-300': 'border-gray-400',
}

def replace_in_file(filepath):
    if "Viewer3D.tsx" in filepath or "ForceVector.tsx" in filepath:
        return
        
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    new_content = content
    for old, new in replacements.items():
        new_content = re.sub(old, new, new_content)
        
    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {filepath}")

for root, dirs, files in os.walk('src/components'):
    for file in files:
        if file.endswith('.tsx'):
            replace_in_file(os.path.join(root, file))
