const superagent = require('superagent')
require('dotenv').config()

async function getUserToken(email, password) {
   let res = await superagent
    .post(process.env.REQUEST_URL+ '/user/login')
    .send({'email': email, 'password': password})
    .set('Accept', 'application/json')
    temp = res.body
    accessToken = temp['access_token']
    return accessToken
    
}

async function addNewTodoList(token, task, createdBy, dateCreated) {
    let res = await superagent
    .post(process.env.REQUEST_URL+ '/todo')
    .send({
        "task": task,
        "createdBy": createdBy,
        "dateCreated": dateCreated
        })
    .set('Accept', 'application/json')
    .set('Authorization', 'Bearer ' + token)
    temp = res.body
    
    return temp

}

async function getAllList(token) {
    let res = await superagent
    .get(process.env.REQUEST_URL+ '/todo')
    .set('Accept', 'application/json')
    .set('Authorization', 'Bearer ' + token)
    temp = res.body

    return temp
}

async function updateTheList(token, id, editedTask, createdBy,dateCreated ) {
    let res = await superagent
    .put(process.env.REQUEST_URL + '/todo/'+id)
    .send({
        "task": editedTask,
        "createdBy": createdBy,
        "dateCreated": dateCreated
        })
    .set('Accept', 'application/json')
    .set('Authorization', 'Bearer ' + token)
    temp = res.body

    return temp
}

async function deleteTheList(token, id ) {
    let res = await superagent
    .delete(process.env.REQUEST_URL + '/todo/'+id)
    .set('Accept', 'application/json')
    .set('Authorization', 'Bearer ' + token)
    temp = res.body

    return temp
}


module.exports = {
    getUserToken,
    addNewTodoList,
    getAllList,
    updateTheList,
    deleteTheList
}