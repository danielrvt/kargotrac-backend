const User = require('../models').Users;
const Packages = require('../models').Packages;
const Items = require('../models').Items;
const Shipments = require('../models').Shipments;
const jwt = require('jsonwebtoken');


const create = async (shippingWay,companyID, userID) => {
    let shipment= {};
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

    const {items, shippingWay} = req.body

    // Debo crear el shipment y asociarle el companyid y el userId

    create(shippingWay,userID,companyID).then((shipment) => {

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
            () => { res.json("Added the shipments")}
        )

    })

}