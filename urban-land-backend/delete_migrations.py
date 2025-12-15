import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

for root, dirs, files in os.walk(BASE_DIR):
    if "migrations" in dirs:
        mig_path = os.path.join(root, "migrations")
        for f in os.listdir(mig_path):
            if f != "__init__.py" and f.endswith(".py"):
                print("Deleting:", os.path.join(mig_path, f))
                os.remove(os.path.join(mig_path, f))

print("All migrations deleted except __init__.py")
