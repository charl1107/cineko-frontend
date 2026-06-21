const fs = require('fs')
const path = require('path')

const locales = ['de', 'es', 'fr', 'hi', 'it', 'ko', 'zh']

const base = `{
    "projectName": "Cineko",
    "authors": "Cineko",
    "coreName": "Cineko",
    "notFound": {
        "title": "404 - Mmmhh... Lost you are",
        "description": "Found, this page is not",
        "quoteAuthor": "- Yoda",
        "backLink": "Back Home"
    },
    "all": "All",
    "results": "Results",
    "pages": "Pages",
    "slogan": "Your Open Cinema",
    "loading": "Loading",
    "welcome": "Welcome to {{projectName}}!",
    "opensource": {
        "git-url": "https://github.com/cineko-org/app",
        "git-platform": "GitHub"
    },
    "movie": {
        "singular": "Movie",
        "plural": "Movies"
    },
    "tvShow": {
        "singular": "TV Show",
        "plural": "TV Shows"
    },
    "home": "Home",
    "settings": "Settings",
    "disclaimer": {
        "label": "Disclaimer",
        "value": "{{projectName}} is a free and open-source streaming application. It does not host any content itself. {{projectName}} is intended for educational and personal use only."
    }
}`

for (const locale of locales) {
    const filePath = path.join(__dirname, '..', 'public', 'locales', locale, 'common.json')
    if (fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, base, 'utf8')
        console.log(`Updated ${locale}/common.json`)
    }
}

console.log('Done rebranding locales')
