const User = require('../models').Users;
const Packages = require('../models').Packages;
const Items = require('../models').Items;
const jwt = require('jsonwebtoken');

// ******************************* GESTION DE ARTICULOS ******************************

const create = async (name, quantity, packageId) => {
    let item = {};
    try {
        item = await Items.create(
            {
                name: name,
                quantity: parseInt(quantity),
                PackageId: packageId
            }
        )
    } catch (e) {
        console.log(e)
        console.log('Error caught');
    }
    return item
}

// DEBO VERIFICAR LA AUTORIZACION!!!!!!!!!!!!!!!!
exports.createItem = (req, res) => {

    // Debo chequear si el tracking id != vacio
    // Debo quitar el userid y poner el jwt
    const { name, quantity, tracking_id } = req.body
    const headers = req.headers

    // Si el tracking_id no existe then createPackage
    // else just add the item

    // Creo el paquete 

    try {
        decoded = jwt.verify(headers.usertoken, 'whatever it takes');
        console.log(decoded)
    } catch (e) {
        return res.status(401).send('unauthorized');
    }
    const userID = decoded.id
    Packages.create(
        {
            tracking_id: tracking_id,
            UserId: userID,
            CompanyId: headers.companyid,
            status: 'PENDIENTE'
        }
    ).then((package) => {

            // Pack asociado a compania

            //package[0].setCompany(companyID)
            console.log(`PAQUETE: `)
            console.log(package)
            // Creo el item
            create(
                name,
                parseInt(quantity),
                package.dataValues.id
            ).then((item) => {
                // Seteo las relaciones

                // Relacion articulos estan en paquetes
                //item.setPackages(package[0])
                const response = {
                    tracking_id: tracking_id,
                    status: package.dataValues.status,
                    name: name,
                    qty: quantity,
                    item_id: item.dataValues.id,
                    package_id: package.dataValues.id

                }
                console.log(response)
                res.json(response)



            })

        })

}

exports.getItems = (req, res) => {

    headers = req.headers
    var items = []
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
    const isCompany = headers.iscompany
    console.log('*****este es el usuariooooooo')
    console.log(userID)
    if(!isCompany)
    {Packages.findAll({
        where: {
            UserId: userID,
            CompanyId: parseInt(companyID)
        }
    }).then((packages) => {
        findItems(packages).then((result) => {
            for (let index = 0; index < result.length; index++) {
                if (result[index]) {
                    for (let j = 0; j < result[index].length; j++) {
                        let item = {
                            tracking_id: packages[index].dataValues.tracking_id,
                            status: packages[index].dataValues.status,
                            name: result[index][j].dataValues.name,
                            qty: result[index][j].dataValues.quantity,
                            item_id: result[index][j].dataValues.id,
                            package_id: packages[index].dataValues.id,
                            ShipmentId: result[index][j].ShipmentId
                        }
                        items.push(item)


                    }

                }

            }
            console.log("ITEMS")
            console.log(items)
            res.json(items)
        })



    })}
    else {
        Packages.findAll({
            where: {
                CompanyId: parseInt(companyID)
            }
        }).then((packages) => {
            findItems(packages).then((result) => {
                for (let index = 0; index < result.length; index++) {
                    if (result[index]) {
                        for (let j = 0; j < result[index].length; j++) {
                            let item = {
                                tracking_id: packages[index].dataValues.tracking_id,
                                status: packages[index].dataValues.status,
                                name: result[index][j].dataValues.name,
                                qty: result[index][j].dataValues.quantity,
                                item_id: result[index][j].dataValues.id,
                                package_id: packages[index].dataValues.id,
                                ShipmentId: result[index][j].ShipmentId
                            }
                            items.push(item)
    
    
                        }
    
                    }
    
                }
                console.log("ITEMS")
                console.log(items)
                res.json(items)
            })
    
    
    
        })
    }

}

exports.getPackageItems = (req, res) => {


    headers = req.headers
    //var items = []
    // Chequeo autorizacion

    try {
        decoded = jwt.verify(headers.usertoken, 'whatever it takes');
        console.log(decoded)
    } catch (e) {
        return res.status(401).send('unauthorized');
    }

    const userID = decoded.id
    const companyID = headers.companyid
    const tracking_id = headers.trackingid
    console.log(req.data)
    Packages.findOne({
        where: {
            tracking_id: tracking_id
        }
    }).then((package) => {
        let pck = [package]
        let packageItems = []
        findItems(pck).then((result) => {
            console.log("Result")
            console.log(result[0])
            let items = result[0]
            items.map((item) => {
                console.log(item)
                const itemToAdd = {
                    tracking_id: package.dataValues.tracking_id,
                    status: package.dataValues.status,
                    name: item.dataValues.name,
                    qty: item.dataValues.quantity,
                    item_id: item.dataValues.id,
                    package_id: package.dataValues.id,
                    ShipmentId: item.dataValues.ShipmentId
                }
                packageItems.push(itemToAdd)
                
            })

            console.log("AQUI LOS ART")
            console.log(packageItems)
            const response = {
                status: "success",
                package: package.dataValues,
                items: packageItems
            }
            res.json(response)
        })



    })
}


// Creo que funciona
// Cuando le doy a agregar debe cerrar el modal
const findItems = (packages) => {
    //let items = []
    return Promise.all(packages.map((package) => {
        return (Items.findAll({
            where: {
                PackageId: package.dataValues.id
            }
        }))
    })).then((result) => {
        console.log('ITEMS')
        console.log(result)
        return result
    })

}

/* EDIT ITEMS */

exports.editItem = (req, res) => {

    const { tracking_id, status, name, qty, item_id, package_id } = req.body
    const headers = req.headers

    try {
        decoded = jwt.verify(headers.usertoken, 'whatever it takes');
        console.log(decoded)
    } catch (e) {
        return res.status(401).send('unauthorized');
    }
    const userID = decoded.id

    console.log("ESTO ES REQ BODY")
    console.log(req.body)
    Packages.findOne({
        where: {
            id: package_id
        }
    }).then((package) => {

        if (package.dataValues.tracking_id !== tracking_id) {
            Packages.update({ tracking_id: tracking_id },
                { where: { id: package_id } })
        }

        Items.findOne({
            where: {
                id: item_id
            }
        }).then((item) => {

            if (item.dataValues.name !== name) {
                Items.update({
                    name: name
                }, {
                        where: { id: item_id }
                    })
            }
            if (item.dataValues.quantity !== qty) {
                Items.update({
                    quantity: qty
                }, {
                        where: { id: item_id }
                    })
            }

            res.json({ tracking_id: tracking_id, status: status, name: name, qty: qty, item_id: item_id, package_id: package_id })
        })
    })




}

/* DELETE ITEMS */

exports.deleteItems = (req, res) => {

    // Arreglar para recibir el articulo para no buscarlo en la bd
    const { tracking_id, status, name, qty, item_id, package_id } = req.body
    const headers = req.headers

    try {
        decoded = jwt.verify(headers.usertoken, 'whatever it takes');
        console.log(decoded)
    } catch (e) {
        return res.status(401).send('unauthorized');
    }
    const userID = decoded.id

    // Busco el item y lo elimino, luego, busco los items asoc al paq si el paquete tiene mas elementos no lo elimino
    // en cambio si

    Packages.findOne({
        where: {
            id: package_id
        }
    }).then((package) => {

        if (package.dataValues.status !== "EN_ALMACEN") {
            Items.destroy({
                where: {
                    id: item_id
                }
            }).then((number) => {

                Items.findAll({
                    where: {
                        PackageId: package_id
                    }
                }).then((packageItems) => {

                    if (packageItems.length > 0) res.json({ status: "success", item: { tracking_id: tracking_id, status: status, name: name, qty: qty } })
                    else {
                        Packages.destroy({
                            where: {
                                id: package_id
                            }
                        }).then((numberRows) => {
                            res.json({ status: "success", item: { tracking_id: tracking_id, status: status, name: name, qty: qty } })
                        })
                    }
                })
            })
        }

        else res.json("No se pudo eliminar el paquete esta en almacen")
    })


}