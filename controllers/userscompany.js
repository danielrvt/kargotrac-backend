const UsersCompany = require('../models').usersCompanies;


/* Esta funcion busca si ya existe el usuario con la misma compania, sino entonces 
agrega una nueva tupla que consiste en (userID, nuevo id de compania) */

const searchUserID = (userID, companyID) => {
    return (UsersCompany.findAll({
        where: {
            userID: userID,
            companyID: companyID
        }
    })).then(function (user) {

        if (user.length > 0)
            // aqui va un next que maneja lo que se hara si se consigue un user / email iguales
            return true;

        else return false;
        

    })
}

/*Esta funcion crea la nueva tupla y la inserta en la bd */
const createNewUserCompany = (userID, companyID) => {

        return UsersCompany.create({
            userID,
            companyID
        }).then((company)=> {
            return company
        })
}

/*Esta funcion es el controlador de llamadas para hacer el proceso de agregar un nuevo usersCompany */
exports.createUsersCompany = (userID, companyID) => {

        return (searchUserID(userID, companyID).then((existCompany)=>{
            console.log(existCompany)
            if(existCompany){
                return null
            }else{
                return UsersCompany.create({
                    userID,
                    companyID
                }).then((company)=> {
                    return company
                })
                
            }

        }))

        

    
}