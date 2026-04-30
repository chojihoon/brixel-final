
import json
import os

locales_dir = r"C:\2026_work\01_makecode_ext\extensions\_locales"
en_file_path = os.path.join(locales_dir, "en", "brixel-ext-strings.json")

def load_json(path):
    try:
        with open(path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        return {}
    except json.JSONDecodeError:
        print(f"Error decoding JSON from {path}")
        return {}

def save_json(path, data):
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=4, ensure_ascii=False)


def main():
    if not os.path.exists(en_file_path):
        print(f"English file not found at {en_file_path}")
        return

    en_data = load_json(en_file_path)
    if not en_data:
        print("English data is empty or invalid.")
        return

    print(f"Loaded {len(en_data)} keys from English file.")

    for lang in os.listdir(locales_dir):
        if lang == "en":
            continue
        
        lang_dir = os.path.join(locales_dir, lang)
        if not os.path.isdir(lang_dir):
            continue

        target_file_path = os.path.join(lang_dir, "brixel-ext-strings.json")
        target_data = load_json(target_file_path)
        
        original_count = len(target_data)
        updated = False
        
        for key, value in en_data.items():
            if key not in target_data:
                target_data[key] = value
                updated = True
        
        if updated:
            save_json(target_file_path, target_data)
            print(f"Updated {lang}: {original_count} -> {len(target_data)} keys.")
        else:
            print(f"No updates needed for {lang}.")

if __name__ == "__main__":
    main()
