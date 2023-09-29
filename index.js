const { Account , Driver , Order , OrderStore , Store , Client  } = require("./models/")
const express = require('express');
const session = require('express-session');
const Controller = require('./controllers/controller');
const app = express()
const port = 3000
app.set('view engine', 'ejs')
app.use(express.urlencoded({ extended: false }));
const routerRegister = require('./router/register') 
app.use(express.static(__dirname + '/public'));
const jwt = require('jsonwebtoken');


/// ini kode rahasia biar tidak hilang
app.use(session({
    secret: '10',
    resave: false,
    saveUninitialized: true
}))

function loginUser(req, res, user) {
    let dataUser;
    let dataAccount;
    Account.findOne({
        where: {
            user: req.body.user,
        }
    })
    .then(account => {
        if (account) {
            if (Account.checkPassword(req.body.password, account.password)) {
                dataAccount = account.dataValues;
                if (account.role === "driver") {
                    return Driver.findOne({
                        where: {
                            id: account.DriverId
                        }
                    })
                    .then(driver => {
                        dataUser = driver.dataValues;
                        req.session.dataTemp = {
                            dataUser,
                            dataAccount
                        };
                        user();
                    })
                    .catch(err => {
                        res.send(err);
                    });
                } else if (account.role === "client") {
                    return Client.findOne({
                        where: {
                            id: account.ClientId
                        }
                    })
                    .then(client => {
                        dataUser = client.dataValues;
                        const payload = { userId: dataAccount.id, username: dataAccount.user };
                        const token = jwt.sign(payload, "pairProject", { expiresIn: '1h' });
                        req.session.dataTemp = {
                            dataUser,
                            dataAccount,
                            jwt:token
                        };
                        user();
                    })
                    .catch(err => {
                        res.send(err);
                    });
                } else {
                    res.redirect('/login?error=hekker');
                }
            } else {
                res.redirect('/login?error=Password wrong');
            }
        } else {
            res.redirect('/login?error=User Wrong');
        }
    })
    .catch(err => {
        res.send(err);
    });
}
function checkCookie(req, res, user){
    if (!req.session.dataTemp){
        res.redirect('/login')
    }
    user()
}


app.get('/',Controller.home)
app.use('/register',routerRegister)
app.get('/login',Controller.login)
app.post('/home', loginUser ,Controller.homePage)
app.post('/takeorder', checkCookie ,Controller.takeOrder)
app.post('/order',Controller.order)
app.get('/logout',Controller.logout)
app.get('/payment',Controller.payment)

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})