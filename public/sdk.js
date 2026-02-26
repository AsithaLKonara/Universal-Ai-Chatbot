(function () {
    const script = document.currentScript;
    const apiKey = script.getAttribute('data-api-key');
    const projectId = script.getAttribute('data-project-id');

    const container = document.createElement('div');
    container.id = 'omnichat-container';
    document.body.appendChild(container);

    const iframe = document.createElement('iframe');
    iframe.src = `https://universal-ai-chatbot.vercel.app/embed?projectId=${projectId}`;
    iframe.style.position = 'fixed';
    iframe.style.bottom = '20px';
    iframe.style.right = '20px';
    iframe.style.width = '350px';
    iframe.style.height = '500px';
    iframe.style.border = 'none';
    iframe.style.zIndex = '9999';
    container.appendChild(iframe);
})();
