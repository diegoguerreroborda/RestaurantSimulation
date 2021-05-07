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
const service = 120
let menuList = [{id:1, cost: 12000}, {id:2, cost: 9000}, {id:3, cost: 8000}, {id:4, cost: 10000}, {id:5, cost: 5000}, {id:6, cost: 1000}]

var serviceWait = 7200
var count = 1

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
    res.send(list_cola)
})

app.post('/test', (req, res) =>{
    generateBill(req.body.mesa.clientes, req.body.mesa.metodo_pago)
    res.sendStatus(200)
})

function generateBill(clients, paymentMethod){
    let totalCost = 0;
    //let filteredClients = clients.filter(client => client.platos);
    let filteredClients = clients.map(item =>{
        //console.log(item.platos[0])
        item.platos.forEach(order => {
            //Buscar el costo en la tabla
            let unitCost = menuList.filter(plato => plato.id == order);
            totalCost += unitCost[0].cost
        })
    })
    //console.log('filtrado', filteredClients)
    console.log(totalCost)
    if(paymentMethod == 'Divido'){
        //Unir todos los platos y dividir el valor en el numero de clients.
    }else if(paymentMethod == 'Americano'){
        //Cada cliente paga lo suyo
    }else if(paymentMethod == 'Unico'){
        //Unir todos los platos y sacar una sola cuenta
    }else{
        //tarjeta
    }
}


app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})