const { Account , Driver , Order , OrderStore , Store , Client  } = require("../models/")
// const qrcode = require('qrcode');
const jwt = require('jsonwebtoken')
const { Op } = require("sequelize")
const qrcode = require('qrcode');
const fs = require('fs');

class Controller{
    static home(req,res){
        let status = req.query.created
        let dataTemp = req.session.dataTemp
        if (!dataTemp) {
            res.render('view',{status , dataTemp:false})
        } else {
            res.render('view',{status , dataTemp} )
        }
    }
    static register(req,res){
        let status = req.query.status
        if (!req.params.role){
            res.render('register',{role:false , status})
        } else if (req.params.role.toLowerCase() == "driver"){
            res.render('register',{role:"driver" , status})
        } else if (req.params.role.toLowerCase() == "client"){
            res.render('register',{role:"client" , status})
        } else {
            res.render('register',{role:false , status})
        }
    }
    static registerPost(req,res){
        if (req.params.role.toLowerCase() == 'driver'){
            const { firstName , lastName , email , user , password } = req.body
            const { role } = req.params
            const date = new Date()
            Account.findAll({
                where:{
                    [Op.or]: [
                        {user},
                        {email}
                    ]
                }
            })
            .then(el =>{
                if (el.length == 0){
                    return Driver.create({
                        firstName,
                        lastName,
                        createdAt : date,
                        updatedAt: date,
                    })
                    .then(element =>{
                        return Driver.findAll({
                            where:{
                                firstName,
                                lastName,
                                createdAt : date,
                            }
                        })
                    })
                    .then(element =>{
                        return Account.create({
                            email,
                            user,
                            password:Account.enc(password),
                            role,
                            DriverId:element[0].id,
                            createdAt : date,
                            updatedAt: date,
                        })
                    }) 
                    .then(element =>{
                        res.redirect(`/?created=Akun anda telah terbuat dengan role ${req.params.role} dengan atas nama ${req.body.firstName} ${req.body.lastName}`)
                    })
                    .catch(err =>{
                        if (err.name == "SequelizeValidationError"){
                            res.redirect(`/register/driver?status=${err.errors.map(el=>{
                                return el.message
                            }).join(", ")}`)
                            return
                        }
                        res.send(err)
                    })
                } else {
                    res.redirect('/register/driver?status=username or email registed')
                }
            })
            .catch(err =>{
                res.send(err)
            })
        } else if (req.params.role.toLowerCase() == 'client'){
            const { firstName , lastName , email , user , password , address } = req.body
            const { role } = req.params
            const date = new Date()
            Account.findAll({
                where:{
                    [Op.or]: [
                        {user},
                        {email}
                    ]
                }
            })
            .then(el =>{
                if (el.length == 0){
                    return Client.create({
                        firstName,
                        lastName,
                        address,
                        createdAt : date,
                        updatedAt: date,
                    })
                } else {
                    res.redirect('/register/client?status=username or email registed')
                }
            })
            .then(element =>{
                return Client.findAll({
                    where:{
                        firstName,
                        lastName,
                        createdAt : date,
                    }
                })
            })
            .then(element =>{
                return Account.create({
                    email,
                    user,
                    password:Account.enc(password),
                    role,
                    ClientId:element[0].id,
                    createdAt : date,
                    updatedAt: date,
                })
            }) 
            .then(element =>{
                res.redirect(`/?created=Akun anda telah terbuat dengan role ${req.params.role} dengan atas nama ${req.body.firstName} ${req.body.lastName}`)
            })
            .catch(err =>{
                if (err.name == "SequelizeValidationError"){
                    res.redirect(`/register/client?status=${err.errors.map(el=>{
                        return el.message
                    }).join(", ")}`)
                    return
                }
                res.send(err)
            })
        }
    }
    static login(req,res){
        res.render('login',{ error:req.query.error })
    }
    static homePage(req,res){
        if (req.session.dataTemp){
            const { dataUser , dataAccount } = req.session.dataTemp
            if ( dataAccount.role ==  'driver'){
                Order.findAll({
                    where: {
                      DriverId: null
                    },
                    include: {
                      model: Client,
                      where: {
                      }
                    },
                    order: [
                      ['id', 'ASC']
                    ]
                })
                .then(data =>{
                    res.render('driver' , { dataUser , dataAccount , data})  
                })
                .catch(err =>{
                    res.send(err)
                })
            } else if ( dataAccount.role ==  'client'){
                Store.findAll({
                    order: [
                        ['id', 'ASC']
                    ]
                })
                .then(data=>{
                    data = data.map(el => {
                        el.rupiahPrice = el.toRupiah
                        return el;
                      })
                    res.render('client' , { dataUser , dataAccount , store:data})
                })
                .catch(err =>{
                    console.log(err)
                    res.send(err)
                })
            }       
        } else {
            res.redirect('/login')
        }
    }
    static order(req, res) {
        let StoreData;
        if (req.session.dataTemp) {
            let pricetotal = 0;
            Store.findAll()
            .then((el) => {
                StoreData = el;
                return Driver.findAll()
            })
            .then((el) => {
                req.session.dataTemp.order = []
                for (const dataStore in StoreData) {
                    for (const dataBody in req.body) {
                        if (StoreData[dataStore].id == dataBody) {
                            if (typeof Number(req.body[dataBody]) == 'number' && Number(req.body[dataBody]) != 0 ) {
                                pricetotal += Math.floor(parseFloat(Number(req.body[dataBody]) * Number(StoreData[dataStore].price)*1.1))
                                req.session.dataTemp.order.push({
                                    priceItem:Number(StoreData[dataStore].price),
                                    totalItem:Number(req.body[dataBody]),
                                    detailOrder: `Ordering in Store ${StoreData[dataStore].name} total order ${Number(req.body[dataBody])}`,
                                    ClientId: req.session.dataTemp.dataAccount.ClientId,}
                                )
                            }
                        }
                    }
                }
                if (pricetotal <= 0){
                    res.render('quote', { quote: `are you not ordering` , linkpayment:false })
                } else {
                    req.session.dataTemp.price = pricetotal
                    const dataToEncode = 'http://127.0.0.1:3000/payment';
                    qrcode.toFile('public/qrcode.png', dataToEncode, (error) => {
                        if (error) {
                            console.error('Gagal membuat QR code:', error);
                            return
                        }
                        res.render('quote' , { quote: `price total : ${Store.toRp(pricetotal)}`, linkpayment:true ,pict:'/qrcode.png' })
                    })
                }
            });
        } else {
            res.redirect('/login');
        }
    }
    static takeOrder(req, res) {
        if (req.session.dataTemp) {
            Order.findAll({
                where: {
                    DriverId: null
                },
                include: {
                    model: Client,
                    where: {}
                },
            })
            .then(el => {
                const store = []
                const nameClient = []
                el.forEach(dataOrder => {
                    for (const dataPost in req.body) {
                        if (req.body[dataPost] == "true") {
                            if (dataPost == dataOrder.id) {
                                const regex = /Ordering in Store (.*?) total order (\w+)/;
                                const matches = dataOrder.detailOrder.match(regex);
                                store.push(`${matches[1]} total ${matches[2]}`)
                                const dataForPush = dataOrder.Client.firstName
                                if (dataForPush) {
                                    nameClient.push(dataForPush)
                                }
                                Order.update({
                                    DriverId: req.session.dataTemp.dataAccount.DriverId
                                }, {
                                    where: {
                                        id: dataPost
                                    }
                                })
                                .catch(err => {
                                    res.send(err)
                                })
                            }
                        }
                    }
                })
                if (nameClient.length != 0 && store.length != 0) {
                    res.render('quote', {quote: `You taking order ${nameClient.join(", ")} in ${store.join(", ")}`, linkpayment:false})
                } else {
                    res.render('quote', {quote: 'You not taking ordering' , linkpayment:false})
                }
            })
            .catch(err => {
                res.send(err)
            })
        }
    }
    static logout(req,res){
        if (req.session.dataTemp) {
            const data = req.session.dataTemp.dataAccount.user
            req.session.destroy((err) => {
                if (err) {
                    res.send(err)
                    return
                }
                res.render("logout",{ data })
              });
        } else {
           res.redirect("/login")
        }
    }
    static payment(req,res){
        if (req.session.dataTemp) {
            if (req.session.dataTemp.dataAccount.role == 'client'){
                const tokenToVerify = req.session.dataTemp.jwt;
                jwt.verify(tokenToVerify, "pairProject", (err, decoded) => {
                    if (err) {
                        console.error('Token tidak valid:', err.message);
                        return;
                    }
                    if (req.session.dataTemp.order){
                        req.session.dataTemp.order.forEach(el =>{
                            Order.create(el);
                        })
                        const totalPrice = req.session.dataTemp.price
                        delete req.session.dataTemp.order
                        delete req.session.dataTemp.price
                        res.render("payment" , {data:req.session.dataTemp.dataAccount.user , price:Store.toRp(totalPrice)})    
                    } else {
                        res.redirect('/login')
                    }
               });
            } else {
                res.render("quote",{ quote:"Are you not client", linkpayment:false })
            }
        } else {
            res.redirect('/login')
        }
    }
} 
module.exports = Controller