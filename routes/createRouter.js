const glob = require('glob')
const Router = require('express').Router

module.exports = glob
    .sync('**/*.js', { cwd: `${__dirname}/` })
    .map(filename => require(`./${filename}`))
    .filter(router => typeof router === 'function' && Array.isArray(router.stack))
    .reduce((rootRouter, router) => rootRouter.use(router), Router({ mergeParams: true }))

