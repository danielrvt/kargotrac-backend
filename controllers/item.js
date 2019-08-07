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

    Packages.findOrCreate({
        where: {
            tracking_id: tracking_id
        },
        defaults: {
            tracking_id: tracking_id,
            UserId: userID,
            CompanyId: headers.companyid
        }
    }).then((package) => {

        // Pack asociado a compania

        //package[0].setCompany(companyID)

        // Creo el item
        create(
            name,
            parseInt(quantity),
            package[0].dataValues.id
        ).then((item) => {
            // Seteo las relaciones

            // Relacion articulos estan en paquetes
            //item.setPackages(package[0])
            const response = {
                tracking_id: tracking_id,
                status: null,
                name: name,
                qty: quantity,
                item_id: item.dataValues.id,
                package_id: package[0].dataValues.id

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


    Packages.findAll({
        where: {
            UserId: userID,
            CompanyId: parseInt(companyID)
        }
    }).then(async (packages) => {
        //console.log(packages)
        console.log(packages)
        findItems(packages).then((result) => {
            console.log("Este es el resultado")
            console.log(result[2])
        })

        res.json(items)

    })

}

// Creo que funciona
// Cuando le doy a agregar debe cerrar el modal
const findItems = (packages) => {
    let items = []
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