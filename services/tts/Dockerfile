FROM python:3.11-slim

RUN apt-get update && apt-get install -y --no-install-recommends curl \
 && rm -rf /var/lib/apt/lists/*
RUN pip install --no-cache-dir piper-tts

# Voices the browser cannot supply on most desktops (MIT-licensed, rhasspy/piper-voices).
ARG VOICE_BASE=https://huggingface.co/rhasspy/piper-voices/resolve/main
RUN mkdir -p /voices \
 && curl -fsSL "$VOICE_BASE/ur/ur_PK/fasih/medium/ur_PK-fasih-medium.onnx"      -o /voices/ur.onnx \
 && curl -fsSL "$VOICE_BASE/ur/ur_PK/fasih/medium/ur_PK-fasih-medium.onnx.json" -o /voices/ur.onnx.json \
 && curl -fsSL "$VOICE_BASE/fa/fa_IR/amir/medium/fa_IR-amir-medium.onnx"        -o /voices/fa.onnx \
 && curl -fsSL "$VOICE_BASE/fa/fa_IR/amir/medium/fa_IR-amir-medium.onnx.json"   -o /voices/fa.onnx.json

ENV VOICE_DIR=/voices PORT=5062
EXPOSE 5062
COPY app.py /app/app.py
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD curl -fsS http://127.0.0.1:5062/health || exit 1
CMD ["python", "/app/app.py"]
