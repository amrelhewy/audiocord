const express = require("express");
const app = express();
const PORT = process.env.PORT || 5000;
const mysql = require("mysql");
const cors = require("cors");
app.use(cors({ credentials: true, origin: "http://localhost:3000" }));
app.use(express.json());
const db_connection = mysql.createPool({
  connectionLimit: 10,
  host: "localhost",
  user: "foo",
  password: "bar",
  database: "audiocord",
  insecureAuth: true,
});

app.post("/comm/v1/addfriend", async (req, res) => {
  const { from, to } = req.body;

  db_connection.getConnection((err, connection) => {
    connection.query(
      `SELECT * FROM users WHERE username IN (?,?)`,
      [from, to],
      (err, results) => {
        
        
        if (results.length == 1)
          return res.status(400).send("User doesn't exist");
       let fromguy;
       let toguy;
        results[0].username===from?fromguy=results[0]:fromguy=results[1]
        results[1].username===to?toguy=results[1]:toguy=results[0];
        connection.query(
          `INSERT INTO friend_list VALUES(?,?,0,?,?)`,
          [fromguy.user_id, toguy.user_id,fromguy.username,toguy.username],
          (err) => {
            if (err)
              return res
                .status(400)
                .send("Can't send friend request.");
            res.status(200).send(`Sent friend request`);
          }
        );
      }
    );

    connection.release();
  });
});

app.get("/comm/v1/getallfriends/:user",async(req,res)=>{
  
const user=req.params.user;
db_connection.getConnection((err,connection)=>{
  connection.query('SELECT * FROM users WHERE username=?',user,(err,results)=>{
  let userid=results[0].user_id;

  connection.query('SELECT * FROM friend_list WHERE user=? OR user_friend=?',[userid,userid],(err,results)=>{
    res.status(200).send(results);
  })

    
  })
  connection.release();
})
});
app.post("/comm/v1/acceptedfriend",async(req,res)=>{
const {adder,reciever}=req.body;
console.log(req.body)
db_connection.getConnection((err,connection)=>{
  connection.query('UPDATE friend_list SET isFriend=1 WHERE adder=? AND reciever=?',[adder,reciever],(err,results)=>{
   if(err) return res.status(400).send('Error..');
   res.status(200).send(`You're now friends with ${adder}.`);

  })

connection.release();

})
});
app.post("/comm/v1/rejectedfriend",async(req,res)=>{
  const {adder,reciever}=req.body;
 db_connection.getConnection((err,connection)=>{
   connection.query('DELETE FROM friend_list WHERE adder=? AND reciever=?',[adder,reciever],(err,results)=>{
    if(err) return res.status(400).send('Error..');
    res.sendStatus(200);
   })
   connection.release();
 })
 
});
let server = app.listen(PORT, () =>
  console.log(`friends microservice running ...`)
);
