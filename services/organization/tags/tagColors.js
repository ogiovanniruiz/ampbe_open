// Same scale as the client's utils/tagColors.ts, for definitions saved without colors
const DEFAULT_BASE = '#1e6fd9'

const HEX = /^#[0-9a-f]{6}$/i

const toRGB = (hex) => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16))
const toHex = (rgb) => '#' + rgb.map(c => Math.round(Math.min(255, Math.max(0, c))).toString(16).padStart(2, '0')).join('')
const mix = (a, b, t) => a.map((c, i) => c + (b[i] - c) * t)

// `count` colors from light to dark around `base`: a pale tint first, the base color near the end, a little darker last
const colorScale = (count, base = DEFAULT_BASE) => {
    var rgb = toRGB(HEX.test(base) ? base : DEFAULT_BASE)
    if(count <= 1) return [toHex(rgb)]
    var white = [255, 255, 255], black = [0, 0, 0]
    return Array.from({length: count}, (_, i) => {
        var w = 0.2 + i / (count - 1)
        return toHex(w <= 1 ? mix(white, rgb, w) : mix(rgb, black, (w - 1)))
    })
}

module.exports = {DEFAULT_BASE, HEX, colorScale}
