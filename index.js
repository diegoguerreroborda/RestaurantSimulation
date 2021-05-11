const express = require('express')
const bodyParser = require('body-parser');
const cors = require('cors')

const app = express()
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

const dishes = require('./api/dishes')
const tables = require('./api/tables')

app.use('/dishes', dishes)
app.use('/tables', tables)

app.set('port', process.env.PORT || 3001);
app.listen(app.get('port'), () =>
    console.log(`Server on port ${app.get('port')}`)
);

module.exports = app