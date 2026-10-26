const axios = require('axios')
const cheerio = require('cheerio')

const { TERMS_URL, TERMS_VERSION } = require('../../config/terms')

const CACHE_MS = 60 * 60 * 1000
const RETRY_MS = 5 * 60 * 1000

// The terms page is a static site page: the intro sits in the hero and the body in
// article.prose. Only these tags are kept; everything else is unwrapped.
const ALLOWED_TAGS = new Set(['p', 'ul', 'ol', 'li', 'strong', 'b', 'em', 'u', 'br', 'h2', 'h3', 'h4', 'a'])

let cache = null

const cleanTerms = (pageHtml) => {
    const $ = cheerio.load(pageHtml)
    const body = $('article.prose').first()
    if (!body.length) throw new Error('Terms body not found on page')

    // Drop page chrome, and keep the acceptance sentence from the hero
    body.find('.back-top').remove()
    const intro = $('.page-hero p').first()
    if (intro.length) body.prepend(`<p>${intro.html()}</p>`)

    // Deepest elements first, so unwrapping a parent never skips its children
    body.find('*').toArray().reverse().forEach(el => {
        const tag = el.tagName.toLowerCase()

        if (!ALLOWED_TAGS.has(tag)) {
            $(el).replaceWith($(el).contents())
            return
        }

        const href = tag === 'a' ? $(el).attr('href') : null
        Object.keys(el.attribs).forEach(attr => $(el).removeAttr(attr))

        if (tag === 'a') {
            if (href && /^https?:\/\//i.test(href)) {
                $(el).attr({ href, target: '_blank', rel: 'noopener' })
            } else if (href && /^mailto:/i.test(href)) {
                $(el).attr({ href })
            } else {
                $(el).replaceWith($(el).contents())
            }
        }
    })

    body.find('p').filter((i, el) => !$(el).text().trim()).remove()

    return body.html().trim()
}

const getTerms = async () => {
    if (cache && Date.now() - cache.fetchedAt < CACHE_MS) return { html: cache.html, url: TERMS_URL, version: TERMS_VERSION }

    try {
        const response = await axios.get(TERMS_URL, { timeout: 10000 })
        cache = { html: cleanTerms(response.data), fetchedAt: Date.now() }
    } catch (e) {
        // Serve the last good copy if the terms site is down. With no copy at all, still
        // return the version so the login agreement check works; the dialog shows an unavailable message.
        console.log('getTerms refresh failed:', e.message)
        if (!cache) return { html: null, url: TERMS_URL, version: TERMS_VERSION }
        // Retry in 5 minutes instead of on every request
        cache.fetchedAt = Date.now() - CACHE_MS + RETRY_MS
    }

    return { html: cache.html, url: TERMS_URL, version: TERMS_VERSION }
}

module.exports = { getTerms }
