let dishes = []
let tables = []
let queue = []
let bills = []
class ATMUtils{
    static get getDishes() { 
        if(dishes.length == 0){
            fillDishes()
        }
        return dishes
    }
    static get getTables() { return tables }
    static get getQueue() { return queue}
    static get getBills() { return bills }
}

function fillDishes(){
    for (let i = 0; i <= 3; i++) {
        switch(i){
            case 0:
                addDishToList(1, 5, i)
                break;
            case 1:
                addDishToList(6, 10, i)
                break;    
            case 2:
                addDishToList(11, 15, i)
                break;    
            case 3:
                addDishToList(16, 20, i)
                break;    
        }        
    }
}

function addDishToList(initValue, endValue, dishType){
    for (let i = initValue; i <= endValue; i++) {
        dishes.push(
            {
                id: i,
                name: "Opcion #" + i,
                cost: i*5000,
                duration: Math.floor(Math.random() * (20-1+1)) + 1,
                type: dishType
            }
        )                    
    }
}

module.exports = ATMUtils