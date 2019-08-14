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

    console.log(userID,companyID)

    Shipments.findAll({
        where: {
            UserId: userID,
            CompanyId: parseInt(companyID)
        }
    }).then((shipments) => {

        let ship_id = []

        let promises_ship = shipments.map( async ship => {

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

exports.editShipment = (req, res) => {


    try {
        decoded = jwt.verify(headers.usertoken, 'whatever it takes');
        console.log(decoded)
    } catch (e) {
        return res.status(401).send('unauthorized');
    }
    const userID = decoded.id
    const companyID = headers.companyid

    const {selectedItems, deselectedItems, ShipmentId} = req.body

    let promiseSelected = selectedItems.map((item) => {
        Items.findOne({
            where: {
                id: item.item_id
            }
        }).then((itemFound) => {

            if(itemFound.dataValues.ShipmentId !== parseInt(ShipmentId)){
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
                id: item.item_id
            }
        }).then((itemFound) => {
            if(itemFound.dataValues.ShipmentId === parseInt(ShipmentId)){
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
    //  Lo busco con el id y pregunto si los datos son distintos a los nuevos,
    // si es asi, entonces edito Shipments.update
    //const {id, }
}