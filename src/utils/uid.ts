// DHIS2 UID :: /^[a-zA-Z][a-zA-Z0-9]{10}$/
const asciiLetters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
const asciiNumbers = "0123456789";
const asciiLettersAndNumbers = asciiLetters + asciiNumbers;
const uidSize = 10;

function randomWithMax(max: number) {
    return Math.floor(Math.random() * max);
}

export function generateUid(): string {
    // First char should be a letter
    let randomChars = asciiLetters.charAt(randomWithMax(asciiLetters.length));

    for (let i = 1; i <= uidSize; i += 1) {
        randomChars += asciiLettersAndNumbers.charAt(randomWithMax(asciiLettersAndNumbers.length));
    }

    return randomChars;
}
