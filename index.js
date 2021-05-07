const express = require('express')
const bodyParser = require('body-parser');

const app = express()
app.use(bodyParser.json())

const port = 3000

let tableList = []


let idBill = 0;
var list_cola = []
var arrivalAcum = 0

let billList = []
let billCount = 0;

const service = 120
let menuList = [{id:1, cost: 12000}, {id:2, cost: 9000}, {id:3, cost: 8000}, {id:4, cost: 10000}, {id:5, cost: 5000}, {id:6, cost: 1000}]

var serviceWait = 7200
var count = 1

app.post('/new', async (req, res) => {
    //Cuando es cuenta divida o Americana
    if(req.body.mesa.metodo_pago == 'Americano' || req.body.mesa.metodo_pago == 'Dividido'){
        console.log('Dividido o Americano')
        await req.body.mesa.clientes.forEach(client => addClientToCola(client, req.body.mesa.hora));
    }else{
        //Cuando es cuenta unica o tarjeta
        console.log('unico')
        await addClientToCola(req.body.mesa.clientes[0], req.body.mesa.hora)
    }
    let currentBill = generateBill(req.body.mesa.clientes, req.body.mesa.metodo_pago)
    billList.push({factura:{id : ++billCount, id_mesa : req.body.mesa.id_mesa, total: currentBill.total, metodo_de_pago: currentBill.metodo_pago, datos: currentBill}})
    res.send(billList[billList.length-1])
})

function addClientToCola(client, hour){
//id,arrival,arrivalAcum,wait,service,exit,stadin,line
    let client_cola = {id:client.id_client,hour_arrival:0,arrival:0,arrivalAcum:0,wait:0,service:120,exit:0, stading:0}
    //arrival
    let date = new Date(hour);
    client_cola.hour_arrival = Math.abs(date.getTime() / 1000)
    if(list_cola.length>0){
        client_cola.arrival =  Math.abs(client_cola.hour_arrival - list_cola[list_cola.length-1].hour_arrival)
    }
    console.log("arrivo:  ",date.getTime() / 1000)
    //arrivalAcum
    arrivalAcum += client_cola.arrival
    client_cola.arrivalAcum = arrivalAcum
    //wait
    if(list_cola.length>0){
        client_cola.wait = (Math.max(list_cola[list_cola.length-1].exit, client_cola.arrivalAcum)) - client_cola.arrivalAcum
    }
    //service
    if(client_cola.arrival > serviceWait){
        client_cola.service = service + 600
        count++
        serviceWait = serviceWait * count
    }else{
        client_cola.service = service
    }
    
    //exit 
    client_cola.exit = client_cola.arrivalAcum + client_cola.wait + service
    //stading
    client_cola.stading = Math.abs(client_cola.arrivalAcum-client_cola.exit)

    list_cola.push(client_cola)
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

app.get('/bill', (req, res) => {
    res.send(billList)
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})