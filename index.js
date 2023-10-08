const express=require('express');
require('./db/config');
const User=require('./db/users');
const Product=require('./db/product');
const cors=require('cors');
const { get } = require('mongoose');
const Jwt= require('jsonwebtoken');
const jwtkey='secret'

const app=express();
app.use(cors( {
        origin:["https://mern-dashboard-serverside.vercel.app"],
        method: ["GET","POST"],
        credentials:true
    }));
app.use(express.json())

app.post("/register",async (req,resp)=>{
   resp.send("registered")
    // let u=new User(req.body);
    // let result=await u.save();
    // result=result.toObject();
    // delete result.password;
    // if(result){
    //     Jwt.sign({result},jwtkey,{expiresIn:"2h"},(err,token)=>{
    //         resp.send({result,auth:token});
    //     })
    // }else{
    //     resp.send({result:"Not Found"})
    // }
})

app.get("/hello",(req,resp)=>{
resp.send("Deployed....")
})

app.post("/login",async (req,resp)=>{
    if(req.body.email&&req.body.password){
        let user=await User.findOne(req.body).select("-password");
        if(user){
            Jwt.sign({user},jwtkey,{expiresIn:"2h"},(err,token)=>{

                resp.send({user,auth:token});

            })
        }else{
            resp.send({result:"Not Found"})
        }
    }else{
        resp.send({result:"Not Found"})
    }
})
app.post("/add",verifyToken,async (req,resp)=>{
    if(req.body.userId&&req.body.name&&req.body.price){
        let p=new Product(req.body);
        const result= await p.save();
        resp.send(result);
    }else{
        resp.send({result:"please provide full details"})
    }
})

app.get("/products", verifyToken,async (req,resp)=>{
    let products= await Product.find();
    resp.send(products);
})

app.get("/myproducts/:id",verifyToken, async (req,resp)=>{
    let products= await Product.find({"userId":req.params.id});
    resp.send(products);
})

app.delete("/product/:id",verifyToken,async (req,resp)=>{
    let result= await Product.deleteOne({_id:req.params.id});
    resp.send(result);
})

app.get("/product/:id",verifyToken,async (req,resp)=>{
    let result=await Product.findOne({_id:req.params.id});
    resp.send(result);
})

app.put("/product/:id",verifyToken,async (req,resp)=>{
    console.log(req.params.id,req.body);
    let r=await Product.updateOne(
        {_id:req.params.id},
        {
            $set:req.body
        }
    )
    resp.send(r);
})

app.get("/search/:key/:id",verifyToken,async (req,resp)=>{
    console.log(req.params.key)
    let result= await Product.find({
        "$and":[
            {userId:req.params.id},
            {
                "$or":[
                    {name:{$regex:req.params.key}},
                    {company:{$regex:req.params.key}},
                    {category:{$regex:req.params.key}}
                ]
             }
            
        ]
    } )
     resp.send(result);
})

function verifyToken(req,resp,next){
    let token=req.headers.authorization;
    if(token){
        Jwt.verify(token,jwtkey,(err,valid)=>{
            if(err){
                resp.status(401).send("Token is not valid")
            }else{
                next();
            }
        })
    }else{
        resp.status(403).send("Please provide Token to Access data")
    }
}

app.listen(5000);
