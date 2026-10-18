import os

index_path = r'c:\xampp\htdocs\rentalmobil\index.html'
sop_path = r'c:\xampp\htdocs\rentalmobil\sop_section.html'

with open(index_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

with open(sop_path, 'r', encoding='utf-8') as f:
    new_content = f.read()

start_index = -1
end_index = -1

for i, line in enumerate(lines):
    if '<!-- SOP SECTION START -->' in line:
        start_index = i
    if start_index != -1 and '</section>' in line:
        # Check if this </section> belongs to the sop section
        # We can assume it's the first </section> after the start tag matching the indentation level or ID
        if 'id="sop-pelepasan"' in lines[start_index+1]: # Verify it is indeed the SOP section
             # Find the closing tag for this section
             pass
        
        # Simpler approach: Locate the line with <section id="sop-pelepasan" and find the matching closing tag
        pass

# Let's do a more robust search
start_line = 0
end_line = 0

for i, line in enumerate(lines):
    if '<section id="sop-pelepasan"' in line:
        start_line = i
    if start_line > 0 and '</section>' in line and i > start_line:
        # Ensure this is the closing tag for the section. 
        # Since sections are top level in this structure, the first </section> after start should be it.
        end_line = i
        break

if start_line > 0 and end_line > start_line:
    print(f"Found section from line {start_line+1} to {end_line+1}")
    
    # We want to keep the surrounding lines if they are not part of the replacement?
    # Actually, sop_section.html contains the full <section>...</section> block.
    
    new_lines = lines[:start_line] + [new_content + '\n'] + lines[end_line+1:]
    
    with open(index_path, 'w', encoding='utf-8') as f:
        f.writelines(new_lines)
    print("Successfully updated index.html")
else:
    print("Could not find the SOP section in index.html")

