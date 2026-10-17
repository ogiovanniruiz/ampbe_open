// SignalWire answers failures with {errors: [{detail}]}; fall back to the axios message
const swErrorDetail = (error) => {
    const data = error.response && error.response.data
    if(data && data.errors && data.errors.length) return data.errors[0].detail || data.errors[0].message || error.message
    if(data && data.message) return data.message
    return error.message
}

const formatPhone = (number) => {
    const digits = (number || '').replace(/\D/g, '').replace(/^1(?=\d{10}$)/, '')
    if(digits.length !== 10) return number
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
}

// Same {errors: [{detail}]} shape the dialogs already read from SignalWire
const failure = (detail) => ({errors: [{detail}]})

module.exports = {swErrorDetail, formatPhone, failure}
