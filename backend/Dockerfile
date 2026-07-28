# Usa a imagem oficial do Python, super leve
FROM python:3.11-slim

# Define o diretório de trabalho dentro do container
WORKDIR /app

# Instala dependências do sistema necessárias para compilar pacotes (como bcrypt, psycopg2)
RUN apt-get update \
    && apt-get install -y gcc libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copia apenas o requirements primeiro, para otimizar o cache do Docker
COPY requirements.txt .

# Instala as dependências Python
RUN pip install --no-cache-dir -r requirements.txt

# Copia o resto do código da aplicação
COPY . .

# A Render define a porta automaticamente através da variável $PORT.
# Se $PORT não estiver definida, usa a 8000.
CMD uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}
