const CONFIG = {
    webhookUrl: 'http://localhost:5678/webhook-test/student-ai'
};

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('generateBtn').addEventListener('click', generateWork);

    document.getElementById('topicInput').addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            generateWork();
        }
    });
});

async function generateWork() {
    const topicInput = document.getElementById('topicInput');
    const generateBtn = document.getElementById('generateBtn');
    const loadingDiv = document.getElementById('loading');
    const errorSection = document.getElementById('errorSection');
    const successSection = document.getElementById('successSection');
    const downloadLink = document.getElementById('downloadLink');
    const fileInfo = document.getElementById('fileInfo');
    const errorMessage = document.getElementById('errorMessage');

    const topic = topicInput.value.trim();

    errorSection.classList.remove('show');
    successSection.classList.remove('show');

    if (!topic) {
        errorMessage.textContent = 'Пожалуйста, введите тему работы';
        errorSection.classList.add('show');
        return;
    }

    loadingDiv.classList.add('show');
    generateBtn.disabled = true;

    try {
        const response = await fetch(CONFIG.webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ topic: topic })
        });

        if (!response.ok) throw new Error('Ошибка сервера: ' + response.status);

        // Получаем JSON
        const data = await response.json();

        // Создаем файл из того HTML, который прислал n8n
        const blob = new Blob([data.result], { type: 'text/html' });
        const fileName = topic ? `Student_Work_${topic.replace(/[^a-zA-Z0-9а-яА-ЯёЁ\s]/g, '_')}.html` : 'student_work.html';

        const url = window.URL.createObjectURL(blob);
        downloadLink.href = url;
        downloadLink.download = fileName;

        fileInfo.innerHTML = `
            <strong>Имя файла:</strong> ${fileName}<br>
            <strong>Размер:</strong> ${(blob.size / 1024).toFixed(2)} KB
        `;
        successSection.classList.add('show');

    } catch (error) {
        errorMessage.textContent = `Ошибка: ${error.message}`;
        errorSection.classList.add('show');
    } finally {
        loadingDiv.classList.remove('show');
        generateBtn.disabled = false;
    }
}