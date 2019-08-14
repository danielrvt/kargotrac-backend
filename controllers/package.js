const User = require('../models').Users;
const Packages = require('../models').Packages;
const Items = require('../models').Items;
const jwt = require('jsonwebtoken');

exports.getPackages = (req, res) => {

    const { tracking_id, status, name, qty, item_id, package_id } = req.body
    const headers = req.headers

    try {
        decoded = jwt.verify(headers.usertoken, 'whatever it takes');
        console.log(decoded)
    } catch (e) {
        return res.status(401).send('unauthorized');
    }
    const userID = decoded.id
    const companyID = headers.companyid

    Packages.findAll({
        where: {
            UserId: userID,
            CompanyId: companyID
        }
    }).then((packages) => {

        let pck_trackingID = {}

        let promises_pck = packages.map( async pck => {

            await findQtyItems(pck).then((pck_w_qty) => {

                if (pck_trackingID[pck_w_qty.tracking_id]) pck_trackingID[pck_w_qty.tracking_id].push(pck_w_qty)
                else pck_trackingID[pck_w_qty.tracking_id] = [pck_w_qty]

            })



        })

        Promise.all(promises_pck).then((packages) => {
            console.log("PAQUETE FINAL")

            let packagesSet = []
            for (const trackingID in pck_trackingID) {
                if (pck_trackingID.hasOwnProperty(trackingID)) {
                    const package = pck_trackingID[trackingID];
                    const tracking_id = trackingID
                    let status = ""
                    let qty = 0
                    
                    package.forEach((element, index) => {
                        qty = qty + element.qty
                        console.log(index)
                        if(index === package.length - 1) status = element.status
                    });
                    packagesSet.push({
                        tracking_id: tracking_id,
                        status: status,
                        qty: qty
                    })
                }
            }
            console.log("Packages set")
            console.log(packagesSet)

            res.json({
                status: "success",
                packages: packagesSet
            })
        })


    })
}

const findQtyItems = (package) => {
    //let items = []
    return (Items.findOne({
        where: {
            PackageId: package.dataValues.id
        }
    })).then((result) => {
        if (result) {
            const pck = {
                id: package.id,
                tracking_id: package.tracking_id,
                seller: package.seller,
                status: package.status,
                qty: result.dataValues.quantity
            }
            console.log("PCK")
            console.log(pck)
            return pck
        }
        else return {
            id: package.id,
            tracking_id: package.tracking_id,
            seller: package.seller,
            status: package.status,
            qty: 0
        }

    })

}