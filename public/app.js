var app = new Vue({
    el: '#app',
    data: {
        servers: []
    }
})
var app2 = new Vue({
    el: '#app-2',
    data: {
        bills: []
    }
})
var app3 = new Vue({
    el: '#app-3',
    data: {
        menu: []
    }
})
function printQueue(){
    fetch('https://restaurantsimulation.herokuapp.com/tables/queue')
    .then(response => response.json())
    .then( 
        data => {
            console.log(data)  
            app.servers = [];
            for(let i=0; i <= data.length; i++){
                app.servers.push({id: data[i]['id'], hour_arrival: data[i]['hour_arrival'], arrival:data[i]['arrival'], arrivalAcum:data[i]['arrivalAcum'], wait:data[i]['wait'], service:data[i]['service'], exit:data[i]['exit'], standing:data[i]['stading']});
            }
        }
    );
}
function printBill(){
    fetch('https://restaurantsimulation.herokuapp.com/tables/bill')
    .then(response => response.json())
    .then( 
        data => {
            console.log(data)
            app2.bills = [];
            for(let i=0; i <= data.length; i++){
                if(data[i]['factura']['metodo_de_pago'] == 'Dividido' || data[i]['factura']['metodo_de_pago'] == 'Americano'){
                    data[i]['factura']['datos'].forEach(element => {
                        console.log('elementtt', element);
                        app2.bills.push({id: data[i]['factura']['id'], id_mesa: data[i]['factura']['id_mesa'],
                        total: element['costo_cliente'], metodo_de_pago:data[i]['factura']['metodo_de_pago'],
                        name_client: element['nombre'], dishes:element['platos']})
                    });
                }else{
                    app2.bills.push({id: data[i]['factura']['id'], id_mesa: data[i]['factura']['id_mesa'], 
                    total:data[i]['factura']['total'], metodo_de_pago:data[i]['factura']['metodo_de_pago'], 
                    name_client:data[i]['factura']['datos'][0]['nombre'], 
                    dishes:data[i]['factura']['platos']});
                }
            }
        }
    );
}
function printMenu(){
    fetch('https://restaurantsimulation.herokuapp.com/dishes/get-all-dishes')
    .then(response => response.json())
    .then( 
        data => {
            console.log(data)  
            app3.menu = [];
            for(let i=0; i <= data.length; i++){
                app3.menu.push({id: data[i]['id'], name: data[i]['name'], cost:data[i]['cost'], duration:data[i]['duration'], type:data[i]['type']});
            }
        }
    );
}

setInterval(() =>{
    printQueue();
    printMenu();
    printBill();
}, 2000)
