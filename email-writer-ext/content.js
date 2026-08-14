console.log("Email Writer Extension - Content Script loaded");

function creatingAIButton() {
    const button = document.createElement('div');

    button.className = 'T-I J-J5-Ji aoO v7 T-I-atl L3  ai-reply-button';

    button.style.marginRight = '8px';
    button.innerText = '✨ AI Reply';

    button.setAttribute('role','button');
    button.setAttribute('data-tooltip','Generate AI Reply');

        // Create Tone dropdown
    const toneSelect = document.createElement('select');

    toneSelect.className = 'ai-tone-select';

    toneSelect.innerHTML = `
        <option value="professional">Professional</option>
        <option value="friendly">Friendly</option>
        <option value="casual">Casual</option>
        <option value="formal">Formal</option>
    `;


    return {
        button,
        toneSelect
    };
}


function getEmailContent() {

    const selectors = [
        '.h7',
        '.a3s.aiL',
        // '[role="presentation"]',
        '.gmail_quote'
    ];

    for(const selector of selectors){
        const content = document.querySelector(selector);
        if(content) {
            return content.innerText.trim();
        }
    }
    return '';
}

function findComposeToolbar() {
    const selectors = [
        '.btC',
        '.aDh',
        '[role="toolbar"]',
        '.gU.Up'
    ];

    for(const selector of selectors){
        const toolbar = document.querySelector(selector);
        if(toolbar) {
            return toolbar;
        }
    }
    return null;
}


function injectButton() {
    const existingButton = document.querySelector('.ai-reply-button');
    if(existingButton){
        // existingButton.remove();
        return;
    }

    const toolbar = findComposeToolbar();
    if(!toolbar){
        console.log("Toolbar not found");
        return;
    }
    console.log("Toolbar found, creating AI button");

    const { button, toneSelect } = creatingAIButton();
    // button.classList.add('ai-reply-button');

    button.addEventListener('click', async() => {
        try {
            button.innerText = '⏳ Generating...';
            button.disabled = true;
            button.classList.add('ai-loading');

            const emailContent = getEmailContent();
            if (!emailContent) {
                alert('Could not find the email content.');
                return;
            }
            // Get selected tone
            const selectedTone =
                toneSelect.value;

            console.log('Selected tone:',selectedTone);

            const response = await fetch('http://localhost:8080/api/email/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    emailContent: emailContent,
                    tone: selectedTone
                })
            });

            if (!response.ok) {

                if (response.status === 429) {
                    throw new Error('AI service rate limit reached. Please wait a few seconds and try again.');
    }
                throw new Error(`AI Request Failed: ${response.status}`);
            }

            const generatedReply = await response.text();
            console.log("Generated reply: ", generatedReply);

            const composeBox = document.querySelector('[role="textbox"][g_editable="true"]');

            if(composeBox){
                composeBox.focus();
                document.execCommand('insertText', false, generatedReply);
            }else{
                throw new Error('Gmail compose box not found.');
            }
        } catch (error) {
            console.error('Email Writer Assistant:', error);
            alert(error.message);
        }finally{
            button.innerHTML = '✨ AI Reply';
            button.disabled = false;
            button.classList.remove('ai-loading');
        }
    });
    // Add tone selector first
    toolbar.insertBefore(toneSelect, toolbar.firstChild);
    toolbar.insertBefore(button, toolbar.firstChild);
}

const observer = new MutationObserver((mutations) => {
    for(const mutation of mutations){
        const addedNodes = Array.from(mutation.addedNodes);
        const hasComposeElements = addedNodes.some(node => 
            node.nodeType === Node.ELEMENT_NODE &&
            (node.matches('.aDh, .btC, [role="dialog"]') || 
            node.querySelector('.aDh, .btC, [role="dialog"]'))
        );
   
        if(hasComposeElements){
            console.log("Compose Window Detected");
            setTimeout(injectButton, 500);
        }
    }
});

observer.observe(document.body,{
    childList: true,
    subtree: true
})