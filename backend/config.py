# This file contains all the configuration variables for the application.
from urllib.parse import urlparse
import os
# A secret key is needed for session management and signing tokens.
# Make this a long, random string in a real application.SECRET_KEY = os.environ.get('SECRET_KEY')

# --- 2. DATABASE URL STRING ---# Reads the key ONLY from the environment. No fallback.
SECRET_KEY = os.environ.get('SECRET_KEY')

# --- 2. DATABASE URL STRING ---
# Reads the URL ONLY from the environment. No fallback.
DATABASE_URL = os.environ.get('DATABASE_URL')