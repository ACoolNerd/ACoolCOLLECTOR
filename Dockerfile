FROM python:3.11-slim-bookworm

WORKDIR /app

# Install system dependencies needed for Playwright and PostgreSQL
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Install Playwright chromium browser and its system dependencies
RUN playwright install chromium
RUN playwright install-deps

COPY main.py scraper.py ./

EXPOSE 8000


CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
