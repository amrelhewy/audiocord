const express=require('express');
const app=express();
const PORT=process.env.PORT || 5004;
const path=require('path')

app.use(express.static(path.join(__dirname, "build")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "/build/index.html"));
});
app.listen(PORT,()=>console.log('web microservice running ..'))