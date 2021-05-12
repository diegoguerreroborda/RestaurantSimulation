const express = require('express')
const router = express.Router()
const atmUtil = require('./ATMUtils')
let arrivalAcum = 0
let billCount = 0;
let serviceWait = 7200
let count = 1
let billList = atmUtil.getBills
let list_queue = atmUtil.getQueue
let menuList = atmUtil.getDishes


router.get('/bill', async function (req, res) {
    res.json(billList)
})

router.get('/queue', async function (req, res) {
    res.json(list_queue)
})

router.post('/new', async function (req, res) {
    //Cuando es cuenta divida o Americana
    if(req.body.mesa.metodo_pago == 'Americano' || req.body.mesa.metodo_pago == 'Dividido'){
        console.log('Dividido o Americano')
        await req.body.mesa.clientes.forEach(client => addClientToQueue(client, req.body.mesa.hora, 120));
    }else if(req.body.mesa.metodo_pago == 'Unico'){
        //Cuando es cuenta unica
        console.log('Unico')
        await addClientToQueue(req.body.mesa.clientes[0], req.body.mesa.hora, 150)
    }else if(req.body.mesa.metodo_pago == 'Tarjeta'){
        //Cuando es cuenta tarjeta
        console.log('Tarjeta')
        await addClientToQueue(req.body.mesa.clientes[0], req.body.mesa.hora, 180)
    }    
    let currentBill = generateBill(req.body.mesa.clientes, req.body.mesa.metodo_pago)
    billList.push({factura:{id : ++billCount, id_mesa : req.body.mesa.id_mesa, total: currentBill.total, metodo_de_pago: currentBill.metodo_pago, datos: currentBill}})
    res.send(billList[billList.length-1])
})

function addClientToQueue(client, hour, service_param){
    let service = service_param
    //id,arrival,arrivalAcum,wait,service,exit,stadin,line
    let client_queue = {id:client.id_client,hour_arrival:0,arrival:0,arrivalAcum:0,wait:0,service:service_param,exit:0, stading:0}
    //arrival
    let date = new Date(hour);
    client_queue.hour_arrival = Math.abs(date.getTime() / 1000)
    if(list_queue.length>0){
        client_queue.arrival =  Math.abs(client_queue.hour_arrival - list_queue[list_queue.length-1].hour_arrival)
    }
    console.log("arrivo:  ",date.getTime() / 1000)
    //arrivalAcum
    arrivalAcum += client_queue.arrival
    client_queue.arrivalAcum = arrivalAcum
    //wait
    if(list_queue.length>0){
        client_queue.wait = (Math.max(list_queue[list_queue.length-1].exit, client_queue.arrivalAcum)) - client_queue.arrivalAcum
    }
    //service
    if(client_queue.arrival > serviceWait){
        client_queue.service = service + 600
        count++
        serviceWait = serviceWait * count
    }else{
        client_queue.service = service
    }
    
    //exit 
    client_queue.exit = client_queue.arrivalAcum + client_queue.wait + service
    //stading
    client_queue.stading = Math.abs(client_queue.arrivalAcum-client_queue.exit)

    list_queue.push(client_queue)
}

function generateBill(clients, paymentMethod){
    clients.metodo_pago = paymentMethod
    let totalCost = 0;
    let platos = ``;
    switch (paymentMethod) {
        case 'Dividido':
            clients = dividedMethod(clients, totalCost, platos)
        break;
        case 'Americano':
            clients = americanMethod(clients)
        break;
        case 'Unico':
            clients = onlyOneMethod(clients, totalCost, platos)
        break;
        case 'Tarjeta':
            clients = onlyOneMethod(clients, totalCost, platos)
        break;
        default:
            console.error('Metodo de pago invalido')
        break;
    }
    return clients
}

function dividedMethod(clients, totalCost, platos){
    console.log('Dividido')
    clients.map(item =>{
        item.platos.forEach(order => {
            let unitCost = menuList.filter(plato => plato.id == order);
            totalCost += unitCost[0].cost
            platos += `${unitCost[0].id}-`
        })
        clients.total = totalCost
    })
    clients.map(item =>{ 
        item.costo_cliente = totalCost / clients.length
        item.platos = platos
    })
    return clients
}

function americanMethod(clients){
    console.log('Americano')
    let costPerClient = 0
    clients.map(item =>{
        item.platos.forEach(order => {
            let unitCost = menuList.filter(plato => plato.id == order);
            costPerClient += unitCost[0].cost
        })
        item.costo_cliente = costPerClient;
        costPerClient = 0;
    })
    return clients
}

function onlyOneMethod(clients, totalCost, platos){
    console.log('Unico o Tarjeta')
        clients.map(item =>{
            item.platos.forEach(order => {
                let unitCost = menuList.filter(plato => plato.id == order);
                totalCost += unitCost[0].cost
                platos += `*${unitCost[0].id}-`
            })
        })
        clients.total = totalCost
        clients.platos = platos
        return clients
}

module.exports = router