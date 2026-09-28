import os
import sys

# Ensure backend root directory is in sys.path so 'app' can be imported by Vercel
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.dirname(current_dir)
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.main import app
