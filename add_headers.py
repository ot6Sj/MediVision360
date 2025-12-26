import os

# Configuration
ROOT_DIR = "."
COPYRIGHT_HOLDER = "ot6_j"
YEAR = "2025"
EXCLUDE_DIRS = {"node_modules", ".venv", ".git", "__pycache__", "dist", "build", "coverage"}
EXTENSIONS = {
    ".py": ("#", f"Copyright (c) {YEAR} {COPYRIGHT_HOLDER}. All Rights Reserved."),
    ".js": ("/*", f"Copyright (c) {YEAR} {COPYRIGHT_HOLDER}. All Rights Reserved.", "*/"),
    ".jsx": ("/*", f"Copyright (c) {YEAR} {COPYRIGHT_HOLDER}. All Rights Reserved.", "*/"),
    ".ts": ("/*", f"Copyright (c) {YEAR} {COPYRIGHT_HOLDER}. All Rights Reserved.", "*/"),
    ".tsx": ("/*", f"Copyright (c) {YEAR} {COPYRIGHT_HOLDER}. All Rights Reserved.", "*/"),
    ".css": ("/*", f"Copyright (c) {YEAR} {COPYRIGHT_HOLDER}. All Rights Reserved.", "*/"),
    ".html": ("<!--", f"Copyright (c) {YEAR} {COPYRIGHT_HOLDER}. All Rights Reserved.", "-->"),
}

def get_header(ext):
    style = EXTENSIONS.get(ext)
    if not style:
        return None
    
    if style[0] == "#":
        return f"{style[0]} {style[1]}\n"
    else:
        return f"{style[0]} {style[1]} {style[2]}\n"

def process_file(filepath):
    _, ext = os.path.splitext(filepath)
    header = get_header(ext)
    if not header:
        return

    try:
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()
        
        # Check if header already exists (simple check)
        if "Copyright (c)" in content and COPYRIGHT_HOLDER in content:
            print(f"Skipping (already licensed): {filepath}")
            return
            
        print(f"Adding header to: {filepath}")
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(header + "\n" + content)
            
    except Exception as e:
        print(f"Error processing {filepath}: {e}")

def main():
    for root, dirs, files in os.walk(ROOT_DIR):
        # Filter directories inplace
        dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]
        
        for file in files:
            process_file(os.path.join(root, file))

if __name__ == "__main__":
    main()
