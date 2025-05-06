
document.getElementById('translateButton').addEventListener('click', function () {
    const inputText = document.getElementById('inputText').value;
    const translationDiv = document.getElementById('translationResult');
    translationDiv.innerHTML = translateToDraconic(inputText);
});

function translateToDraconic(text) {
    const lowerCaseText = text.toLowerCase();
    let outputHTML = '';
    let isOpeningQuote = true;

    let i = 0;
    while (i < lowerCaseText.length) {
        const char = lowerCaseText[i];

        // Handle line breaks
        if (char === '\n') {
            outputHTML += '<br>';
            i++;
            continue;
        }

        // Handle commands like ~shake
        if (char === '~') {
            const rest = lowerCaseText.slice(i);
            const match = rest.match(/^~[a-z-]+/);

            if (match && runeMap[match[0]]) {
                outputHTML += `<img src="${runeMap[match[0]]}" alt="${match[0]} icon"> `;
                i += match[0].length;
                continue;
            }
        }

        // Handle quotes
        if (char === '"') {
            outputHTML += isOpeningQuote
                ? `<img src="${runeMap['<quote>']}" alt="opening quote"> `
                : `<img src="${runeMap['</quote>']}" alt="closing quote"> `;
            isOpeningQuote = !isOpeningQuote;
        } else if (runeMap[char]) {
            outputHTML += `<img src="${runeMap[char]}" alt="${char} rune"> `;
        } else {
            outputHTML += char; // Keep unknown characters as-is
        }

        i++;
    }

    return outputHTML;
}
