const express = require('express')
const app = express()

const port = process.env.PORT || 3000

const User = require('./models/user')

const jwt = require('jsonwebtoken')
const jwtSecret = 'abc123abc123abc123'

const mongo = process.env.MONGO || 'mongodb://localhost/minhas-series-rest'
const mongoose = require('mongoose')
mongoose.Promise = global.Promise

const bodyParser = require('body-parser')

const users = require('./routes/users')
const series = require('./routes/series')

app.use(bodyParser.json())

const createInitialUsers = async() => {
    const total = await User.count({})
    if(total === 0){
        const user = await new User({
            username: 'admin',
            password: 'admin',
            roles: ['restrito', 'admin']
        })
        await user.save()

        const user2 = await new User({
            username: 'user',
            password: 'user',
            roles: ['restrito']
        })
        await user2.save()
    }
}

app.use('/series', series)
app.use('/users', users)

app.post('/auth', async(req, res) => {
    const user = req.body
    const userDb = await User.findOne({
        username: user.username
    })
    if(userDb){
        if(userDb.password === user.password){
            const payload = {
                id: userDb._id,
                username: userDb.name,
                roles: userDb.roles
            }

            jwt.sign(payload, jwtSecret, (err, token) => {
                res.send({
                    success: true,
                    token: token
                })
            })

            
        }else{
            res.send({
                success:false,
                message: 'wrong credentials'
            })
        }
    }else{
        res.send({
            success:false,
            message: 'wrong credentials'
        })
    }
})

    mongoose
            .connect(mongo, {useMongoClient:true})
            .then(() =>{
                createInitialUsers()
                app.listen(port, () =>  console.log('ON'))
            })
            .catch(e => console.log(e)
)