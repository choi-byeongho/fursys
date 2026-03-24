import os
import re

replacements = {
    # backgrounds
    r'bg-gray-900/90': 'bg-white/90',
    r'bg-gray-900/80': 'bg-white/80',
    r'bg-gray-900': 'bg-white',
    r'bg-gray-950': 'bg-[#f5f5f7]',
    r'bg-gray-800(?![/0-9])': 'bg-gray-50',
    r'bg-blue-950/20': 'bg-blue-50/50',
    r'bg-gray-800/40': 'bg-gray-50',
    r'bg-gray-800/60': 'bg-gray-50',
    r'bg-gray-800/50': 'bg-gray-50',
    r'bg-gray-700': 'bg-gray-100',
    
    # borders
    r'border-gray-700': 'border-gray-200',
    r'border-gray-600': 'border-gray-300',
    r'border-gray-500': 'border-gray-400',
    r'border-blue-800': 'border-blue-200',
    
    # text colors
    r'text-gray-100': 'text-gray-900',
    r'text-gray-200': 'text-gray-800',
    r'text-gray-300': 'text-gray-700',
    r'text-gray-400': 'text-gray-500',
    r'text-gray-500': 'text-gray-400',
}

def replace_in_file(filepath):
    if "Viewer3D.tsx" in filepath:
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
