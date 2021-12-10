const express = require('express');
const mongoose = require('mongoose');
var assert = require('assert');
var engine = require('consolidate');
const session = require("express-session");
const port =process.env.port || 8080
const app = express();
app.use(
    session({
      secret: 'thisisasecret',
      saveUninitialized: true,
      resave: true
      })
      );
    var sess;
app.use(express.json())
app.use(express.static('public'))
app.use(express.urlencoded({
    extended:true
}))
mongoose.connect('mongodb+srv://priyanka:priyanka@cluster0.muzf2.mongodb.net/priyanka',{
    useNewUrlParser: true,
    useUnifiedTopology: true
});
var db = mongoose.connection;
db.on('error',()=>console.log("Error in Connecting to Database"));
db.once('open',()=>console.log("Connected to Database"))
app.post("/sign_up",(req,res)=>{
    sess = req.session;
    var fname = req.body.fname;
    var lname = req.body.lname;
    var phone = req.body.phone;
    var email = req.body.email;
    var pwd = req.body.pwd;
    var data = {
        "fname": fname,
        "lname": lname,
        "phone": phone,
        "email" : email,
        "pwd" : pwd
    }
    db.collection('users').insertOne(data,(err,collection)=>{
        if(err){
            throw err;
        }
        console.log("Record Inserted Successfully");
    });
    return res.redirect('index.html')
})
app.post("/order",(req,res)=>{
    sess = req.session;
    var pname = req.body.pname;
    var price= req.body.price;
var uname=sess.name;
var phone=sess.phone;
var email=sess.email;
var data = {
  
    "pname": pname,
    "price" : parseInt(price),
    "uname" : uname,
    "phone": phone,
    "email" : email,
    "Date" : new Date()
}
db.collection('orders').insertOne(data,(err,collection)=>{  
    if(err){
        throw err;}
    console.log("Ordered Successfully");
});
return res.redirect('checkout.html')
})
/* add product starts */
app.post("/add-product",(req,res)=>{
    sess = req.session;
      var pname = req.body.pname; 
      var category = req.body.category;  
      var price = req.body.price;
      var Sprice= req.body.Sprice;  
      var fileInput = req.body.fileInput;  
      var data = {  
          "Category": category,  
          "Product name": pname,
          "Price" : parseInt(price),
          "Sprice" : parseInt(Sprice),  
          "File input" : fileInput,  
          "Date" : new Date()  
      }  
      db.collection('products').insertOne(data,(err,collection)=>{  
          if(err){  
            throw err;}
          console.log("Item Inserted Successfully");});
  
        return res.redirect('success.html')
   })
/* add product ends */

/* update item */
app.post("/updproduct",(req,res)=>{
    sess = req.session;
    var fname = req.body.fname;
    var pname = req.body.lname;
    var cat = req.body.cat;
    var price = req.body.price;
    var Sprice = req.body.Sprice;
    var image = req.body.image;
    var query = {"Product name": fname};
    var data = { $set:{
        "Product name": pname,
        "Category": cat,
        "Price" : parseInt(price),
        "Sprice" : Sprice,
        "File input" : image,
        "Date" : new Date()
    }}
    db.collection('products').updateOne(query,data,(err,collection)=>{
        if(err){ 
          throw err;  
      }  
          console.log("Item updated Successfully");  
         return res.redirect('success.html') 
    });  
  })
/* update item ends*/
/* delete item starts*/
app.post("/del-product",(req,res)=>{
    sess = req.session;
      var pname = req.body.pname;
      var data = {
          "Product name": pname,
      }  
      db.collection('products').deleteOne(data,(err,collection)=>{  
        if(err){  
          throw err;  
      }  
        console.log("Item deleted Successfully"); 
      return res.redirect('success.html')  
      });
  
  })
/* delete item ends*/
/* login starts */
app.post("/login",(req,res)=>{
    sess = req.session;
    var email = req.body.email;
    var pwd = req.body.pwd;
    db.collection('users').findOne(
        {
        "email" : email
        } 
        ,(err,collection)=>{
      try {
sess.email=collection.email;
sess.phone=collection.phone;
sess.name=(collection.fname + " " + collection.lname)  
        if(collection.pwd==pwd)
    {
        console.log("Record found Successfully");
        return res.redirect('/fruits')
    }    
    if(collection.spwd==pwd)
    {
        console.log("Record found Successfully");
        return res.redirect('admin.html')
    }
    else
    {
        console.log("Record not found!!");
        return res.redirect('error.html')
    }
         } catch (err) {
             res.send("Invalid Email")
         }});   
})
app.engine('html', engine.mustache);
app.set('view engine', 'html')
app.get("/",(req,res)=>{
    res.set({
        "Allow-access-Allow-Origin": '*'
    })
    return res.redirect('index.html');
})
/* login ends */
/* search */
app.get("/search",(req,res)=>{
      sess = req.session;
      var regex = req.query.search;
      var resultArray = [];
      var cursor = db.collection('products').find({"Product name":{$regex: regex,$options: '$i'}});
        cursor.forEach(function(doc){
            assert.notEqual(null, doc);
            resultArray.push(doc);            
          }, function (err, doc){
            assert.equal(null, err);
            if (resultArray.length == 0){
        res.send("No Products Found!!")
    }
    else {
            res.render('home',{search : resultArray});            
            console.log({search : resultArray});
           }
          });   
}) 
app.get("/fruits",(req,res)=>{
    sess = req.session;
    var resultArray = [];
    var cursor = db.collection('products').find({Category:'Fruits'});
    cursor.forEach(function(doc){
        assert.notEqual(null, doc);
      resultArray.push(doc);
      }, function (err, doc){
        assert.equal(null, err);
        res.render('home',{fruits : resultArray});
       console.log({fruits : resultArray});
      });
})
app.get("/vegetables",(req,res)=>{
    sess = req.session;
    var resultArray = [];
    var cursor = db.collection('products').find({Category:'Vegetables'});
    cursor.forEach(function(doc){
        assert.notEqual(null, doc);
      resultArray.push(doc);
      }, function (err, doc){
        assert.equal(null, err);
        res.render('home',{vegetables : resultArray});
       console.log({vegetables : resultArray});
      });
})
app.get("/staples",(req,res)=>{
    sess = req.session;
    var resultArray = [];
    var cursor = db.collection('products').find({Category:'Staples'});
    cursor.forEach(function(doc){
        assert.notEqual(null, doc);
      resultArray.push(doc);
      }, function (err, doc){
        assert.equal(null, err);
        res.render('home',{staples : resultArray});
       console.log({staples : resultArray});
      });
})
app.get("/snacks",(req,res)=>{
    sess = req.session;
    var resultArray = [];
    var cursor = db.collection('products').find({Category:'Snacks'});
    cursor.forEach(function(doc){
        assert.notEqual(null, doc);
      resultArray.push(doc);
      }, function (err, doc){
        assert.equal(null, err);
        res.render('home',{snacks : resultArray});
       console.log({snacks : resultArray});
      });
})
app.get("/dairy",(req,res)=>{
    sess = req.session;
    var resultArray = [];
    var cursor = db.collection('products').find({Category:'Diary'});
    cursor.forEach(function(doc){
        assert.notEqual(null, doc);
      resultArray.push(doc);
      }, function (err, doc){
        assert.equal(null, err);
        res.render('home',{dairy : resultArray});
       console.log({dairy : resultArray});
      });
})
app.get("/meat",(req,res)=>{
    sess = req.session;
    var resultArray = [];
    var cursor = db.collection('products').find({Category:'Meat'});
    cursor.forEach(function(doc){
        assert.notEqual(null, doc);
      resultArray.push(doc);
      }, function (err, doc){
        assert.equal(null, err);
        res.render('home',{meat : resultArray});
       console.log({meat : resultArray});
      });
})
app.get("/product",(req,res)=>{
    sess = req.session;
    var resultArray = [];
    var cursor = db.collection('products').find({});
    cursor.forEach(function(doc){
        assert.notEqual(null, doc);
      resultArray.push(doc);
      }, function (err, doc){
        assert.equal(null, err);
        res.render('product',{products : resultArray});
       console.log({products : resultArray});
      });
})
app.get('/logout',(req,res) => {
    req.session.destroy((err) => {
      if(err) {
        return console.log(err);
      }
      res.redirect('/');
    });
  });
app.listen(port,()=>{
    console.log('accuired port number is '+ port)
})