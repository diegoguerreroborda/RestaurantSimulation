const express = require('express')
const router = express.Router()
const atmUtil = require('./ATMUtils')
let dishesList = atmUtil.getDishes

router.get('/get-all-dishes', async function(req, res){
    res.json(dishesList)
})

router.get('/get-dish-by-id', async function(req, res){
    if(dishesList.length == 0){
        getAllDishes()
    }
    let dish = null
    dishesList.forEach( function(tmpDish, index, list) {
        if(req.query.id == tmpDish.id){
            dish = tmpDish
        }
    })
    res.json(
        dish
    )
})

router.get('/get-dish-type-by-id', async function(req, res){
    let dish = null
    switch(req.query.dishType){
        case '0':
            dish = dishes[0]
            break
        case '1':
            dish = dishes[1]
            break
        case '2':
            dish = dishes[2]
            break
        case '3':
            dish = dishes[3]
            break   
        default:
            dish = dishes
            break;             
    }
    res.json(
        dish
    )
})

router.get('/get-dishes-types', async function(req, res){
    res.json(dishes)
})

const dishes = [
    {
        typeId: 0,
        typeName: "Jugos"       
    },
    {
        typeId: 1,
        typeName: "Bandejas"       
    },
    {
        typeId: 2,
        typeName: "Sopas"       
    },{
        typeId: 3,
        typeName: "Postres"       
    },
]

function getAllDishes(){
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
    return dishesList
}

function addDishToList(initValue, endValue, dishType){
    for (let i = initValue; i <= endValue; i++) {
        dishesList.push(
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

module.exports = router