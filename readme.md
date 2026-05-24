# 🎓 Автоматический генератор студенческих работ

> **Конвейерная генерация курсовых и рефератов с помощью n8n + Ollama + Qwen 2.5**

---

## Что это и зачем?

**Student AI Writer** — это автоматизированный пайплайн для генерации полноценных студенческих работ (15-30 страниц).

### 🔥 Почему это круто:

| Ручной подход | Наш конвейер |
|--------------|--------------|
| ❌ Кидаешь в ChatGPT по абзацу → ждёшь → копируешь | ✅ **Один клик** → вся работа готова за 10-25 минут |
| ❌ Нейросеть "забывает" контекст, повторяется | ✅ **Каждая глава генерируется изолированно** с чётким ТЗ |
| ❌  Объем "как получится" | ✅ Контролируемый объем через targetWords в конфиге

### Запуск

```bash
# Клонируй репозиторий
git clone https://github.com/OlegRozh/Student-assistant.git
cd student-ai-writer
```

### Создай файл .env по примеру ниже
```env
PROJECT_ROOT=.
#Database
POSTGRES_USER=n8n_user
POSTGRES_PASSWORD=SuperSecretPassword123
POSTGRES_DB=n8n_database

#n8n Security
N8N_ENCRYPTION_KEY=my-super-secret-encryption-key-change-it-later
N8N_BASIC_AUTH_ACTIVE=true
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=admin_password_change_it

#AI Provider Settings
# Варианты: "ollama" или "deepseek"
AI_PROVIDER=ollama

# Ollama настройки (локальная модель)
OLLAMA_BASE_URL=http://ollama:11434
OLLAMA_MODEL=qwen2.5:7b

# DeepSeek настройки (API)
DEEPSEEK_API_KEY=твой_ключ_если_используешь_api
DEEPSEEK_BASE_URL=https://api.deepseek.com
```

### Для дальнейшего запуска требуется запустить docker

```bash
docker-compose up -d

# Проверь логи
docker-compose logs -f n8n
docker-compose logs -f ollama
```
## Далее можно установить нейросеть локально, или подключить через API.
### Установка ИИ модели локально через Ollama

```bash
# Зайди в контейнер ollama
docker-compose exec ollama ollama pull qwen2.5:7b

# Проверь установку:
docker-compose exec ollama ollama list
# Должно быть: qwen2.5:7b    <id>    4.7GB
```
## Импорт workflow в n8n

Открой http://localhost:5678

**Нажми Settings ⚙️ → Import from File**

**Выбери файл `workflow.json` из корня репозитория**

**Проверь в HTTP-нодах URL: http://ollama:11434/api/chat (внутри Docker)**

**Активируй воркфлоу (переключатель ↗)**

## Генерация работы

**Открой `index.html` в браузере**

**Введи тему, например: "Контейнеризация приложений с помощью Docker"**

**Нажми "Сгенерировать работу"**

**Подожди 10-25 минут (зависит от GPU и объема)**

**Скачай .html-файл и открой в Word**

## 📏 Как изменить количество страниц

Открой в n8n ноду `02_GenerateOutline` и отредактируй `targetWords`:

```javascript
// ~20 страниц (стандартная курсовая)
introduction: { targetWords: 1200 },
chapter1: { targetWords: 4500 },  // Теория — самая объемная
chapter2: { targetWords: 4000 },  // Практика
chapter3: { targetWords: 4000 },  // Анализ
conclusion: { targetWords: 1200 }
// Итого: ~15 000 слов ≈ 30 страниц
```

### Использование DeepSeek API вместо локальной модели

Если у тебя слабый ПК или нужна более мощная модель:

1. В файле `.env` измени:
```env
AI_PROVIDER=deepseek
DEEPSEEK_API_KEY=sk-твой-реальный-ключ
```
### В каждой HTTP-ноде в n8n замени:

**URL:** {{ $env.DEEPSEEK_BASE_URL }}/v1/chat/completions

**Headers:** добавь Authorization: Bearer {{ $env.DEEPSEEK_API_KEY }}

**JSON Body:** замени model на "deepseek-chat"

Перезапусти воркфлоу.

- **Плюсы API: не грузит твой ПК, быстрее, качественнее**

- **Минусы: платно (~$0.14/1K токенов), нужен интернет**


## Где смотреть логи:

**n8n: UI → вкладка Executions → клик по запуску → детали каждой ноды**

**Ollama: docker-compose logs -f ollama**

**PostgreSQL: docker-compose logs -f postgres**

**Браузер: F12 → Console / Network (ошибки фронтенда)**


## 🚨 Частые проблемы

| Проблема | Решение |
|----------|---------|
| ❌ `Connection refused` к Ollama | Проверь: `docker-compose exec ollama ollama list` — модель должна быть в списке |
| ❌ Таймаут при генерации | Увеличь **Timeout** в настройках ноды до `240000` (4 мин) |
| ❌ В тексте остались `###` или `<|im_start|>` | Обнови код в ноде `08_ValidatorAndAutoFix` на последнюю версию |
| ❌ n8n не видит переменные из .env | Перезапусти: `docker-compose up -d --force-recreate n8n` |

## Нашел баг или есть идея?

- **Форкни репозиторий**

- **Создай ветку feature/твоя-идея**

- **Внеси изменения**

- **Открой Pull Request**

- **Или просто напиши в Issues**