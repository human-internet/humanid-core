'use strict'

function init(services, args) {
    // Get logger
    const {logger} = args

    // Load services
    const serviceMap = {}
    services.forEach(Service => {
        const svc = new Service(serviceMap, args)
        const svcName = svc.getServiceName()
        serviceMap[svc.getServiceName()] = svc
        logger.debug(`Service loaded: ${svcName}`)
    })

    // Return service map
    return serviceMap
}

module.exports = {init}

