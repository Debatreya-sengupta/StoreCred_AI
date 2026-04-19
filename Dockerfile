# Use an official lightweight Python image
FROM python:3.12-slim-bookworm

# Set up environment variables
ENV PYTHONUNBUFFERED=1
ENV PORT=7860
# Prevent caching to keep image small
ENV PIP_NO_CACHE_DIR=1

# Create a non-root user (Required by Hugging Face Spaces for security)
RUN useradd -m -u 1000 user

# Set working directory
WORKDIR /app

# Install system dependencies required by OpenCV and GeoPandas
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements file first to leverage Docker cache
COPY --chown=user:user requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy the rest of the backend codebase
COPY --chown=user:user . .

# Switch to the non-root user
USER user

# Expose the port Hugging Face Spaces expects
EXPOSE 7860

# Command to run the FastAPI application
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "7860"]
