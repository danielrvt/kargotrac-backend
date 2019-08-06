const User = require('../models').Users;
const Packages = require('../models').Packages;
const Items = require('../models').Items;

// ******************************* GESTION DE ARTICULOS ******************************

const create = async (name, quantity) => {
    let item = {};
    try {
        item = await Items.create(
            name,
            parseInt(quantity)

        )
    } catch (e) {
        console.log(e)
        console.log('Error caught');
    }
    return item
}

// DEBO VERIFICAR LA AUTORIZACION!!!!!!!!!!!!!!!!
exports.createItem = (req, res) => {

    const { name, quantity, tracking_id, companyID, userID } = req.body

    // Si el tracking_id no existe then createPackage
    // else just add the item

    // Creo el paquete 

    Packages.findOrCreate({
        where: {
            tracking_id: tracking_id
        },
        defaults: {
            tracking_id: tracking_id
        }
    }).then((package) => {
        
        // Pack asociado a compania
        
        package[0].setCompany(companyID)

        // Creo el item
        create(
            name,
            parseInt(quantity)
        ).then((item) => {
            // Seteo las relaciones

            // Relacion articulos estan en paquetes
            item.setPackages(package[0].dataValues.id)
        
            User.findOne({
                where: {
                    id: userID
                }
            }).then((user) => {
                
                // Relacion el apck esta asociado a un usuario
                package[0].setUser(user.dataValues.id)

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





    })

}