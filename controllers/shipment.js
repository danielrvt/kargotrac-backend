const User = require('../models').Users;
const Packages = require('../models').Packages;
const Items = require('../models').Items;
const Shipments = require('../models').Shipments;
const jwt = require('jsonwebtoken');


const create = async (shippingWay, companyID, userID) => {
    let shipment = {};
    try {
        shipment = await Shipments.create(
            {
                shipping_way: shippingWay,
                CompanyId: companyID,
                UserId: userID,
                status: "POR EMPACAR"
            }
        )
    } catch (e) {
        console.log(e)
        console.log('Error caught');
    }
    return shipment
}


exports.createShipments = (req, res) => {

    headers = req.headers
    //var items = []
    // Chequeo autorizacion

    try {
        decoded = jwt.verify(headers.usertoken, 'whatever it takes');
        console.log(decoded)
    } catch (e) {
        return res.status(401).send('unauthorized');
    }
    console.log("HEADERS")
    console.log(headers)
    const userID = decoded.id
    const companyID = headers.companyid

    const { items, shippingWay } = req.body

    // Debo crear el shipment y asociarle el companyid y el userId

    create(shippingWay, companyID, userID).then((shipment) => {

        // Debo a cada articulo asociarle el ShipmentId

        Promise.all(items.map((shipItem) => {

            return (Items.update({
                ShipmentId: shipment.dataValues.id
            }, {
                    where: {
                        id: shipItem.item_id
                    }
                }))
        })).then(
            (resp) => {
                console.log(resp)
                res.json({
                    status: "success",
                    shipmentItems: items
                })
            }
        )

    })

}

exports.getShipments = (req, res) => {

    headers = req.headers

    try {
        decoded = jwt.verify(headers.usertoken, 'whatever it takes');
        console.log(decoded)
    } catch (e) {
        return res.status(401).send('unauthorized');
    }
    const userID = decoded.id
    const companyID = headers.companyid
    const isCompany = headers.iscompany
    console.log(!isCompany)
    console.log(userID, companyID)
    if (isCompany === 'false') {

        Shipments.findAll({
            where: {
                UserId: userID,
                CompanyId: parseInt(companyID)
            }
        }).then((shipments) => {

            let ship_id = []

            let promises_ship = shipments.map(async ship => {

                await findQtyItems(ship).then((items_qty) => {

                    let shipment = {
                        id: ship.dataValues.id,
                        creation_date: ship.dataValues.createdAt.toLocaleDateString(),
                        qty: items_qty,
                        status: ship.dataValues.status,
                        shipping_way: ship.dataValues.shipping_way
                    }
                    ship_id.push(shipment)
                })



            })

            Promise.all(promises_ship).then((s) => {
                console.log("PAQUETE FINAL")
                console.log("Shipment set")
                console.log(ship_id)

                res.json({
                    status: "success",
                    shipments: ship_id
                })
            })

        })
    } else {
        console.log("????????????????????????")
        Shipments.findAll({
            where: {
                CompanyId: parseInt(companyID)
            }
        }).then((shipments) => {

            let ship_id = []

            let promises_ship = shipments.map(async ship => {

                await findQtyItems(ship).then((items_qty) => {

                    let shipment = {
                        id: ship.dataValues.id,
                        creation_date: ship.dataValues.createdAt.toLocaleDateString(),
                        qty: items_qty,
                        status: ship.dataValues.status,
                        shipping_way: ship.dataValues.shipping_way
                    }
                    ship_id.push(shipment)
                })

            })

            Promise.all(promises_ship).then((s) => {
                console.log("PAQUETE FINAL")
                console.log("Shipment set")
                console.log(ship_id)

                res.json({
                    status: "success",
                    shipments: ship_id
                })
            })

        })

    }
}


const findQtyItems = (shipment) => {
    //let items = []
    return (Items.findAll({
        where: {
            ShipmentId: shipment.dataValues.id
        }
    })).then((result) => {
        let total = 0
        result.forEach((item) => {
            total = total + item.dataValues.quantity
        })
        return total

    })

}

exports.getSingleShipment = (req, res) => {
    headers = req.headers
    try {
        decoded = jwt.verify(headers.usertoken, 'whatever it takes');
        console.log(decoded)
    } catch (e) {
        return res.status(401).send('unauthorized');
    }
    Shipments.findOne({
        where: {
            id: parseInt(headers.id)
        }
    }).then((shipment) => {
        res.json({
            shipment: shipment.dataValues
        })
    })
}
exports.editShipment = (req, res) => {


    try {
        decoded = jwt.verify(headers.usertoken, 'whatever it takes');
        console.log(decoded)
    } catch (e) {
        return res.status(401).send('unauthorized');
    }
    const userID = decoded.id
    const companyID = headers.companyid
    const isCompany = headers.iscompany
    const { selectedItems, deselectedItems, ShipmentId, companyEdits, newItems } = req.body
    console.log("COMPANY EDITS")
    console.log(companyEdits)

    if (isCompany === 'false') {
        if (selectedItems.length > 0) {

            Shipments.findOne({
                where: {
                    id: parseInt(ShipmentId)
                }
            }).then((shipment) => {
                console.log("SHIPMENT")
                console.log(shipment)
                console.log('new item')
                console.log(newItems)
                if (shipment.dataValues.status === "EMPACADO") {
                    console.log("pase a empadados")
                    create(
                        shipment.dataValues.shipping_way,
                        shipment.CompanyId,
                        shipment.UserId
                    ).then((ship) => {
                        let promiseSelected = newItems.map((item) => {
                            Items.findOne({
                                where: {
                                    id: parseInt(item.item_id)
                                }
                            }).then((itemFound) => {
    
                                if (itemFound.dataValues.ShipmentId !== parseInt(ShipmentId)) {
                                    Items.update({
                                        ShipmentId: ship.dataValues.id
                                    }, {
                                            where: {
                                                id: itemFound.dataValues.id
                                            }
                                        })
                                }
                            })
                        })
                        Promise.all([promiseSelected]).then(() => {
                            res.json({
                                status: "success",
                                ShipmentId: ShipmentId
                            })
                        })
                    })


                } else {
                    let promiseSelected = selectedItems.map((item) => {
                        Items.findOne({
                            where: {
                                id: parseInt(item.item_id)
                            }
                        }).then((itemFound) => {

                            if (itemFound.dataValues.ShipmentId !== parseInt(ShipmentId)) {
                                Items.update({
                                    ShipmentId: ShipmentId
                                }, {
                                        where: {
                                            id: itemFound.dataValues.id
                                        }
                                    })
                            }

                        })
                    })

                    let promiseDeselected = deselectedItems.map((item) => {

                        Items.findOne({
                            where: {
                                id: parseInt(item.item_id)
                            }
                        }).then((itemFound) => {
                            if (itemFound.dataValues.ShipmentId === parseInt(ShipmentId)) {
                                Items.update({
                                    ShipmentId: null
                                }, {
                                        where: {
                                            id: itemFound.dataValues.id
                                        }
                                    })
                            }
                        })
                    })

                    Promise.all([promiseSelected, promiseDeselected]).then(() => {
                        res.json({
                            status: "success",
                            ShipmentId: ShipmentId
                        })
                    })
                }
            })


        } else {
            Shipments.destroy({
                where: {
                    id: parseInt(ShipmentId)
                }
            }).then(() => res.json({
                status: "Shipment destroyed"
            }))
        }
    }
    else {
        Shipments.findOne({
            where: {
                id: parseInt(ShipmentId)
            }
        }).then((shipment) => {
            if (shipment.status !== companyEdits.status) {
                Shipments.update({
                    status: companyEdits.status
                }, {
                        where: {
                            id: shipment.dataValues.id
                        }
                    })
            }
            if (parseFloat(shipment.lbs_weight) !== parseFloat(companyEdits.lbs_weight)) {
                Shipments.update({
                    lbs_weight: parseFloat(companyEdits.lbs_weight)
                }, {
                        where: {
                            id: shipment.dataValues.id
                        }
                    })
            }
            if (parseFloat(shipment.pvl_weight) !== parseFloat(companyEdits.pvl_weight)) {
                Shipments.update({
                    pvl_weight: parseFloat(companyEdits.pvl_weight)
                }, {
                        where: {
                            id: shipment.dataValues.id
                        }
                    })
            }
            if (parseFloat(shipment.cubic_feet_volume) !== parseFloat(companyEdits.cubic_feet_volume)) {
                Shipments.update({
                    cubic_feet_volume: parseFloat(companyEdits.cubic_feet_volume)
                }, {
                        where: {
                            id: shipment.dataValues.id
                        }
                    })
            }
            if (parseInt(shipment.number_of_boxes) !== parseInt(companyEdits.number_of_boxes)) {
                Shipments.update({
                    number_of_boxes: parseInt(companyEdits.number_of_boxes)
                }, {
                        where: {
                            id: shipment.dataValues.id
                        }
                    })
            }
            res.json({
                status: "success",
                shipmentValues: companyEdits
            })
        })
    }
    //  Lo busco con el id y pregunto si los datos son distintos a los nuevos,
    // si es asi, entonces edito Shipments.update
    //const {id, }
}