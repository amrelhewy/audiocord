const express = require("express");
const app = express();
const PORT = process.env.PORT || 5000;
const mysql = require("mysql");
const bcrypt=require('bcrypt');
const jwt=require('jsonwebtoken');
const cors=require('cors')
const db_connection = mysql.createPool({
  connectionLimit: 10,
  host: "mysqldb",
  user: "foo",
  password: "bar",
  database: "audiocord",
  insecureAuth: true,
});

app.use(cors({credentials:true,origin:'http://localhost:3000'}))
app.use(express.json());
app.post("/api/v1/register", async (req, res) => {

  const username = req.body.user;
  const pass =req.body.pass;
     db_connection.getConnection((err,connection)=>{
     connection.query(
        `SELECT * FROM users WHERE username=?`,
        username,
       async (err, results) => {
          if (results.length > 0) {
               return res.status(400).send("User Already Exists..");
          }
         const salt =await bcrypt.genSalt(10);
         const hashedPassword=await bcrypt.hash(pass,salt);
          connection.query('INSERT INTO users(username,password) VALUES (?,?)',[username,hashedPassword],(err,results)=>{
                return res.status(200).send('Registered Successfully');
              
          })
        }
      );
      connection.release();
})

});
app.post("/api/v1/login",async(req,res)=>{
const {user,pass}=req.body;
db_connection.getConnection((err,connection)=>{
  connection.query(`SELECT * FROM users WHERE username=?`,user,async(err,results)=>{
   if(results.length==0) return res.status(400).send("User doesn't exist");
   let ifPasswordisTrue=await bcrypt.compare(pass,results[0].password)
   if(!ifPasswordisTrue) return res.status(400).send("Incorrect Password");
     //login details..
     const token=jwt.sign({user},'haw',{expiresIn:'24h'});
     res.status(200).cookie('Authorization',token,{httpOnly:true}).send(results[0]);
  
  });

  connection.release();
})
});
let server = app.listen(PORT, () =>
  console.log(`login microservice running ...`)
);
